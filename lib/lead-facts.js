// Turns a raw form submission into the facts Ben needs to act on a lead (2026-11-24).
// The alert email (lib/lead-email.js) renders these; it never reads the raw request.

const TZ = 'Australia/Brisbane';

// What each form promises the visitor, keyed by `interest`. Business days, Mon-Fri.
const PROMISES = {
  'Paid ads': { days: 2, what: 'their plan' },
};

const SOURCES = { meta: 'Meta ad (Facebook/Instagram)', facebook: 'Facebook ad', instagram: 'Instagram ad', google: 'Google ad', tiktok: 'TikTok ad', reddit: 'Reddit ad' };

function addBusinessDays(date, n) {
  const d = new Date(date);
  // Work in Brisbane calendar days (UTC+10, no DST).
  const local = new Date(d.getTime() + 10 * 3600e3);
  let added = 0;
  while (added < n) {
    local.setUTCDate(local.getUTCDate() + 1);
    const day = local.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return new Date(local.getTime() - 10 * 3600e3);
}

const fmt = (d, opts) => new Intl.DateTimeFormat('en-AU', { timeZone: TZ, ...opts }).format(d);

export function buildLeadFacts({ name, email, phone, interest, message, source, page, tracking, leadId, saveFailed, receivedAt = new Date() }) {
  // Older forms appended "[utm_source=... fbclid=...]" to the message. Strip it out and read it as tracking.
  let said = (message || '').trim();
  const tail = said.match(/\n*\[([^\]]*utm_[^\]]*)\]\s*$/);
  const tags = { ...(tracking || {}) };
  if (tail) {
    said = said.slice(0, tail.index).trim();
    for (const pair of tail[1].split(/\s+/)) { const [k, v] = pair.split('='); if (k && v && !tags[k]) tags[k] = v; }
  }
  // Fall back to the page URL's query string.
  let path = page || '';
  try {
    const u = new URL(page || '/', 'https://nunyabunya.com');
    path = u.pathname;
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) if (!tags[k] && u.searchParams.get(k)) tags[k] = u.searchParams.get(k);
  } catch {}

  const realEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') ? email : null;
  const src = (tags.utm_source || (source || '').replace(/^paid-ads:?/, '')).toLowerCase();
  const paid = (tags.utm_medium || '').toLowerCase() === 'paid' || /^paid-ads:/.test(source || '');
  const cameFrom = src ? (SOURCES[src] || (paid ? `${src} ad` : src)) : (paid ? 'Paid ad' : 'Website (direct)');

  const promise = PROMISES[interest];
  const due = promise ? addBusinessDays(receivedAt, promise.days) : null;

  return {
    name,
    firstName: (name || '').split(/\s+/)[0] || name,
    interest: interest || 'General enquiry',
    isPaid: paid,
    received: fmt(receivedAt, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
    contact: {
      email: realEmail,
      phone: phone || null,
      only: realEmail && !phone ? 'email' : !realEmail && phone ? 'phone' : null,
      replyLink: realEmail ? `mailto:${realEmail}?subject=${encodeURIComponent('Your ads plan from Nunya Bunya')}` : null,
      callLink: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null,
      textLink: phone ? `sms:${phone.replace(/[^\d+]/g, '')}` : null,
    },
    said: said || null, // null = they left "trade and area" blank
    origin: {
      cameFrom,
      campaign: tags.utm_campaign || null,
      adVersion: tags.utm_content || null,
      page: path || null,
    },
    promise: promise ? { what: promise.what, days: promise.days, due: fmt(due, { weekday: 'long', day: 'numeric', month: 'short' }) } : null,
    leadId: leadId || null,
    saved: !saveFailed,
  };
}
