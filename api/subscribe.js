// Vercel serverless function — collects lead magnet emails into Supabase + sends download email via Resend
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
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase env vars');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const cleanName = (name || '').trim();
  const cleanEmail = email.trim().toLowerCase();

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
        name: cleanName,
        email: cleanEmail,
        source: source || 'lead-magnet',
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      // If it's a duplicate email, still succeed (they already subscribed)
      if (errText.includes('duplicate') || errText.includes('unique')) {
        // Still send the email even for duplicates (they may have lost it)
        await sendLeadMagnetEmail(RESEND_API_KEY, cleanEmail, cleanName);
        return res.status(200).json({ success: true, message: 'Already subscribed.' });
      }
      console.error('Supabase error:', errText);
      return res.status(500).json({ error: 'Failed to save. Please try again.' });
    }

    // Send the lead magnet email (don't block the response if it fails)
    await sendLeadMagnetEmail(RESEND_API_KEY, cleanEmail, cleanName);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

async function sendLeadMagnetEmail(apiKey, toEmail, name) {
  if (!apiKey) {
    console.warn('No RESEND_API_KEY — skipping email delivery');
    return;
  }

  const firstName = name || 'there';
  const downloadUrl = 'https://www.nunyabunya.com/assets/what-even-is-good-marketing.pdf';

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:36px;">
    <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.04em;text-transform:uppercase;">NUNYA <span style="color:#00E5CC;">BUNYA</span></span>
  </div>

  <!-- Main card -->
  <div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:44px 32px;text-align:center;">

    <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#00E5CC,#7FFF00);margin:0 auto 24px;line-height:64px;font-size:28px;">&#128196;</div>

    <h1 style="font-size:26px;font-weight:900;color:#ffffff;text-transform:uppercase;margin:0 0 8px;line-height:1.1;">Your Guide Is Ready</h1>

    <p style="font-size:15px;color:#999;font-weight:300;line-height:1.7;margin:0 0 32px;">
      Hey ${firstName} &mdash; here&rsquo;s your free copy of <strong style="color:#fff;">&ldquo;What Even Is Good Marketing?&rdquo;</strong> Click the button below to download it.
    </p>

    <a href="${downloadUrl}" style="display:inline-block;background:#00E5CC;color:#0a0a0a;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:0.04em;">Download Your Free Guide</a>

    <p style="font-size:13px;color:#666;margin-top:24px;font-weight:300;">
      PDF &middot; 8 pages &middot; No fluff, just the stuff that works.
    </p>
  </div>

  <!-- What's inside -->
  <div style="margin-top:32px;padding:0 8px;">
    <h2 style="font-size:16px;font-weight:700;color:#fff;text-transform:uppercase;margin:0 0 16px;letter-spacing:0.03em;">What&rsquo;s Inside:</h2>
    <table role="presentation" style="width:100%;">
      <tr><td style="padding:8px 0;font-size:14px;color:#999;font-weight:300;"><span style="color:#00E5CC;margin-right:8px;">&#10003;</span> The 5 signs your marketing is actually working</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#999;font-weight:300;"><span style="color:#00E5CC;margin-right:8px;">&#10003;</span> The marketing stack that matters (in priority order)</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#999;font-weight:300;"><span style="color:#00E5CC;margin-right:8px;">&#10003;</span> DIY vs. agency vs. freelancer &mdash; honest comparison</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#999;font-weight:300;"><span style="color:#00E5CC;margin-right:8px;">&#10003;</span> A 30-day quick start action plan</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#999;font-weight:300;"><span style="color:#00E5CC;margin-right:8px;">&#10003;</span> 7 red flags when hiring a marketing agency</td></tr>
    </table>
  </div>

  <!-- CTA -->
  <div style="margin-top:36px;padding:32px;background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:12px;text-align:center;">
    <h3 style="font-size:15px;font-weight:700;color:#fff;text-transform:uppercase;margin:0 0 8px;">Want us to run the audit for you?</h3>
    <p style="font-size:13px;color:#999;font-weight:300;line-height:1.7;margin:0 0 20px;">Book a free strategy call. We&rsquo;ll analyse your marketing, find the holes, and build a plan.</p>
    <a href="https://cal.com/nunyabunya" style="display:inline-block;border:2px solid #FF4DDD;color:#FF4DDD;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Book a Free Call</a>
  </div>

  <!-- Footer -->
  <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);">
    <p style="font-size:12px;color:#555;margin:0;">Nunya Bunya Pty Ltd &middot; Brisbane, QLD</p>
    <p style="font-size:11px;color:#444;margin:8px 0 0;">You&rsquo;re receiving this because you downloaded our free guide. No spam, ever.</p>
  </div>

</div>
</body>
</html>`.trim();

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Nunya Bunya <hello@nunyabunya.com>',
        to: toEmail,
        subject: `Here's your free guide, ${firstName} 🎯`,
        html: html
      })
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', errText);
    } else {
      console.log('Lead magnet email sent to:', toEmail);
    }
  } catch (err) {
    // Don't fail the whole request if email fails — lead is already saved
    console.error('Email send error:', err);
  }
}
