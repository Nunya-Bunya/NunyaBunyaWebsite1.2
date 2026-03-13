// Admin API: GET content items for calendar view
import { requireAuth, supabaseFetch } from '../auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { start, end, client } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end dates required (YYYY-MM-DD).' });

  try {
    let query = `dashboard_content_items?date=gte.${start}&date=lte.${end}&order=date.asc,platform.asc`;

    if (client && client !== 'all') {
      query += `&client_id=eq.${encodeURIComponent(client)}`;
    }

    const items = await supabaseFetch(query);
    return res.status(200).json({ total: items.length, items });
  } catch (err) {
    console.error('Calendar error:', err);
    return res.status(500).json({ error: 'Failed to fetch calendar data.' });
  }
}
