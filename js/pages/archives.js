window.addEventListener('includes-ready', function () {

  /* ── CANVAS GRAIN GLOBAL ── */
  var canvas = document.getElementById('global-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    function grain() {
      var w = canvas.width, h = canvas.height;
      var img = ctx.createImageData(w, h); var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255 | 0;
        d[i] = v; d[i+1] = Math.round(v * 0.92); d[i+2] = Math.round(v * 0.78); d[i+3] = Math.random() * 22 | 0;
      }
      ctx.putImageData(img, 0, 0); requestAnimationFrame(grain);
    }
    grain();
  }

  /* ── NAV SCROLL (transparente → solide) ── */
  var navEl = document.getElementById('site-nav');
  if (navEl) {
    window.addEventListener('scroll', function () {
      navEl.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── FILTRES ── */
  var cards = document.querySelectorAll('.archive-card');
  document.querySelectorAll('.filtre-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filtre-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      cards.forEach(function (card) {
        if (filter === 'tous') { card.style.display = ''; return; }
        var jur = card.querySelector('.archive-card-jur');
        card.style.display = (jur && jur.textContent.trim() === filter) ? '' : 'none';
      });
    });
  });

});
