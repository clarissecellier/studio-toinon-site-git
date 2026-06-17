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

  /* ── ARCHIVES : DEFILEMENT INFINI + VIGNETTE CURSEUR ── */
  var trackWrap = document.querySelector('.archives-track-wrap');
  var track = document.getElementById('archivesTrack');
  var floatEl = document.getElementById('archiveFloat');
  if (trackWrap && track) {
    var items = track.children;
    var SPEED = 1.1;                 // px / frame (~66 px/s à 60fps)
    var offset = 0;                  // translation courante (négatif = vers la gauche)
    var halfWidth = 0;               // largeur d'un set (contenu dupliqué x2)
    var paused = false;
    var dragging = false, dragStartX = 0, dragStartOffset = 0, moved = false;

    function measure() { halfWidth = track.scrollWidth / 2; }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    function normalize() {           // garde offset dans [-halfWidth, 0] => boucle sans fin
      if (halfWidth <= 0) return;
      while (offset <= -halfWidth) offset += halfWidth;
      while (offset > 0) offset -= halfWidth;
    }

    function render() {
      if (!paused && !dragging) offset -= SPEED;
      normalize();
      track.style.transform = 'translateX(' + offset + 'px)';
      requestAnimationFrame(render);
    }
    render();

    /* pause au survol */
    trackWrap.addEventListener('mouseenter', function () { paused = true; });
    trackWrap.addEventListener('mouseleave', function () { paused = false; hideFloat(); });

    /* glisser pour parcourir */
    trackWrap.addEventListener('mousedown', function (e) {
      dragging = true; moved = false; dragStartX = e.pageX; dragStartOffset = offset;
      track.classList.add('dragging');
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      e.preventDefault();
      if (Math.abs(e.pageX - dragStartX) > 4) moved = true;
      offset = dragStartOffset + (e.pageX - dragStartX);
      normalize();
    });
    window.addEventListener('mouseup', function () {
      dragging = false; track.classList.remove('dragging');
    });

    /* vignette flottante qui suit le curseur */
    function showFloat(item) {
      if (!floatEl) return;
      var num = item.querySelector('.dossier-num');
      var client = item.querySelector('.dossier-client');
      var type = item.querySelector('.dossier-type');
      var accent = item.getAttribute('data-accent') || '#1A1A1A';
      var img = item.getAttribute('data-img');
      var imgEl = floatEl.querySelector('.archive-float-img');
      floatEl.querySelector('.archive-float-num').textContent = num ? num.textContent : '';
      floatEl.querySelector('.archive-float-client').textContent = client ? client.textContent : '';
      floatEl.querySelector('.archive-float-type').textContent = type ? type.textContent : '';
      if (img) {
        imgEl.style.backgroundImage = 'url("' + img + '")';
        imgEl.style.backgroundColor = '';
        floatEl.classList.add('has-img');
      } else {
        imgEl.style.backgroundImage = 'none';
        imgEl.style.backgroundColor = accent;
        floatEl.classList.remove('has-img');
      }
      floatEl.classList.add('show');
    }
    function hideFloat() { if (floatEl) floatEl.classList.remove('show'); }
    function moveFloat(e) {
      if (!floatEl) return;
      floatEl.style.left = e.clientX + 'px';
      floatEl.style.top = e.clientY + 'px';
    }

    Array.prototype.forEach.call(items, function (item) {
      item.addEventListener('mouseenter', function () { showFloat(item); });
      item.addEventListener('mousemove', moveFloat);
      var href = item.getAttribute('data-href');
      if (href && href !== '#') item.classList.add('is-link');
      item.addEventListener('click', function () {
        if (moved) return;                       // c'etait un glisser, pas un clic
        if (href && href !== '#') window.location.href = href;
      });
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
