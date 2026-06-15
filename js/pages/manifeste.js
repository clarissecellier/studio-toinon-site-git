window.addEventListener('includes-ready', function () {

  /* ── CANVAS GRAIN HERO ── */
  var heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    var ctx = heroCanvas.getContext('2d');
    function resize() { heroCanvas.width = heroCanvas.offsetWidth; heroCanvas.height = heroCanvas.offsetHeight; }
    resize(); window.addEventListener('resize', resize);
    function grain() {
      var w = heroCanvas.width, h = heroCanvas.height;
      var img = ctx.createImageData(w, h); var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255 | 0;
        d[i] = v; d[i+1] = Math.round(v * 0.92); d[i+2] = Math.round(v * 0.78); d[i+3] = Math.random() * 12 | 0;
      }
      ctx.putImageData(img, 0, 0); requestAnimationFrame(grain);
    }
    grain();
  }

  /* ── NAV : zones claires/sombres ── */
  var navEl = document.getElementById('site-nav');
  if (navEl) {
    var lightSections = document.querySelectorAll('#manifeste-body, footer');
    function checkNav() {
      var anyLight = Array.from(lightSections).some(function (el) {
        var r = el.getBoundingClientRect(); return r.top < 80 && r.bottom > 0;
      });
      navEl.classList.toggle('on-light', anyLight);
    }
    window.addEventListener('scroll', checkNav, { passive: true });
    checkNav();
  }

});
