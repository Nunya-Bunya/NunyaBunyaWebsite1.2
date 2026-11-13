// $89 Business Plan checkout.
//
// The quiz POSTs { email, answers } here. We create a Stripe Checkout Session for
// the same $89 price the old Payment Link used, with the buyer's quiz answers
// attached as metadata on the payment itself. The fulfillment watcher on Ben's Mac
// (Products/business-plan/watch_buyers.py) reads the answers straight off the paid
// PaymentIntent, so no database sits between "paid" and "plan delivered".
//
// Replaced the Supabase `leads` hop on 2026-11-14 after that project stopped
// existing (DNS gone) and the quiz started returning 500s.
//
// Env (Vercel): STRIPE_BP_CHECKOUT_KEY — a restricted key on the SAME Stripe account
// as the $89 price, with "Checkout Sessions: Write". If it's missing or Stripe errors,
// we hand back the old Payment Link so a buyer is never blocked; the watcher then
// flags that sale to Ben as "paid, no answers".

const PRICE_ID = 'price_1Tff0aJGGLPcHaTXyjPjlRGE';            // $89 AUD "Business Plan"
const PAYMENT_LINK = 'https://buy.stripe.com/dRm4gAfa9cuidpa8xm8k804';
const SITE = 'https://www.nunyabunya.com';
const FIELDS = ['business_name', 'owner_name', 'what_it_does', 'customer', 'problem',
                'offer', 'location', 'stage', 'goal', 'edge'];
const CHUNK = 490;        // Stripe metadata values max out at 500 chars
const MAX_CHUNKS = 4;     // 10 fields x 4 = 40 keys, under Stripe's 50-key cap

function fallback(res, email, reason) {
  console.error('bp-checkout fallback:', reason);
  const url = PAYMENT_LINK + '?prefilled_email=' + encodeURIComponent(email || '');
  return res.status(200).json({ ok: false, url, fallback: true });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const a = body.answers || {};
  const email = String(body.email || a.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'That email looks off. Mind checking it?' });
  }

  const key = (process.env.STRIPE_BP_CHECKOUT_KEY || '').trim();
  if (!key) return fallback(res, email, 'STRIPE_BP_CHECKOUT_KEY not set');

  const p = new URLSearchParams();
  p.append('mode', 'payment');
  p.append('line_items[0][price]', PRICE_ID);
  p.append('line_items[0][quantity]', '1');
  p.append('customer_email', email);
  p.append('automatic_tax[enabled]', 'true');
  p.append('success_url', `${SITE}/business-plan-success.html?session_id={CHECKOUT_SESSION_ID}`);
  p.append('cancel_url', `${SITE}/business-plan.html`);

  const meta = { bp: '1', bp_email: email };
  for (const f of FIELDS) {
    const v = String(a[f] || '').trim().slice(0, CHUNK * MAX_CHUNKS);
    for (let i = 0; i * CHUNK < v.length; i++) {
      meta[i === 0 ? `bp_${f}` : `bp_${f}__${i + 1}`] = v.slice(i * CHUNK, (i + 1) * CHUNK);
    }
  }
  for (const [k, v] of Object.entries(meta)) {
    p.append(`payment_intent_data[metadata][${k}]`, v);
  }
  p.append('metadata[bp]', '1');

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: p.toString(),
    });
    const d = await r.json();
    if (!r.ok || !d.url) return fallback(res, email, `Stripe ${r.status}: ${d.error && d.error.message}`);
    return res.status(200).json({ ok: true, url: d.url });
  } catch (e) {
    return fallback(res, email, e.message);
  }
}
