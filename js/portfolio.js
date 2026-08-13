/* ============================================================
   PORTFOLIO.JS — category filtering
   ============================================================ */
(function () {
  var bar = document.querySelector('.filter-bar');
  var grid = document.querySelector('[data-portfolio-grid]');
  if (!bar || !grid) return;

  var cards = grid.querySelectorAll('.portfolio-card');
  var buttons = bar.querySelectorAll('.filter-btn');

  function applyFilter(cat) {
    cards.forEach(function (card) {
      var match = cat === 'all' || card.getAttribute('data-category') === cat;
      if (window.gsap) {
        gsap.to(card, {
          opacity: match ? 1 : 0,
          scale: match ? 1 : .92,
          duration: .35,
          ease: 'power2.out',
          onStart: function () { if (match) card.style.display = ''; },
          onComplete: function () { if (!match) card.style.display = 'none'; }
        });
      } else {
        card.style.display = match ? '' : 'none';
      }
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
})();
