# Supabase Migration Plan

## Overview
Migrating from local `data/db.json` and local file uploads to a managed Supabase backend.

## 1. Database Schema (PostgreSQL)

### Tables
1. **news**
   - `id` (uuid, primary key)
   - `title` (text)
   - `excerpt` (text)
   - `content` (text)
   - `publishDate` (date)
   - `imageUrl` (text)
   - `created_at` (timestamp)

2. **roster**
   - `id` (uuid, primary key)
   - `name` (text)
   - `handicap` (float)
   - `year` (text)
   - `faculty` (text)
   - `imageUrl` (text)
   - `isFeatured` (boolean)
   - `created_at` (timestamp)

3. **staff**
   - `id` (uuid, primary key)
   - `name` (text)
   - `role` (text)
   - `year` (text)
   - `imageUrl` (text)
   - `order` (integer)
   - `created_at` (timestamp)

4. **scores**
   - `id` (uuid, primary key)
   - `tournamentName` (text)
   - `date` (date)
   - `result` (text)
   - `playersCount` (integer)
   - `scoresList` (jsonb)
   - `created_at` (timestamp)

5. **gallery**
   - `id` (uuid, primary key)
   - `title` (text)
   - `imageUrl` (text)
   - `date` (date)
   - `category` (text)
   - `created_at` (timestamp)

6. **sponsors**
   - `id` (uuid, primary key)
   - `name` (text)
   - `description` (text)
   - `websiteUrl` (text)
   - `imageUrl` (text)
   - `isActive` (boolean)
   - `created_at` (timestamp)

7. **site_config**
   - `key` (text, primary key) - e.g., 'welcome_section', 'upcoming_activity', 'site_settings', 'site_labels'
   - `data` (jsonb)
   - `updated_at` (timestamp)

### Storage
- Bucket name: `uploads`
- Public access policy: Enabled for read.

## 2. Implementation Roadmap

### Phase 1: Preparation
- [x] Install `@supabase/supabase-js`.
- [ ] Set up `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### Phase 2: Schema Creation
- [x] Provide SQL script for Supabase dashboard (`supabase_schema.sql`).

### Phase 3: Data Migration
- [x] Create `scripts/migrate-to-supabase.ts`.
- [ ] Run migration to move JSON data and local files to Supabase.

### Phase 4: Backend Refactor
- [x] Update `server.ts` to use Supabase for all CRUD operations.
- [x] Update `server.ts` to use Supabase Storage for file uploads.

### Phase 5: Verification
- [ ] Test all API endpoints.
- [ ] Verify image uploads work and serve from Supabase URL.
