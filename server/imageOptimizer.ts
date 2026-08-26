// Image optimization pipeline (Sharp).
//
// Two halves:
//   1. `optimizeUploadBuffer` — everything the CMS uploads is transcoded to WebP and
//      capped in size *before* it reaches Supabase Storage, so the origin file is small.
//   2. `registerImageRoutes` — /api/img resizes and re-encodes on demand, which is what
//      fixes the images already in the database (multi-megabyte PNG screenshots) without
//      a migration. Results are written to a disk cache and served immutable.
//
// Anything the pipeline can't handle (SVG, animated GIF, an unreachable origin) falls
// back to the original URL, so a transform failure can never blank out an image.

import "./env";
import crypto from "crypto";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import sharp from "sharp";

type ExpressApp = {
  get: (route: string, handler: (req: any, res: any) => any) => void;
};

const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const CACHE_MAX_BYTES = Number(process.env.IMAGE_CACHE_MAX_BYTES ?? 512 * 1024 * 1024);
const IMAGE_MAX_AGE = Number(process.env.IMAGE_CACHE_MAX_AGE ?? 60 * 60 * 24 * 30);

const MAX_WIDTH = 3840;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 12_000;

const DEFAULT_QUALITY = 76;
const UPLOAD_QUALITY = Number(process.env.UPLOAD_WEBP_QUALITY ?? 82);
const UPLOAD_MAX_WIDTH = Number(process.env.UPLOAD_MAX_WIDTH ?? 2400);

const OUTPUT_FORMATS = new Set(["webp", "avif", "jpeg", "png"]);

/** Formats Sharp should not touch: vectors stay vectors, animations stay animated. */
const PASSTHROUGH_MIME = new Set(["image/svg+xml", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]);
const PASSTHROUGH_EXT = new Set([".svg", ".gif", ".ico"]);

/** Local directories /api/img may read from when `src` is a same-origin path. */
const LOCAL_ROOTS = ["uploads", "public", "dist"].map(dir => path.resolve(process.cwd(), dir));

function allowedRemoteHosts(): Set<string> {
  const hosts = new Set<string>(["images.unsplash.com", "plus.unsplash.com"]);

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (supabaseUrl) {
    try {
      hosts.add(new URL(supabaseUrl).hostname);
    } catch {
      /* malformed env value — nothing to allow */
    }
  }

  (process.env.IMAGE_ALLOWED_HOSTS || "")
    .split(",")
    .map(host => host.trim().toLowerCase())
    .filter(Boolean)
    .forEach(host => hosts.add(host));

  return hosts;
}

let remoteHostCache: Set<string> | null = null;

function remoteHosts(): Set<string> {
  if (!remoteHostCache) remoteHostCache = allowedRemoteHosts();
  return remoteHostCache;
}

type Source =
  | { kind: "remote"; url: string }
  | { kind: "local"; file: string };

/**
 * Resolves the `src` parameter to something safe to read. Remote URLs must be https and
 * on the allowlist; local paths must land inside a known asset root (blocks `../`
 * traversal and turns this endpoint into a closed proxy rather than an open one).
 */
function resolveSource(src: string): Source | null {
  if (!src) return null;

  if (/^https?:\/\//i.test(src)) {
    try {
      const url = new URL(src);
      if (url.protocol !== "https:") return null;
      if (!remoteHosts().has(url.hostname.toLowerCase())) return null;
      return { kind: "remote", url: url.toString() };
    } catch {
      return null;
    }
  }

  if (!src.startsWith("/") || src.startsWith("//")) return null;

  const relative = decodeURIComponent(src.split("?")[0]).replace(/^\/+/, "");
  for (const root of LOCAL_ROOTS) {
    const candidate = path.resolve(root, relative.startsWith(path.basename(root) + "/")
      ? relative.slice(path.basename(root).length + 1)
      : relative);
    if (!candidate.startsWith(root + path.sep)) continue;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return { kind: "local", file: candidate };
  }
  return null;
}

