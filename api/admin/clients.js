// Admin API: GET all clients OR single client detail
// Replaces both admin/clients.js and admin/client.js
// ?id=X → single client with stats | no id → all clients list
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id, active } = req.query;

  // Single client detail mode
  if (id) {
    try {
      let clients = await supabaseFetch(`clients?client_slug=eq.${encodeURIComponent(id)}`);
      if (!clients || clients.length === 0) {
        clients = await supabaseFetch(`clients?id=eq.${encodeURIComponent(id)}`);
      }
      if (!clients || clients.length === 0) {
        return res.status(404).json({ error: 'Client not found.' });
      }

      const client = clients[0];
      const clientId = client.id;
      const clientSlug = client.client_slug || client.id;

      const [campaigns, socialPosts, weeklyReports, seoReports, pipelineRuns, weeklyNotes] = await Promise.all([
        supabaseFetch(`content_campaigns?client_id=eq.${clientId}&select=status`).catch(() => []),
        supabaseFetch(`social_posts?client_id=eq.${clientId}&select=status`).catch(() => []),
        supabaseFetch(`weekly_reports?client_id=eq.${clientId}&order=report_date.desc&limit=5`).catch(() => []),
        supabaseFetch(`seo_reports?client_id=eq.${clientId}&order=report_date.desc&limit=5`).catch(() => []),
        supabaseFetch(`pipeline_runs?client_id=eq.${encodeURIComponent(clientSlug)}&order=started_at.desc&limit=10`).catch(() => []),
        supabaseFetch(`weekly_notes?client_id=eq.${encodeURIComponent(clientSlug)}&order=week_start.desc&limit=3`).catch(() => []),
      ]);

      const allContent = [...(campaigns || []), ...(socialPosts || [])];
      const stats = { total: allContent.length, draft: 0, pending_review: 0, approved: 0, published: 0 };
      allContent.forEach(item => {
        const s = (item.status || 'draft').toLowerCase();
        if (stats[s] !== undefined) stats[s]++;
      });

      return res.status(200).json({
        client: { ...client, client_id: clientSlug },
        content_stats: stats,
        reports: [...(weeklyReports || []), ...(seoReports || [])].sort((a, b) =>
          new Date(b.report_date) - new Date(a.report_date)
        ).slice(0, 10),
        pipeline_runs: pipelineRuns || [],
        weekly_notes: weeklyNotes || [],
      });
    } catch (err) {
      console.error('Client detail error:', err);
      return res.status(500).json({ error: 'Failed to fetch client.' });
    }
  }

  // List all clients mode
  try {
    let query = 'clients?select=*&order=client_name.asc';
    if (active === 'true') query += '&active=eq.true';

    const clients = await supabaseFetch(query);
    const mapped = (clients || []).map(c => ({
      ...c,
      client_id: c.client_slug || c.id,
    }));

    return res.status(200).json({ total: mapped.length, clients: mapped });
  } catch (err) {
    console.error('Clients error:', err);
    return res.status(500).json({ error: 'Failed to fetch clients.' });
  }
}
