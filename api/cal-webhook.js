// Vercel serverless function — receives Cal.com booking webhooks and posts to Slack #alerts
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
  const SLACK_CHANNEL = process.env.SLACK_ALERTS_CHANNEL || 'C0AN3KML1DG';

  if (!SLACK_TOKEN) {
    console.error('Missing SLACK_BOT_TOKEN env var');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const payload = req.body || {};
  const trigger = payload.triggerEvent;
  const booking = payload.payload || {};

  const attendee = booking.attendees?.[0] || {};
  const title = booking.title || 'Unknown';
  const startTime = booking.startTime;
  const endTime = booking.endTime;
  const attendeeName = attendee.name || 'Unknown';
  const attendeeEmail = attendee.email || 'Unknown';
  const attendeeTimezone = attendee.timeZone || '';
  const meetingUrl = booking.metadata?.videoCallUrl || '';
  const eventType = booking.eventTitle || booking.type || '';

  let emoji, action;
  switch (trigger) {
    case 'BOOKING_CREATED':
      emoji = '\u{1F389}';
      action = 'New Booking';
      break;
    case 'BOOKING_RESCHEDULED':
      emoji = '\u{1F504}';
      action = 'Rescheduled';
      break;
    case 'BOOKING_CANCELLED':
      emoji = '\u{274C}';
      action = 'Cancelled';
      break;
    default:
      emoji = '\u{1F514}';
      action = trigger || 'Update';
  }

  const formatTime = (iso) => {
    if (!iso) return 'TBD';
    const d = new Date(iso);
    return d.toLocaleString('en-AU', {
      timeZone: 'Australia/Brisbane',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *${action}: ${title}*`
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Who:*\n${attendeeName}` },
        { type: 'mrkdwn', text: `*Email:*\n${attendeeEmail}` },
        { type: 'mrkdwn', text: `*When:*\n${formatTime(startTime)}` },
        { type: 'mrkdwn', text: `*Timezone:*\n${attendeeTimezone}` }
      ]
    }
  ];

  if (meetingUrl) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Meeting Link:* <${meetingUrl}|Join Call>` }
    });
  }

  const fallbackText = `${emoji} ${action}: ${title} — ${attendeeName} (${attendeeEmail}) at ${formatTime(startTime)}`;

  try {
    const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: SLACK_CHANNEL,
        text: fallbackText,
        blocks
      })
    });

    const slackData = await slackRes.json();
    if (!slackData.ok) {
      console.error('Slack API error:', slackData.error);
      return res.status(500).json({ error: 'Failed to post to Slack', detail: slackData.error });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
