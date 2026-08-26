# CU Golf Club - Official Registry

The official digital registry and activities portal for Chulalongkorn University Golf Club.

## Features

- **Squad Registry**: Comprehensive roster of varsity players and staff.
- **Match Stats**: Live tournament standings and stroke logs.
- **Activities Blog**: Coverage of club events and championships.
- **Admin CMS**: Integrated content management system powered by Supabase.

## Tech Stack

- **Frontend**: React (TS), Tailwind CSS, Framer Motion.
- **Backend**: Node.js/Express.
- **Database**: Supabase (PostgreSQL & Storage).
- **Hosting**: Optimized for Render (Free Tier).

## Performance Architecture

### Page-scoped content API

`GET /api/content?page=<name>` (also `/api/content/<name>`) returns only the data one
view needs. Pages: `shell`, `home`, `blog`, `activity`, `club`, `roster`, `staff`,
`scores`, `sponsors`, `membership`, `gallery`.

- `shell` carries the navbar/marquee/footer chrome and is fetched once per session.
- `blog` accepts `limit` and `offset` and returns a `pagination` block.
- `activity` takes `id` and returns a single article.
- `GET /api/db` still returns the whole payload, but only the CMS calls it.

Slices are built by `server/contentService.ts`, cached in-process for
`CONTENT_CACHE_TTL_MS`, and dropped automatically after any successful write to an
`/api/*` route.

### Image optimization

`GET /api/img?src=<url|path>&w=<width>&q=<quality>&fm=<webp|avif|auto>` fetches the
source, re-encodes it with Sharp, and caches the result on disk under `.cache/images`.
CMS uploads are additionally converted to WebP *before* they reach Supabase Storage.
Use the `OptimizedImage` component on the frontend — it emits a responsive `srcset`,
lazy-loads by default, and falls back to the original URL if a transform fails.

Sources are restricted to the Supabase Storage host, Unsplash, and same-origin paths.
Add more with `IMAGE_ALLOWED_HOSTS` (comma-separated).

### Caching

| Response | Cache-Control |
| --- | --- |
| `/api/content?page=…` | `public, max-age=60, stale-while-revalidate=600` + ETag |
| `/api/img` | `public, max-age=30d, immutable` + ETag |
| `/uploads/*` | `public, max-age=30d, immutable` |
| `/assets/*` (fingerprinted) | `public, max-age=1y, immutable` |
| `index.html`, `/api/db` | `no-cache` / `no-store` |

The frontend adds a stale-while-revalidate layer in `src/utils/contentClient.ts`:
memory + `sessionStorage`, in-flight request dedupe, and cache invalidation on every
CMS write. All text responses are gzipped.

## Deployment & Keep-Alive

This application is designed to handle Render's free tier sleep cycles gracefully.

### Mitigating Backend Sleep

1. **Waking Up UI**: The frontend includes a specialized loading screen that informs users when the backend is spinning up.
2. **Self-Pinging Mechanism**: The backend can keep itself awake by pinging its own URL.
   - To enable this, set the `RENDER_EXTERNAL_URL` environment variable in your Render dashboard to your public app URL (e.g., `https://cu-golf-club.onrender.com`).
   - The server will ping `/api/health` every 14 minutes to prevent inactivity spin-down.

### Environment Variables

See `.env.example` for the required configuration.

- `GEMINI_API_KEY`: For AI features.
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin ops).
- `RENDER_EXTERNAL_URL`: Your public app URL for keep-alive.

Optional performance knobs (all have sane defaults):

- `CONTENT_CACHE_TTL_MS`: server-side content cache lifetime (default `60000`).
- `CONTENT_MAX_AGE` / `CONTENT_SWR`: `Cache-Control` values for `/api/content` (default `60` / `600`).
- `IMAGE_CACHE_MAX_AGE`: browser cache lifetime for optimized images (default 30 days).
- `IMAGE_CACHE_MAX_BYTES`: disk budget for `.cache/images` before pruning (default 512MB).
- `IMAGE_ALLOWED_HOSTS`: extra image origins `/api/img` may fetch from.
- `UPLOAD_WEBP_QUALITY` / `UPLOAD_MAX_WIDTH`: CMS upload conversion settings (default `82` / `2400`).
