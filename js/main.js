/**
 * main.js — Scripts partagés (cursor, reveal, burger, logo swap)
 * Doit s'exécuter après que includes.js ait dispatché "includes-ready".
 */

/* ── GRAIN ANIMÉ (helper partagé) ──
   Avant, chaque page redessinait le grain pixel par pixel en pleine résolution
   à 60fps (≈8M écritures/frame en 1080p), ce qui saturait le thread principal
   et faisait laguer le curseur personnalisé.
   Optimisation : le bruit est généré sur un canvas basse résolution (1 px = 2 px
   écran → 4× moins d'écritures) puis agrandi en drawImage, et l'animation est
   bridée à 30fps. À l'œil (grain à ~5-11% d'opacité) le rendu est identique.
   Options : alphaMax (intensité), full (true = plein viewport, sinon taille du canvas). */
function startGrain(canvas, opts) {
  if (!canvas) return;
  opts = opts || {};
  var alphaMax = opts.alphaMax || 22;
  var scale = 2;          // 1 px de bruit pour 2 px écran
  var interval = 1000 / 30;
  var full = !!opts.full;
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  var buf = document.createElement('canvas');
  var bctx = buf.getContext('2d');
  function resize() {
    var w = full ? window.innerWidth : canvas.offsetWidth;
    var h = full ? window.innerHeight : canvas.offsetHeight;
    canvas.width = w; canvas.height = h;
    buf.width = Math.max(1, Math.ceil(w / scale));
    buf.height = Math.max(1, Math.ceil(h / scale));
    ctx.imageSmoothingEnabled = false;
  }
  resize();
  window.addEventListener('resize', resize);
  var last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (now - last < interval) return;
    last = now;
    var bw = buf.width, bh = buf.height;
    var img = bctx.createImageData(bw, bh); var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.random() * 255 | 0;
      d[i] = v; d[i+1] = Math.round(v * 0.92); d[i+2] = Math.round(v * 0.78); d[i+3] = Math.random() * alphaMax | 0;
    }
    bctx.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}
window.startGrain = startGrain;

window.addEventListener('includes-ready', function () {

  /* ── CURSEUR ── */
  var cursor = document.getElementById('cursor');
  var trail  = document.getElementById('cursor-trail');
  if (cursor && trail) {
    var mx = 0, my = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    });
    (function animTrail() {
      tx += (mx - tx) * 0.12; ty += (my - ty) * 0.12;
      trail.style.left = tx + 'px'; trail.style.top = ty + 'px';
      requestAnimationFrame(animTrail);
    })();
    document.querySelectorAll('a, button, input, textarea, select, [data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('big'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('big'); });
    });
  }

  /* ── SCROLL REVEAL ── */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ── BURGER MENU ── */
  var burger    = document.querySelector('.nav-burger');
  var navCenter = document.querySelector('.nav-center');
  if (burger && navCenter) {
    burger.addEventListener('click', function () {
      var open = navCenter.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navCenter.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navCenter.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── CONTRASTE NAV + LOGO selon le fond ──
     La nav est transparente : son texte et son logo doivent s'adapter à la
     section qui se trouve derrière elle (foncé sur fond clair, clair sur fond sombre).

     Config lue depuis les data-attributes du <body> :
       data-dark-sections="id1,id2"  → les sections à fond SOMBRE (séparées par virgule)
       data-default-dark="true|false" → le fond par défaut est-il sombre ?
  */
  var DARK_SRC  = 'assets/images/logo-light.svg';   // logo clair → pour fond sombre
  var LIGHT_SRC = 'assets/images/logo-dark.svg';    // logo sombre → pour fond clair

  var darkSectionIds = (document.body.dataset.darkSections || '').split(',').filter(Boolean);
  var defaultDark    = document.body.dataset.defaultDark === 'true';
  var logoImg        = document.getElementById('nav-logo-img');
  var navEl          = document.getElementById('site-nav');

  function bgIsDark() {
    if (!darkSectionIds.length) return defaultDark;
    var navH = 80;
    var anyDark = darkSectionIds.some(function (id) {
      var el = document.getElementById(id);
      if (!el) return false;
      var r = el.getBoundingClientRect();
      return r.top < navH && r.bottom > 0;
    });
    return anyDark || defaultDark;
  }
  function applyNavTheme() {
    var dark = bgIsDark();
    if (logoImg) logoImg.src = dark ? DARK_SRC : LIGHT_SRC;
    if (navEl) navEl.classList.toggle('on-light', !dark);
  }
  applyNavTheme();
  window.addEventListener('scroll', applyNavTheme, { passive: true });

  /* Fond de nav « solide » (crème floutée) activé une fois le hero passé.
     Utilisé par l'accueil pour basculer en blur à la fin de la section hero
     (le CSS du blur est scopé par page). */
  var heroEl = document.getElementById('hero');
  function applyNavSolid() {
    if (!navEl) return;
    var solid = heroEl
      ? heroEl.getBoundingClientRect().bottom <= 80
      : window.scrollY > 10;
    navEl.classList.toggle('nav-solid', solid);
  }
  applyNavSolid();
  window.addEventListener('scroll', applyNavSolid, { passive: true });

});
