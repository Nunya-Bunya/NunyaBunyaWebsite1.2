// Admin API: Consolidated data endpoints — documents, benchmark, onboard (via ?action= param)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Temporary debug endpoint
  if (req.query.action === 'debug-env' && req.query.key === 'fix2026') {
    const url = process.env.SUPABASE_URL || 'NOT SET';
    const key = process.env.SUPABASE_KEY || 'NOT SET';
    const results = {};

    // Test 1: direct fetch to Supabase
    try {
      const r1 = await fetch(`${url}/rest/v1/`, { headers: { 'apikey': key } });
      results.direct = { status: r1.status, ok: r1.ok };
    } catch (e) { results.direct = { error: e.message, code: e.cause?.code }; }

    // Test 2: try the other Supabase URL that was working before
    try {
      const r2 = await fetch('https://podyldvpvgqktwbqswrc.supabase.co/rest/v1/', { headers: { 'apikey': key } });
      results.old_url = { status: r2.status };
    } catch (e) { results.old_url = { error: e.message }; }

    // Test 3: DNS resolution test
    try {
      const r3 = await fetch('https://dqxwrhxablsioztsyshr.supabase.co/rest/v1/', {
        headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxeHdyaHhhYmxzaW96dHN5c2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTc0NzMsImV4cCI6MjA3MTQ3MzQ3M30.-vdFiI39GjM4ftLvWAPssAQgvx30QHgfnya-SWpwPqw' }
      });
      results.hardcoded_anon = { status: r3.status, body: (await r3.text()).substring(0, 100) };
    } catch (e) { results.hardcoded_anon = { error: e.message, code: e.cause?.code }; }

    return res.status(200).json({ url, key_len: key.length, results });
  }

  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { action } = req.query;

  // Debug: show what env vars are available (masked) — temporary, remove after fixing
  // Temporary debug — move above auth check


  try {
    // ── Documents (pipeline_documents only) ──
    if (action === 'documents' && req.method === 'GET') {
      const { client_id, category, doc_type, limit } = req.query;
      let query = 'pipeline_documents?order=created_at.desc';
      if (client_id) query += `&client_id=eq.${encodeURIComponent(client_id)}`;
      if (category) query += `&doc_category=eq.${encodeURIComponent(category)}`;
      if (doc_type) query += `&doc_type=eq.${encodeURIComponent(doc_type)}`;
      query += `&limit=${limit || 50}`;
      const docs = await supabaseFetch(query);
      return res.status(200).json({ total: (docs || []).length, documents: docs || [] });
    }

    // ── Save/Update a pipeline document ──
    if (action === 'save-doc' && req.method === 'POST') {
      const { client_id, doc_type, content_json, status } = req.body || {};
      if (!client_id || !doc_type) return res.status(400).json({ error: 'client_id and doc_type required.' });

      // Upsert: find existing doc and update, or create new
      const existing = await supabaseFetch(`pipeline_documents?client_id=eq.${encodeURIComponent(client_id)}&doc_type=eq.${encodeURIComponent(doc_type)}&order=created_at.desc&limit=1`).catch(() => []);

      if (existing && existing.length) {
        await supabaseFetch(`pipeline_documents?id=eq.${existing[0].id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            content_json: typeof content_json === 'string' ? content_json : JSON.stringify(content_json),
            content: typeof content_json === 'string' ? content_json : JSON.stringify(content_json, null, 2),
            status: status || existing[0].status,
            updated_at: new Date().toISOString(),
          }),
        });
        return res.status(200).json({ success: true, action: 'updated', id: existing[0].id });
      } else {
        const created = await supabaseFetch('pipeline_documents', {
          method: 'POST',
          body: JSON.stringify({
            client_id, doc_type, doc_category: 'planning',
            title: `Content Calendar`,
            content_json: typeof content_json === 'string' ? content_json : JSON.stringify(content_json),
            content: typeof content_json === 'string' ? content_json : JSON.stringify(content_json, null, 2),
            status: status || 'draft', version: 1, created_by: 'nbhq',
          }),
        });
        return res.status(201).json({ success: true, action: 'created', doc: created?.[0] });
      }
    }

    // ── Generate content from approved calendar ──
    if (action === 'generate-from-calendar' && req.method === 'POST') {
      const { client_id } = req.body || {};
      if (!client_id) return res.status(400).json({ error: 'client_id required.' });

      const agentUrl = process.env.AGENT_SERVER_URL || 'http://localhost:8000';

      // Mark calendar as approved
      const docs = await supabaseFetch(`pipeline_documents?client_id=eq.${encodeURIComponent(client_id)}&doc_type=eq.content_calendar&order=created_at.desc&limit=1`).catch(() => []);
      if (docs && docs.length) {
        await supabaseFetch(`pipeline_documents?id=eq.${docs[0].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'approved', updated_at: new Date().toISOString() }),
        });
      }

      // Trigger enterprise_month pipeline
      let pipelineResult = null;
      try {
        const pRes = await fetch(`${agentUrl}/pipeline/enterprise_month`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id }),
        });
        pipelineResult = await pRes.json();
      } catch { pipelineResult = { error: 'Agent server unreachable' }; }

      return res.status(202).json({
        success: true,
        calendar_approved: true,
        pipeline: pipelineResult,
      });
    }

    // ── Deliverables (ALL content across all tables for a client) ──
    if (action === 'deliverables' && req.method === 'GET') {
      const { client_id, client_name } = req.query;
      if (!client_id && !client_name) return res.status(400).json({ error: 'client_id or client_name required.' });

      // Fetch from all tables in parallel
      const slugFilter = client_id ? `client_id=eq.${encodeURIComponent(client_id)}` : '';
      const nameFilter = client_name ? `client_name=eq.${encodeURIComponent(client_name)}` : '';
      // pipeline_documents uses slug, other tables use client_name
      const docFilter = slugFilter;
      const contentFilter = nameFilter || slugFilter;

      const [pipelineDocs, campaigns, socialPosts, weeklyReports, seoReports, adsReports] = await Promise.all([
        supabaseFetch(`pipeline_documents?${docFilter}&order=created_at.desc&limit=50`).catch(() => []),
        supabaseFetch(`content_campaigns?${contentFilter}&order=created_at.desc&limit=30`).catch(() => []),
        supabaseFetch(`social_posts?${contentFilter}&order=created_at.desc&limit=30`).catch(() => []),
        supabaseFetch(`weekly_reports?${contentFilter}&order=report_date.desc&limit=10`).catch(() => []),
        supabaseFetch(`seo_reports?${contentFilter}&order=report_date.desc&limit=10`).catch(() => []),
        supabaseFetch(`ads_reports?order=report_date.desc&limit=10`).catch(() => []),
      ]);

      // Normalize into unified deliverables list
      const deliverables = [];

      (pipelineDocs || []).forEach(d => deliverables.push({
        id: d.id, type: 'strategy_doc', subtype: d.doc_type, category: d.doc_category,
        title: d.title || d.doc_type?.replace(/_/g, ' '), status: d.status,
        created_at: d.created_at, created_by: d.created_by,
        content_json: d.content_json, content: d.content, source_table: 'pipeline_documents',
      }));

      (campaigns || []).forEach(d => deliverables.push({
        id: d.id, type: 'blog_post', subtype: 'content_campaign', category: 'content',
        title: d.topic || 'Blog Post', status: d.status,
        created_at: d.created_at, created_by: 'content_machine',
        content_json: { blog_post: d.blog_post, social_posts: d.social_posts, newsletter: d.newsletter,
                        ad_pack: d.ad_pack, seo_keywords: d.seo_keywords, image_prompt: d.image_prompt },
        content: d.blog_post, source_table: 'content_campaigns',
      }));

      (socialPosts || []).forEach(d => deliverables.push({
        id: d.id, type: 'social_post', subtype: d.platform || 'multi', category: 'content',
        title: d.topic || 'Social Post Batch', status: d.status,
        created_at: d.created_at, created_by: 'social_agent',
        content_json: d.posts, content: null, source_table: 'social_posts',
      }));

      (weeklyReports || []).forEach(d => deliverables.push({
        id: d.id, type: 'weekly_report', subtype: 'weekly', category: 'report',
        title: 'Weekly Report — ' + (d.reporting_period || ''), status: d.status,
        created_at: d.report_date, created_by: 'reporting_agent',
        content_json: d.full_report, content: null, source_table: 'weekly_reports',
      }));

      (seoReports || []).forEach(d => deliverables.push({
        id: d.id, type: 'seo_report', subtype: 'seo', category: 'report',
        title: 'SEO Report', status: d.status,
        created_at: d.report_date, created_by: 'seo_agent',
        content_json: { keywords: d.keyword_opportunities, calendar: d.content_calendar,
                        quick_wins: d.quick_wins, gaps: d.competitor_gaps, summary: d.executive_summary },
        content: d.executive_summary, source_table: 'seo_reports',
      }));

      // Sort all by date descending
      deliverables.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Group by category
      const grouped = { strategy: [], content: [], report: [] };
      deliverables.forEach(d => {
        const cat = d.category || 'content';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(d);
      });

      return res.status(200).json({
        total: deliverables.length,
        deliverables,
        grouped,
        counts: {
          strategy_docs: (pipelineDocs || []).length,
          blog_posts: (campaigns || []).length,
          social_posts: (socialPosts || []).length,
          weekly_reports: (weeklyReports || []).length,
          seo_reports: (seoReports || []).length,
          ads_reports: (adsReports || []).length,
        },
      });
    }

    // ── Benchmark GET ──
    if (action === 'benchmark' && req.method === 'GET') {
      const { id, client_id, limit } = req.query;
      if (id) {
        const runs = await supabaseFetch(`benchmark_runs?id=eq.${encodeURIComponent(id)}`);
        if (!runs || runs.length === 0) return res.status(404).json({ error: 'Benchmark not found.' });
        return res.status(200).json(runs[0]);
      }
      let query = 'benchmark_runs?order=started_at.desc';
      if (client_id) query += `&client_id=eq.${encodeURIComponent(client_id)}`;
      query += `&limit=${limit || 20}`;
      const runs = await supabaseFetch(query);
      return res.status(200).json({ total: (runs || []).length, runs: runs || [] });
    }

    // ── Benchmark POST ──
    if (action === 'benchmark' && req.method === 'POST') {
      const { client_id, run_type, notes } = req.body || {};
      if (!client_id || !run_type) return res.status(400).json({ error: 'client_id and run_type required.' });

      const created = await supabaseFetch('benchmark_runs', {
        method: 'POST',
        body: JSON.stringify({ client_id, run_type, notes: notes || null, started_at: new Date().toISOString(), status: 'running' }),
      });
      const benchmark = created?.[0];
      if (!benchmark) return res.status(500).json({ error: 'Failed to create benchmark.' });

      const agentUrl = process.env.AGENT_SERVER_URL || 'http://localhost:8000';
      const pipelineName = run_type === 'onboarding' ? 'full_brand_setup' : 'enterprise_month';
      let pipelineResult = null;
      try {
        const pipelineRes = await fetch(`${agentUrl}/pipeline/${pipelineName}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ client_id, benchmark_run_id: benchmark.id }),
        });
        pipelineResult = await pipelineRes.json();
      } catch { pipelineResult = { error: 'Agent server unreachable' }; }

      return res.status(201).json({ success: true, benchmark, pipeline: pipelineResult });
    }

    // ── Onboard POST ──
    if (action === 'onboard' && req.method === 'POST') {
      const b = req.body || {};
      if (!b.client_name) return res.status(400).json({ error: 'client_name required.' });

      const slug = b.client_slug || b.client_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const clientRow = {
        client_slug: slug, client_name: b.client_name, business_type: b.business_type || null,
        location: b.location || null, service: b.service || null, tone: b.tone || null,
        target_audience: b.target_audience || null, target_city: b.target_city || null,
        website_url: b.website_url || null, cta_link: b.cta_link || null,
        attorney_name: b.attorney_name || null, goals: b.goals || null, notes: b.notes || null,
        google_place_id: b.google_place_id || null, facebook_page_id: b.facebook_page_id || null,
        wp_url: b.wp_url || null, platforms: b.platforms || [], content_pillars: b.content_pillars || [],
        posting_frequency: b.posting_frequency || {}, pipelines: b.pipelines || [],
        tier: b.tier || 'client', active: true, updated_at: new Date().toISOString(),
      };

      const created = await supabaseFetch('clients', {
        method: 'POST', body: JSON.stringify(clientRow),
        headers: { 'Prefer': 'resolution=merge-duplicates' }, prefer: 'resolution=merge-duplicates',
      });
      const result = { success: true, client: created?.[0] || clientRow, client_slug: slug };

      if (b.trigger_pipeline !== false) {
        const agentUrl = process.env.AGENT_SERVER_URL || 'http://localhost:8000';
        try {
          const pRes = await fetch(`${agentUrl}/pipeline/full_brand_setup`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_id: slug }),
          });
          result.pipeline = await pRes.json();
          result.pipeline_triggered = true;
        } catch { result.pipeline_triggered = false; result.pipeline_error = 'Agent server unreachable.'; }
      }
      return res.status(201).json(result);
    }

    // ── External Service Proxies (keeps credentials server-side) ──

    // Generic Mautic API proxy — any endpoint, server-side auth
    if (action === 'service-mautic') {
      const MAUTIC_URL = process.env.MAUTIC_URL || 'https://mautic.nunyabunya.com';
      const MAUTIC_USER = process.env.MAUTIC_API_USER;
      const MAUTIC_PASS = process.env.MAUTIC_API_PASSWORD;
      if (!MAUTIC_USER || !MAUTIC_PASS) return res.status(200).json({ error: 'Mautic not configured' });
      const auth = Buffer.from(`${MAUTIC_USER}:${MAUTIC_PASS}`).toString('base64');
      const { endpoint, ...rest } = req.query;
      if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
      // Build query string from remaining params (excluding action)
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(rest)) { if (k !== 'action') params.set(k, v); }
      const qs = params.toString() ? `?${params.toString()}` : '';
      try {
        const r = await fetch(`${MAUTIC_URL}/api/${endpoint}${qs}`, { headers: { 'Authorization': `Basic ${auth}` } });
        if (!r.ok) return res.status(200).json({});
        return res.status(200).json(await r.json());
      } catch { return res.status(200).json({}); }
    }

    if (action === 'service-mautic-submissions') {
      const MAUTIC_URL = process.env.MAUTIC_URL || 'https://mautic.nunyabunya.com';
      const MAUTIC_USER = process.env.MAUTIC_API_USER;
      const MAUTIC_PASS = process.env.MAUTIC_API_PASSWORD;
      if (!MAUTIC_USER || !MAUTIC_PASS) return res.status(200).json({ total: 0 });
      const auth = Buffer.from(`${MAUTIC_USER}:${MAUTIC_PASS}`).toString('base64');
      const { formId } = req.query;
      if (!formId) return res.status(200).json({ total: 0 });
      try {
        const r = await fetch(`${MAUTIC_URL}/api/forms/${formId}/submissions?limit=1`, { headers: { 'Authorization': `Basic ${auth}` } });
        if (!r.ok) return res.status(200).json({ total: 0 });
        const d = await r.json();
        return res.status(200).json({ total: parseInt(d.total) || 0 });
      } catch { return res.status(200).json({ total: 0 }); }
    }

    if (action === 'service-shlink-clicks') {
      const SHLINK_URL = process.env.SHLINK_URL || 'https://go.nunyabunya.com';
      const SHLINK_KEY = process.env.SHLINK_API_KEY;
      if (!SHLINK_KEY) return res.status(200).json({ clicks: 0 });
      const { slug } = req.query;
      if (!slug) return res.status(200).json({ clicks: 0 });
      try {
        const r = await fetch(`${SHLINK_URL}/rest/v3/short-urls/${slug}`, { headers: { 'X-Api-Key': SHLINK_KEY } });
        if (!r.ok) return res.status(200).json({ clicks: 0 });
        const d = await r.json();
        return res.status(200).json({ clicks: d.visitsSummary?.total || d.visitsCount || 0 });
      } catch { return res.status(200).json({ clicks: 0 }); }
    }

    // Generic Matomo API proxy — any method, server-side auth
    if (action === 'service-matomo') {
      const MATOMO_URL = process.env.MATOMO_URL || 'https://analytics.nunyabunya.com';
      const MATOMO_TOKEN = process.env.MATOMO_AUTH_TOKEN;
      if (!MATOMO_TOKEN) return res.status(200).json({ error: 'Matomo not configured' });
      const { method: matomoMethod, ...rest } = req.query;
      if (!matomoMethod) return res.status(400).json({ error: 'method required' });
      const params = new URLSearchParams({ module: 'API', method: matomoMethod, format: 'JSON', token_auth: MATOMO_TOKEN, force_api_session: '1' });
      // Forward all other query params
      for (const [k, v] of Object.entries(rest)) {
        if (k !== 'action') params.set(k, v);
      }
      try {
        const r = await fetch(MATOMO_URL, { method: 'POST', body: params });
        if (!r.ok) return res.status(200).json([]);
        return res.status(200).json(await r.json());
      } catch { return res.status(200).json([]); }
    }

    if (action === 'service-matomo-views') {
      const MATOMO_URL = process.env.MATOMO_URL || 'https://analytics.nunyabunya.com';
      const MATOMO_TOKEN = process.env.MATOMO_AUTH_TOKEN;
      if (!MATOMO_TOKEN) return res.status(200).json({ views: 0 });
      const { path: pagePath, siteId, period, date } = req.query;
      if (!pagePath) return res.status(200).json({ views: 0 });
      try {
        const params = new URLSearchParams({
          module: 'API', method: 'Actions.getPageUrl', pageUrl: pagePath,
          idSite: siteId || '1', period: period || 'month', date: date || 'today',
          format: 'JSON', token_auth: MATOMO_TOKEN, force_api_session: '1',
        });
        const r = await fetch(MATOMO_URL, { method: 'POST', body: params });
        if (!r.ok) return res.status(200).json({ views: 0 });
        const d = await r.json();
        return res.status(200).json({ views: (d[0] && d[0].nb_visits) || 0 });
      } catch { return res.status(200).json({ views: 0 }); }
    }

    if (action === 'service-pexels-search') {
      const PEXELS_KEY = process.env.PEXELS_API_KEY;
      if (!PEXELS_KEY) return res.status(200).json({ photos: [] });
      const { query: q, per_page, orientation } = req.query;
      if (!q) return res.status(200).json({ photos: [] });
      try {
        const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per_page || 9}&orientation=${orientation || 'landscape'}`, { headers: { 'Authorization': PEXELS_KEY } });
        if (!r.ok) return res.status(200).json({ photos: [] });
        return res.status(200).json(await r.json());
      } catch { return res.status(200).json({ photos: [] }); }
    }

    // ── Daily Tasks CRUD ──
    if (action === 'daily-tasks' && req.method === 'GET') {
      const { date, status, week } = req.query;
      let query = 'daily_tasks?order=priority.asc,created_at.asc';
      if (date) query += `&date=eq.${date}`;
      if (status && status !== 'all') query += `&status=eq.${status}`;
      if (week) {
        // Get tasks for a full week starting from the given date
        const start = new Date(week);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        query += `&date=gte.${start.toISOString().slice(0,10)}&date=lte.${end.toISOString().slice(0,10)}`;
      }
      query += '&limit=200';
      try {
        const tasks = await supabaseFetch(query);
        return res.status(200).json({ total: (tasks || []).length, tasks: tasks || [] });
      } catch (e) {
        return res.status(200).json({ total: 0, tasks: [], error: 'Table may not exist yet. Run supabase-create-daily-tasks.sql' });
      }
    }

    if (action === 'daily-tasks' && req.method === 'POST') {
      try {
        const { tasks: newTasks } = req.body || {};
        if (!newTasks || !Array.isArray(newTasks)) {
          // Single task
          const task = req.body;
          if (!task.title || !task.date) return res.status(400).json({ error: 'title and date required' });
          const created = await supabaseFetch('daily_tasks', {
            method: 'POST',
            body: JSON.stringify({ title: task.title, date: task.date, category: task.category || 'general', business: task.business || null, priority: task.priority || 'normal', notes: task.notes || null }),
          });
          return res.status(201).json(created?.[0] || { success: true });
        }
        // Bulk insert
        const created = await supabaseFetch('daily_tasks', {
          method: 'POST',
          body: JSON.stringify(newTasks),
        });
        return res.status(201).json({ inserted: (created || []).length });
      } catch (err) {
        console.error('daily-tasks POST error:', err.message);
        return res.status(500).json({ error: err.message, hint: 'Check that daily_tasks table exists in Supabase' });
      }
    }

    if (action === 'daily-tasks' && req.method === 'PATCH') {
      const { id, status: newStatus, notes } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const update = { updated_at: new Date().toISOString() };
      if (newStatus) {
        update.status = newStatus;
        if (newStatus === 'done') update.completed_at = new Date().toISOString();
        if (newStatus === 'pending') update.completed_at = null;
      }
      if (notes !== undefined) update.notes = notes;
      await supabaseFetch(`daily_tasks?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(update) });
      return res.status(200).json({ success: true });
    }

    if (action === 'daily-tasks' && req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabaseFetch(`daily_tasks?id=eq.${id}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    }

    // ── Daily Tasks: Get urgent/upcoming deadlines ──
    if (action === 'deadlines') {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const tasks = await supabaseFetch(`daily_tasks?priority=eq.urgent&status=neq.done&date=gte.${today}&order=date.asc&limit=10`);
        return res.status(200).json({ deadlines: tasks || [] });
      } catch {
        return res.status(200).json({ deadlines: [] });
      }
    }

    if (action === 'service-leads') {
      const leads = await supabaseFetch('leads?order=created_at.desc&limit=200').catch(() => []);
      return res.status(200).json({ total: (leads || []).length, leads: leads || [] });
    }

    if (action === 'service-contacts') {
      const contacts = await supabaseFetch('contacts?order=created_at.desc&limit=200').catch(() => []);
      return res.status(200).json({ total: (contacts || []).length, contacts: contacts || [] });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('Data API error:', err);
    return res.status(500).json({ error: 'Internal error.', details: err.message });
  }
}
