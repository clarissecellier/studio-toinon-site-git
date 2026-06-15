window.addEventListener('includes-ready', function () {

  /* ── CANVAS GRAIN CONTACT ── */
  var canvas = document.getElementById('contact-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize(); window.addEventListener('resize', resize);
    function grain() {
      var w = canvas.width, h = canvas.height;
      var img = ctx.createImageData(w, h); var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255 | 0;
        d[i] = v; d[i+1] = Math.round(v * 0.92); d[i+2] = Math.round(v * 0.78); d[i+3] = Math.random() * 18 | 0;
      }
      ctx.putImageData(img, 0, 0); requestAnimationFrame(grain);
    }
    grain();
  }

  /* ── NUMÉRO DOSSIER DYNAMIQUE ── */
  var numEl = document.querySelector('.form-dossier-num');
  if (numEl) {
    var num = String(Math.floor(Math.random() * 900) + 100);
    numEl.textContent = 'Dossier N° ' + num + ' — En cours d\'ouverture';
  }

});
