window.addEventListener('includes-ready', function () {

  /* ── CANVAS GRAIN HERO ── */
  var heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) {
    var ctx = heroCanvas.getContext('2d');
    function resizeCanvas() { heroCanvas.width = heroCanvas.offsetWidth; heroCanvas.height = heroCanvas.offsetHeight; }
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    function drawGrain() {
      var w = heroCanvas.width, h = heroCanvas.height;
      var img = ctx.createImageData(w, h); var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255 | 0;
        d[i] = v; d[i+1] = Math.round(v * 0.92); d[i+2] = Math.round(v * 0.78); d[i+3] = Math.random() * 28 | 0;
      }
      ctx.putImageData(img, 0, 0); requestAnimationFrame(drawGrain);
    }
    drawGrain();
  }

  /* ── CANVAS GRAIN ARCHIVES ── */
  var archCanvas = document.getElementById('archives-canvas');
  if (archCanvas) {
    var actx = archCanvas.getContext('2d');
    function resizeArch() { archCanvas.width = archCanvas.offsetWidth; archCanvas.height = archCanvas.offsetHeight; }
    resizeArch(); window.addEventListener('resize', resizeArch);
    function drawArchGrain() {
      var w = archCanvas.width, h = archCanvas.height;
      var img = actx.createImageData(w, h); var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255 | 0;
        d[i] = v; d[i+1] = Math.round(v * 0.92); d[i+2] = Math.round(v * 0.78); d[i+3] = Math.random() * 22 | 0;
      }
      actx.putImageData(img, 0, 0); requestAnimationFrame(drawArchGrain);
    }
    drawArchGrain();
  }

  /* ── DRAG SCROLL ARCHIVES ── */
  var trackWrap = document.querySelector('.archives-track-wrap');
  var track = document.getElementById('archivesTrack');
  if (trackWrap && track) {
    var isDragging = false, startX = 0, scrollLeft = 0;
    trackWrap.addEventListener('mousedown', function (e) {
      isDragging = true; startX = e.pageX - trackWrap.offsetLeft;
      scrollLeft = trackWrap.scrollLeft; track.classList.add('dragging');
    });
    window.addEventListener('mouseup', function () { isDragging = false; track.classList.remove('dragging'); });
    trackWrap.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      e.preventDefault();
      var x = e.pageX - trackWrap.offsetLeft;
      trackWrap.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }

  /* ── PARALLAX HERO ── */
  var heroBg = document.getElementById('heroBg');
  if (heroBg) {
    document.addEventListener('mousemove', function (e) {
      var xPct = (e.clientX / window.innerWidth - 0.5) * 22;
      var yPct = (e.clientY / window.innerHeight - 0.5) * 10;
      heroBg.style.transform = 'translate(calc(-50% + ' + xPct + 'px), calc(-50% + ' + yPct + 'px))';
    });
  }

  /* ── JURIDICTIONS ACCORDION ── */
  document.querySelectorAll('.juridiction').forEach(function (jur) {
    function toggle() {
      var idx = jur.dataset.jur;
      var detail = document.getElementById('jur-' + idx);
      var isOpen = detail.classList.contains('open');
      document.querySelectorAll('.jur-detail').forEach(function (d) { d.classList.remove('open'); });
      document.querySelectorAll('.juridiction').forEach(function (j) { j.setAttribute('aria-expanded', 'false'); });
      if (!isOpen) { detail.classList.add('open'); jur.setAttribute('aria-expanded', 'true'); }
    }
    jur.addEventListener('click', toggle);
    jur.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

});
