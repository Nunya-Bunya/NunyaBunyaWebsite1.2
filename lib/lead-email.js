// The "new lead" alert Ben gets at ben@nunyabunya.com (Wizard, 2026-11-24).
// Input: the facts from lib/lead-facts.js. Output: { subject, html, text }.
// Email-client HTML: tables, inline styles, no images, no web fonts required, no JS.
// Dark by design so Gmail iOS dark mode leaves it alone and light mode still reads.

const C = {
  page: '#0a0a0a',
  card: '#111111',
  panel: '#1a1a1a',
  rule: '#2a2a2a',
  ink: '#f4f4f4',
  soft: '#c4c4c4', // 11.6:1 on #111
  faint: '#a3a3a3', // 7.6:1 on #111
  teal: '#00E5CC',
  magenta: '#FF2D78',
};
const HEAD = "'Barlow Condensed','Arial Narrow','Helvetica Neue',Arial,sans-serif";
const BODY = "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export function escapeHtml(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const shortDay = (due) => (due || '').replace(/^([A-Za-z]{3})[a-z]*/, '$1');
const plainWhat = (what) => (what || '').replace(/^their\s+/i, '');

function originLine(o = {}) {
  const parts = [o.cameFrom];
  if (o.campaign) parts.push(`campaign ${o.campaign}`);
  if (o.adVersion) parts.push(`ad version ${o.adVersion}`);
  if (o.page) parts.push(o.page);
  return parts.filter(Boolean).join(' · ');
}

function button(href, label, solid) {
  const bg = solid ? C.teal : C.panel;
  const fg = solid ? '#0a0a0a' : C.ink;
  const border = solid ? C.teal : '#3a3a3a';
  return `<a href="${escapeHtml(href)}" style="display:block;background:${bg};border:1px solid ${border};border-radius:10px;color:${fg};font-family:${HEAD};font-size:20px;font-weight:700;letter-spacing:0.04em;line-height:20px;padding:16px 12px;text-align:center;text-decoration:none;text-transform:uppercase;">${escapeHtml(label)}</a>`;
}

function label(text) {
  return `<div style="font-family:${HEAD};font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.teal};line-height:16px;margin:0 0 6px;">${escapeHtml(text)}</div>`;
}

