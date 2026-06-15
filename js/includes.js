/**
 * includes.js — Chargement dynamique header / footer / tab-bar
 * Dispatch "includes-ready" une fois tout injecté.
 */
(function () {
  var base = document.body.dataset.base || '';

  function load(url, placeholder, done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', base + url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        var tmp = document.createElement('div');
        tmp.innerHTML = xhr.responseText;
        placeholder.parentNode.replaceChild(tmp.firstElementChild, placeholder);
      }
      done();
    };
    xhr.onerror = done;
    xhr.send();
  }

  var pending = 3;
  function onDone() {
    pending--;
    if (pending > 0) return;

    // Marquer le lien actif dans la nav
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#site-nav .nav-center a').forEach(function (a) {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });

    // Marquer le tab actif
    var page = document.body.dataset.page;
    if (page) {
      document.querySelectorAll('#tab-bar .tab-item').forEach(function (t) {
        if (t.dataset.page === page) t.classList.add('active');
      });
    }

    // Logo + thème nav initial selon couleur de page (évite le clignotement
    // avant que main.js ne prenne le relais au scroll)
    var isDark = document.body.dataset.defaultDark === 'true';
    var logoImg = document.getElementById('nav-logo-img');
    if (logoImg) {
      logoImg.src = base + (isDark ? 'assets/images/logo-light.svg' : 'assets/images/logo-dark.svg');
    }
    var navEl = document.getElementById('site-nav');
    if (navEl) navEl.classList.toggle('on-light', !isDark);

    // Footer : cacher le bon logo
    var footer = document.getElementById('site-footer');
    if (footer && footer.classList.contains('light')) {
      footer.querySelectorAll('.logo-on-dark').forEach(function (el) { el.style.display = 'none'; });
    } else if (footer) {
      footer.querySelectorAll('.logo-on-light').forEach(function (el) { el.style.display = 'none'; });
    }

    window.dispatchEvent(new Event('includes-ready'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var headerEl = document.getElementById('site-header-placeholder');
    var footerEl = document.getElementById('site-footer-placeholder');
    var tabEl    = document.getElementById('tab-bar-placeholder');

    if (headerEl) load('includes/header.html', headerEl, onDone); else onDone();
    if (footerEl) load('includes/footer.html', footerEl, onDone); else onDone();
    if (tabEl)    load('includes/tab-bar.html', tabEl, onDone);   else onDone();
  });
})();
