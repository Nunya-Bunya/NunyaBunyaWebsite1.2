-- Playbook System: Play templates, runs, steps, and metrics
-- Run this migration against your Supabase project

-- ═══════════════════════════════════════════════════════════
-- PLAY TEMPLATES — the blueprint for each play
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS play_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,                    -- 'first-dollar', 'content-engine', etc.
  name TEXT NOT NULL,                           -- 'FIRST DOLLAR'
  description TEXT,                             -- Short summary
  chapter TEXT DEFAULT 'zero-to-one',           -- Which playbook chapter
  icon TEXT DEFAULT '💰',                       -- Emoji for UI

  -- The step definitions (JSON array)
  -- Each step: { key, name, agent, type: 'automated'|'approval'|'human'|'recurring',
  --              description, inputs_needed: [], schedule?, depends_on: [] }
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Input schema — what data the play needs to run
  -- Each input: { key, label, type: 'text'|'select'|'json', source?: 'clients'|'brand_docs', required }
  input_schema JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Default schedule for recurring steps (cron expressions)
  default_schedule JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  version INT DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- PLAY RUNS — an instance of a play for a specific client
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS play_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_template_id UUID REFERENCES play_templates(id),
  play_slug TEXT NOT NULL,                      -- Denormalized for quick queries
  client_id TEXT NOT NULL,                      -- References clients table
  client_name TEXT,                             -- Denormalized

  status TEXT NOT NULL DEFAULT 'configuring',   -- configuring, active, paused, completed, cancelled

  -- Resolved inputs (filled from docs + user input at launch)
  inputs JSONB DEFAULT '{}'::jsonb,

  -- Progress tracking
  total_steps INT DEFAULT 0,
  completed_steps INT DEFAULT 0,
  current_day INT DEFAULT 0,                    -- Day X of the campaign

  -- Schedule
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,                      -- When the daily loop fires next

  -- Notes / learnings
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- PLAY STEPS — individual step instances within a run
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS play_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_run_id UUID REFERENCES play_runs(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,                       -- Matches template step key
  name TEXT NOT NULL,
  agent TEXT,                                   -- Which agent handles this

  step_type TEXT NOT NULL,                      -- 'automated', 'approval', 'human', 'recurring'
  status TEXT NOT NULL DEFAULT 'pending',       -- pending, queued, running, awaiting_approval,
                                                -- awaiting_human, completed, failed, skipped

  -- For recurring steps
  schedule TEXT,                                -- Cron expression
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INT DEFAULT 0,

  -- Step data
  input_data JSONB DEFAULT '{}'::jsonb,         -- Data fed into this step
  output_data JSONB DEFAULT '{}'::jsonb,        -- Results from this step
  error TEXT,

  -- Approval integration
  approval_item_id UUID,                        -- Links to approval_items if awaiting approval

  -- Ordering and dependencies
  sort_order INT DEFAULT 0,
  depends_on TEXT[] DEFAULT '{}',               -- Step keys this depends on

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- PLAY METRICS — daily tracking data per run
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS play_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  play_run_id UUID REFERENCES play_runs(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Flexible metrics storage
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: { "dms_sent": 30, "replies": 5, "content_posted": 3, "conversations": 2, "revenue": 0 }

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(play_run_id, recorded_at)
);

-- ═══════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_play_runs_client ON play_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_play_runs_status ON play_runs(status);
CREATE INDEX IF NOT EXISTS idx_play_runs_slug ON play_runs(play_slug);
CREATE INDEX IF NOT EXISTS idx_play_steps_run ON play_steps(play_run_id);
CREATE INDEX IF NOT EXISTS idx_play_steps_status ON play_steps(status);
CREATE INDEX IF NOT EXISTS idx_play_metrics_run ON play_metrics(play_run_id);
CREATE INDEX IF NOT EXISTS idx_play_metrics_date ON play_metrics(recorded_at);

-- ═══════════════════════════════════════════════════════════
-- SEED: FIRST DOLLAR play template
-- ═══════════════════════════════════════════════════════════
INSERT INTO play_templates (slug, name, description, chapter, icon, steps, input_schema, default_schedule)
VALUES (
  'first-dollar',
  'FIRST DOLLAR',
  'The play that proves you''re not guessing. Validate demand before building anything. Run outbound + content + embedded attention simultaneously until Dollar #1.',
  'zero-to-one',
  '💰',

  -- STEPS
  '[
    {
      "key": "signal_scan",
      "name": "Signal Scan",
      "agent": "signal-agent",
      "type": "recurring",
      "description": "Find trending topics, repeating pain points, and what''s working. Output 3 content ideas with 3 hooks each.",
      "schedule": "0 7 * * *",
      "inputs_needed": ["industry", "target_audience", "platforms"],
      "depends_on": []
    },
    {
      "key": "content_creation",
      "name": "Content Creation",
      "agent": "content-agent",
      "type": "recurring",
      "description": "Generate 3 short-form video scripts + 1-2 supporting posts from Signal Agent output. Structure: Hook → Insight → Identity → CTA.",
      "schedule": "0 8 * * *",
      "inputs_needed": ["brand_voice", "offers"],
      "depends_on": ["signal_scan"]
    },
    {
      "key": "media_production",
      "name": "Media Production",
      "agent": "media-agent",
      "type": "approval",
      "description": "Generate video visuals, image assets, format for each platform. Queued for approval before posting.",
      "inputs_needed": ["brand_colors", "brand_fonts", "logo_url"],
      "depends_on": ["content_creation"]
    },
    {
      "key": "distribution",
      "name": "Distribution",
      "agent": "distribution-agent",
      "type": "automated",
      "description": "Post approved content to TikTok, Instagram, YouTube Shorts. Cross-post with platform-native formatting.",
      "schedule": "0 10 * * *",
      "inputs_needed": ["platform_accounts"],
      "depends_on": ["media_production"]
    },
    {
      "key": "outbound",
      "name": "Outbound DMs",
      "agent": "outbound-agent",
      "type": "recurring",
      "description": "Identify leads, generate 20-50 personalized DMs daily. First batch goes to approval, then auto after patterns validated.",
      "schedule": "0 9 * * *",
      "inputs_needed": ["target_audience", "offer_description", "dm_script"],
      "depends_on": []
    },
    {
      "key": "conversation",
      "name": "Conversation Management",
      "agent": "conversation-agent",
      "type": "recurring",
      "description": "Draft replies to inbound messages, handle objections, qualify leads. Approval queue for first week, then auto.",
      "schedule": "0 11 * * * ",
      "inputs_needed": ["offer_description", "pricing"],
      "depends_on": ["outbound"]
    },
    {
      "key": "embedded_attention",
      "name": "Embedded Attention",
      "agent": "embedded-agent",
      "type": "recurring",
      "description": "Post 10-20 high-quality comments daily in Reddit, Facebook groups, IG, YouTube. Add value first, soft CTA second.",
      "schedule": "0 12 * * *",
      "inputs_needed": ["target_communities", "expertise_topics"],
      "depends_on": []
    },
    {
      "key": "offer_setup",
      "name": "Offer Setup",
      "agent": "offer-agent",
      "type": "automated",
      "description": "Structure the offer, set pricing, create payment links, build landing page if needed.",
      "inputs_needed": ["service_name", "pricing", "booking_url"],
      "depends_on": []
    },
    {
      "key": "closer",
      "name": "Close Deals",
      "agent": null,
      "type": "human",
      "description": "When a lead is qualified — pitch, close, collect payment. Shows up in My Day.",
      "inputs_needed": [],
      "depends_on": ["conversation"]
    },
    {
      "key": "payment",
      "name": "Payment Collection",
      "agent": "payment-agent",
      "type": "automated",
      "description": "Generate Stripe/Cal.com payment links, send invoices, confirm payment received.",
      "inputs_needed": ["stripe_price_id", "booking_url"],
      "depends_on": ["closer"]
    },
    {
      "key": "analytics",
      "name": "Daily Analytics",
      "agent": "analytics-agent",
      "type": "recurring",
      "description": "Track views, retention, engagement, conversations, conversions. Feed into play metrics dashboard.",
      "schedule": "0 20 * * *",
      "inputs_needed": ["platform_accounts"],
      "depends_on": []
    },
    {
      "key": "optimization",
      "name": "Weekly Optimization",
      "agent": "optimization-agent",
      "type": "approval",
      "description": "Weekly report: what to double down on, what to kill, what to test next. Changes require approval.",
      "schedule": "0 9 * * 1",
      "inputs_needed": [],
      "depends_on": ["analytics"]
    }
  ]'::jsonb,

  -- INPUT SCHEMA
  '[
    {"key": "industry", "label": "Industry / Niche", "type": "text", "required": true, "source": null, "placeholder": "e.g. Portrait Photography, Digital Marketing"},
    {"key": "target_audience", "label": "Target Audience", "type": "text", "required": true, "source": null, "placeholder": "e.g. Brisbane business owners, solopreneurs"},
    {"key": "service_name", "label": "Service / Product Name", "type": "text", "required": true, "source": null, "placeholder": "e.g. Corporate Headshots, Done For You Marketing"},
    {"key": "offer_description", "label": "Offer Description", "type": "text", "required": true, "source": null, "placeholder": "What exactly are you selling?"},
    {"key": "pricing", "label": "Pricing", "type": "text", "required": true, "source": null, "placeholder": "e.g. $250 Essential / $450 Professional / $800 Executive"},
    {"key": "booking_url", "label": "Booking URL", "type": "text", "required": false, "source": null, "placeholder": "e.g. cal.com/powerportraits"},
    {"key": "dm_script", "label": "DM Opening Script", "type": "text", "required": false, "source": null, "placeholder": "Leave blank for default: Hey — quick question: are you trying to get more [result] right now?"},
    {"key": "brand_voice", "label": "Brand Voice", "type": "text", "required": false, "source": "brand_docs", "placeholder": "Auto-filled from brand docs if available"},
    {"key": "brand_colors", "label": "Brand Colors", "type": "text", "required": false, "source": "brand_docs", "placeholder": "Auto-filled from brand docs"},
    {"key": "brand_fonts", "label": "Brand Fonts", "type": "text", "required": false, "source": "brand_docs", "placeholder": "Auto-filled from brand docs"},
    {"key": "platforms", "label": "Active Platforms", "type": "text", "required": true, "source": null, "placeholder": "e.g. Twitter, Instagram, TikTok, LinkedIn"},
    {"key": "target_communities", "label": "Target Communities", "type": "text", "required": false, "source": null, "placeholder": "e.g. r/smallbusiness, Brisbane Entrepreneurs FB group"}
  ]'::jsonb,

  -- DEFAULT SCHEDULE
  '{
    "daily_loop": "0 7 * * *",
    "weekly_review": "0 9 * * 1",
    "timezone": "Australia/Brisbane"
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  steps = EXCLUDED.steps,
  input_schema = EXCLUDED.input_schema,
  default_schedule = EXCLUDED.default_schedule,
  updated_at = now();
