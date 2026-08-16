/* ============================================================
   POPUP.JS — delayed lead-capture popup + WhatsApp handoff.
   Shows once per visit (and not again for 3 days after a close),
   never on the contact page, and never if the user already
   submitted the main contact form this session.
   ============================================================ */
(function () {
  var overlay = document.querySelector('[data-popup-overlay]');
  if (!overlay) return;

  var WHATSAPP_NUMBER = '919529008060';
  var STORAGE_KEY = 'opz_popup_dismissed_at';
  var SNOOZE_DAYS = 3;
  var DELAY_MS = 9000;

  // Never show on the contact page — the full form is already there.
  var path = window.location.pathname;
  if (/contact\.html$/.test(path)) return;

  function isSnoozed() {
    try {
      var last = localStorage.getItem(STORAGE_KEY);
      if (!last) return false;
      var elapsedDays = (Date.now() - parseInt(last, 10)) / 86400000;
      return elapsedDays < SNOOZE_DAYS;
    } catch (e) { return false; }
  }

  function snooze() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
  }

  function openPopup() {
    if (document.body.classList.contains('popup-seen-session')) return;
    overlay.classList.add('is-open');
    document.body.classList.add('popup-seen-session');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    snooze();
  }

  if (!isSnoozed()) {
    setTimeout(function () {
      // don't interrupt if the user is already scrolled to the very bottom (near footer/CTA)
      openPopup();
    }, DELAY_MS);
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closePopup();
  });
  var closeBtn = overlay.querySelector('[data-popup-close]');
  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  var form = overlay.querySelector('[data-popup-form]');
  if (!form) return;
  var status = form.querySelector('.form-status');

  function showStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('ok', 'err');
    status.classList.add('show', ok ? 'ok' : 'err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.querySelector('#popup-name');
    var phone = form.querySelector('#popup-phone');
    var service = form.querySelector('#popup-service');

    if (!name.value.trim() || !phone.value.trim()) {
      showStatus('Please share your name and phone number.', false);
      return;
    }
    var phonePattern = /^[0-9+\-\s()]{7,15}$/;
    if (!phonePattern.test(phone.value.trim())) {
      showStatus('That phone number doesn\u2019t look right.', false);
      return;
    }

    var lines = [
      'New enquiry from the Orbit Pixel website (popup):',
      'Name: ' + name.value.trim(),
      'Phone: ' + phone.value.trim(),
      service.value ? 'Service: ' + service.value : null
    ].filter(Boolean);

    var text = encodeURIComponent(lines.join('\n'));
    showStatus('Thanks! Opening WhatsApp so you can send this directly.', true);
    snooze();

    setTimeout(function () {
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text, '_blank');
      closePopup();
      form.reset();
    }, 500);
  });
})();
