/* ============================================================
   PORTFOLIO.JS — category filtering
   ============================================================ */
(function () {
  var bar = document.querySelector('.filter-bar');
  var grid = document.querySelector('[data-portfolio-grid]');
  if (!bar || !grid) return;

  var cards = grid.querySelectorAll('.work-card, .portfolio-card');
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

  function selectFilter(cat, opts) {
    var target = bar.querySelector('.filter-btn[data-filter="' + cat + '"]') || bar.querySelector('.filter-btn[data-filter="all"]');
    if (!target) return;
    buttons.forEach(function (b) { b.classList.remove('active'); });
    target.classList.add('active');
    applyFilter(target.getAttribute('data-filter'));
    if (opts && opts.scroll) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectFilter(btn.getAttribute('data-filter'));
    });
  });

  /* pick up an initial category from the URL, e.g. portfolio.html#branding */
  var initialCat = (window.location.hash || '').replace('#', '');
  if (initialCat) {
    selectFilter(initialCat, { scroll: true });
  }
})();
