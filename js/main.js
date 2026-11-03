(function () {
  'use strict';

  // Nav scroll shadow
  var nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Mobile hamburger
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.querySelector('.nav-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      drawer.classList.toggle('open');
    });
  }

  // Active nav link
  var path = window.location.pathname;
  var page = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(function (a) {
    var href = a.getAttribute('href').split('/').pop();
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: show all
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }

  // Contact form. Posts to the form's Formspree action; the visible
  // message follows that response and is not shown on a timer.
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (typeof window.fetch !== 'function') return;
      e.preventDefault();
      var btn = form.querySelector('.form-submit');
      var status = form.querySelector('[role="status"]');
      var span = btn ? btn.querySelector('span') : null;
      var orig = span ? span.textContent : '';
      if (btn) btn.disabled = true;
      if (span) span.textContent = 'Sending\u2026';
      if (status) {
        status.textContent = '';
        status.classList.remove('is-error');
      }
      var fallback = 'Your message could not be sent. Please try again or email debraeldinrealtor@gmail.com.';
      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          if (status) status.textContent = 'Message sent. Debra will be in touch soon. Thank you for reaching out.';
          return;
        }
        return res.json().then(function (data) {
          var errors = data && data.errors;
          var detail = '';
          if (errors && errors.length) {
            detail = errors.map(function (err) { return err && err.message; }).filter(Boolean).join(' ');
          }
          if (!detail && data && typeof data.error === 'string') detail = data.error;
          var failure = new Error('failed');
          failure.detail = detail;
          throw failure;
        }, function () {
          throw new Error('failed');
        });
      }).catch(function (err) {
        if (status) {
          status.classList.add('is-error');
          status.textContent = (err && err.detail) ? err.detail : fallback;
        }
      }).then(function () {
        if (btn) btn.disabled = false;
        if (span) span.textContent = orig;
      });
    });
  }

  // Smooth anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    });
  });

})();
