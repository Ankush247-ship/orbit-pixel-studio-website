/* ============================================================
   CONTACT.JS — enquiry form validation + WhatsApp handoff
   Static site: the form composes a WhatsApp message with the
   enquiry details rather than posting to a backend.
   ============================================================ */
(function () {
  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  var status = form.querySelector('.form-status');
  var WHATSAPP_NUMBER = '919529008060';

  function showStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('ok', 'err');
    status.classList.add('show', ok ? 'ok' : 'err');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.querySelector('#name');
    var phone = form.querySelector('#phone');
    var email = form.querySelector('#email');
    var service = form.querySelector('#service');
    var budget = form.querySelector('#budget');
    var business = form.querySelector('#business');
    var message = form.querySelector('#message');

    if (!name.value.trim() || !phone.value.trim()) {
      showStatus('Please share your name and phone number so we can reach you.', false);
      return;
    }
    var phonePattern = /^[0-9+\-\s()]{7,15}$/;
    if (!phonePattern.test(phone.value.trim())) {
      showStatus('That phone number doesn\u2019t look right \u2014 please double-check it.', false);
      return;
    }
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showStatus('That email doesn\u2019t look right \u2014 please double-check it.', false);
      return;
    }

    var lines = [
      'New enquiry from the Orbit Pixel website:',
      'Name: ' + name.value.trim(),
      business.value.trim() ? 'Business: ' + business.value.trim() : null,
      'Phone: ' + phone.value.trim(),
      email.value.trim() ? 'Email: ' + email.value.trim() : null,
      service.value ? 'Service: ' + service.value : null,
      budget.value.trim() ? 'Budget: ' + budget.value.trim() : null,
      message.value.trim() ? 'Message: ' + message.value.trim() : null
    ].filter(Boolean);

    var text = encodeURIComponent(lines.join('\n'));
    showStatus('Thanks! Opening WhatsApp so you can send your enquiry directly.', true);

    setTimeout(function () {
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text, '_blank');
    }, 500);

    form.reset();
  });
})();
