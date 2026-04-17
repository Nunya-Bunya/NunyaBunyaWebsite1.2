// Vercel serverless function — accepts site contact form submissions, stores them in Supabase, and sends a Slack alert.
import { sendSlackAlert, sendMauticSubmission, escapeText } from '../lib/notifications.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const phone = (body.phone || '').trim() || null;
  const interest = (body.interest || body.package || '').trim() || null;
  const message = (body.message || '').trim() || null;
  const source = (body.source || 'web-form').trim();
  const page = (body.page || '').trim() || null;

  if (!email || !name) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Submit-lead error: Supabase configuration missing');
    return res.status(500).json({ ok: false, error: 'Server configuration error.' });
  }

  const leadRow = {
    name,
    email,
    phone,
    source,
    page,
    interest,
    message,
    created_at: new Date().toISOString()
  };

  let savedLead = null;
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
      return res.status(500).json({ ok: false, error: 'Could not save your message. Please try again.' });
    }

    const rows = await supabaseRes.json();
    savedLead = Array.isArray(rows) ? rows[0] : rows;
  } catch (err) {
    console.error('Supabase insert exception:', err);
    return res.status(500).json({ ok: false, error: 'Could not save your message. Please try again.' });
  }

  // Send Slack alert
  const slackMessage = [
    `*New lead from Nunya Bunya website*`,
    `*Name:* ${escapeText(name)}`,
    `*Email:* ${escapeText(email)}`,
    phone ? `*Phone:* ${escapeText(phone)}` : null,
    interest ? `*Interest:* ${escapeText(interest)}` : null,
    source ? `*Source:* ${escapeText(source)}` : null,
    page ? `*Page:* ${escapeText(page)}` : null,
    message ? `*Message:* ${escapeText(message)}` : null,
    '',
    `*Lead ID:* ${savedLead?.id || 'unknown'}`
  ].filter(Boolean).join('\n');

  await sendSlackAlert(slackMessage);

  // Optional Mautic submission
  if (process.env.MAUTIC_URL && process.env.MAUTIC_FORM_ID) {
    await sendMauticSubmission({
      email,
      firstname: name,
      phone,
      message
    });
  }

  return res.status(200).json({ ok: true, lead: savedLead });
}
