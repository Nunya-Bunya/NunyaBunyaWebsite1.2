// Vercel serverless function — handles various webhook submissions from frontend
// Centralizes lead capture for different form types and stores in Supabase
import { sendSlackAlert, sendMauticSubmission, escapeText, sendEmailNotification } from '../lib/notifications.js';

// The free guide, sent automatically when someone opts in on business-plan-guide.html.
// (Source of truth for the prose: Content/business-plan-engine/01-LEAD-MAGNET.md)
function businessPlanGuideEmail(firstName) {
  const hi = firstName ? `Hi ${escapeText(firstName)},` : 'Hi there,';
  return `<!DOCTYPE html><html><body style="margin:0;background:#0D0D0D;font-family:'Helvetica Neue',Arial,sans-serif;color:#e8e8e8;">
  <div style="max-width:600px;margin:0 auto;padding:40px 28px;">
    <p style="font-family:'Courier New',monospace;color:#00E5CC;letter-spacing:3px;font-size:12px;text-transform:uppercase;">// Nunya Bunya · Free Guide</p>
    <h1 style="color:#fff;font-size:30px;line-height:1.1;text-transform:uppercase;font-weight:900;margin:8px 0 24px;">What great business plans get right</h1>
    <p>${hi}</p>
    <p>Here's the guide you asked for. Almost every "business plan template" you'll download is built backwards. It asks you to fill in thirty boxes designed to make a bank comfortable, not to make your business work. The plans that actually built companies do the opposite: short, specific, and obsessed with a few things.</p>
    <h2 style="color:#00E5CC;font-size:18px;text-transform:uppercase;margin-top:30px;">5 plans worth studying</h2>
    <p><strong style="color:#fff;">1. Airbnb's pitch (2008)</strong> — ten slides, led with the <em>problem</em>, not the product. Once you believed the problem, the product was obvious.</p>
    <p><strong style="color:#fff;">2. The one-page plan</strong> — short on purpose. If you can't say who you serve, what you sell, how you reach them and how you make money on one page, you don't understand your business yet.</p>
    <p><strong style="color:#fff;">3. Tesla's master plan (2006)</strong> — four sentences. It showed the <em>order of operations</em>: what we do first, and what that unlocks. A plan is a sequence, not a feature list.</p>
    <p><strong style="color:#fff;">4. The local business that gets the loan</strong> — knew its numbers cold. It could survive the one question that kills most plans: "walk me through the money."</p>
    <p><strong style="color:#fff;">5. The lean anti-plan</strong> — a list of the riskiest assumptions and the cheapest way to test each one in 90 days. More honest than a confident forecast that's wrong by week two.</p>
    <h2 style="color:#00E5CC;font-size:18px;text-transform:uppercase;margin-top:30px;">The 5 things they share</h2>
    <p>1. Names the problem so clearly you feel it.<br>2. Knows exactly who it's for (one customer, in detail).<br>3. Can explain the money in one breath.<br>4. Has an order of operations.<br>5. Is honest about the risks.</p>
    <h2 style="color:#00E5CC;font-size:18px;text-transform:uppercase;margin-top:30px;">The Monday test</h2>
    <p>Read every section of your plan and ask: <strong style="color:#fff;">could I act on this on Monday?</strong> "Leverage strategic synergies" fails. "This week I call the ten people most likely to have this problem" passes. The job of a plan isn't to impress — it's to tell you what to do next.</p>
    <div style="margin:36px 0;padding:24px;background:#141414;border:1px solid #00E5CC;border-radius:14px;">
      <p style="margin:0 0 14px;color:#fff;">Rather not start from a blank page? Answer ten questions and we'll build you a custom plan that passes the Monday test — your market, your numbers, a 90-day order of operations.</p>
      <a href="https://www.nunyabunya.com/business-plan.html" style="display:inline-block;background:#00E5CC;color:#0D0D0D;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:30px;">Build my plan — $89 →</a>
      <p style="margin:12px 0 0;color:#888;font-size:13px;">$89, normally $299. Built for your business, not a template.</p>
    </div>
    <p style="color:#888;font-size:13px;">— Ben, Nunya Bunya<br>nunyabunya.com</p>
  </div></body></html>`;
}

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
      // BFK survey — supports partial (per-section) saves AND final submit.
      tableName = 'bfk_submissions';
      leadData = {
        tier: body.tier || 'foundation',
        client_name: (body.client_name || body.name || '').trim(),
        client_email: (body.client_email || body.email || '').trim(),
        client_phone: (body.client_phone || body.phone || '').trim() || null,
        answers: body.answers || {},
        payment_status: body.payment_status || 'pending',
        submitted_at: new Date().toISOString()
      };
      // Partial-save support (DORMANT until bfk_submissions has the
      // session_id / is_partial / submission_stage columns). Only attach these
      // when the request actually carries them — otherwise a normal final
      // submit would send columns that don't exist yet and Supabase rejects
      // the whole insert (PGRST204 -> 500 "Could not save your submission").
      if (body.session_id) leadData.session_id = String(body.session_id);
      if (body.submission_stage) leadData.submission_stage = String(body.submission_stage);
      if (body.is_partial === true) leadData.is_partial = true;
      slackMessage = `*New BFK submission*\n*Name:* ${escapeText(leadData.client_name)}\n*Email:* ${escapeText(leadData.client_email)}\n*Tier:* ${escapeText(leadData.tier)}`;
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

    case 'business-plan': {
      // $89 Business Plan quiz — captures intake answers, then the buyer is sent
      // to the Stripe Payment Link. The answers ride along so Ben (or the auto
      // delivery handler) can run generate_plan.py on them. Stores in `leads`.
      const a = body.answers || {};
      const fields = ['business_name','owner_name','what_it_does','customer','problem','offer','location','stage','goal','edge'];
      const answersText = fields
        .filter(k => (a[k] || '').toString().trim())
        .map(k => `${k}: ${a[k].toString().trim()}`)
        .join('\n');
      leadData = {
        name: (a.owner_name || body.name || '').trim(),
        email: (body.email || a.email || '').trim(),
        phone: (body.phone || '').trim() || null,
        source: 'business-plan',
        page: 'business-plan-quiz',
        interest: 'Business Plan ($89)',
        message: answersText,
        created_at: new Date().toISOString()
      };
      slackMessage = `*🧾 New Business Plan quiz* ($89)\n*Name:* ${escapeText(leadData.name)}\n*Email:* ${escapeText(leadData.email)}\n*Business:* ${escapeText(a.business_name || '—')}\n\n*Answers (for generate_plan.py):*\n${escapeText(answersText)}`;
      mauticData = { email: leadData.email, firstname: leadData.name, phone: leadData.phone };
      break;
    }

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

  // Partial BFK saves (per-section autosave) are allowed without name/email —
  // the whole point is to keep their answers before they finish. Everything
  // else still requires name + email.
  const isPartialSave = webhookType === 'business-foundation-kit' && leadData.is_partial === true;
  const email = leadData.email || leadData.client_email;
  const name = leadData.name || leadData.client_name;
  if (!isPartialSave && (!email || !name)) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }

  // Save to Supabase. For BFK with a session_id, UPSERT so each visitor has
  // one row that fills in as they progress (no duplicate rows per Next click).
  const useUpsert = webhookType === 'business-foundation-kit' && leadData.session_id;
  let savedRecord = null;
  try {
    const endpoint = useUpsert
      ? `${SUPABASE_URL}/rest/v1/${tableName}?on_conflict=session_id`
      : `${SUPABASE_URL}/rest/v1/${tableName}`;
    const preferHeader = useUpsert
      ? 'return=representation,resolution=merge-duplicates'
      : 'return=representation';
    const supabaseRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: preferHeader
      },
      body: JSON.stringify(leadData)
    });

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error('Supabase save failed:', supabaseRes.status, errText);
      return res.status(500).json({ ok: false, error: 'Could not save your submission. Please try again.' });
    }

    const rows = await supabaseRes.json();
    savedRecord = Array.isArray(rows) ? rows[0] : rows;
  } catch (err) {
    console.error('Supabase save exception:', err);
    return res.status(500).json({ ok: false, error: 'Could not save your submission. Please try again.' });
  }

  // Partial saves are silent — no Slack/Mautic noise on every section.
  if (isPartialSave) {
    return res.status(200).json({ ok: true, record: savedRecord, partial: true });
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

  // Auto-deliver the free guide to lead-magnet opt-ins (business-plan-guide page).
  // Uses Resend via sendEmailNotification; from = ben@ so it reads as a personal send.
  if (webhookType === 'lead-magnet' && (leadData.page === 'business-plan-guide' || leadData.source === 'business-plan-guide') && leadData.email) {
    try {
      await sendEmailNotification(
        leadData.email,
        'Your business-plan breakdown (free guide)',
        businessPlanGuideEmail(leadData.name),
        'Ben at Nunya Bunya <ben@nunyabunya.com>'
      );
    } catch (e) {
      console.error('Guide auto-send failed:', e);
    }
  }

  return res.status(200).json({ ok: true, record: savedRecord });
}