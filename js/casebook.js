/* ============================================================
   CASEBOOK.JS — instant category filtering for the redesigned
   portfolio page ("The Orbit Casebook"). No page reload, no
   anchor jumps. Keyboard accessible via native <button> elements.
   ============================================================ */
(function () {
  var filterButtons = document.querySelectorAll('[data-cb-filter]');
  var cards = document.querySelectorAll('[data-cat]');
  var sections = document.querySelectorAll('[data-cb-section]');
  var countEl = document.querySelector('[data-cb-count]');

  if (countEl) {
    countEl.textContent = cards.length;
  }

  function applyFilter(category) {
    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-cat') || '').split(' ');
      var show = category === 'all' || cats.indexOf(category) !== -1;
      card.classList.toggle('is-filtered-out', !show);
    });

    sections.forEach(function (section) {
      var visibleCount = section.querySelectorAll('[data-cat]:not(.is-filtered-out)').length;
      section.classList.toggle('is-empty', visibleCount === 0);
    });
  }

  function selectFilter(category) {
    filterButtons.forEach(function (b) {
      var isMatch = b.getAttribute('data-cb-filter') === category;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });
    applyFilter(category);
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectFilter(btn.getAttribute('data-cb-filter'));
    });
  });

  /* Legacy deep-links from other pages (e.g. services/*.html) still
     use #cat-website, #cat-branding, #cat-seo, #cat-video, #cat-ai,
     #cat-smm, #cat-graphic. Map those to the matching filter so
     visitors land pre-filtered instead of just scrolled. */
  var hashCategoryMap = {
    'cat-website': 'web',
    'cat-branding': 'branding',
    'cat-graphic': 'design',
    'cat-smm': 'social',
    'cat-seo': 'seo',
    'cat-video': 'video',
    'cat-ai': 'ai'
  };

  function applyHashFilter() {
    var id = window.location.hash.replace('#', '');
    if (hashCategoryMap[id]) {
      selectFilter(hashCategoryMap[id]);
    }
  }

  applyHashFilter();
  window.addEventListener('hashchange', applyHashFilter);
})();
