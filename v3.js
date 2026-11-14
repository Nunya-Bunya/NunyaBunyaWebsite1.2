/* Nunya Bunya v3 shared behaviour (Wizard, 2026-11-14). Pairs with style-v3.css.
 * No dependencies. Load with <script src="/v3.js" defer></script>.
 * In <head>, before the stylesheet, add the theme line so there is no flash:
 *   <script>document.documentElement.classList.add('js');try{var t=localStorage.getItem('nb_theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
 */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav: solid once scrolled, full-screen menu on phones ── */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = nav.querySelector('.nav__toggle');
    var icon = toggle && toggle.querySelector('use');
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (icon) icon.setAttribute('href', '/images/v3/icons.svg#' + (open ? 'i-close' : 'i-menu'));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    if (toggle) {
      toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
      nav.querySelectorAll('.nav__links a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
      window.addEventListener('resize', function () { if (window.innerWidth > 980 && nav.classList.contains('is-open')) setOpen(false); });
    }
  }

  /* ── Lights up / lights down ── */
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    var label = btn.querySelector('[data-theme-label]');
    var paint = function () {
      var light = doc.dataset.theme === 'light';
      if (label) label.textContent = light ? 'Lights down' : 'Lights up';
      btn.setAttribute('aria-pressed', light ? 'true' : 'false');
    };
    paint();
    btn.addEventListener('click', function () {
      var next = doc.dataset.theme === 'light' ? 'dark' : 'light';
      if (next === 'dark') delete doc.dataset.theme; else doc.dataset.theme = next;
      try { localStorage.setItem('nb_theme', next); } catch (e) {}
      paint();
    });
  });

  /* ── Reveals + hand marks: once, when they enter the frame ── */
  var targets = document.querySelectorAll('[data-reveal], [data-draw]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    /* A mark starts fully clipped, and a clipped box never "intersects",
       so marks are triggered by the word they sit on. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target._nbTargets.forEach(function (t) { t.classList.add('in'); });
        io.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) {
      var watch = el.hasAttribute('data-draw') ? el.parentElement : el;
      (watch._nbTargets = watch._nbTargets || []).push(el);
      io.observe(watch);
    });
  }

  /* ── The opening shot: start the focus pull once the still has decoded ── */
  var hero = document.querySelector('.hero');
  if (hero) {
    var img = hero.querySelector('.hero__still img');
    var go = function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); };
    if (reduce || !img) go();
    else if (img.complete) (img.decode ? img.decode().then(go, go) : go());
    else { img.addEventListener('load', go, { once: true }); img.addEventListener('error', go, { once: true }); }
    setTimeout(go, 1800); /* never leave the title hidden on a slow connection */
  }

  /* ── Phone dock: shows once the opener's buttons have gone, hides at the closing scene ── */
  var dock = document.querySelector('.dock');
  var heroActs = document.querySelector('.hero .actions');
  var end = document.querySelector('[data-dock-end]');
  if (dock && heroActs && 'IntersectionObserver' in window) {
    var past = false, atEnd = false;
    var paintDock = function () {
      var show = past && !atEnd;
      dock.classList.toggle('is-shown', show);
      dock.setAttribute('aria-hidden', show ? 'false' : 'true');
      dock.querySelectorAll('a').forEach(function (a) { a.tabIndex = show ? 0 : -1; });
    };
    new IntersectionObserver(function (e) { past = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; paintDock(); }).observe(heroActs);
    if (end) new IntersectionObserver(function (e) { atEnd = e[0].isIntersecting; paintDock(); }).observe(end);
  }
})();
