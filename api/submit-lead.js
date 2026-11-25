// Vercel serverless function: accepts site form submissions, stores them in Supabase, and emails Ben a lead alert.
import { buildLeadFacts } from '../lib/lead-facts.js';
import { renderLeadEmail } from '../lib/lead-email.js';
import { sendLeadAutoReply } from '../lib/lead-autoreply.js';
import { sendEmailNotification, escapeHtml } from '../lib/notifications.js';

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
  const tracking = body.tracking && typeof body.tracking === 'object' ? body.tracking : null;

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
  let saveFailed = false;
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
      saveFailed = true;
    } else {
      const rows = await supabaseRes.json();
      savedLead = Array.isArray(rows) ? rows[0] : rows;
    }
  } catch (err) {
    console.error('Supabase insert exception:', err);
    saveFailed = true;
  }
  // 2026-11-13: the Supabase project stopped resolving, so every enquiry was rejected. A failed save no
  // longer loses the lead: the email to Ben below becomes the record. Only if BOTH fail does the visitor see an error.

  // Email Ben (2026-11-13; redesigned 2026-11-24). This is the alert that reaches him (Slack isn't read).
  // reply_to = the lead, so hitting Reply in Gmail answers them directly.
  // 2026-11-25: Slack, Mautic and Twenty CRM calls removed; all three pointed at services that no longer exist.
  let emailed = false;
  let facts = null;
  try {
    facts = buildLeadFacts({ name, email, phone, interest, message, source, page, tracking, leadId: savedLead?.id, saveFailed });
    const { subject, html, text } = renderLeadEmail(facts);
    emailed = await sendEmailNotification('ben@nunyabunya.com', subject, html, null, { text, replyTo: facts.contact.email || undefined });
  } catch (e) {
    console.error('Lead email render failed, sending plain fallback:', e);
    const rows = [['Name', name], ['Email', email], ['Phone', phone], ['Interest', interest], ['Message', message]]
      .filter(([, v]) => v).map(([k, v]) => `<p><b>${k}:</b> ${escapeHtml(String(v))}</p>`).join('');
    emailed = await sendEmailNotification('ben@nunyabunya.com', `New NB lead: ${name}`, rows + `<p>Lead ID: ${savedLead?.id || 'NOT SAVED'}</p>`);
  }
  if (saveFailed && !emailed) {
    return res.status(500).json({ ok: false, error: 'Could not save your message. Please try again.' });
  }

  // Instant reply to the lead from Ben (2026-11-25): no enquiry waits for a first touch.
  // /paid-ads leads get the Full Diary Plan version with its due date.
  await sendLeadAutoReply(name, email, facts);

  return res.status(200).json({ ok: true, lead: savedLead });
}
