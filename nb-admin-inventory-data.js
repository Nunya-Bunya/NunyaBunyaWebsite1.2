// Asset Inventory Data — Single source of truth for what's built per business
// Update counts here as you build. Dashboard reads from this file.

const INVENTORY_BUSINESSES = [
  { id: 'nb', name: 'Nunya Bunya', short: 'NB', color: '#00E5CC' },
  { id: 'pp', name: 'Power Portraits', short: 'PP', color: '#FF2D78' },
  { id: 'pdw', name: 'Pawesome Dog Walkers', short: 'PDW', color: '#FFB800' },
  { id: 'orca', name: 'ORCA Film Awards', short: 'ORCA', color: '#9B59B6' },
  { id: 'cl', name: 'Conner Law', short: 'CL', color: '#4A90D9' },
  { id: 'bac', name: 'Ben Alek Conner', short: 'BAC', color: '#E67E22' },
  { id: 'br', name: 'Bella Ryhider', short: 'BR', color: '#1ABC9C' },
];

const INVENTORY_CATEGORIES = [
  {
    id: 'foundation',
    label: 'Foundation',
    icon: '&#9881;',
    items: [
      { id: 'website', label: 'Website Live' },
      { id: 'domain_ssl', label: 'Domain + SSL' },
      { id: 'analytics', label: 'Analytics Installed' },
      { id: 'crm_entry', label: 'CRM Entry' },
      { id: 'booking_page', label: 'Booking Page' },
      { id: 'short_links', label: 'Short Links' },
      { id: 'gmb', label: 'Google Business Profile' },
    ]
  },
  {
    id: 'brand',
    label: 'Brand Assets',
    icon: '&#9997;',
    items: [
      { id: 'logo_png', label: 'Logo (PNG)' },
      { id: 'logo_svg', label: 'Logo (SVG)' },
      { id: 'brand_bible', label: 'Brand Bible' },
      { id: 'brand_voice', label: 'Brand Voice Guide' },
      { id: 'social_profile_kit', label: 'Social Profile Kit' },
      { id: 'icon_set', label: 'Icon Set' },
      { id: 'photo_guidelines', label: 'Photo Guidelines' },
    ]
  },
  {
    id: 'lead_gen',
    label: 'Lead Generation',
    icon: '&#9883;',
    items: [
      { id: 'lead_magnets', label: 'Lead Magnets' },
      { id: 'landing_pages', label: 'Landing Pages' },
      { id: 'optin_forms', label: 'Opt-in Forms' },
      { id: 'welcome_sequence', label: 'Welcome Email Sequence' },
      { id: 'nurture_sequence', label: 'Nurture Email Sequence' },
      { id: 'booking_funnel', label: 'Booking Funnel' },
    ]
  },
  {
    id: 'content',
    label: 'Content Bank',
    icon: '&#128203;',
    items: [
      { id: 'blog_posts', label: 'Blog Posts Published' },
      { id: 'social_posts_bank', label: 'Social Posts in Bank' },
      { id: 'content_calendar', label: 'Content Calendar' },
      { id: 'reel_scripts', label: 'Reel / Video Scripts' },
      { id: 'customer_personas', label: 'Customer Personas' },
      { id: 'case_studies', label: 'Case Studies' },
      { id: 'testimonials', label: 'Testimonials (Real)' },
    ]
  },
  {
    id: 'ads',
    label: 'Ads',
    icon: '&#127981;',
    items: [
      { id: 'ad_creatives_static', label: 'Ad Creatives (Static)' },
      { id: 'ad_creatives_video', label: 'Ad Creatives (Video)' },
      { id: 'ad_copy_sets', label: 'Ad Copy Sets' },
      { id: 'active_campaigns', label: 'Active Campaigns' },
    ]
  },
  {
    id: 'email',
    label: 'Email Marketing',
    icon: '&#9993;',
    items: [
      { id: 'mautic_segments', label: 'Mautic Segments' },
      { id: 'email_sequences', label: 'Email Sequences' },
      { id: 'email_templates', label: 'Email Templates' },
      { id: 'campaign_automations', label: 'Campaign Automations' },
    ]
  },
  {
    id: 'automations',
    label: 'Automations & Pipelines',
    icon: '&#9889;',
    items: [
      { id: 'n8n_workflows', label: 'n8n Workflows' },
      { id: 'cron_jobs', label: 'Cron Jobs Active' },
      { id: 'social_pipelines', label: 'Social Posting Pipelines' },
      { id: 'content_pipelines', label: 'Content Gen Pipelines' },
      { id: 'outreach_pipelines', label: 'Outreach Pipelines' },
    ]
  },
  {
    id: 'sales',
    label: 'Sales & Revenue',
    icon: '&#128176;',
    items: [
      { id: 'pricing_defined', label: 'Pricing / Packages Defined' },
      { id: 'proposals', label: 'Proposals / Pitch Decks' },
      { id: 'contracts', label: 'Contracts' },
      { id: 'invoice_templates', label: 'Invoice Templates' },
      { id: 'onboarding_flow', label: 'Client Onboarding Flow' },
    ]
  },
  {
    id: 'seo',
    label: 'SEO',
    icon: '&#128269;',
    items: [
      { id: 'pillar_pages', label: 'Pillar Pages' },
      { id: 'seo_blog_posts', label: 'SEO Blog Posts' },
      { id: 'schema_markup', label: 'Schema Markup' },
      { id: 'gmb_optimized', label: 'GMB Claimed + Optimized' },
      { id: 'backlinks', label: 'Backlinks' },
    ]
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: '&#9776;',
    items: [
      { id: 'metabase_dashboards', label: 'Metabase Dashboards' },
      { id: 'weekly_report_auto', label: 'Weekly Report Automation' },
      { id: 'client_reports', label: 'Client-Facing Reports' },
    ]
  },
];

