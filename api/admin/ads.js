// NBHQ Admin API — Ad Factory CRUD (Supabase-backed)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = requireAuth(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const { brand, status, limit } = req.query || {};
      let path = 'ad_factory_entries?order=created_at.desc';
      if (brand) path += `&brand=eq.${brand}`;
      if (status) path += `&status=eq.${status}`;
      if (limit) path += `&limit=${limit}`;
      const data = await supabaseFetch(path);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = await supabaseFetch('ad_factory_entries', {
        method: 'POST',
        body: JSON.stringify(req.body),
        prefer: 'return=representation',
      });
      return res.status(201).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id } = req.query || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      const data = await supabaseFetch(`ad_factory_entries?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(req.body),
        prefer: 'return=representation',
      });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query || {};
      if (!id) return res.status(400).json({ error: 'id required' });
      await supabaseFetch(`ad_factory_entries?id=eq.${id}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
