// Effet machine à écrire : alterne les mots dans #type-word, en boucle.
(function () {
  var el = document.getElementById('type-word');
  if (!el) return;

  var WORDS = ['justice', 'un sens'];
  var TYPE = 110;        // vitesse de frappe (ms/lettre)
  var DEL = 65;          // vitesse d'effacement
  var HOLD = 1500;       // pause mot complet
  var HOLD_EMPTY = 350;  // pause mot vide avant le suivant

  // Accessibilité : si l'utilisateur réduit les animations, on fige le 1er mot.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = WORDS[0];
    return;
  }

  var w = 0, i = 0, deleting = false;

  function tick() {
    var word = WORDS[w];
    if (!deleting) {
      i++;
      el.textContent = word.slice(0, i);
      if (i >= word.length) { deleting = true; return setTimeout(tick, HOLD); }
      return setTimeout(tick, TYPE);
    }
    i--;
    el.textContent = word.slice(0, i);
    if (i <= 0) { deleting = false; w = (w + 1) % WORDS.length; return setTimeout(tick, HOLD_EMPTY); }
    return setTimeout(tick, DEL);
  }

  el.textContent = '';
  setTimeout(tick, 500);
})();
