// Client half of the image pipeline.
//
// Rewrites image URLs to the server's /api/img endpoint, which returns a resized,
// WebP-encoded copy. Sources the endpoint will not accept (data URIs, vectors,
// third-party hosts we do not proxy) are returned untouched so nothing ever breaks.

/** Hosts /api/img is allowed to fetch from — mirrors the server-side allowlist. */
const OPTIMIZABLE_HOSTS = new Set(
  [
    "images.unsplash.com",
    "plus.unsplash.com",
    hostOf(import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ].filter(Boolean) as string[]
);

/** Formats Sharp cannot improve on, or should not flatten. */
const SKIP_EXTENSIONS = /\.(svg|gif|ico)(\?|$)/i;

function hostOf(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function canOptimize(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:") || src.startsWith("blob:")) return false;
  if (SKIP_EXTENSIONS.test(src)) return false;

  if (/^https?:\/\//i.test(src)) {
    const host = hostOf(src);
    return !!host && OPTIMIZABLE_HOSTS.has(host);
  }

  // Bundled assets are pre-optimized and fingerprinted by Vite — leave them alone.
  if (src.startsWith("/assets/") || src.startsWith("/src/")) return false;

  // Same-origin paths (/uploads/..., /line-openchat-qr.jpeg) are served from disk.
  return src.startsWith("/") && !src.startsWith("//");
}

export interface ImageOptions {
  /** Target width in CSS pixels. Omit to keep the source width. */
  width?: number;
  /** 30–95. Defaults to the server's own default. */
  quality?: number;
  /** "webp" (default) or "auto" to let the server upgrade AVIF-capable browsers. */
  format?: "webp" | "auto" | "avif";
}

export function optimizedSrc(src: string, options: ImageOptions = {}): string {
  if (!canOptimize(src)) return src;

  const params = new URLSearchParams({ src });
  if (options.width) params.set("w", String(Math.round(options.width)));
  if (options.quality) params.set("q", String(options.quality));
  if (options.format && options.format !== "webp") params.set("fm", options.format);

  return `/api/img?${params.toString()}`;
}

/** Default responsive ladder — covers phone through retina desktop. */
export const DEFAULT_WIDTHS = [320, 480, 640, 960, 1280, 1920];

/**
 * Builds a srcset so the browser downloads the smallest variant that fits its layout
 * slot. Widths above the requested size are dropped: a 96px avatar never needs 1920px.
 */
export function buildSrcSet(src: string, options: ImageOptions & { widths?: number[] } = {}): string | undefined {
  if (!canOptimize(src)) return undefined;

  const ceiling = options.width ? options.width * 2 : Infinity;
  const widths = (options.widths || DEFAULT_WIDTHS).filter(width => width <= ceiling);
  if (widths.length === 0) widths.push(Math.round(Math.min(ceiling, 1920)));

  return widths
    .map(width => `${optimizedSrc(src, { ...options, width })} ${width}w`)
    .join(", ");
}
