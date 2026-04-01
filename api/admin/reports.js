// Admin API: GET reports from all report tables (weekly, SEO, ads)
import { requireAuth, supabaseFetch } from '../../lib/auth-utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { client, type, limit } = req.query;
  const maxResults = parseInt(limit) || 20;

  try {
    const clientFilter = (client && client !== 'all')
      ? `&client_id=eq.${encodeURIComponent(client)}`
      : '';

    // Fetch from all report tables in parallel (filter by type if specified)
    const fetches = [];

    if (!type || type === 'weekly') {
      fetches.push(
        supabaseFetch(`weekly_reports?order=report_date.desc${clientFilter}&limit=${maxResults}`)
          .then(rows => (rows || []).map(r => ({ ...r, report_type: 'weekly' })))
          .catch(() => [])
      );
    }

    if (!type || type === 'seo') {
      fetches.push(
        supabaseFetch(`seo_reports?order=report_date.desc${clientFilter}&limit=${maxResults}`)
          .then(rows => (rows || []).map(r => ({ ...r, report_type: 'seo' })))
          .catch(() => [])
      );
    }

    if (!type || type === 'ads') {
      fetches.push(
        supabaseFetch(`ads_reports?order=report_date.desc${clientFilter}&limit=${maxResults}`)
          .then(rows => (rows || []).map(r => ({ ...r, report_type: 'ads' })))
          .catch(() => [])
      );
    }

    const results = await Promise.all(fetches);
    const allReports = results.flat()
      .sort((a, b) => new Date(b.report_date) - new Date(a.report_date))
      .slice(0, maxResults);

    return res.status(200).json({ total: allReports.length, reports: allReports });
  } catch (err) {
    console.error('Reports error:', err);
    return res.status(500).json({ error: 'Failed to fetch reports.' });
  }
}
