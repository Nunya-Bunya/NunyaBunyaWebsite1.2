// Vercel serverless function — secret admin endpoint to view leads
// Access via: /api/leads?key=YOUR_ADMIN_KEY
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ADMIN_KEY = process.env.ADMIN_KEY;
  const { key, format } = req.query;

  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Supabase error:', errText);
      return res.status(500).json({ error: 'Failed to fetch leads.' });
    }

    const leads = await response.json();

    // CSV export option
    if (format === 'csv') {
      const header = 'Name,Email,Source,Date\n';
      const rows = leads.map(l =>
        `"${l.name}","${l.email}","${l.source || ''}","${l.created_at}"`
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=nunya-bunya-leads.csv');
      return res.status(200).send(header + rows);
    }

    return res.status(200).json({ total: leads.length, leads });
  } catch (err) {
    console.error('Leads error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
}
