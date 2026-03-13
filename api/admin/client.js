// Admin API: GET single client detail with stats
import { requireAuth, supabaseFetch } from '../auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Client ID required.' });

  try {
    // Fetch client, content stats, latest report, and weekly notes in parallel
    const [clients, contentItems, reports, weeklyNotes] = await Promise.all([
      supabaseFetch(`dashboard_clients?client_id=eq.${encodeURIComponent(id)}`),
      supabaseFetch(`dashboard_content_items?client_id=eq.${encodeURIComponent(id)}&select=status`),
      supabaseFetch(`dashboard_reports?client_id=eq.${encodeURIComponent(id)}&order=report_date.desc&limit=5`),
      supabaseFetch(`dashboard_weekly_notes?client_id=eq.${encodeURIComponent(id)}&order=week_start.desc&limit=3`),
    ]);

    if (!clients || clients.length === 0) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    // Compute content stats
    const stats = { total: 0, planned: 0, drafted: 0, published: 0 };
    if (contentItems) {
      stats.total = contentItems.length;
      contentItems.forEach(item => {
        const s = (item.status || 'planned').toLowerCase();
        if (s === 'planned') stats.planned++;
        else if (s === 'drafted' || s === 'draft') stats.drafted++;
        else if (s === 'published') stats.published++;
      });
    }

    return res.status(200).json({
      client: clients[0],
      content_stats: stats,
      reports: reports || [],
      weekly_notes: weeklyNotes || [],
    });
  } catch (err) {
    console.error('Client detail error:', err);
    return res.status(500).json({ error: 'Failed to fetch client.' });
  }
}