export function renderLeadEmail(f) {
  const name = f.name || 'No name given';
  const first = f.firstName || name;
  const c = f.contact || {};
  const p = f.promise;
  const o = f.origin || {};

  // Subject: lock-screen short.
  const subject = ['Lead: ' + name, f.interest, p ? `${plainWhat(p.what)} due ${shortDay(p.due)}` : null]
    .filter(Boolean).join(' · ').replace(/[\r\n]+/g, ' ') + (f.saved === false ? ' · NOT SAVED' : '');

  const clock = p ? `We told them: ${plainWhat(p.what)} within ${p.days} business day${p.days === 1 ? '' : 's'}.` : null;
  const dueLine = p ? `Due ${p.due}.` : null;
  const onlyNote = c.only === 'phone' ? 'Phone only' : c.only === 'email' ? 'Email only' : null;
  const saidText = f.said ? f.said : null;
  const blankNote = 'Left blank. Ask their trade and area when you reply.';
  const origin = originLine(o);
  const originHtml = origin.split(' · ').map((x) => `<span style="white-space:nowrap;">${escapeHtml(x)}</span>`).join(' · ');

  // ---- buttons ----
  const btns = [];
  if (c.replyLink) btns.push(button(c.replyLink, `Reply to ${first}`, true));
  if (c.callLink) btns.push(button(c.callLink, 'Call', !c.replyLink));
  if (c.textLink) btns.push(button(c.textLink, 'Text', false));
  // Reply full width; Call and Text share a row.
  let btnRows = '';
  if (c.replyLink) btnRows += `<tr><td style="padding:0 0 10px;">${btns.shift()}</td></tr>`;
  if (btns.length === 2) {
    btnRows += `<tr><td style="padding:0 0 10px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="50%" style="padding-right:5px;">${btns[0]}</td><td width="50%" style="padding-left:5px;">${btns[1]}</td></tr></table></td></tr>`;
  } else if (btns.length === 1) {
    btnRows += `<tr><td style="padding:0 0 10px;">${btns[0]}</td></tr>`;
  }
  const contactBits = [c.email, c.phone].filter(Boolean).map(escapeHtml).join(' &nbsp;·&nbsp; ');
  const replyNote = c.replyLink ? `Gmail's own Reply reaches ${escapeHtml(first)} too.` : '';
  const noContact = !c.email && !c.phone;

  const warn = f.saved === false
    ? `<tr><td style="padding:0 0 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.magenta}" style="background:${C.magenta};border-radius:10px;padding:14px 16px;font-family:${HEAD};font-size:18px;font-weight:700;letter-spacing:0.03em;line-height:22px;color:#0a0a0a;text-transform:uppercase;">Database was down: this email is the only record of this lead.<div style="font-family:${BODY};font-size:13px;font-weight:600;letter-spacing:0;text-transform:none;line-height:18px;margin-top:4px;">Keep it. Don't archive or delete.</div></td></tr></table></td></tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.page};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page};">${escapeHtml([clock, dueLine].filter(Boolean).join(' ') || origin)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};">
<tr><td align="center" style="padding:16px 10px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
${warn}
<tr><td bgcolor="${C.teal}" style="background:${C.teal};border-radius:14px 14px 0 0;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
<tr><td bgcolor="${C.card}" style="background:${C.card};border-radius:0 0 14px 14px;padding:22px 20px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td style="padding:0 0 4px;font-family:${HEAD};font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${C.faint};line-height:16px;">New lead &nbsp;<span style="color:${C.teal};">●</span>&nbsp; ${escapeHtml(f.interest)}</td></tr>
<tr><td style="padding:0 0 14px;font-family:${HEAD};font-size:44px;font-weight:700;line-height:46px;color:${C.ink};letter-spacing:-0.005em;">${escapeHtml(name)}</td></tr>

${p ? `<tr><td style="padding:0 0 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${C.panel}" style="background:${C.panel};border-left:4px solid ${C.magenta};border-radius:4px 10px 10px 4px;padding:14px 16px;">
<div style="font-family:${BODY};font-size:15px;line-height:21px;color:${C.soft};">${escapeHtml(clock)}</div>
<div style="font-family:${HEAD};font-size:27px;font-weight:700;line-height:32px;color:${C.ink};text-transform:uppercase;letter-spacing:0.01em;margin-top:2px;">Due <span style="color:${C.magenta};">${escapeHtml(p.due).replace(/(\d+ \S+)$/, '<span style="white-space:nowrap;">$1</span>')}</span></div>
</td></tr></table></td></tr>` : ''}

<tr><td style="padding:0 0 6px;">${label(onlyNote ? `Reach them · ${onlyNote}` : 'Reach them')}</td></tr>
${noContact ? `<tr><td style="padding:0 0 14px;font-family:${BODY};font-size:15px;line-height:21px;color:${C.magenta};">No working email or phone on the form.</td></tr>` : `${btnRows}
<tr><td style="padding:0 0 18px;font-family:${BODY};font-size:13px;line-height:19px;color:${C.faint};">${contactBits}${replyNote ? `<br>${replyNote}` : ''}</td></tr>`}

<tr><td style="padding:0 0 18px;border-top:1px solid ${C.rule};"><div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>
${label('Trade and area')}
${saidText
    ? `<div style="font-family:${BODY};font-size:17px;line-height:25px;color:${C.ink};white-space:pre-line;">${escapeHtml(saidText)}</div>`
    : `<div style="font-family:${BODY};font-size:15px;line-height:22px;color:${C.soft};"><span style="color:${C.magenta};font-weight:700;">Left blank.</span> Ask their trade and area when you reply.</div>`}
</td></tr>

<tr><td style="padding:0 0 16px;border-top:1px solid ${C.rule};"><div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>
${label('Came from')}
<div style="font-family:${BODY};font-size:15px;line-height:22px;color:${C.ink};">${originHtml}</div>
<div style="font-family:${BODY};font-size:13px;line-height:19px;color:${C.faint};margin-top:4px;">Received ${escapeHtml(f.received)} (Brisbane)</div>
</td></tr>

</table></td></tr>

<tr><td style="padding:14px 6px 0;font-family:${BODY};font-size:12px;line-height:18px;color:${C.faint};">Lead ID ${escapeHtml(f.leadId ?? 'none')}${f.saved === false ? ` &nbsp;·&nbsp; <span style="color:${C.magenta};font-weight:700;">Not saved to the database</span>` : ''} &nbsp;·&nbsp; nunyabunya.com form</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const t = [];
  if (f.saved === false) t.push('!! DATABASE WAS DOWN: this email is the only record of this lead. Keep it.', '');
  t.push(`NEW LEAD · ${f.interest}`, name, '');
  if (p) t.push(clock, dueLine, '');
  t.push(onlyNote ? `REACH THEM (${onlyNote})` : 'REACH THEM');
  if (c.email) t.push(`Email: ${c.email}`);
  if (c.phone) t.push(`Phone: ${c.phone}`);
  if (noContact) t.push('No working email or phone on the form.');
  if (c.replyLink) t.push(`Gmail's own Reply reaches ${first} too.`);
  t.push('', 'TRADE AND AREA', saidText || blankNote, '');
  t.push('CAME FROM', origin, `Received ${f.received} (Brisbane)`, '');
  t.push(`Lead ID ${f.leadId ?? 'none'}${f.saved === false ? ' · Not saved to the database' : ''}`);
  const text = t.join('\n').replace(/—/g, '-');

  return { subject, html, text };
}
