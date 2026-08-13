/* ============================================================
   NAVIGATION.JS — mobile menu + active link
   ============================================================ */
(function(){
  var hamburger = document.querySelector('.hamburger');
  var menu = document.querySelector('.mobile-menu');
  if (!hamburger || !menu) return;

  var links = menu.querySelectorAll('.mobile-menu-links a, .mobile-menu-foot a');
  var isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    document.body.classList.add('menu-open');
    if (window.__lenis) window.__lenis.stop();

    if (window.gsap) {
      gsap.set(menu, { display: 'flex' });
      gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: .4, ease: 'power2.out' });
      gsap.fromTo(links, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: .55, stagger: .06, delay: .1, ease: 'power3.out' });
    } else {
      menu.style.display = 'flex';
      menu.style.opacity = 1;
    }
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (window.__lenis) window.__lenis.start();

    if (window.gsap) {
      gsap.to(menu, {
        opacity: 0, duration: .35, ease: 'power2.in', onComplete: function () {
          menu.classList.remove('is-open');
          gsap.set(menu, { display: 'none' });
        }
      });
    } else {
      menu.classList.remove('is-open');
      menu.style.display = 'none';
    }
  }

  hamburger.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  links.forEach(function (a) { a.addEventListener('click', closeMenu); });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && isOpen) closeMenu();
  });

  /* ---------- active nav link ---------- */
  var current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .mobile-menu-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
