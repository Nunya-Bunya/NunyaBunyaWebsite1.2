// Vercel serverless function — handles various webhook submissions from frontend
// Centralizes lead capture for different form types and stores in Supabase
import { sendSlackAlert, sendMauticSubmission, escapeText } from '../lib/notifications.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Webhook error: Supabase configuration missing');
    return res.status(500).json({ ok: false, error: 'Server configuration error.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const webhookType = req.query.type || body.webhook_type || 'unknown';

  let leadData = null;
  let tableName = 'leads';
  let slackMessage = '';
  let mauticData = null;

  // Process different webhook types
  switch (webhookType) {
    case 'lead-magnet':
      // Brand starter kit lead magnet
      leadData = {
        name: (body.name || '').trim(),
        email: (body.email || '').trim(),
        phone: (body.phone || '').trim() || null,
        source: 'lead-magnet',
        page: 'brand-starter-kit',
        interest: 'brand-starter-kit',
        message: (body.message || '').trim() || null,
        created_at: new Date().toISOString()
      };
      slackMessage = `*New lead magnet signup*\n*Name:* ${escapeText(leadData.name)}\n*Email:* ${escapeText(leadData.email)}\n*Source:* Brand Starter Kit`;
      mauticData = { email: leadData.email, firstname: leadData.name, phone: leadData.phone };
      break;

    case 'subscribe':
      // Newsletter subscription
      leadData = {
        name: (body.name || 'Subscriber').trim(),
        email: (body.email || '').trim(),
        source: 'newsletter',
        page: body.page || 'unknown',
        interest: 'newsletter',
        created_at: new Date().toISOString()
      };
      slackMessage = `*New newsletter signup*\n*Email:* ${escapeText(leadData.email)}\n*Page:* ${escapeText(body.page || 'unknown')}`;
      mauticData = { email: leadData.email, firstname: leadData.name };
      break;

    case 'business-foundation-kit':
      // BFK purchase/checkout
      tableName = 'bfk_submissions';
      leadData = {
        tier: body.tier || 'foundation',
        client_name: (body.client_name || body.name || '').trim(),
        client_email: (body.client_email || body.email || '').trim(),
        client_phone: (body.client_phone || body.phone || '').trim() || null,
        answers: body.answers || {},
        promo_code: body.promo_code || null,
        payment_status: body.payment_status || 'pending',
        submitted_at: new Date().toISOString()
      };
      slackMessage = `*New BFK purchase*\n*Name:* ${escapeText(leadData.client_name)}\n*Email:* ${escapeText(leadData.client_email)}\n*Tier:* ${escapeText(leadData.tier)}`;
      mauticData = {
        email: leadData.client_email,
        firstname: leadData.client_name,
        phone: leadData.client_phone
      };
      break;

    case 'upsell-checkout':
      // Website package upsell
      leadData = {
        name: (body.name || '').trim(),
        email: (body.email || '').trim(),
        phone: (body.phone || '').trim() || null,
        source: 'upsell-checkout',
        page: 'website-package',
        interest: body.package || 'website-package',
        message: `Budget: ${body.budget || 'N/A'}, Timeline: ${body.timeline || 'N/A'}`,
        created_at: new Date().toISOString()
      };
      slackMessage = `*New website package inquiry*\n*Name:* ${escapeText(leadData.name)}\n*Email:* ${escapeText(leadData.email)}\n*Package:* ${escapeText(body.package || 'unknown')}`;
      mauticData = { email: leadData.email, firstname: leadData.name, phone: leadData.phone };
      break;

    case 'voice-memo':
      // Voice memo submission
      tableName = 'voice_memos';
      leadData = {
        client_name: (body.client_name || '').trim(),
        client_email: (body.client_email || '').trim(),
        memo_title: (body.memo_title || '').trim(),
        memo_content: (body.memo_content || '').trim(),
        created_at: new Date().toISOString()
      };
      slackMessage = `*New voice memo*\n*From:* ${escapeText(leadData.client_name)}\n*Email:* ${escapeText(leadData.client_email)}\n*Title:* ${escapeText(leadData.memo_title)}`;
      break;

    default:
      return res.status(400).json({ ok: false, error: 'Unknown webhook type' });
  }

  // Validate required fields
  const email = leadData.email || leadData.client_email;
  const name = leadData.name || leadData.client_name;
  if (!email || !name) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }

  // Save to Supabase
  let savedRecord = null;
  try {
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(leadData)
    });

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error('Supabase insert failed:', supabaseRes.status, errText);
      return res.status(500).json({ ok: false, error: 'Could not save your submission. Please try again.' });
    }

    const rows = await supabaseRes.json();
    savedRecord = Array.isArray(rows) ? rows[0] : rows;
  } catch (err) {
    console.error('Supabase insert exception:', err);
    return res.status(500).json({ ok: false, error: 'Could not save your submission. Please try again.' });
  }

  // Send notifications
  await sendSlackAlert(slackMessage);

  // Mautic — create/update contact and add to NB segment via contacts API
  const MAUTIC_URL = (process.env.MAUTIC_URL || '').trim().replace(/\/$/, '');
  const MAUTIC_USER = process.env.MAUTIC_API_USER || process.env.MAUTIC_USER || 'admin';
  const MAUTIC_PASS = process.env.MAUTIC_API_PASSWORD || process.env.MAUTIC_PASS || '';
  const NB_SEGMENT_ID = process.env.MAUTIC_NB_SEGMENT_ID || '6';

  if (mauticData && MAUTIC_URL && MAUTIC_PASS) {
    const auth = 'Basic ' + Buffer.from(`${MAUTIC_USER}:${MAUTIC_PASS}`).toString('base64');
    try {
      const contactPayload = {
        firstname: mauticData.firstname || mauticData.name || '',
        email: mauticData.email,
        tags: ['nunya-bunya', webhookType],
      };
      if (mauticData.phone) contactPayload.phone = mauticData.phone;

      const r = await fetch(`${MAUTIC_URL}/api/contacts/new`, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify(contactPayload)
      });
      const d = await r.json();
      const cid = d?.contact?.id;
      if (cid) {
        await fetch(`${MAUTIC_URL}/api/segments/${NB_SEGMENT_ID}/contact/${cid}/add`, {
          method: 'POST',
          headers: { Authorization: auth }
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Mautic error:', e);
    }
  }

  return res.status(200).json({ ok: true, record: savedRecord });
}