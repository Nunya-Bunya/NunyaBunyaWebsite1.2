// Admin API: GET all clients
import { requireAuth, supabaseFetch } from '../auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const clients = await supabaseFetch('dashboard_clients?select=*&order=client_name.asc');
    return res.status(200).json({ total: clients.length, clients });
  } catch (err) {
    console.error('Clients error:', err);
    return res.status(500).json({ error: 'Failed to fetch clients.' });
  }
}
