/**
 * consent.js — Bandeau de consentement cookies (CNIL) + chargement conditionnel
 * de Google Analytics.
 *
 * Autonome (n'a besoin ni de includes.js ni de main.js) : il injecte son propre
 * style et sa propre bannière, et fonctionne donc aussi bien sur les pages
 * desktop que sur les pages mobiles autonomes du dossier mobile/.
 *
 * Règle CNIL appliquée : Google Analytics dépose des cookies de mesure
 * d'audience NON essentiels → aucun script Google n'est chargé tant que
 * l'utilisateur n'a pas cliqué « Accepter ». « Refuser » et « Accepter » ont
 * le même poids visuel. Le choix est mémorisé en localStorage.
 */
(function () {
  var GA_ID = 'G-9312TM8KJN';
  var KEY = 'st-cookie-consent';        // localStorage : { choice, ts }
  var EXPIRE_GRANTED = 13 * 30 * 24 * 60 * 60 * 1000; // ~13 mois (validité consentement)
  var EXPIRE_DENIED  = 6 * 30 * 24 * 60 * 60 * 1000;  // ~6 mois (re-demande après refus)

  /* Chemin relatif vers la racine du site (les pages mobiles sont dans mobile/) */
  var ROOT = location.pathname.indexOf('/mobile/') > -1 ? '../' : '';

  function readChoice() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var age = Date.now() - (data.ts || 0);
      if (data.choice === 'granted' && age < EXPIRE_GRANTED) return 'granted';
      if (data.choice === 'denied'  && age < EXPIRE_DENIED)  return 'denied';
      return null; // expiré → on redemande
    } catch (e) { return null; }
  }

  function saveChoice(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, ts: Date.now() })); } catch (e) {}
  }

  /* ── Chargement de Google Analytics (uniquement après consentement) ── */
  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  /* ── Style de la bannière (au style judiciaire du site) ── */
  function injectStyle() {
    var css =
      '#st-consent{position:fixed;left:0;right:0;bottom:0;z-index:9000;' +
      'background:rgba(26,26,26,0.97);color:#F5F0E8;' +
      'border-top:1px solid #D4E842;' +
      'font-family:"Space Mono","Courier New",Courier,monospace;' +
      'padding:1.25rem 1.5rem;display:flex;flex-wrap:wrap;align-items:center;' +
      'gap:1rem 1.5rem;justify-content:center;' +
      'transform:translateY(100%);transition:transform .45s ease;}' +
      '#st-consent.st-show{transform:translateY(0);}' +
      '#st-consent .st-txt{flex:1 1 320px;max-width:760px;font-size:0.72rem;' +
      'line-height:1.6;letter-spacing:0.02em;color:rgba(245,240,232,0.85);}' +
      '#st-consent .st-txt strong{color:#F5F0E8;letter-spacing:0.04em;}' +
      '#st-consent .st-txt a{color:#D4E842;text-decoration:underline;text-underline-offset:2px;}' +
      '#st-consent .st-actions{display:flex;gap:0.75rem;flex-shrink:0;}' +
      '#st-consent button{font-family:inherit;font-size:0.6rem;letter-spacing:0.18em;' +
      'text-transform:uppercase;padding:0.7rem 1.4rem;border:1px solid #F5F0E8;' +
      'cursor:pointer;background:transparent;color:#F5F0E8;transition:background .2s,color .2s,border-color .2s;}' +
      '#st-consent button.st-accept{background:#D4E842;color:#1A1A1A;border-color:#D4E842;}' +
      '#st-consent button.st-accept:hover{background:#E8462A;color:#F5F0E8;border-color:#E8462A;}' +
      '#st-consent button.st-refuse:hover{background:#F5F0E8;color:#1A1A1A;}' +
      'body.page-light #st-consent{color:#F5F0E8;}' +
      '@media(max-width:600px){#st-consent{flex-direction:column;align-items:stretch;text-align:center;padding:1.1rem 1.2rem;}' +
      '#st-consent .st-actions{justify-content:center;}' +
      '#st-consent button{flex:1;}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  function showBanner() {
    injectStyle();
    var bar = document.createElement('div');
    bar.id = 'st-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Consentement aux cookies');
    bar.innerHTML =
      '<p class="st-txt"><strong>Pièce à conviction.</strong> Ce site utilise des cookies de ' +
      'mesure d\'audience (Google Analytics) pour comprendre sa fréquentation. ' +
      'Ils ne sont déposés qu\'avec votre accord. ' +
      '<a href="' + ROOT + 'mentions-legales.html">En savoir plus</a>.</p>' +
      '<div class="st-actions">' +
      '<button type="button" class="st-refuse">Refuser</button>' +
      '<button type="button" class="st-accept">Accepter</button>' +
      '</div>';
    document.body.appendChild(bar);
    // forcer un reflow puis afficher (slide-up)
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('st-show'); }); });

    function close(choice) {
      saveChoice(choice);
      bar.classList.remove('st-show');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 500);
      if (choice === 'granted') loadGA();
    }
    bar.querySelector('.st-accept').addEventListener('click', function () { close('granted'); });
    bar.querySelector('.st-refuse').addEventListener('click', function () { close('denied'); });
  }

  function init() {
    var choice = readChoice();
    if (choice === 'granted') { loadGA(); return; }
    if (choice === 'denied') { return; }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
