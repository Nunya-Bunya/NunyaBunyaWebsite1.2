// Admin API: GET all clients (reads from unified clients table)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { active } = req.query;
    let query = 'clients?select=*&order=client_name.asc';
    if (active === 'true') query += '&active=eq.true';

    const clients = await supabaseFetch(query);

    // Map to consistent shape for frontend (client_id = client_slug for backwards compat)
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
