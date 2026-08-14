/* ============================================================
   MAIN.JS — smooth scroll, cursor, particles, navbar state
   ============================================================ */
(function(){
  document.documentElement.classList.add('js-ready');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.1
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.gsap && window.gsap.ticker) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    window.__lenis = lenis;
  }

  /* ---------- navbar scroll state ---------- */
  var navbar = document.querySelector('.navbar');
  function updateNav() {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ---------- custom cursor (desktop only) ---------- */
  if (!isTouch) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });

    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    var hoverTargets = 'a, button, .card, .btn, input, textarea, select, .filter-btn';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) ring.classList.remove('hovering');
    });
    document.addEventListener('mousedown', function () { ring.style.opacity = '.6'; });
    document.addEventListener('mouseup', function () { ring.style.opacity = '1'; });
  }

  /* ---------- hero interface: desktop-only cursor parallax ---------- */
  (function heroParallax() {
    var hero = document.querySelector('[data-hero-interface]');
    if (!hero) return;

    var mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    var cards = hero.querySelectorAll('.float-card');
    var orbitWrap = hero.querySelector('.hero-orbit-wrap');
    var glow = null;
    var raf = null;
    var tx = 0, ty = 0, cx = 0, cy = 0;
    var active = false;

    function onMove(e) {
      var rect = hero.getBoundingClientRect();
      // -1..1 range from hero center
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (glow) {
        glow.style.transform = 'translate3d(' + (e.clientX - rect.left) + 'px,' + (e.clientY - rect.top) + 'px,0) translate(-50%,-50%)';
      }
    }

    function loop() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      cards.forEach(function (card, i) {
        var depth = 6 + (i % 3) * 3;
        card.style.transform = 'translate(' + (cx * depth) + 'px,' + (cy * depth) + 'px)';
      });
      if (orbitWrap) {
        orbitWrap.style.transform = 'translate(' + (cx * -6) + 'px,' + (cy * -6) + 'px)';
      }
      raf = requestAnimationFrame(loop);
    }

    function enable() {
      if (active || reduceMotion) return;
      active = true;
      glow = document.createElement('div');
      glow.className = 'hero-cursor-glow';
      hero.appendChild(glow);
      hero.addEventListener('mousemove', onMove);
      loop();
    }

    function disable() {
      if (!active) return;
      active = false;
      hero.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      tx = ty = cx = cy = 0;
      cards.forEach(function (card) { card.style.transform = ''; });
      if (orbitWrap) orbitWrap.style.transform = '';
      if (glow && glow.parentNode) glow.parentNode.removeChild(glow);
      glow = null;
    }

    function handleCapabilityChange() {
      if (mql.matches) enable(); else disable();
    }

    handleCapabilityChange();
    if (mql.addEventListener) mql.addEventListener('change', handleCapabilityChange);
    else if (mql.addListener) mql.addListener(handleCapabilityChange); // older Safari
  })();

  /* ---------- ambient particles ---------- */
  document.querySelectorAll('.particles').forEach(function (field) {
    var count = window.innerWidth < 680 ? 14 : 28;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'particle';
      var size = (Math.random() * 2.4 + 1.2).toFixed(1);
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.top = Math.random() * 100 + '%';
      p.style.left = Math.random() * 100 + '%';
      p.style.opacity = (Math.random() * 0.4 + 0.15).toFixed(2);
      if (!reduceMotion) {
        p.style.animation = 'drift ' + (6 + Math.random() * 8).toFixed(1) + 's ease-in-out infinite';
        p.style.animationDelay = (Math.random() * 5).toFixed(1) + 's';
      }
      field.appendChild(p);
    }
  });

  /* ---------- current year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- homepage services "Show More" toggle ---------- */
  var servicesToggle = document.getElementById('services-toggle');
  var servicesGrid = document.querySelector('.services-grid');
  if (servicesToggle && servicesGrid) {
    servicesToggle.addEventListener('click', function () {
      var expanded = servicesGrid.classList.toggle('services-expanded');
      servicesToggle.classList.toggle('is-expanded', expanded);
      servicesToggle.innerHTML = expanded
        ? 'Show Less <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-left:.4rem;transition:transform .3s var(--ease);"><path d="M6 9l6 6 6-6"/></svg>'
        : 'Show More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-left:.4rem;transition:transform .3s var(--ease);"><path d="M6 9l6 6 6-6"/></svg>';
      if (!expanded) {
        servicesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})();
