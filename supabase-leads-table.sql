-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Creates the leads + contacts tables for Nunya Bunya website

-- ═══════════════════════════════════════
-- LEADS TABLE (email list from lead magnets)
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'lead-magnet',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique ON leads(email);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on leads" ON leads
  FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════
-- CONTACTS TABLE (contact form messages)
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  package TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on contacts" ON contacts
  FOR ALL USING (true) WITH CHECK (true);
