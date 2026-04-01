// Admin API: Consolidated data endpoints — documents, benchmark, onboard (via ?action= param)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { action } = req.query;

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

    return res.status(400).json({ error: 'Unknown action. Use ?action=documents|benchmark|onboard' });
  } catch (err) {
    console.error('Data API error:', err);
    return res.status(500).json({ error: 'Internal error.', details: err.message });
  }
}
