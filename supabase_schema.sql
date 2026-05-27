-- Drop existing tables if they exist
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS roster;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS sponsors;
DROP TABLE IF EXISTS site_config;

-- Create news table (Note: Column names must match db.json keys exactly for easy migration)
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  "publishDate" DATE,
  "imageUrl" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create roster table
CREATE TABLE roster (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handicap FLOAT,
  year TEXT,
  faculty TEXT,
  "imageUrl" TEXT,
  "isFeatured" BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create staff table
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  year TEXT,
  "imageUrl" TEXT,
  "order" INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scores table
CREATE TABLE scores (
  id TEXT PRIMARY KEY,
  "tournamentName" TEXT NOT NULL,
  date DATE,
  result TEXT,
  "playersCount" INTEGER DEFAULT 0,
  "scoresList" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gallery table
CREATE TABLE gallery (
  id TEXT PRIMARY KEY,
  title TEXT,
  "imageUrl" TEXT,
  date DATE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sponsors table
CREATE TABLE sponsors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "websiteUrl" TEXT,
  "imageUrl" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create site_config table
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Add Read policies
CREATE POLICY "Allow public read news" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public read roster" ON roster FOR SELECT USING (true);
CREATE POLICY "Allow public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Allow public read scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Allow public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Allow public read site_config" ON site_config FOR SELECT USING (true);

-- Add Write policies (for migration/admin)
-- Note: In a real app, you'd restrict this to authenticated users
CREATE POLICY "Allow all for news" ON news FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for roster" ON roster FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for staff" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for scores" ON scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for gallery" ON gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for sponsors" ON sponsors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for site_config" ON site_config FOR ALL USING (true) WITH CHECK (true);
