// NBHQ Admin API — Swipe File CRUD
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  // GET — list all entries (with optional filters)
  if (req.method === 'GET') {
    try {
      const { layer, category, client, limit } = req.query || {};
      let path = 'swipe_entries?order=created_at.desc';
      if (layer) path += `&layer=eq.${layer}`;
      if (category) path += `&category=eq.${category}`;
      if (client) path += `&client=eq.${client}`;
      if (limit) path += `&limit=${limit}`;
      const data = await supabaseFetch(path);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — create new entry
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const data = await supabaseFetch('swipe_entries', {
        method: 'POST',
        body: JSON.stringify(body),
        prefer: 'return=representation',
      });
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — update entry
  if (req.method === 'PATCH') {
    try {
      const { id } = req.query || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = req.body;
      const data = await supabaseFetch(`swipe_entries?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        prefer: 'return=representation',
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE — remove entry
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabaseFetch(`swipe_entries?id=eq.${id}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
