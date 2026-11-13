/* NB cookie consent + consent-gated Meta Pixel. Added 2026-11-14 (SOP-AD-000: pixel loads only after consent).
 *
 * Load synchronously BEFORE the page's fbq('init') call:
 *   <script src="/consent.js"></script>
 *   <script>fbq('init','<pixel id>');fbq('track','PageView');</script>
 *
 * This defines Meta's usual fbq queue but does NOT load Meta's script. Every fbq() call on the page
 * waits in that queue. "That's fine" loads Meta's script and the queue is sent; "No thanks" means
 * nothing is ever sent to Meta. The choice is a cookie on .nunyabunya.com so it carries from
 * nunyabunya.com to www (the Stripe success page) and is asked once a year at most.
 */
(function (w, d) {
  if (!w.fbq) {
    var n = w.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!w._fbq) w._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  }

  var NAME = 'nb_consent';
  function read() { var m = d.cookie.match(/(?:^|;\s*)nb_consent=(yes|no)/); return m ? m[1] : null; }
  function save(v) {
    var base = NAME + '=' + v + '; Max-Age=31536000; Path=/; SameSite=Lax';
    var host = location.hostname;
    d.cookie = /(^|\.)nunyabunya\.com$/.test(host) ? base + '; Domain=.nunyabunya.com' : base;
  }
  var loaded = false;
  function loadMeta() {
    if (loaded) return; loaded = true;
    var t = d.createElement('script'); t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    (d.head || d.documentElement).appendChild(t);
  }

  var choice = read();
  if (choice === 'yes') { loadMeta(); return; }
  if (choice === 'no') return;

  function showBar() {
    var css = '#nb-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:760px;margin:0 auto;' +
      'background:#111;color:#eee;border:1px solid #2a2a2a;border-radius:14px;padding:14px 16px;display:flex;flex-wrap:wrap;' +
      'gap:12px;align-items:center;justify-content:space-between;font:14px/1.45 "Plus Jakarta Sans",Helvetica,Arial,sans-serif;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.45)}#nb-consent p{margin:0;flex:1 1 300px}#nb-consent a{color:#00E5CC}' +
      '#nb-consent .b{display:flex;gap:8px;flex:0 0 auto}#nb-consent button{font:600 14px "Plus Jakarta Sans",Helvetica,Arial,sans-serif;' +
      'border-radius:999px;padding:10px 18px;cursor:pointer;min-width:112px}#nb-consent .no{background:transparent;color:#eee;border:1px solid #555}' +
      '#nb-consent .yes{background:#00E5CC;color:#0a0a0a;border:1px solid #00E5CC}';
    var s = d.createElement('style'); s.textContent = css; d.head.appendChild(s);
    var bar = d.createElement('div'); bar.id = 'nb-consent'; bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML = '<p>Quick one: can I use cookies to see which ads brought you here? It helps me keep ad costs, ' +
      'and prices, down. Meta\'s tracking only switches on if you say yes. <a href="/privacy.html">Privacy</a></p>' +
      '<div class="b"><button class="no" type="button">No thanks</button><button class="yes" type="button">That\'s fine</button></div>';
    d.body.appendChild(bar);
    bar.querySelector('.yes').onclick = function () { save('yes'); bar.remove(); loadMeta(); };
    bar.querySelector('.no').onclick = function () { save('no'); bar.remove(); };
  }
  if (d.body) showBar(); else d.addEventListener('DOMContentLoaded', showBar);
})(window, document);
