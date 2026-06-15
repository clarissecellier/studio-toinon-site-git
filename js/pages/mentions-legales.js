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

  /* ── NAV SCROLL ── */
  var navEl = document.getElementById('site-nav');
  if (navEl) {
    window.addEventListener('scroll', function () {
      navEl.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

});
