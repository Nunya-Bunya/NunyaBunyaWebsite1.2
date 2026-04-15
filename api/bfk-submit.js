// Vercel serverless function — handles BFK survey submissions server-side.
// Called from bedrock-survey.html with survey answers + contact info.
// Inserts to Supabase, notifies #alerts on Slack, emails Ben via Resend,
// and fires the n8n Brand Bible webhook. Returns {ok, id} or {ok:false, error}.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).json({ ok: false, error: 'Server not configured' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const name = (body.client_name || '').trim();
  const email = (body.client_email || '').trim();
  const phone = (body.client_phone || '').trim() || null;
  const answers = body.answers || {};
  const track = body.track || (answers && answers.track) || null;

  if (!name || !email) return res.status(400).json({ ok: false, error: 'Missing name or email' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'Invalid email' });

  const row = {
    tier: 'free',
    client_name: name,
    client_email: email,
    client_phone: phone,
    answers,
    payment_status: 'promo_free',
    submitted_at: new Date().toISOString()
  };

  let insertedId = null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/bfk_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(row)
    });
    if (!r.ok) {
      const errTxt = await r.text();
      console.error('Supabase insert failed:', r.status, errTxt);
      return res.status(500).json({ ok: false, error: 'Could not save your answers. Please try again.' });
    }
    const rows = await r.json();
    insertedId = rows && rows[0] && rows[0].id;
  } catch (e) {
    console.error('Supabase insert exception:', e);
    return res.status(500).json({ ok: false, error: 'Could not save your answers. Please try again.' });
  }

  const business = answers.q1 || answers.q2 || '(unnamed)';
  const trackLabel = track === 'existing' ? 'Existing business' : (track === 'startup' ? 'Starting fresh' : 'Unknown track');
  const answerCount = Object.keys(answers || {}).filter(k => !k.startsWith('_')).length;

  const notifications = [];

  const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
  const ALERTS_CHANNEL = process.env.SLACK_ALERTS_CHANNEL || 'C0AN3KML1DG';
  if (SLACK_BOT_TOKEN) {
    notifications.push(
      fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          channel: ALERTS_CHANNEL,
          text: `New BFK submission: ${business} (${name})`,
          blocks: [
            { type: 'header', text: { type: 'plain_text', text: 'New BFK Submission' } },
            { type: 'section', fields: [
              { type: 'mrkdwn', text: `*Business:*\n${business}` },
              { type: 'mrkdwn', text: `*Track:*\n${trackLabel}` },
              { type: 'mrkdwn', text: `*Name:*\n${name}` },
              { type: 'mrkdwn', text: `*Email:*\n${email}` },
              { type: 'mrkdwn', text: `*Phone:*\n${phone || '—'}` },
              { type: 'mrkdwn', text: `*Answers:*\n${answerCount} questions` }
            ] },
            { type: 'section', text: { type: 'mrkdwn', text: `<https://www.nunyabunya.com/nb-admin-bfk.html|Open in NBHQ>  ·  Submission ID: \`${insertedId || 'unknown'}\`` } }
          ]
        })
      }).then(r => r.json()).then(j => { if (!j.ok) console.error('Slack error:', j); }).catch(e => console.error('Slack exception:', e))
    );
  } else {
    console.warn('SLACK_BOT_TOKEN not set — skipping Slack notification');
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ben@nunyabunya.com';
  const FROM_EMAIL = process.env.FROM_EMAIL || 'alerts@nunyabunya.com';
  if (RESEND_API_KEY) {
    notifications.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `NB Alerts <${FROM_EMAIL}>`,
          to: [ADMIN_EMAIL],
          reply_to: email,
          subject: `New BFK submission — ${business}`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
  <h2 style="margin:0 0 16px">New BFK Submission</h2>
  <table style="border-collapse:collapse;width:100%;font-size:14px">
    <tr><td style="padding:6px 12px;background:#f5f5f5"><strong>Business</strong></td><td style="padding:6px 12px">${escapeHtml(business)}</td></tr>
    <tr><td style="padding:6px 12px;background:#f5f5f5"><strong>Track</strong></td><td style="padding:6px 12px">${escapeHtml(trackLabel)}</td></tr>
    <tr><td style="padding:6px 12px;background:#f5f5f5"><strong>Name</strong></td><td style="padding:6px 12px">${escapeHtml(name)}</td></tr>
    <tr><td style="padding:6px 12px;background:#f5f5f5"><strong>Email</strong></td><td style="padding:6px 12px"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
    <tr><td style="padding:6px 12px;background:#f5f5f5"><strong>Phone</strong></td><td style="padding:6px 12px">${escapeHtml(phone || '—')}</td></tr>
    <tr><td style="padding:6px 12px;background:#f5f5f5"><strong>Answers</strong></td><td style="padding:6px 12px">${answerCount} questions</td></tr>
    <tr><td style="padding:6px 12px;background:#f5f5f5"><strong>Submission ID</strong></td><td style="padding:6px 12px;font-family:monospace;font-size:12px">${escapeHtml(insertedId || 'unknown')}</td></tr>
  </table>
  <p style="margin-top:20px"><a href="https://www.nunyabunya.com/nb-admin-bfk.html" style="background:#00e5cc;color:#000;padding:10px 16px;text-decoration:none;font-weight:700">Open in NBHQ</a></p>
</div>`
        })
      }).then(r => r.json()).then(j => { if (j.error) console.error('Resend error:', j); }).catch(e => console.error('Resend exception:', e))
    );
  } else {
    console.warn('RESEND_API_KEY not set — skipping email notification');
  }

  const N8N_WEBHOOK = process.env.N8N_BFK_WEBHOOK || 'https://n8n.nunyabunya.com/webhook/business-foundation-kit';
  notifications.push(
    fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: 'brand-bible', promo_code: null, submission_id: insertedId, ...row })
    }).catch(e => console.error('n8n exception:', e))
  );

  await Promise.allSettled(notifications);
  return res.status(200).json({ ok: true, id: insertedId });
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
