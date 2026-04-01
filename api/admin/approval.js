// Admin API: GET approval queue, PATCH to approve/reject items
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // GET: Fetch approval queue or single item detail
  if (req.method === 'GET') {
    const { client_id, item_type, limit, id, type } = req.query;

    try {
      // Detail mode: ?id=X&type=content_campaign
      if (id && type) {
        const tableMap = { content_campaign: 'content_campaigns', social_post: 'social_posts', review_response: 'review_log', weekly_report: 'weekly_reports' };
        const table = tableMap[type];
        if (!table) return res.status(400).json({ error: `Unknown type: ${type}` });
        const items = await supabaseFetch(`${table}?id=eq.${encodeURIComponent(id)}`);
        if (!items || items.length === 0) return res.status(404).json({ error: 'Item not found.' });
        return res.status(200).json({ item_type: type, item: items[0] });
      }

      // Queue mode
      let query = 'approval_queue?order=created_at.desc';
      if (client_id) query += `&client_id=eq.${encodeURIComponent(client_id)}`;
      if (item_type) query += `&item_type=eq.${encodeURIComponent(item_type)}`;
      query += `&limit=${limit || 50}`;

      const items = await supabaseFetch(query);
      return res.status(200).json({ total: (items || []).length, items: items || [] });
    } catch (err) {
      console.error('Approval error:', err);
      return res.status(500).json({ error: 'Failed to fetch approval data.' });
    }
  }

  // PATCH: Approve or reject an item
  if (req.method === 'PATCH') {
    const { id, item_type, action, notes } = req.body || {};
    if (!id || !item_type || !action) {
      return res.status(400).json({ error: 'id, item_type, and action required.' });
    }
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be "approve" or "reject".' });
    }

    const now = new Date().toISOString();
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Map item_type to the source table
    const tableMap = {
      content_campaign: 'content_campaigns',
      social_post: 'social_posts',
      review_response: 'review_log',
      weekly_report: 'weekly_reports',
    };

    const table = tableMap[item_type];
    if (!table) return res.status(400).json({ error: `Unknown item_type: ${item_type}` });

    try {
      let updates;
      if (item_type === 'review_response') {
        updates = {
          approved_at: action === 'approve' ? now : null,
          approved_by: action === 'approve' ? 'admin' : null,
        };
      } else {
        updates = {
          status: newStatus,
          approved_at: action === 'approve' ? now : null,
          approved_by: action === 'approve' ? 'admin' : null,
        };
      }

      const result = await supabaseFetch(
        `${table}?id=eq.${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify(updates) }
      );

      return res.status(200).json({ success: true, item: result?.[0] || null });
    } catch (err) {
      console.error('Approval update error:', err);
      return res.status(500).json({ error: 'Failed to update approval.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
