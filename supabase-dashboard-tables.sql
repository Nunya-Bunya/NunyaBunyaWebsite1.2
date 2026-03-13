-- Nunya Bunya Admin Dashboard — Supabase Tables
-- Run this in Supabase SQL Editor to create the dashboard tables.

-- 1. Clients table
CREATE TABLE IF NOT EXISTS dashboard_clients (
    client_id         TEXT PRIMARY KEY,
    client_name       TEXT NOT NULL,
    business_type     TEXT,
    location          TEXT,
    service           TEXT,
    tier              TEXT DEFAULT 'client',
    active            BOOLEAN DEFAULT TRUE,
    platforms         JSONB DEFAULT '[]',
    content_pillars   JSONB DEFAULT '[]',
    posting_frequency JSONB DEFAULT '{}',
    pipelines         JSONB DEFAULT '[]',
    client_url        TEXT,
    cta_link          TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dashboard_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on dashboard_clients"
    ON dashboard_clients FOR ALL
    USING (true) WITH CHECK (true);

-- 2. Content items (calendar + tasks)
CREATE TABLE IF NOT EXISTS dashboard_content_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         TEXT NOT NULL REFERENCES dashboard_clients(client_id) ON DELETE CASCADE,
    content_id        TEXT,
    date              DATE NOT NULL,
    platform          TEXT NOT NULL,
    content_type      TEXT,
    pillar            TEXT,
    topic             TEXT,
    hook              TEXT,
    cta               TEXT,
    caption           TEXT,
    status            TEXT DEFAULT 'planned',
    month_key         TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_items_date ON dashboard_content_items(date);
CREATE INDEX IF NOT EXISTS idx_content_items_client ON dashboard_content_items(client_id);
CREATE INDEX IF NOT EXISTS idx_content_items_month ON dashboard_content_items(month_key);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON dashboard_content_items(status);

ALTER TABLE dashboard_content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on dashboard_content_items"
    ON dashboard_content_items FOR ALL
    USING (true) WITH CHECK (true);

-- 3. Weekly notes (accomplished / in progress / upcoming)
CREATE TABLE IF NOT EXISTS dashboard_weekly_notes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         TEXT NOT NULL REFERENCES dashboard_clients(client_id) ON DELETE CASCADE,
    week_start        DATE NOT NULL,
    accomplished      TEXT,
    in_progress       TEXT,
    upcoming          TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, week_start)
);

ALTER TABLE dashboard_weekly_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on dashboard_weekly_notes"
    ON dashboard_weekly_notes FOR ALL
    USING (true) WITH CHECK (true);

-- 4. Reports
CREATE TABLE IF NOT EXISTS dashboard_reports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         TEXT NOT NULL REFERENCES dashboard_clients(client_id) ON DELETE CASCADE,
    report_type       TEXT NOT NULL,
    report_date       DATE NOT NULL,
    title             TEXT,
    summary           TEXT,
    full_data         JSONB DEFAULT '{}',
    status            TEXT DEFAULT 'draft',
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_client ON dashboard_reports(client_id, report_type);

ALTER TABLE dashboard_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on dashboard_reports"
    ON dashboard_reports FOR ALL
    USING (true) WITH CHECK (true);
