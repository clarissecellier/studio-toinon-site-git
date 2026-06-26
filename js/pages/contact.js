window.addEventListener('includes-ready', function () {

  /* ── CANVAS GRAIN CONTACT ── */
  startGrain(document.getElementById('contact-canvas'), { alphaMax: 18 });

  /* ── NUMÉRO DOSSIER DYNAMIQUE ── */
  var numEl = document.querySelector('.form-dossier-num');
  if (numEl) {
    var num = String(Math.floor(Math.random() * 900) + 100);
    numEl.textContent = 'Dossier N° ' + num + ' — En cours d\'ouverture';
  }

});
