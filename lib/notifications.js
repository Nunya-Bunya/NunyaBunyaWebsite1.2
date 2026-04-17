// Shared notification utilities for backend endpoints
// Handles Slack alerts, Mautic submissions, and email notifications

export async function sendSlackAlert(message, channel = null, blocks = null) {
  const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
  const SLACK_ALERTS_CHANNEL = channel || process.env.SLACK_ALERTS_CHANNEL || 'C0AN3KML1DG';

  if (!SLACK_BOT_TOKEN) {
    console.warn('SLACK_BOT_TOKEN not set — skipping Slack notification');
    return;
  }

  try {
    const payload = {
      channel: SLACK_ALERTS_CHANNEL,
      text: message,
      unfurl_links: false
    };

    if (blocks) {
      payload.blocks = blocks;
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Slack error:', result);
    }
  } catch (error) {
    console.error('Slack notification failed:', error);
  }
}

export async function sendMauticSubmission(formData, formId = null) {
  const mauticUrl = (process.env.MAUTIC_URL || '').trim().replace(/\/$/, '');
  const mauticFormId = formId || (process.env.MAUTIC_FORM_ID || '').trim();

  if (!mauticUrl || !mauticFormId) {
    console.warn('Mautic not configured — skipping Mautic submission');
    return;
  }

  try {
    const formDataObj = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      if (value != null) formDataObj.append(`mauticform[${key}]`, String(value));
    });
    formDataObj.append('mauticform[formId]', mauticFormId);

    await fetch(`${mauticUrl}/form/submit?formId=${encodeURIComponent(mauticFormId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formDataObj.toString()
    });
  } catch (error) {
    console.error('Mautic submission failed:', error);
  }
}

export async function sendEmailNotification(to, subject, html, from = null) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ben@nunyabunya.com';
  const FROM_EMAIL = from || process.env.FROM_EMAIL || 'alerts@nunyabunya.com';

  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email notification');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `NB Alerts <${FROM_EMAIL}>`,
        to: [to || ADMIN_EMAIL],
        subject,
        html
      })
    });

    const result = await response.json();
    if (result.error) {
      console.error('Resend error:', result);
    }
  } catch (error) {
    console.error('Email notification failed:', error);
  }
}

export function escapeText(text) {
  return String(text || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}