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

  /* ── FILTRES ── */
  var cards = document.querySelectorAll('.archive-card');
  document.querySelectorAll('.filtre-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filtre-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      cards.forEach(function (card) {
        if (filter === 'all') { card.style.display = ''; return; }
        // data-jur peut contenir plusieurs juridictions (ex. "J.01 J.02")
        var jurs = (card.dataset.jur || '').split(/\s+/);
        card.style.display = (jurs.indexOf(filter) > -1) ? '' : 'none';
      });
    });
  });

});