async function readSource(source: Source): Promise<{ buffer: Buffer; contentType: string }> {
  if (source.kind === "local") {
    const buffer = await fsp.readFile(source.file);
    return { buffer, contentType: mimeFromExtension(path.extname(source.file)) };
  }

  const response = await fetch(source.url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: "image/*,*/*;q=0.8" }
  });
  if (!response.ok) throw new Error(`Origin responded ${response.status}`);

  const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_SOURCE_BYTES) throw new Error("Source image too large");

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_SOURCE_BYTES) throw new Error("Source image too large");

  return { buffer, contentType };
}

function mimeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".avif": return "image/avif";
    case ".gif": return "image/gif";
    case ".svg": return "image/svg+xml";
    case ".ico": return "image/x-icon";
    default: return "application/octet-stream";
  }
}

function isPassthrough(contentType: string, hint: string): boolean {
  if (PASSTHROUGH_MIME.has(contentType)) return true;
  return PASSTHROUGH_EXT.has(path.extname(hint.split("?")[0]).toLowerCase());
}

/**
 * Re-encodes a raster image at the requested width and format.
 * EXIF orientation is applied and metadata is dropped, which alone strips a surprising
 * amount of weight off phone photos.
 */
async function transcode(
  input: Buffer,
  options: { width?: number; quality: number; format: string }
): Promise<Buffer> {
  let pipeline = sharp(input, { failOn: "none" }).rotate();

  if (options.width) {
    pipeline = pipeline.resize({ width: options.width, withoutEnlargement: true, fit: "inside" });
  }

  switch (options.format) {
    case "avif":
      return pipeline.avif({ quality: Math.max(30, options.quality - 12), effort: 3 }).toBuffer();
    case "jpeg":
      return pipeline.jpeg({ quality: options.quality, mozjpeg: true }).toBuffer();
    case "png":
      return pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
    default:
      return pipeline.webp({ quality: options.quality, effort: 4 }).toBuffer();
  }
}

/**
 * Converts a CMS upload to WebP before it is stored. Returns the original buffer
 * untouched for vectors/animations so logos and GIFs survive intact.
 */
export async function optimizeUploadBuffer(
  buffer: Buffer,
  filename: string
): Promise<{ buffer: Buffer; filename: string; contentType: string; converted: boolean }> {
  const ext = path.extname(filename).toLowerCase() || ".png";
  const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");

  if (isPassthrough("", filename)) {
    return {
      buffer,
      filename: `${baseName}-${Date.now()}${ext}`,
      contentType: mimeFromExtension(ext),
      converted: false
    };
  }

  try {
    const optimized = await transcode(buffer, {
      width: UPLOAD_MAX_WIDTH,
      quality: UPLOAD_QUALITY,
      format: "webp"
    });
    return {
      buffer: optimized,
      filename: `${baseName}-${Date.now()}.webp`,
      contentType: "image/webp",
      converted: true
    };
  } catch (err: any) {
    console.warn(`[img] Upload conversion failed for ${filename}, storing original:`, err.message);
    let contentType = `image/${ext.replace(".", "")}`;
    if (contentType === "image/jpg") contentType = "image/jpeg";
    return { buffer, filename: `${baseName}-${Date.now()}${ext}`, contentType, converted: false };
  }
}

async function ensureCacheDir(): Promise<void> {
  await fsp.mkdir(CACHE_DIR, { recursive: true });
}

/** Keeps the on-disk cache bounded by evicting the least recently modified entries. */
async function pruneCache(): Promise<void> {
  try {
    const names = await fsp.readdir(CACHE_DIR);
    const entries = await Promise.all(
      names.map(async name => {
        const file = path.join(CACHE_DIR, name);
        const stat = await fsp.stat(file).catch(() => null);
        return stat?.isFile() ? { file, size: stat.size, mtime: stat.mtimeMs } : null;
      })
    );

    const files = entries.filter((entry): entry is { file: string; size: number; mtime: number } => !!entry);
    let total = files.reduce((sum, entry) => sum + entry.size, 0);
    if (total <= CACHE_MAX_BYTES) return;

    files.sort((a, b) => a.mtime - b.mtime);
    for (const entry of files) {
      if (total <= CACHE_MAX_BYTES * 0.8) break;
      await fsp.unlink(entry.file).catch(() => undefined);
      total -= entry.size;
    }
    console.log(`[img] Pruned image cache down to ${(total / 1024 / 1024).toFixed(1)}MB`);
  } catch {
    /* pruning is best effort */
  }
}

