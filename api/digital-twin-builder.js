// Vercel serverless function — handles digital twin builder submissions
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
    console.error('DTB submission error: Supabase configuration missing');
    return res.status(500).json({ ok: false, error: 'Server configuration error.' });
  }

  try {
    // For now, keep the existing logic but remove direct Supabase calls from frontend
    // This endpoint will need to be expanded to handle file uploads properly
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    // Store submission in database
    const submissionData = {
      client_name: (body.client_name || '').trim(),
      client_email: (body.client_email || '').trim(),
      client_phone: (body.client_phone || '').trim() || null,
      product_type: body.product_type || 'twin',
      business_info: body.business_info || {},
      target_audience: body.target_audience || {},
      brand_personality: body.brand_personality || {},
      content_preferences: body.content_preferences || {},
      budget_range: body.budget_range || '',
      timeline: body.timeline || '',
      additional_notes: body.additional_notes || '',
      promo_code: body.promo_code || null,
      final_price: body.final_price || 0,
      payment_status: body.final_price === 0 ? 'promo_free' : 'pending',
      submitted_at: new Date().toISOString()
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/dtb_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(submissionData)
    });

    if (!insertRes.ok) {
      console.error('Failed to store DTB submission:', insertRes.status, insertRes.statusText);
      return res.status(500).json({ ok: false, error: 'Failed to store submission' });
    }

    // Send notifications
    const slackMessage = `*New Digital Twin Builder submission*\n*Name:* ${escapeText(submissionData.client_name)}\n*Email:* ${escapeText(submissionData.client_email)}\n*Product:* ${escapeText(submissionData.product_type)}\n*Price:* $${submissionData.final_price}`;
    await sendSlackAlert(slackMessage);

    if (submissionData.client_email) {
      await sendMauticSubmission({
        email: submissionData.client_email,
        firstname: submissionData.client_name,
        phone: submissionData.client_phone
      });
    }

    res.status(200).json({ ok: true, message: 'Submission received successfully' });

  } catch (error) {
    console.error('DTB submission error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}