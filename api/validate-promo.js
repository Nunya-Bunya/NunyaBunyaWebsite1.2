// Vercel serverless function — validates promo codes
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Promo validation error: Supabase configuration missing');
    return res.status(500).json({ ok: false, error: 'Server configuration error.' });
  }

  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ ok: false, error: 'Promo code required' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/promo_codes?code=eq.${encodeURIComponent(code)}&is_active=eq.true&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      console.error('Supabase error:', response.status, response.statusText);
      return res.status(500).json({ ok: false, error: 'Database error' });
    }

    const promos = await response.json();

    if (!promos || promos.length === 0) {
      return res.status(404).json({ ok: false, error: 'Invalid promo code' });
    }

    const promo = promos[0];

    // Check if expired
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      return res.status(400).json({ ok: false, error: 'Expired promo code' });
    }

    // Check usage limit
    if (promo.max_uses && promo.times_used >= promo.max_uses) {
      return res.status(400).json({ ok: false, error: 'Promo code fully redeemed' });
    }

    // Return promo details (excluding sensitive info)
    res.status(200).json({
      ok: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discount_percent: promo.discount_percent,
        valid_until: promo.valid_until,
        max_uses: promo.max_uses,
        times_used: promo.times_used
      }
    });

  } catch (error) {
    console.error('Promo validation error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}