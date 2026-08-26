// Client-side content cache (stale-while-revalidate).
//
// Every route asks for its own slice of content. This layer makes sure that:
//   - the same slice is never fetched twice concurrently (in-flight dedupe),
//   - navigating back to a page you already visited renders instantly from memory,
//   - a full page reload still starts from sessionStorage instead of a blank screen,
//   - stale data is refreshed in the background rather than behind a spinner.
//
// The server sends ETag + Cache-Control on these responses, so a background
// revalidation usually costs one 304 with an empty body.

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, setMutationListener } from "./api";

export type ContentPage =
  | "shell"
  | "home"
  | "blog"
  | "activity"
  | "club"
  | "roster"
  | "staff"
  | "scores"
  | "sponsors"
  | "membership"
  | "gallery";

export type ContentParams = Record<string, string | number | undefined>;

interface CacheRecord<T = any> {
  data: T;
  fetchedAt: number;
}

/** Cached data younger than this is served without a background refetch. */
const FRESH_MS = 60_000;

/** sessionStorage entries older than this are ignored on boot. */
const PERSIST_MAX_AGE_MS = 30 * 60_000;

const STORAGE_PREFIX = "cu-content-v1:";

const memoryCache = new Map<string, CacheRecord>();
const inFlight = new Map<string, Promise<any>>();
const subscribers = new Set<() => void>();

function buildKey(page: ContentPage, params: ContentParams = {}): string {
  const query = new URLSearchParams({ page });
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => query.set(key, String(value)));
  return query.toString();
}

function readPersisted<T>(key: string): CacheRecord<T> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const record = JSON.parse(raw) as CacheRecord<T>;
    if (Date.now() - record.fetchedAt > PERSIST_MAX_AGE_MS) return null;
    return record;
  } catch {
    return null;
  }
}

function persist(key: string, record: CacheRecord): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(record));
  } catch {
    // Private mode or quota exhausted — the memory cache still works.
  }
}

function lookup<T>(key: string): CacheRecord<T> | null {
  const hit = memoryCache.get(key);
  if (hit) return hit as CacheRecord<T>;

  const persisted = readPersisted<T>(key);
  if (persisted) memoryCache.set(key, persisted);
  return persisted;
}

/**
 * Drops every cached slice and notifies mounted views to refetch.
 * Called after any CMS mutation so editors immediately see their own writes.
 */
export function invalidateContent(): void {
  memoryCache.clear();
  try {
    Object.keys(sessionStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => sessionStorage.removeItem(key));
  } catch {
    /* nothing to clear */
  }
  subscribers.forEach(notify => notify());
}

// Any successful CMS write drops the cache, so an editor's next navigation shows the
// change rather than the copy that was cached seconds earlier.
setMutationListener(invalidateContent);

export async function fetchPageContent<T = any>(
  page: ContentPage,
  params: ContentParams = {}
): Promise<T> {
  const key = buildKey(page, params);

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const request = fetch(`/api/content?${key}`)
    .then(async res => {
      const text = await res.text();
      let payload: any = {};
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          throw new ApiError("Received an invalid response from the content service.", res.status);
        }
      }
      if (!res.ok) throw new ApiError(payload.error || `Failed to load ${page} content`, res.status);

      const record: CacheRecord<T> = { data: payload, fetchedAt: Date.now() };
      memoryCache.set(key, record);
      persist(key, record);
      return payload as T;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

/** Warms the cache without rendering — used to prefetch a route before navigation. */
export function prefetchPageContent(page: ContentPage, params: ContentParams = {}): void {
  const key = buildKey(page, params);
  const cached = lookup(key);
  if (cached && Date.now() - cached.fetchedAt < FRESH_MS) return;
  void fetchPageContent(page, params).catch(() => undefined);
}

export interface PageContentState<T> {
  data: T | null;
  /** True only when there is nothing at all to render yet. */
  loading: boolean;
  /** True while a background revalidation of already-rendered data is running. */
  validating: boolean;
  error: string;
  /** HTTP status behind `error`, when the failure came from the server rather than the network. */
  errorStatus: number | null;
  refresh: () => Promise<void>;
}

export function usePageContent<T = any>(
  page: ContentPage,
  params: ContentParams = {},
  options: { enabled?: boolean } = {}
): PageContentState<T> {
  const enabled = options.enabled !== false;
  const key = buildKey(page, params);

  const [data, setData] = useState<T | null>(() => (enabled ? lookup<T>(key)?.data ?? null : null));
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [validating, setValidating] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!enabled) return;
    setValidating(true);
    try {
      const payload = await fetchPageContent<T>(page, params);
      if (!mounted.current) return;
      setData(payload);
      setError("");
      setErrorStatus(null);
    } catch (err: any) {
      if (!mounted.current) return;
      setError(err?.message || "Failed to load content.");
      setErrorStatus(err instanceof ApiError ? err.status : null);
    } finally {
      if (mounted.current) setValidating(false);
    }
    // `key` already encodes page + params, so it is the honest dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const cached = lookup<T>(key);
    setData(cached?.data ?? null);
    setError("");
    setErrorStatus(null);

    // Fresh enough to skip the network entirely.
    if (cached && Date.now() - cached.fetchedAt < FRESH_MS) return;

    void load();
  }, [key, enabled, load]);

  // Re-run when a CMS write clears the cache.
  useEffect(() => {
    if (!enabled) return;
    const onInvalidate = () => void load();
    subscribers.add(onInvalidate);
    return () => {
      subscribers.delete(onInvalidate);
    };
  }, [load, enabled]);

  return {
    data,
    loading: enabled && data === null && !error,
    validating,
    error,
    errorStatus,
    refresh: load
  };
}
