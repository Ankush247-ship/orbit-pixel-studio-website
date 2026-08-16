/* ============================================================
   ANIMATIONS.JS — GSAP timelines + ScrollTrigger reveals

   ROBUSTNESS CONTRACT: content must NEVER depend on this file to
   become visible. animations.css shows [data-reveal] elements by
   default; they are only pre-hidden once the 'gsap-anim-ready'
   class is added to <html> below, AFTER we've verified both GSAP
   and ScrollTrigger genuinely loaded. Everything past that point
   runs inside try/catch — any runtime error immediately falls back
   to forcing all reveal elements visible instead of leaving them
   hidden. A separate inline watchdog in each page's <head> is the
   final safety net in case this whole file fails to load/parse.
   ============================================================ */
(function () {
  var html = document.documentElement;

  function forceRevealVisible() {
    html.classList.remove('gsap-anim-ready');
    html.classList.add('reveal-fallback');
  }

  // Hard requirement: both GSAP core and the ScrollTrigger plugin
  // must be present, or we never enter animated/hidden state at all.
  if (!window.gsap || !window.ScrollTrigger) {
    forceRevealVisible();
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (err) {
    forceRevealVisible();
    return;
  }

  // Only now do we opt in to the CSS that pre-hides [data-reveal] etc.
  html.classList.add('gsap-anim-ready');

  // Everything below can legitimately throw (missing element, plugin
  // quirk, etc). If it does, immediately undo the hidden state so
  // nothing is left stuck at opacity:0.
  try {
    runAnimations();
  } catch (err) {
    forceRevealVisible();
    if (window.console && console.warn) {
      console.warn('Orbit Pixel Studio: animation setup failed, falling back to static visible content.', err);
    }
  }

  function runAnimations() {

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.innerWidth < 680;

  /* ============ TEXT SPLITTING (word-by-word) ============ */
  function splitWords(el) {
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.innerHTML = words.map(function (w) {
      return '<span class="split-word"><span>' + w + '</span></span>';
    }).join(' ');
    return el.querySelectorAll('.split-word > span');
  }

  /* ============ HERO LOAD SEQUENCE ============ */
  function heroSequence() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    var navbar = document.querySelector('.navbar');
    var badge = hero.querySelector('.hero-eyebrow-plain') || hero.querySelector('.hero-badge');
    var headLines = hero.querySelectorAll('.hero-h1-stack .h-line');
    var heading = hero.querySelector('h1');
    var lead = hero.querySelector('.lead');
    var ctas = hero.querySelector('.hero-ctas');
    var avail = hero.querySelector('.hero-availability');
    var trust = hero.querySelector('.hero-trust');
    var visual = hero.querySelector('.hero-visual');

    if (navbar) tl.from(navbar, { opacity: 0, y: -16, duration: .7 }, 0);
    if (badge) tl.from(badge, { opacity: 0, y: 18, duration: .6 }, .15);

    if (headLines.length) {
      tl.from(headLines, { y: '110%', opacity: 0, duration: .8, stagger: .09, ease: 'power4.out' }, .3);
    } else if (heading) {
      var chars = splitWords(heading);
      tl.to(chars, { y: 0, duration: .8, stagger: .045, ease: 'power4.out' }, .3);
    }
    if (lead) tl.from(lead, { opacity: 0, y: 16, duration: .7 }, .75);
    if (ctas) tl.from(ctas.children, { opacity: 0, y: 14, scale: .96, duration: .55, stagger: .1 }, .9);
    if (avail) tl.from(avail, { opacity: 0, y: 10, duration: .6 }, 1.05);
    else if (trust) tl.from(trust, { opacity: 0, y: 10, duration: .6 }, 1.05);
    if (visual) tl.from(visual, { opacity: 0, y: 40, duration: 1, ease: 'power3.out' }, .5);

    var orbitLabels = hero.querySelectorAll('.orbit-label');
    if (orbitLabels.length) tl.from(orbitLabels, { opacity: 0, scale: .7, stagger: .12, duration: .5, ease: 'back.out(2)' }, 1.15);

    var featureCards = hero.querySelectorAll('.hero-feature-card');
    if (featureCards.length) tl.from(featureCards, { opacity: 0, y: 26, stagger: .1, duration: .65 }, 1.3);

    /* connecting lines behind the floating cards draw in after the cards land */
    var lines = hero.querySelectorAll('.interface-lines .ln');
    if (lines.length && !isMobile) {
      lines.forEach(function (line) {
        try {
          var len = line.getTotalLength();
          gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        } catch (e) { /* getTotalLength unsupported: leave line static */ }
      });
      tl.to(lines, { strokeDashoffset: 0, duration: .9, stagger: .07, ease: 'power2.out' }, 1.25);
    }

    /* service-area route: draw the line, then pop in each node */
    var routePath = hero.querySelector('[data-route-path]');
    var routeNodes = hero.querySelectorAll('[data-route-node]');
    var routeDot = hero.querySelector('[data-route-dot]');
    if (routePath && routeNodes.length) {
      try {
        var routeLen = routePath.getTotalLength();
        gsap.set(routePath, { strokeDasharray: routeLen, strokeDashoffset: routeLen });
        tl.to(routePath, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 1.5);
      } catch (e) { /* fall through to node reveal only */ }
      gsap.set(routeNodes, { opacity: 0, scale: .4 });
      tl.to(routeNodes, { opacity: 1, scale: 1, duration: .4, stagger: .06, ease: 'back.out(2)' }, 1.7);
      if (routeDot) tl.from(routeDot, { opacity: 0, duration: .3 }, 1.6);
    }
  }
  heroSequence();

  /* ============ ROUTE: continuous travelling light (desktop, motion-safe only) ============ */
  function routeTravelLoop() {
    if (isMobile || reduceMotion) return;
    var dot = document.querySelector('[data-route-dot]');
    var nodes = document.querySelectorAll('[data-route-node]');
    if (!dot || !nodes.length) return;

    var stops = Array.prototype.map.call(nodes, function (n) {
      return parseFloat(n.style.left) || 0;
    });

    var tl = gsap.timeline({ repeat: -1, delay: 2.5 });
    stops.forEach(function (pct, i) {
      if (i === 0) return;
      tl.to(dot, { left: pct + '%', duration: 1.1, ease: 'power1.inOut' })
        .to(dot, { duration: .35 }); // brief pause at each city
    });
    tl.to(dot, { left: stops[0] + '%', duration: 1.1, ease: 'power1.inOut' })
      .to(dot, { duration: .6 });

    window.__orbitRouteTravel = tl;
  }
  routeTravelLoop();

  /* ============ PAGE HERO (subpages) SEQUENCE ============ */
  function pageHeroSequence() {
    var hero = document.querySelector('[data-page-hero]');
    if (!hero) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    var navbar = document.querySelector('.navbar');
    var eyebrow = hero.querySelector('.eyebrow');
    var heading = hero.querySelector('h1');
    var lead = hero.querySelector('.lead');

    if (navbar) tl.from(navbar, { opacity: 0, y: -16, duration: .7 }, 0);
    if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 16, duration: .6 }, .1);
    if (heading) tl.from(heading, { opacity: 0, y: 26, duration: .8 }, .25);
    if (lead) tl.from(lead, { opacity: 0, y: 16, duration: .7 }, .5);
  }
  pageHeroSequence();

  /* ============ SCROLL REVEALS ============ */
  gsap.utils.toArray('[data-reveal]').forEach(function (el, i) {
    var group = el.closest('[data-reveal-group]');
    var stagger = group ? 0 : 0;
    gsap.to(el, {
      opacity: 1, y: 0, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  gsap.utils.toArray('[data-reveal-fade]').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, duration: 1,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  gsap.utils.toArray('[data-reveal-scale]').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, scale: 1, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* staggered groups (cards, grids) */
  gsap.utils.toArray('[data-reveal-group]').forEach(function (group) {
    var items = group.querySelectorAll('[data-reveal-item]');
    if (!items.length) return;
    gsap.to(items, {
      opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .1,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true }
    });
  });

  /* headings word reveal on scroll */
  gsap.utils.toArray('[data-split-scroll]').forEach(function (el) {
    var chars = splitWords(el);
    gsap.to(chars, {
      y: 0, duration: .7, stagger: .035, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ============ COUNTERS ============ */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; }
        });
      }
    });
  });

  /* ============ PROCESS TIMELINE FILL ============ */
  var fill = document.querySelector('.process-line-fill');
  var track = document.querySelector('.process-track');
  if (fill && track) {
    gsap.to(fill, {
      width: isMobile ? undefined : '100%',
      height: isMobile ? '100%' : undefined,
      ease: 'none',
      scrollTrigger: { trigger: track, start: 'top 75%', end: 'bottom 60%', scrub: 1 }
    });
    /* .process-step now carries data-reveal in the markup, so it's
       automatically picked up by the generic [data-reveal] loop above —
       this keeps it on the same crash-safe, CSS-default-visible system
       instead of a bespoke inline-hidden animation. */
  }

  /* ============ MAGNETIC BUTTONS (desktop only) ============ */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      var strength = 22;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: (x / r.width) * strength, y: (y / r.height) * strength, duration: .4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' });
      });
    });
  }

  /* ============ CARD TILT-LIFT via mousemove glow position ============ */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ============ CTA background orbit lines drift ============ */
  gsap.utils.toArray('.cta-bigtype').forEach(function (el) {
    gsap.to(el, {
      backgroundPosition: '200% 50%', duration: 20, ease: 'none', repeat: -1
    });
  });

  /* refresh ScrollTrigger after full load (fonts/images can shift layout) */
  window.addEventListener('load', function () {
    try { ScrollTrigger.refresh(); } catch (err) { /* non-fatal */ }
  });

  } // end runAnimations
})();