// COUNTS — Update these as you build!
// Format: { itemId: count } per business
// count = 0 means "not started", 1+ means "built that many"
// Use -1 for "not applicable" (e.g. Booking Page for ORCA)
const INVENTORY_COUNTS = {
  nb: {
    // Foundation
    website: 1, domain_ssl: 1, analytics: 1, crm_entry: 1, booking_page: 1, short_links: 1, gmb: 0,
    // Brand
    logo_png: 1, logo_svg: 0, brand_bible: 1, brand_voice: 1, social_profile_kit: 1, icon_set: 0, photo_guidelines: 0,
    // Lead Gen
    lead_magnets: 2, landing_pages: 3, optin_forms: 1, welcome_sequence: 1, nurture_sequence: 1, booking_funnel: 1,
    // Content
    blog_posts: 5, social_posts_bank: 30, content_calendar: 1, reel_scripts: 0, customer_personas: 0, case_studies: 3, testimonials: 0,
    // Ads
    ad_creatives_static: 4, ad_creatives_video: 0, ad_copy_sets: 3, active_campaigns: 0,
    // Email
    mautic_segments: 2, email_sequences: 3, email_templates: 2, campaign_automations: 1,
    // Automations
    n8n_workflows: 6, cron_jobs: 4, social_pipelines: 1, content_pipelines: 1, outreach_pipelines: 1,
    // Sales
    pricing_defined: 1, proposals: 1, contracts: 0, invoice_templates: 0, onboarding_flow: 1,
    // SEO
    pillar_pages: 3, seo_blog_posts: 5, schema_markup: 1, gmb_optimized: 0, backlinks: 0,
    // Reporting
    metabase_dashboards: 3, weekly_report_auto: 1, client_reports: 0,
  },
  pp: {
    website: 1, domain_ssl: 1, analytics: 1, crm_entry: 1, booking_page: 1, short_links: 1, gmb: 0,
    logo_png: 1, logo_svg: 0, brand_bible: 1, brand_voice: 1, social_profile_kit: 1, icon_set: 0, photo_guidelines: 1,
    lead_magnets: 1, landing_pages: 2, optin_forms: 1, welcome_sequence: 1, nurture_sequence: 1, booking_funnel: 1,
    blog_posts: 0, social_posts_bank: 20, content_calendar: 1, reel_scripts: 0, customer_personas: 1, case_studies: 0, testimonials: 0,
    ad_creatives_static: 3, ad_creatives_video: 0, ad_copy_sets: 2, active_campaigns: 0,
    mautic_segments: 1, email_sequences: 2, email_templates: 1, campaign_automations: 1,
    n8n_workflows: 2, cron_jobs: 2, social_pipelines: 1, content_pipelines: 0, outreach_pipelines: 0,
    pricing_defined: 1, proposals: 0, contracts: 0, invoice_templates: 0, onboarding_flow: 0,
    pillar_pages: 3, seo_blog_posts: 0, schema_markup: 1, gmb_optimized: 0, backlinks: 0,
    metabase_dashboards: 0, weekly_report_auto: 0, client_reports: 0,
  },
  pdw: {
    website: 1, domain_ssl: 1, analytics: 1, crm_entry: 1, booking_page: 1, short_links: 1, gmb: 0,
    logo_png: 1, logo_svg: 0, brand_bible: 1, brand_voice: 1, social_profile_kit: 1, icon_set: 0, photo_guidelines: 0,
    lead_magnets: 0, landing_pages: 1, optin_forms: 1, welcome_sequence: 0, nurture_sequence: 0, booking_funnel: 1,
    blog_posts: 0, social_posts_bank: 10, content_calendar: 0, reel_scripts: 0, customer_personas: 0, case_studies: 0, testimonials: 0,
    ad_creatives_static: 2, ad_creatives_video: 0, ad_copy_sets: 1, active_campaigns: 0,
    mautic_segments: 0, email_sequences: 0, email_templates: 0, campaign_automations: 0,
    n8n_workflows: 1, cron_jobs: 1, social_pipelines: 1, content_pipelines: 0, outreach_pipelines: 0,
    pricing_defined: 1, proposals: 0, contracts: 0, invoice_templates: 0, onboarding_flow: 0,
    pillar_pages: 0, seo_blog_posts: 0, schema_markup: 0, gmb_optimized: 0, backlinks: 0,
    metabase_dashboards: 0, weekly_report_auto: 0, client_reports: 0,
  },
  orca: {
    website: 1, domain_ssl: 1, analytics: 1, crm_entry: -1, booking_page: -1, short_links: 1, gmb: -1,
    logo_png: 1, logo_svg: 0, brand_bible: 1, brand_voice: 1, social_profile_kit: 1, icon_set: 0, photo_guidelines: 0,
    lead_magnets: 0, landing_pages: 1, optin_forms: 1, welcome_sequence: 0, nurture_sequence: 0, booking_funnel: -1,
    blog_posts: 0, social_posts_bank: 5, content_calendar: 0, reel_scripts: 0, customer_personas: 0, case_studies: -1, testimonials: -1,
    ad_creatives_static: 0, ad_creatives_video: 0, ad_copy_sets: 0, active_campaigns: 0,
    mautic_segments: 0, email_sequences: 0, email_templates: 0, campaign_automations: 0,
    n8n_workflows: 1, cron_jobs: 1, social_pipelines: 1, content_pipelines: 0, outreach_pipelines: 0,
    pricing_defined: -1, proposals: -1, contracts: -1, invoice_templates: -1, onboarding_flow: -1,
    pillar_pages: 0, seo_blog_posts: 0, schema_markup: 1, gmb_optimized: -1, backlinks: 0,
    metabase_dashboards: 0, weekly_report_auto: 0, client_reports: -1,
  },
  cl: {
    website: 1, domain_ssl: 1, analytics: 1, crm_entry: 1, booking_page: 1, short_links: 1, gmb: 0,
    logo_png: 1, logo_svg: 0, brand_bible: 1, brand_voice: 1, social_profile_kit: 0, icon_set: 0, photo_guidelines: 0,
    lead_magnets: 1, landing_pages: 2, optin_forms: 1, welcome_sequence: 1, nurture_sequence: 1, booking_funnel: 1,
    blog_posts: 0, social_posts_bank: 0, content_calendar: 0, reel_scripts: 0, customer_personas: 0, case_studies: 0, testimonials: 0,
    ad_creatives_static: 1, ad_creatives_video: 0, ad_copy_sets: 1, active_campaigns: 0,
    mautic_segments: 1, email_sequences: 2, email_templates: 1, campaign_automations: 1,
    n8n_workflows: 0, cron_jobs: 0, social_pipelines: 0, content_pipelines: 0, outreach_pipelines: 0,
    pricing_defined: 1, proposals: 0, contracts: 0, invoice_templates: 0, onboarding_flow: 0,
    pillar_pages: 0, seo_blog_posts: 0, schema_markup: 1, gmb_optimized: 0, backlinks: 0,
    metabase_dashboards: 0, weekly_report_auto: 0, client_reports: 0,
  },
  bac: {
    website: 1, domain_ssl: 1, analytics: 0, crm_entry: -1, booking_page: 0, short_links: 0, gmb: 0,
    logo_png: 0, logo_svg: 0, brand_bible: 0, brand_voice: 0, social_profile_kit: 0, icon_set: 0, photo_guidelines: 0,
    lead_magnets: 0, landing_pages: 0, optin_forms: 0, welcome_sequence: 0, nurture_sequence: 0, booking_funnel: 0,
    blog_posts: 0, social_posts_bank: 0, content_calendar: 0, reel_scripts: 0, customer_personas: 0, case_studies: -1, testimonials: -1,
    ad_creatives_static: 0, ad_creatives_video: 0, ad_copy_sets: 0, active_campaigns: 0,
    mautic_segments: 0, email_sequences: 0, email_templates: 0, campaign_automations: 0,
    n8n_workflows: 0, cron_jobs: 0, social_pipelines: 0, content_pipelines: 0, outreach_pipelines: 0,
    pricing_defined: 0, proposals: 0, contracts: 0, invoice_templates: 0, onboarding_flow: -1,
    pillar_pages: 0, seo_blog_posts: 0, schema_markup: 0, gmb_optimized: 0, backlinks: 0,
    metabase_dashboards: 0, weekly_report_auto: 0, client_reports: -1,
  },
  br: {
    website: 0, domain_ssl: 0, analytics: 0, crm_entry: 0, booking_page: 0, short_links: 0, gmb: 0,
    logo_png: 1, logo_svg: 0, brand_bible: 1, brand_voice: 1, social_profile_kit: 0, icon_set: 0, photo_guidelines: 1,
    lead_magnets: 0, landing_pages: 0, optin_forms: 0, welcome_sequence: 0, nurture_sequence: 0, booking_funnel: 0,
    blog_posts: 0, social_posts_bank: 0, content_calendar: 1, reel_scripts: 8, customer_personas: 3, case_studies: -1, testimonials: 0,
    ad_creatives_static: 0, ad_creatives_video: 0, ad_copy_sets: 0, active_campaigns: 0,
    mautic_segments: 0, email_sequences: 0, email_templates: 0, campaign_automations: 0,
    n8n_workflows: 0, cron_jobs: 0, social_pipelines: 0, content_pipelines: 0, outreach_pipelines: 0,
    pricing_defined: 1, proposals: 1, contracts: 0, invoice_templates: 0, onboarding_flow: 0,
    pillar_pages: 0, seo_blog_posts: 0, schema_markup: 0, gmb_optimized: 0, backlinks: 0,
    metabase_dashboards: 0, weekly_report_auto: 0, client_reports: 0,
  },
};
