// Admin API: Proxy for external marketing services (Mautic, Shlink, Matomo, Pexels)
// Keeps all API credentials server-side — never exposed to the browser
import { requireAuth } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { service, action } = req.query;

  try {
    // ── Mautic ──
    if (service === 'mautic') {
      const MAUTIC_URL = process.env.MAUTIC_URL || 'https://mautic.nunyabunya.com';
      const MAUTIC_USER = process.env.MAUTIC_API_USER;
      const MAUTIC_PASS = process.env.MAUTIC_API_PASSWORD;
      if (!MAUTIC_USER || !MAUTIC_PASS) return res.status(500).json({ error: 'Mautic not configured' });

      const auth = Buffer.from(`${MAUTIC_USER}:${MAUTIC_PASS}`).toString('base64');

      // Get form submissions count
      if (action === 'form-submissions') {
        const { formId } = req.query;
        if (!formId) return res.status(400).json({ error: 'formId required' });
        const r = await fetch(`${MAUTIC_URL}/api/forms/${formId}/submissions?limit=1`, {
          headers: { 'Authorization': `Basic ${auth}` },
        });
        if (!r.ok) return res.status(200).json({ total: 0 });
        const data = await r.json();
        return res.status(200).json({ total: parseInt(data.total) || 0 });
      }

      // Get contacts
      if (action === 'contacts') {
        const { search, limit } = req.query;
        let url = `${MAUTIC_URL}/api/contacts?limit=${limit || 20}&orderBy=date_added&orderByDir=desc`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const r = await fetch(url, { headers: { 'Authorization': `Basic ${auth}` } });
        if (!r.ok) return res.status(200).json({ total: 0, contacts: {} });
        const data = await r.json();
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: 'Unknown mautic action' });
    }

    // ── Shlink ──
    if (service === 'shlink') {
      const SHLINK_URL = process.env.SHLINK_URL || 'https://go.nunyabunya.com';
      const SHLINK_KEY = process.env.SHLINK_API_KEY;
      if (!SHLINK_KEY) return res.status(500).json({ error: 'Shlink not configured' });

      // Get short URL stats
      if (action === 'clicks') {
        const { slug } = req.query;
        if (!slug) return res.status(400).json({ error: 'slug required' });
        const r = await fetch(`${SHLINK_URL}/rest/v3/short-urls/${slug}`, {
          headers: { 'X-Api-Key': SHLINK_KEY },
        });
        if (!r.ok) return res.status(200).json({ clicks: 0 });
        const data = await r.json();
        return res.status(200).json({ clicks: data.visitsSummary?.total || data.visitsCount || 0 });
      }

      return res.status(400).json({ error: 'Unknown shlink action' });
    }

    // ── Matomo ──
    if (service === 'matomo') {
      const MATOMO_URL = process.env.MATOMO_URL || 'https://analytics.nunyabunya.com';
      const MATOMO_TOKEN = process.env.MATOMO_AUTH_TOKEN;
      if (!MATOMO_TOKEN) return res.status(500).json({ error: 'Matomo not configured' });

      // Get page views
      if (action === 'page-views') {
        const { path, siteId, period, date } = req.query;
        if (!path) return res.status(400).json({ error: 'path required' });
        const params = new URLSearchParams({
          module: 'API', method: 'Actions.getPageUrl',
          pageUrl: path, idSite: siteId || '1',
          period: period || 'month', date: date || 'today',
          format: 'JSON', token_auth: MATOMO_TOKEN, force_api_session: '1',
        });
        const r = await fetch(MATOMO_URL, { method: 'POST', body: params });
        if (!r.ok) return res.status(200).json({ views: 0 });
        const data = await r.json();
        return res.status(200).json({ views: (data[0] && data[0].nb_visits) || 0 });
      }

      return res.status(400).json({ error: 'Unknown matomo action' });
    }

    // ── Pexels ──
    if (service === 'pexels') {
      const PEXELS_KEY = process.env.PEXELS_API_KEY;
      if (!PEXELS_KEY) return res.status(500).json({ error: 'Pexels not configured' });

      if (action === 'search') {
        const { query: q, per_page, orientation } = req.query;
        if (!q) return res.status(400).json({ error: 'query required' });
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per_page || 9}&orientation=${orientation || 'landscape'}`;
        const r = await fetch(url, { headers: { 'Authorization': PEXELS_KEY } });
        if (!r.ok) return res.status(200).json({ photos: [] });
        const data = await r.json();
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: 'Unknown pexels action' });
    }

    // ── Leads (from Supabase, via admin auth) ──
    if (service === 'leads') {
      const { supabaseFetch } = await import('../../lib/auth-utils.js');
      const leads = await supabaseFetch('leads?order=created_at.desc&limit=200');
      return res.status(200).json({ total: (leads || []).length, leads: leads || [] });
    }

    // ── Contacts (from Supabase, via admin auth) ──
    if (service === 'contacts') {
      const { supabaseFetch } = await import('../../lib/auth-utils.js');
      const contacts = await supabaseFetch('contacts?order=created_at.desc&limit=200');
      return res.status(200).json({ total: (contacts || []).length, contacts: contacts || [] });
    }

    return res.status(400).json({ error: `Unknown service: ${service}` });
  } catch (err) {
    console.error(`Service proxy error [${service}/${action}]:`, err.message);
    return res.status(200).json({ error: err.message, total: 0, clicks: 0, views: 0 });
  }
}
