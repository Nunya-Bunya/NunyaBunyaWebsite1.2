// Cal.com webhook for NB free-audit bookings (2026-11-25).
// One booking -> (1) a row in Supabase `leads`, the same table as form fills, so every lead lives in one place;
// (2) a Meta Conversions API "Lead" event on pixel 780551491788433, so NB's ads learn from booked calls;
// (3) Ben's lead alert email. Cal.com signs the body with CAL_WEBHOOK_SECRET (header x-cal-signature-256).
import crypto from 'node:crypto';
import { buildLeadFacts } from '../lib/lead-facts.js';
import { renderLeadEmail } from '../lib/lead-email.js';
import { sendEmailNotification } from '../lib/notifications.js';

const PIXEL = process.env.META_PIXEL_ID || '780551491788433';

async function rawBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks).toString('utf8');
}

const sha = (v) => crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');
const answer = (r, k) => {
  const v = r?.[k];
  return (v && typeof v === 'object' && 'value' in v ? v.value : v) || '';
};

export async function sendMetaLead({ email, name, eventId, eventTime, sourceUrl, extra = {} }) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) { console.warn('META_CAPI_TOKEN not set: Meta Lead skipped'); return { skipped: true }; }
  const first = (name || '').trim().split(/\s+/)[0];
  const event = {
    event_name: 'Lead', event_time: eventTime, event_id: eventId, action_source: 'website',
    event_source_url: sourceUrl || 'https://nunyabunya.com/paid-ads',
    user_data: { em: email ? [sha(email)] : undefined, fn: first ? [sha(first)] : undefined, country: [sha('au')] },
    custom_data: { lead_source: 'cal-booking', ...extra },
  };
  const body = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  const r = await fetch(`https://graph.facebook.com/v21.0/${PIXEL}/events?access_token=${encodeURIComponent(token)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) console.error('Meta CAPI failed:', r.status, JSON.stringify(j).slice(0, 300));
  return { ok: r.ok, ...j };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const raw = await rawBody(req);
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ ok: false, error: 'not configured' });
  const sig = String(req.headers['x-cal-signature-256'] || '');
  const want = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) {
    return res.status(401).json({ ok: false, error: 'bad signature' });
  }

  let msg;
  try { msg = JSON.parse(raw); } catch { return res.status(400).json({ ok: false }); }
  if (msg.triggerEvent !== 'BOOKING_CREATED') return res.status(200).json({ ok: true, ignored: msg.triggerEvent });
  const p = msg.payload || {};
  const r = p.responses || {};
  const att = (p.attendees || [])[0] || {};
  const name = answer(r, 'name') || att.name || '';
  const email = answer(r, 'email') || att.email || '';
  const meta = p.metadata || {};
  const when = p.startTime ? new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Brisbane', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(p.startTime)) : '';
  const lines = [
    `Booked free audit: ${when} Brisbane`,
    `Business: ${answer(r, 'business-name')}`,
    `Website: ${answer(r, 'website')}`,
    answer(r, 'instagram') ? `Instagram: ${answer(r, 'instagram')}` : '',
    `Trading: ${answer(r, 'trading')}`,
    `Ad budget: ${answer(r, 'ad-budget')}`,
    answer(r, 'notes') ? `Notes: ${answer(r, 'notes')}` : '',
  ].filter(Boolean);
  const message = lines.join('\n');
  const tracking = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) if (meta[k]) tracking[k] = meta[k];
  const source = tracking.utm_source ? `cal-booking:${tracking.utm_source}` : 'cal-booking';

  // 1. Same table as the forms.
  let leadId = null;
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;
    const s = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ name, email, phone: null, source, page: '/cal/nb-free-audit', interest: 'Free audit', message, created_at: new Date().toISOString() }),
    });
    if (s.ok) leadId = (await s.json())?.[0]?.id || null; else console.error('Supabase insert failed:', s.status, await s.text());
  } catch (e) { console.error('Supabase insert exception:', e); }

  // 2. Meta Lead. event_id = booking uid, so a retried webhook can't double count.
  let meta_ok = null;
  const isTest = /^test\b/i.test(name) || /@nunyabunya\.com$/i.test(email);
  if (!isTest) try {
    const m = await sendMetaLead({ email, name, eventId: `cal-${p.uid || p.bookingId}`, eventTime: Math.floor(Date.now() / 1000), extra: { trading: answer(r, 'trading'), ad_budget: answer(r, 'ad-budget') } });
    meta_ok = m.ok ?? false;
  } catch (e) { console.error('Meta CAPI exception:', e); meta_ok = false; }

  // 3. Ben's alert.
  try {
    const facts = buildLeadFacts({ name, email, phone: null, interest: 'Free audit', message, source, page: '/cal/nb-free-audit', tracking, leadId, saveFailed: !leadId });
    const { subject, html, text } = renderLeadEmail(facts);
    await sendEmailNotification('ben@nunyabunya.com', subject, html, null, { text, replyTo: email || undefined });
  } catch (e) { console.error('Booking alert failed:', e); }

  return res.status(200).json({ ok: true, lead: leadId, meta: meta_ok });
}
