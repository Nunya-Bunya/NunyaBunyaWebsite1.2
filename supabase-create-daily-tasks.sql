-- Run this in Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)
-- Creates the daily_tasks table for the NBHQ My Day feature

CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- revenue, content, operations, build, creative, admin
  business TEXT, -- nunya-bunya, power-portraits, ben-alek-conner, orca, clg, bella-rhyder
  status TEXT DEFAULT 'pending', -- pending, done, skipped
  priority TEXT DEFAULT 'normal', -- urgent, high, normal, low
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by date
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status);

-- Enable RLS
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON daily_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Insert urgent/pinned items
INSERT INTO daily_tasks (date, title, category, business, priority) VALUES
  ('2026-04-13', 'DEADLINE: Screen Queensland PROOF application', 'creative', 'ben-alek-conner', 'urgent'),
  ('2026-04-05', 'OVERDUE: Send ORCA voting email', 'operations', 'orca', 'urgent');
