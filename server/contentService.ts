// Page-scoped content service.
//
// The site used to load every collection and every site_config row through a single
// /api/db request, on every visit, for every page. This module splits that payload
// into per-page slices and puts a short-lived in-process cache in front of Supabase so
// repeat visitors are answered from memory (and, via ETag, usually with a bare 304).
//
// Cache invalidation is driven by `invalidateContentCache()`, which the mutation
// middleware in server.ts calls after any successful non-GET /api/* request.

import "./env";
import crypto from "crypto";
import { CONTENT_DEFAULTS } from "./defaults";

type Supabase = {
  from: (table: string) => any;
};

const COLLECTION_TABLES = [
  "news",
  "roster",
  "staff",
  "scores",
  "gallery",
  "sponsors",
  "member_events",
  "instagram_posts"
] as const;

/** Table name -> the key the frontend expects in the JSON payload. */
const COLLECTION_KEY: Record<string, string> = {
  member_events: "memberEvents",
  instagram_posts: "instagramPosts"
};

const CACHE_TTL_MS = Number(process.env.CONTENT_CACHE_TTL_MS ?? 60_000);

/** Browser/CDN caching policy for page content. Short max-age, long SWR window. */
const CONTENT_MAX_AGE = Number(process.env.CONTENT_MAX_AGE ?? 60);
const CONTENT_SWR = Number(process.env.CONTENT_SWR ?? 600);
export const CONTENT_CACHE_CONTROL = `public, max-age=${CONTENT_MAX_AGE}, stale-while-revalidate=${CONTENT_SWR}`;

export const CONTENT_PAGES = [
  "shell",
  "home",
  "blog",
  "activity",
  "club",
  "roster",
  "staff",
  "scores",
  "sponsors",
  "membership",
  "gallery"
] as const;

export type ContentPage = (typeof CONTENT_PAGES)[number];

export interface PageQuery {
  limit?: number;
  offset?: number;
  id?: string;
}

interface CacheEntry {
  value: any;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<any>>();

/** Bumped on every content mutation; folded into ETags so stale validators never match. */
let contentVersion = Date.now();

export function invalidateContentCache(): void {
  cache.clear();
  contentVersion = Date.now();
}

export function getContentVersion(): number {
  return contentVersion;
}

/**
 * Reads through the in-process cache, collapsing concurrent misses onto one query so a
 * burst of first-time visitors produces a single round trip to Supabase.
 */
async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = loader()
    .then(value => {
      cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

export function createContentService(supabase: Supabase) {
  async function getCollection(table: string): Promise<any[]> {
    return cached(`collection:${table}`, async () => {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw new Error(`Failed to read ${table}: ${error.message}`);
      return data || [];
    });
  }

  /** All site_config rows, camelCased and back-filled with the shipped defaults. */
  async function getSiteConfig(): Promise<Record<string, any>> {
    return cached("site_config", async () => {
      const { data, error } = await supabase.from("site_config").select("*");
      if (error) throw new Error(`Failed to read site_config: ${error.message}`);

      const config: Record<string, any> = {};
      (data || []).forEach((row: any) => {
        const camelKey = row.key.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
        config[camelKey] = row.data || {};
      });

      for (const [key, fallback] of Object.entries(CONTENT_DEFAULTS)) {
        if (!config[key] || Object.keys(config[key]).length === 0) config[key] = fallback;
      }
      return config;
    });
  }

  /** The complete payload — CMS only. Public pages use `getPage()` instead. */
  async function getFullDatabase(): Promise<Record<string, any>> {
    const [collections, config] = await Promise.all([
      Promise.all(COLLECTION_TABLES.map(table => getCollection(table))),
      getSiteConfig()
    ]);

    const db: Record<string, any> = { ...config };
    COLLECTION_TABLES.forEach((table, index) => {
      db[COLLECTION_KEY[table] || table] = collections[index];
    });
    return db;
  }

  /** Visible articles, newest and highest-ranked first — the order every view applies. */
  async function getSortedNews(): Promise<any[]> {
    const news = await getCollection("news");
    return news
      .filter((item: any) => item.isVisible !== false)
      .sort((a: any, b: any) => {
        const rankDelta = (b.rank || 0) - (a.rank || 0);
        if (rankDelta !== 0) return rankDelta;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      });
  }

  async function getVisible(table: string): Promise<any[]> {
    const rows = await getCollection(table);
    return rows.filter((row: any) => row.isVisible !== false);
  }

  async function getPage(page: ContentPage, query: PageQuery = {}): Promise<any> {
    switch (page) {
      // Chrome shared by every route: navbar, marquee, footer. Fetched once per visit.
      case "shell": {
        const config = await getSiteConfig();
        return {
          siteSettings: config.siteSettings,
          siteLabels: config.siteLabels,
          siteLabelsThai: config.siteLabelsThai || {}
        };
      }

      case "home": {
        const [config, news, scores, sponsors, instagramPosts] = await Promise.all([
          getSiteConfig(),
          getSortedNews(),
          getVisible("scores"),
          getCollection("sponsors"),
          getCollection("instagram_posts")
        ]);
        return {
          // The home page renders three cards and one scoreboard — send exactly that.
          news: news.slice(0, 3),
          scores: scores.slice(0, 3),
          sponsors,
          instagramPosts,
          welcomeSection: config.welcomeSection,
          homeSponsorSection: config.homeSponsorSection,
          simulatorSection: config.simulatorSection
        };
      }

      case "blog": {
        const news = await getSortedNews();
        const limit = clampLimit(query.limit, 24);
        const offset = Math.max(0, query.offset || 0);
        return {
          news: news.slice(offset, offset + limit),
          pagination: {
            total: news.length,
            limit,
            offset,
            hasMore: offset + limit < news.length
          }
        };
      }

      // One article, not the whole archive — an article page used to ship every post.
      case "activity": {
        const news = await getCollection("news");
        const article = news.find((item: any) => item.id === query.id) || null;
        return { article };
      }

      case "club": {
        const config = await getSiteConfig();
        return { clubActivity: config.clubActivity };
      }

      case "roster":
        return { roster: await getCollection("roster") };

      case "staff":
        return { staff: await getCollection("staff") };

      case "scores":
        return { scores: await getCollection("scores") };

      case "sponsors":
        return { sponsors: await getCollection("sponsors") };

      case "gallery":
        return { gallery: await getCollection("gallery") };

      case "membership": {
        const [config, memberEvents] = await Promise.all([
          getSiteConfig(),
          getCollection("member_events")
        ]);
        return {
          memberEvents,
          memberEventsOrder: Array.isArray(config.memberEventsOrder) ? config.memberEventsOrder : []
        };
      }

      default:
        throw new Error(`Unknown content page: ${page}`);
    }
  }

  return { getPage, getFullDatabase, getCollection, getSiteConfig };
}

function clampLimit(value: number | undefined, fallback: number): number {
  if (!value || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(1, Math.floor(value)), 100);
}

/** Weak-ish ETag over the serialized body — lets unchanged pages answer with a 304. */
export function computeETag(body: string): string {
  return `W/"${crypto.createHash("sha1").update(body).digest("base64url")}"`;
}

export function isContentPage(value: string): value is ContentPage {
  return (CONTENT_PAGES as readonly string[]).includes(value);
}
