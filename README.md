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
