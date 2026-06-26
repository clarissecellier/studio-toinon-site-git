window.addEventListener('includes-ready', function () {

  /* ── CANVAS GRAIN CONTACT ── */
  startGrain(document.getElementById('contact-canvas'), { alphaMax: 18 });

  /* ── NUMÉRO DOSSIER DYNAMIQUE ── */
  var numEl = document.querySelector('.form-dossier-num');
  if (numEl) {
    var num = String(Math.floor(Math.random() * 900) + 100);
    numEl.textContent = 'Dossier N° ' + num + ' — En cours d\'ouverture';
  }

  /* ── SOUMISSION DU FORMULAIRE (envoi via contact.php) ── */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var feedback = document.getElementById('form-feedback');
  var btn = form.querySelector('.form-submit');
  var btnLabel = btn ? btn.querySelector('span') : null;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFeedback(msg, ok) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.style.color = ok ? '#2E7D32' : '#E8462A';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setFeedback('', true);

    var nom = (form.querySelector('[name="nom"]').value || '').trim();
    var email = (form.querySelector('[name="email"]').value || '').trim();
    var message = (form.querySelector('[name="message"]').value || '').trim();

    if (!nom || !email || !message) {
      setFeedback('Renseignez au minimum votre identité, votre email et la description.', false);
      return;
    }
    if (!emailRe.test(email)) {
      setFeedback('Adresse email invalide.', false);
      return;
    }

    var original = btnLabel ? btnLabel.textContent : '';
    if (btn) btn.disabled = true;
    if (btnLabel) btnLabel.textContent = 'Envoi…';

    fetch('contact.php', { method: 'POST', body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) {
          form.querySelectorAll('.form-group, .form-bottom').forEach(function (el) {
            el.style.display = 'none';
          });
          setFeedback('Dossier transmis. On instruit votre affaire et on vous répond sous 48h, en toute confidentialité.', true);
        } else {
          if (btn) btn.disabled = false;
          if (btnLabel) btnLabel.textContent = original;
          setFeedback((j && j.error) || 'Envoi impossible. Réessayez.', false);
        }
      })
      .catch(function () {
        if (btn) btn.disabled = false;
        if (btnLabel) btnLabel.textContent = original;
        setFeedback('Connexion impossible. Réessayez, ou écrivez directement à clarisse@studio-toinon.fr.', false);
      });
  });

});
