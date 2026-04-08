-- Upsell Orders table — tracks all paid upsell product purchases
-- Run in Supabase SQL editor (project: podyldvpvgqktwbqswrc)

CREATE TABLE IF NOT EXISTS upsell_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL,          -- brand-bible, style-guide, brand-bundle, website-package
  client_name TEXT,
  client_email TEXT,
  amount NUMERIC(10,2),
  tier TEXT DEFAULT 'standard',   -- standard, premium (for website-package)
  stripe_session_id TEXT,
  submission_id TEXT,             -- links back to bfk_submissions if applicable
  status TEXT DEFAULT 'paid',     -- paid, generating, delivered, refunded
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_url TEXT,              -- URL to download deliverables
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_upsell_orders_email ON upsell_orders(client_email);
CREATE INDEX IF NOT EXISTS idx_upsell_orders_product ON upsell_orders(product);
CREATE INDEX IF NOT EXISTS idx_upsell_orders_stripe ON upsell_orders(stripe_session_id);

-- RLS (service role bypasses, anon blocked)
ALTER TABLE upsell_orders ENABLE ROW LEVEL SECURITY;
