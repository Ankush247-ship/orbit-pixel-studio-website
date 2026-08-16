/* ============================================================
   PORTFOLIO.JS — horizontal scroll row arrows for the
   category-based Selected Work sections on portfolio.html
   ============================================================ */
(function () {
  var rows = document.querySelectorAll('[data-hscroll]');
  rows.forEach(function (row) {
    var category = row.closest('.work-category');
    if (!category) return;
    var prevBtn = category.querySelector('[data-hscroll-prev]');
    var nextBtn = category.querySelector('[data-hscroll-next]');
    function scrollAmount() { return Math.min(row.clientWidth * 0.85, 640); }
    if (prevBtn) prevBtn.addEventListener('click', function () {
      row.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      row.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
  });
})();