const transformsInFlight = new Map<string, Promise<{ buffer: Buffer; contentType: string }>>();

export function registerImageRoutes(app: ExpressApp): void {
  void ensureCacheDir().then(pruneCache);
  setInterval(() => void pruneCache(), 60 * 60 * 1000).unref?.();

  app.get("/api/img", async (req: any, res: any) => {
    const src = String(req.query.src || "");
    const requestedFormat = String(req.query.fm || "webp").toLowerCase();
    const width = Math.min(MAX_WIDTH, Math.max(0, Math.floor(Number(req.query.w) || 0))) || undefined;
    const quality = Math.min(95, Math.max(30, Math.floor(Number(req.query.q) || DEFAULT_QUALITY)));

    // `auto` upgrades to AVIF only for browsers that advertise it; everyone else gets WebP.
    const accept = String(req.headers.accept || "");
    const format = requestedFormat === "auto"
      ? (accept.includes("image/avif") ? "avif" : "webp")
      : (OUTPUT_FORMATS.has(requestedFormat) ? requestedFormat : "webp");

    const source = resolveSource(src);
    if (!source) return res.status(400).json({ error: "Unsupported or disallowed image source." });

    const key = crypto
      .createHash("sha1")
      .update(`${src}|${width || 0}|${quality}|${format}|v1`)
      .digest("hex");
    const etag = `"${key}"`;

    if (req.headers["if-none-match"] === etag) {
      res.setHeader("Cache-Control", `public, max-age=${IMAGE_MAX_AGE}, immutable`);
      res.setHeader("ETag", etag);
      return res.status(304).end();
    }

    const cacheFile = path.join(CACHE_DIR, `${key}.${format}`);

    const send = (buffer: Buffer, contentType: string, cacheState: string) => {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", `public, max-age=${IMAGE_MAX_AGE}, immutable`);
      res.setHeader("ETag", etag);
      res.setHeader("X-Image-Cache", cacheState);
      res.setHeader("Vary", "Accept");
      res.end(buffer);
    };

    try {
      const cachedBuffer = await fsp.readFile(cacheFile).catch(() => null);
      if (cachedBuffer) return send(cachedBuffer, `image/${format}`, "HIT");

      // Collapse duplicate work: a fresh page load can request the same hero image
      // several times before the first transform has finished writing to disk.
      let work = transformsInFlight.get(key);
      if (!work) {
        work = (async () => {
          const { buffer, contentType } = await readSource(source);

          if (isPassthrough(contentType, src)) {
            return { buffer, contentType: contentType || mimeFromExtension(path.extname(src)) };
          }

          const optimized = await transcode(buffer, { width, quality, format });

          // Never serve a "optimized" file that is bigger than what we started with.
          if (optimized.byteLength >= buffer.byteLength && !width) {
            return { buffer, contentType: contentType || "application/octet-stream" };
          }

          await ensureCacheDir();
          await fsp.writeFile(cacheFile, optimized).catch(() => undefined);
          return { buffer: optimized, contentType: `image/${format}` };
        })().finally(() => transformsInFlight.delete(key));
        transformsInFlight.set(key, work);
      }

      const result = await work;
      return send(result.buffer, result.contentType, "MISS");
    } catch (err: any) {
      // Degrade to the untouched original rather than showing a broken image.
      console.warn(`[img] Optimization failed for ${src}:`, err.message);
      if (source.kind === "remote") return res.redirect(302, source.url);
      return res.status(502).json({ error: "Failed to process image." });
    }
  });
}
