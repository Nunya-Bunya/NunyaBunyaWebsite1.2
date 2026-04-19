-- Migration: Add lead_magnet, client_id, and other columns to leads table
-- Also makes name nullable (lead magnet captures are email-only)
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Make name nullable (lead magnet forms don't require name)
ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;

-- Add new columns for lead magnet tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interest TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS page TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_magnet TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_id TEXT;

-- Index for filtering by lead magnet and client
CREATE INDEX IF NOT EXISTS idx_leads_lead_magnet ON leads(lead_magnet);
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
