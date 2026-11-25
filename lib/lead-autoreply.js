// Instant auto-reply to every nunyabunya.com enquiry (2026-11-25). Added after four paid-ad leads
// sat for days with no reply. Copy by Carly; replies go to Ben's inbox via reply_to.
import { sendEmailNotification, escapeHtml } from './notifications.js';

const BOOKING_URL = 'https://cal.com/benalekconner/nb-free-audit';

// Skip our own health-check submissions (channel_watch.py sends "TEST ..." from ben@).
export function shouldAutoReply(name, email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (/^test\b/i.test(name || '')) return false;
  if (/@nunyabunya\.com$/i.test(email)) return false;
  return true;
}

export function renderAutoReply(name) {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  const cap = first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
  const greet = cap || 'there';
  const subject = cap ? `Thanks ${cap}, I've got your message` : `Thanks, I've got your message`;
  const html = `<p>Hi ${escapeHtml(greet)},</p>
<p>Thanks for getting in touch. I'll reply to you personally within one business day.</p>
<p>To get things moving, just hit reply and send me:</p>
<ul>
  <li>your business name</li>
  <li>your website or socials</li>
  <li>what you want more of (calls, bookings, sales, something else)</li>
</ul>
<p>If you'd rather jump straight to a time, <a href="${BOOKING_URL}">book a free 20-minute marketing audit</a>.</p>
<p>Ben<br>Ben Alek Conner<br>Nunya Bunya</p>`;
  const text = `Hi ${greet},

Thanks for getting in touch. I'll reply to you personally within one business day.

To get things moving, just hit reply and send me:
- your business name
- your website or socials
- what you want more of (calls, bookings, sales, something else)

If you'd rather jump straight to a time, book a free 20-minute marketing audit here:
${BOOKING_URL}

Ben
Ben Alek Conner
Nunya Bunya`;
  return { subject, html, text };
}

// /paid-ads leads (interest "Paid ads"): the Full Diary Plan versions. Copy by Carly, 2026-11-25
// (01-Nunya Bunya/Site/copy/paid-ads-autoreply-2026-11-25.json). A = trade and area given, B = left blank.
export function renderPlanAutoReply(name, facts) {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  const greet = first ? first.charAt(0).toUpperCase() + first.slice(1) : 'there';
  const said = (facts && facts.said) || '';
  const due = facts && facts.promise && facts.promise.due;
  if (said && due) {
    const subject = 'Your Full Diary Plan is on its way';
    const lines = [
      `Thanks for sending this through. Your Full Diary Plan for ${said} will be in your inbox by ${due}.`,
      `The plan comes either way. If you reply with your business name and your website or Facebook page, I can make it sharper.`,
      `Once it's ready, we can go through it on a free call if you'd like: ${BOOKING_URL}`,
    ];
    return build(subject, greet, lines);
  }
  const subject = 'Quick one before I write your plan';
  const lines = [
    `Thanks for asking for a Full Diary Plan. Could you reply with your trade and the suburbs you work in? Something like "electrician, Penrith and the Hills" is plenty.`,
    `If you've got a business name and a website or Facebook page, send those too.`,
    `I'll start on your plan as soon as I have that.`,
  ];
  return build(subject, greet, lines);
}

function build(subject, greet, lines) {
  const text = `Hi ${greet},\n\n${lines.join('\n\n')}\n\nBen\nNunya Bunya`;
  const link = `<a href="${BOOKING_URL}">${BOOKING_URL}</a>`;
  const html = `<p>Hi ${escapeHtml(greet)},</p>\n` + lines.map(l => `<p>${escapeHtml(l).replace(BOOKING_URL, link)}</p>`).join('\n') + `\n<p>Ben<br>Nunya Bunya</p>`;
  return { subject, html, text };
}

export async function sendLeadAutoReply(name, email, facts = null) {
  if (!shouldAutoReply(name, email)) return false;
  try {
    const isPlan = facts && facts.interest === 'Paid ads';
    const { subject, html, text } = isPlan ? renderPlanAutoReply(name, facts) : renderAutoReply(name);
    return await sendEmailNotification(email, subject, html, 'Ben Alek Conner <ben@nunyabunya.com>',
      { text, replyTo: 'ben@nunyabunya.com' });
  } catch (e) {
    console.error('Lead auto-reply failed:', e);
    return false;
  }
}
