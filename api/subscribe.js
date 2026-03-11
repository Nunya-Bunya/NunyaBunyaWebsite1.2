// Vercel serverless function — collects lead magnet emails into Supabase
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, source } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase env vars');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // Insert into Supabase "leads" table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: (name || '').trim(),
        email: email.trim().toLowerCase(),
        source: source || 'lead-magnet',
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      // If it's a duplicate email, still succeed (they already subscribed)
      if (errText.includes('duplicate') || errText.includes('unique')) {
        return res.status(200).json({ success: true, message: 'Already subscribed.' });
      }
      console.error('Supabase error:', errText);
      return res.status(500).json({ error: 'Failed to save. Please try again.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
