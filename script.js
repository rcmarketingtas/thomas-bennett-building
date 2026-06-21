/* ============================================================
   THOMAS BENNETT BUILDING — script.js (Gallery Edition)
   Sections:
   1.  Sticky header shadow
   2.  Hamburger / mobile nav
   3.  Close mobile nav on link click
   4.  Active nav link on scroll
   5.  Hero slideshow (autoplay + dots + arrows)
   6.  Fade-in animations (Intersection Observer)
   7.  Gallery lightbox
   8.  Project filtering
   9.  Contact form validation
   10. Back-to-top button
   ============================================================ */

(function () {
  'use strict';

  /* ================================================================
     1. STICKY HEADER SHADOW
  ================================================================ */
  const header = document.getElementById('header');

  function onHeaderScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();


  /* ================================================================
     2. HAMBURGER / MOBILE NAV
  ================================================================ */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  function openMobileNav() {
    mobileNav.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    const first = mobileNav.querySelector('.mobile-nav__link');
    if (first) first.focus();
  }

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', function () {
    mobileNav.classList.contains('is-open') ? closeMobileNav() : openMobileNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeMobileNav();
      hamburger.focus();
    }
  });


  /* ================================================================
     3. CLOSE MOBILE NAV ON LINK CLICK
  ================================================================ */
  mobileNav.querySelectorAll('.mobile-nav__link, .mobile-nav__cta').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });


  /* ================================================================
     4. ACTIVE NAV LINK ON SCROLL
  ================================================================ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(function (link) {
          const isMatch = link.getAttribute('href') === '#' + id;
          link.style.color = isMatch ? 'var(--color-primary)' : '';
        });
      }
    });
  }, { rootMargin: '-30% 0px -65% 0px', threshold: 0 }).observe
    ? sections.forEach(function (s) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              navLinks.forEach(function (link) {
                link.style.color = link.getAttribute('href') === '#' + entry.target.id
                  ? 'var(--color-primary)' : '';
              });
            }
          });
        }, { rootMargin: '-30% 0px -65% 0px', threshold: 0 }).observe(s);
      })
    : null;


  /* ================================================================
     5. HERO SLIDESHOW
        Auto-advances every 5s. Pauses on hover/focus.
  ================================================================ */
  const heroSlider = document.getElementById('hero-slider');

  if (heroSlider) {
    const slides      = heroSlider.querySelectorAll('.hero__slide');
    const dots        = document.querySelectorAll('.hero__dot');
    const prevBtn     = document.getElementById('hero-prev');
    const nextBtn     = document.getElementById('hero-next');
    let   current     = 0;
    let   timer       = null;
    const INTERVAL_MS = 5000;

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      dots[current].setAttribute('aria-selected', 'false');

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('active');
      dots[current].classList.add('active');
      dots[current].setAttribute('aria-selected', 'true');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startTimer() {
      stopTimer();
      timer = setInterval(next, INTERVAL_MS);
    }

    function stopTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    // Dot clicks
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
        startTimer(); // restart autoplay
      });
    });

    // Arrow clicks
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startTimer(); });

    // Keyboard navigation on arrows
    document.addEventListener('keydown', function (e) {
      // Only when no modal is open
      if (document.getElementById('lightbox').classList.contains('active')) return;
      if (e.key === 'ArrowLeft')  { prev(); startTimer(); }
      if (e.key === 'ArrowRight') { next(); startTimer(); }
    });

    // Pause on hover / focus so user can read content
    const heroSection = document.getElementById('home');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopTimer);
      heroSection.addEventListener('mouseleave', startTimer);
      heroSection.addEventListener('focusin',    stopTimer);
      heroSection.addEventListener('focusout',   startTimer);
    }

    startTimer();
  }


  /* ================================================================
     6. FADE-IN SCROLL ANIMATIONS
  ================================================================ */
  const fadeEls = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

  fadeEls.forEach(function (el) { fadeObserver.observe(el); });


  /* ================================================================
     7. GALLERY LIGHTBOX
        Collects all .gallery-item elements and builds a lightbox
        with prev/next navigation and keyboard support.
  ================================================================ */
  const galleryItems   = document.querySelectorAll('.gallery-item');
  const lightbox       = document.getElementById('lightbox');
  const lightboxImg    = document.getElementById('lightbox-img');
  const lightboxCap    = document.getElementById('lightbox-caption');
  const lightboxClose  = document.getElementById('lightbox-close');
  const lightboxPrev   = document.getElementById('lightbox-prev');
  const lightboxNext   = document.getElementById('lightbox-next');
  const lightboxBd     = document.getElementById('lightbox-backdrop');
  let   lbCurrent      = 0;
  let   lbLastFocus    = null;

  // Build an array of { src, alt, caption } from each gallery item
  const lbItems = Array.from(galleryItems).map(function (item) {
    const img = item.querySelector('img');
    return {
      src:     img ? img.getAttribute('src')     : '',
      alt:     img ? img.getAttribute('alt')     : '',
      caption: item.getAttribute('data-caption') || '',
    };
  });

  function openLightbox(index) {
    lbLastFocus = document.activeElement;
    lbCurrent   = index;
    loadLbImage(lbCurrent);
    lightbox.classList.add('active');
    lightboxBd.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxBd.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lbLastFocus) lbLastFocus.focus();
  }

  function loadLbImage(index) {
    const item = lbItems[index];
    lightboxImg.style.opacity = '0';
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCap.textContent = item.caption;
    lightboxImg.onload  = function () { lightboxImg.style.opacity = '1'; };
    lightboxImg.onerror = function () { lightboxImg.style.opacity = '1'; };
  }

  function lbPrev() { lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length; loadLbImage(lbCurrent); }
  function lbNext() { lbCurrent = (lbCurrent + 1) % lbItems.length; loadLbImage(lbCurrent); }

  // Open on click / Enter / Space
  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { openLightbox(i); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev)  lightboxPrev.addEventListener('click', lbPrev);
  if (lightboxNext)  lightboxNext.addEventListener('click', lbNext);
  if (lightboxBd)    lightboxBd.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbPrev();
    if (e.key === 'ArrowRight') lbNext();
  });


  /* ================================================================
     8. PROJECT FILTERING
  ================================================================ */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectGrid = document.getElementById('projects-grid');

  if (projectGrid) {
    const projectItems = projectGrid.querySelectorAll('.project-item');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.getAttribute('data-filter');

        filterBtns.forEach(function (b) {
          b.classList.remove('filter-btn--active');
          b.removeAttribute('aria-pressed');
        });
        btn.classList.add('filter-btn--active');
        btn.setAttribute('aria-pressed', 'true');

        projectItems.forEach(function (item) {
          const match = filter === 'all' || item.getAttribute('data-category') === filter;
          if (match) {
            item.classList.remove('hidden');
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { item.classList.add('is-visible'); });
            });
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }


  /* ================================================================
     9. CONTACT FORM VALIDATION
  ================================================================ */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {

    function showError(id, msg) {
      const field = document.getElementById(id);
      const err   = document.getElementById(id + '-error');
      if (field) field.classList.add('is-invalid');
      if (err)   err.textContent = msg;
    }

    function clearError(id) {
      const field = document.getElementById(id);
      const err   = document.getElementById(id + '-error');
      if (field) field.classList.remove('is-invalid');
      if (err)   err.textContent = '';
    }

    function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

    function validate() {
      let ok = true;
      const name  = document.getElementById('name');
      const email = document.getElementById('email');
      const type  = document.getElementById('project-type');
      const msg   = document.getElementById('message');

      if (!name.value.trim())         { showError('name', 'Please enter your full name.');           ok = false; } else clearError('name');
      if (!email.value.trim())        { showError('email', 'Please enter your email address.');      ok = false; }
      else if (!isValidEmail(email.value)) { showError('email', 'Please enter a valid email address.'); ok = false; }
      else clearError('email');
      if (!type.value)                { showError('project-type', 'Please select a project type.');  ok = false; } else clearError('project-type');
      if (!msg.value.trim())          { showError('message', 'Please enter a message.');             ok = false; }
      else if (msg.value.trim().length < 10) { showError('message', 'Please provide a bit more detail.'); ok = false; }
      else clearError('message');

      return ok;
    }

    ['name', 'email', 'project-type', 'message'].forEach(function (id) {
      const f = document.getElementById(id);
      if (!f) return;
      f.addEventListener('input',  function () { clearError(id); });
      f.addEventListener('change', function () { clearError(id); });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        const first = contactForm.querySelector('.is-invalid');
        if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); first.focus(); }
        return;
      }
      contactForm.style.display = 'none';
      formSuccess.removeAttribute('aria-hidden');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ================================================================
     10. BACK TO TOP
  ================================================================ */
  const backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
