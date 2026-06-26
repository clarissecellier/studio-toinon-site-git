window.addEventListener('includes-ready', function () {

  /* ── CANVAS GRAIN GLOBAL ── */
  startGrain(document.getElementById('global-canvas'), { full: true, alphaMax: 22 });

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
