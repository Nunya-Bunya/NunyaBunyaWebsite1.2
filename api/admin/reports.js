// Admin API: GET reports by client
import { requireAuth, supabaseFetch } from '../auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { client, type, limit } = req.query;

  try {
    let query = 'dashboard_reports?order=report_date.desc';
    if (client && client !== 'all') query += `&client_id=eq.${encodeURIComponent(client)}`;
    if (type) query += `&report_type=eq.${encodeURIComponent(type)}`;
    query += `&limit=${limit || 20}`;

    const reports = await supabaseFetch(query);
    return res.status(200).json({ total: reports.length, reports });
  } catch (err) {
    console.error('Reports error:', err);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }
}
