/**
 * main.js — Scripts partagés (cursor, reveal, burger, logo swap)
 * Doit s'exécuter après que includes.js ait dispatché "includes-ready".
 */

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

  /* ── LOGO CONTRAST SWAP ── */
  var DARK_SRC  = 'assets/images/logo-light.svg';
  var LIGHT_SRC = 'assets/images/logo-dark.svg';

  /* La config est lue depuis body data attributes :
     data-dark-sections="id1,id2"  (séparés par virgule)
     data-default-dark="true|false"
  */
  var darkSectionIds = (document.body.dataset.darkSections || '').split(',').filter(Boolean);
  var defaultDark    = document.body.dataset.defaultDark === 'true';
  var logoImg        = document.getElementById('nav-logo-img');

  if (logoImg) {
    function getLogoColor() {
      if (!darkSectionIds.length) return defaultDark ? 'dark' : 'light';
      var navH = 80;
      var anyDark = darkSectionIds.some(function (id) {
        var el = document.getElementById(id);
        if (!el) return false;
        var r = el.getBoundingClientRect();
        return r.top < navH && r.bottom > 0;
      });
      return anyDark ? 'dark' : (defaultDark ? 'dark' : 'light');
    }
    function updateLogo() {
      logoImg.src = (getLogoColor() === 'dark') ? DARK_SRC : LIGHT_SRC;
    }
    updateLogo();
    window.addEventListener('scroll', updateLogo, { passive: true });
  }

});
