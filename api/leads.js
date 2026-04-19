// Vercel serverless function — handles two things:
// 1. GET /api/leads?key=ADMIN_KEY — secret admin endpoint to view leads
// 2. POST /api/leads — lightweight lead capture (email-only, for lead magnets / blog CTAs)
import { sendSlackAlert, escapeText } from '../lib/notifications.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Leads API: Supabase configuration missing');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // ── POST: lightweight lead capture (email-only, for blog CTAs / lead magnets) ──
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim();
    const source = (body.source || 'web-form').trim();
    const lead_magnet = (body.lead_magnet || '').trim() || null;
    const client_id = (body.client_id || '').trim() || null;
    const name = (body.name || '').trim() || null;

    if (!email) {
      return res.status(400).json({ ok: false, error: 'Email is required.' });
    }

    const leadRow = {
      email,
      source,
      lead_magnet,
      client_id,
      created_at: new Date().toISOString()
    };
    // Include name if provided (not required for lead magnet captures)
    if (name) leadRow.name = name;

    try {
      const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(leadRow)
      });

      if (!supabaseRes.ok) {
        const errText = await supabaseRes.text();
        console.error('Supabase insert failed:', supabaseRes.status, errText);
        return res.status(500).json({ ok: false, error: 'Could not save lead. Please try again.' });
      }

      const rows = await supabaseRes.json();
      const savedLead = Array.isArray(rows) ? rows[0] : rows;

      // Send Slack alert
      const slackMessage = [
        `*New lead magnet capture*`,
        `*Email:* ${escapeText(email)}`,
        source ? `*Source:* ${escapeText(source)}` : null,
        lead_magnet ? `*Lead Magnet:* ${escapeText(lead_magnet)}` : null,
        client_id ? `*Client ID:* ${escapeText(client_id)}` : null,
        name ? `*Name:* ${escapeText(name)}` : null,
        '',
        `*Lead ID:* ${savedLead?.id || 'unknown'}`
      ].filter(Boolean).join('\n');

      await sendSlackAlert(slackMessage);

      return res.status(200).json({ ok: true, lead: savedLead });
    } catch (err) {
      console.error('Lead capture error:', err);
      return res.status(500).json({ ok: false, error: 'Server error.' });
    }
  }

  // ── GET: admin view of all leads ──
  if (req.method === 'GET') {
    const ADMIN_KEY = process.env.ADMIN_KEY;
    const { key, format } = req.query;

    if (!ADMIN_KEY || key !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
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
        const header = 'Name,Email,Source,Lead Magnet,Client ID,Date\n';
        const rows = leads.map(l =>
          `"${l.name || ''}","${l.email}","${l.source || ''}","${l.lead_magnet || ''}","${l.client_id || ''}","${l.created_at}"`
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

  return res.status(405).json({ error: 'Method not allowed' });
}
