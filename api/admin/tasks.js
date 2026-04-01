// Admin API: GET today's tasks, PATCH to update status (reads from content_calendar_items + real tables)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // GET: Fetch tasks for a given date (defaults to today)
  if (req.method === 'GET') {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    try {
      const items = await supabaseFetch(
        `content_calendar_items?date=eq.${date}&order=client_id.asc,platform.asc`
      );
      return res.status(200).json({ date, total: (items || []).length, tasks: items || [] });
    } catch (err) {
      console.error('Tasks error:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
  }

  // PATCH: Update content item status (routes to the correct source table)
  if (req.method === 'PATCH') {
    const { id, status, content_type } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'id and status required.' });

    const validStatuses = ['draft', 'pending_review', 'approved', 'rejected', 'published', 'skipped'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Use: ${validStatuses.join(', ')}` });
    }

    // Determine which table to update based on content_type
    const table = content_type === 'social_post' ? 'social_posts' : 'content_campaigns';
    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'approved') {
      updates.approved_at = new Date().toISOString();
    }

    try {
      const result = await supabaseFetch(
        `${table}?id=eq.${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );
      return res.status(200).json({ success: true, item: result?.[0] || null });
    } catch (err) {
      console.error('Task update error:', err);
      return res.status(500).json({ error: 'Failed to update task.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
