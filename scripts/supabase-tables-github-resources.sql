-- ─────────────────────────────────────────────────────────────────
-- Supabase tables for GitHub resource sync
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- public-apis/public-apis → ~1400 free APIs
CREATE TABLE IF NOT EXISTS public_apis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  auth TEXT DEFAULT 'No',
  https TEXT DEFAULT 'Yes',
  cors TEXT DEFAULT 'Unknown',
  category TEXT NOT NULL,
  url TEXT,
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, category)
);

-- sindresorhus/awesome → ~700 curated resource lists
CREATE TABLE IF NOT EXISTS awesome_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT NOT NULL,
  parent_name TEXT,
  synced_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, category)
);

-- Indexes for search + filter
CREATE INDEX IF NOT EXISTS idx_public_apis_category ON public_apis(category);
CREATE INDEX IF NOT EXISTS idx_public_apis_name ON public_apis USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_awesome_lists_category ON awesome_lists(category);
CREATE INDEX IF NOT EXISTS idx_awesome_lists_name ON awesome_lists USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- RLS: allow read for authenticated users (service role bypasses anyway)
ALTER TABLE public_apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE awesome_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read public_apis" ON public_apis FOR SELECT USING (true);
CREATE POLICY "Allow read awesome_lists" ON awesome_lists FOR SELECT USING (true);
CREATE POLICY "Allow service insert public_apis" ON public_apis FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service insert awesome_lists" ON awesome_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service update public_apis" ON public_apis FOR UPDATE USING (true);
CREATE POLICY "Allow service update awesome_lists" ON awesome_lists FOR UPDATE USING (true);
