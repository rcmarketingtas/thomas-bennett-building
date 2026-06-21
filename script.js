/* ============================================================
   THOMAS BENNETT BUILDING — script.js
   Sections:
   1.  Sticky header shadow on scroll
   2.  Hamburger / mobile nav toggle
   3.  Close mobile nav on link click
   4.  Active nav link highlight on scroll (Intersection Observer)
   5.  Fade-in scroll animations (Intersection Observer)
   6.  Project gallery filtering
   7.  Contact form validation & submission
   8.  Back-to-top button
   ============================================================ */

(function () {
  'use strict';

  /* ================================================================
     1. STICKY HEADER — add shadow class when page is scrolled
  ================================================================ */
  const header = document.getElementById('header');

  function handleHeaderScroll() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // run once on load


  /* ================================================================
     2. HAMBURGER / MOBILE NAV TOGGLE
  ================================================================ */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  function openMobileNav() {
    mobileNav.classList.add('is-open');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    // Trap focus loosely — first link gets focus
    const firstLink = mobileNav.querySelector('.mobile-nav__link');
    if (firstLink) firstLink.focus();
  }

  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', function () {
    const isOpen = mobileNav.classList.contains('is-open');
    isOpen ? closeMobileNav() : openMobileNav();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      closeMobileNav();
      hamburger.focus();
    }
  });


  /* ================================================================
     3. CLOSE MOBILE NAV WHEN A LINK IS CLICKED
  ================================================================ */
  const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav__link, .mobile-nav__cta');

  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileNav();
    });
  });


  /* ================================================================
     4. ACTIVE NAV LINK — highlight current section in desktop nav
  ================================================================ */
  const sections   = document.querySelectorAll('section[id]');
  const navLinks   = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('nav__link--active');
              link.style.color = 'var(--color-primary)';
            } else {
              link.classList.remove('nav__link--active');
              link.style.color = '';
            }
          });
        }
      });
    },
    {
      rootMargin: '-30% 0px -65% 0px', // trigger when section is roughly in the middle of viewport
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });


  /* ================================================================
     5. FADE-IN SCROLL ANIMATIONS (Intersection Observer)
        Elements with class .fade-in get .is-visible when they
        enter the viewport.
  ================================================================ */
  const fadeEls = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    }
  );

  fadeEls.forEach(function (el) {
    fadeObserver.observe(el);
  });


  /* ================================================================
     6. PROJECT GALLERY FILTERING
        Filter buttons set data-filter attribute; project items have
        data-category attributes. Hidden items get .hidden class.
  ================================================================ */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectGrid = document.getElementById('projects-grid');

  if (projectGrid) {
    const projectItems = projectGrid.querySelectorAll('.project-item');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.getAttribute('data-filter');

        // Update active state on buttons
        filterBtns.forEach(function (b) {
          b.classList.remove('filter-btn--active');
          b.removeAttribute('aria-pressed');
        });
        btn.classList.add('filter-btn--active');
        btn.setAttribute('aria-pressed', 'true');

        // Show / hide project items with a brief fade
        projectItems.forEach(function (item) {
          const category = item.getAttribute('data-category');
          const isMatch  = filter === 'all' || category === filter;

          if (isMatch) {
            item.classList.remove('hidden');
            // Re-trigger fade-in for newly visible items
            item.classList.remove('is-visible');
            // Small rAF delay so the browser registers the class removal
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                item.classList.add('is-visible');
              });
            });
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }


  /* ================================================================
     7. CONTACT FORM — Client-side validation & success message
  ================================================================ */
  const contactForm   = document.getElementById('contact-form');
  const formSuccess   = document.getElementById('form-success');

  if (contactForm) {

    // Helper: show an error message for a field
    function showError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (!field || !error) return;
      field.classList.add('is-invalid');
      error.textContent = message;
    }

    // Helper: clear an error message for a field
    function clearError(fieldId) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (!field || !error) return;
      field.classList.remove('is-invalid');
      error.textContent = '';
    }

    // Validate email format
    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    // Validate form; return true if valid
    function validateForm() {
      let valid = true;

      const name        = document.getElementById('name');
      const email       = document.getElementById('email');
      const projectType = document.getElementById('project-type');
      const message     = document.getElementById('message');

      // Name
      if (!name.value.trim()) {
        showError('name', 'Please enter your full name.');
        valid = false;
      } else {
        clearError('name');
      }

      // Email
      if (!email.value.trim()) {
        showError('email', 'Please enter your email address.');
        valid = false;
      } else if (!isValidEmail(email.value)) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      } else {
        clearError('email');
      }

      // Project type
      if (!projectType.value) {
        showError('project-type', 'Please select a project type.');
        valid = false;
      } else {
        clearError('project-type');
      }

      // Message
      if (!message.value.trim()) {
        showError('message', 'Please enter a message.');
        valid = false;
      } else if (message.value.trim().length < 10) {
        showError('message', 'Please provide a bit more detail (at least 10 characters).');
        valid = false;
      } else {
        clearError('message');
      }

      return valid;
    }

    // Live validation: clear errors as user types/selects
    ['name', 'email', 'project-type', 'message'].forEach(function (fieldId) {
      const field = document.getElementById(fieldId);
      if (!field) return;
      field.addEventListener('input', function () { clearError(fieldId); });
      field.addEventListener('change', function () { clearError(fieldId); });
    });

    // Form submit
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm()) {
        // Scroll to first invalid field
        const firstInvalid = contactForm.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        return;
      }

      // Simulate submission — hide form, show success
      // Replace this block with a real fetch() call to your backend/form service
      contactForm.style.display = 'none';
      formSuccess.removeAttribute('aria-hidden');
      formSuccess.classList.add('is-visible');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ================================================================
     8. BACK TO TOP BUTTON
        Appears after scrolling 400px; click scrolls to top.
  ================================================================ */
  const backToTop = document.getElementById('back-to-top');

  if (backToTop) {
    function handleBackToTopVisibility() {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });
    handleBackToTopVisibility();

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
