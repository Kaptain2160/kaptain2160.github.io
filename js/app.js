// ═══════════════════════════════════════════════════════════════
// APP.JS — all site interactivity. Reads/writes SITE_DATA (data.js).
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var CALENDLY_BASE = 'https://calendly.com/debraeldinrealtor/30min';
  var FORMSPREE_URL = 'https://formspree.io/f/xpqeaarv';

  var DATA = SITE_DATA;

  // ═══════════════════════════════════════════════════════════
  // NAV
  // ═══════════════════════════════════════════════════════════
  var nav = document.getElementById('siteNav');
  var toTop = document.getElementById('toTop');
  window.addEventListener('scroll', function () {
    if (nav) nav.classList.toggle('solid', window.scrollY > 40);
    if (toTop) toTop.classList.toggle('show', window.scrollY > 700);
  }, { passive: true });

  var navToggle = document.getElementById('navToggle');
  var navDrawer = document.getElementById('navDrawer');
  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', function () {
      var opening = !navDrawer.classList.contains('open');
      navToggle.classList.toggle('open', opening);
      navDrawer.classList.toggle('open', opening);
      navDrawer.inert = !opening;
      navToggle.setAttribute('aria-expanded', String(opening));
      document.body.style.overflow = opening ? 'hidden' : '';
    });
    navDrawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navDrawer.classList.remove('open');
        navDrawer.inert = true;
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
        navToggle.click();
        navToggle.focus();
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      var target = href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
      }
    });
  });
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Keep the poster on small screens and reduced-motion connections; offer playback explicitly.
  (function () {
    var video = document.querySelector('.hero-visual video');
    var control = document.getElementById('videoToggle');
    if (!video || !control) return;
    function play() {
      var source = video.querySelector('source');
      if (!source.getAttribute('src')) { source.src = source.dataset.src; video.load(); }
      video.play().catch(function () { control.textContent = 'Play scenery'; });
    }
    video.addEventListener('play', function () { control.textContent = 'Pause scenery'; control.setAttribute('aria-pressed', 'true'); });
    video.addEventListener('pause', function () { control.textContent = 'Play scenery'; control.setAttribute('aria-pressed', 'false'); });
    control.addEventListener('click', function () { if (video.paused) play(); else video.pause(); });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        window.matchMedia('(min-width: 1081px)').matches &&
        !(navigator.connection && navigator.connection.saveData)) {
      if (document.readyState === 'complete') play();
      else window.addEventListener('load', play, { once: true });
    }
  })();

  // ═══════════════════════════════════════════════════════════
  // HERO PARALLAX — responds to scroll only, respects reduced motion
  // ═══════════════════════════════════════════════════════════
  (function () {
    var layers = document.querySelectorAll('.hero-visual video, .hero-visual .hero-photo-bg');
    var hero = document.querySelector('.hero');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!layers.length || !hero || reduceMotion) return;
    var ticking = false;
    function update() {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var offset = Math.max(-1, Math.min(1, rect.top / window.innerHeight)) * -30;
        var t = 'translateY(' + offset + 'px) scale(1.08)';
        layers.forEach(function (el) { el.style.transform = t; });
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  // ═══════════════════════════════════════════════════════════
  // SCROLL REVEAL + ANIMATED COUNTERS
  // ═══════════════════════════════════════════════════════════
  var revealObserver = null;
  function getRevealObserver() {
    if (revealObserver || !('IntersectionObserver' in window)) return revealObserver;
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    return revealObserver;
  }
  window.observeReveals = function (root) {
    var io = getRevealObserver();
    if (!io) return;
    (root || document).querySelectorAll('.reveal, .reveal-scale').forEach(function (el) {
      if (el.classList.contains('in')) return;
      var rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight) el.classList.add('will-animate');
      io.observe(el);
    });
  };
  observeReveals(document);

  function animateCount(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^(\d+)/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffixNode = el.querySelector('span');
    var suffixHTML = suffixNode ? suffixNode.outerHTML : '';
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.innerHTML = target + suffixHTML;
      return;
    }
    var duration = 1100, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.innerHTML = Math.round(target * eased) + suffixHTML;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); countIO.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.hero-stat-n, .about-ribbon-n').forEach(function (el) { countIO.observe(el); });
  }

  // ═══════════════════════════════════════════════════════════
  // LISTINGS
  // ═══════════════════════════════════════════════════════════
  function fmtBadgeClass(badge) {
    if (!badge) return 'badge-active';
    var b = badge.toLowerCase();
    if (b === 'new') return 'badge-new';
    if (b === 'sold') return 'badge-sold';
    return 'badge-active';
  }

  function makeListingCard(l, type, i) {
    var isLot = type === 'lots';
    var card = document.createElement('article');
    card.className = 'card reveal';
    card.style.transitionDelay = (Math.min(i % 6, 5) * 0.08) + 's';

    var imgWrap = document.createElement('div');
    imgWrap.className = 'card-img-wrap';
    if (l.photo) {
      var img = document.createElement('img');
      img.src = l.photo; img.alt = l.address; img.loading = 'lazy';
      imgWrap.appendChild(img);
    } else {
      var ph = document.createElement('div');
      ph.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--forest-deep);color:var(--brass-light)';
      ph.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
      imgWrap.appendChild(ph);
    }
    var badge = document.createElement('span');
    badge.className = 'card-badge ' + fmtBadgeClass(l.badge);
    badge.textContent = l.badge || 'Active';
    imgWrap.appendChild(badge);

    var hoverCta = document.createElement('div');
    hoverCta.className = 'card-hover-cta';
    var hoverLabel = document.createElement('span');
    hoverLabel.className = 'card-hover-label';
    hoverLabel.textContent = 'View Details';
    hoverCta.appendChild(hoverLabel);
    imgWrap.appendChild(hoverCta);
    card.appendChild(imgWrap);

    var body = document.createElement('div');
    body.className = 'card-body';
    var price = document.createElement('div');
    price.className = 'card-price';
    price.textContent = l.price;
    var addr = document.createElement('div');
    addr.className = 'card-addr';
    addr.textContent = l.address;
    body.appendChild(price);
    body.appendChild(addr);

    if (l.beds || l.baths || l.sqft) {
      var meta = document.createElement('div');
      meta.className = 'card-meta';
      if (l.beds) meta.innerHTML += '<span class="card-meta-item">' + l.beds + ' bd</span>';
      if (l.baths) meta.innerHTML += '<span class="card-meta-item">' + l.baths + ' ba</span>';
      if (l.sqft) meta.innerHTML += '<span class="card-meta-item">' + l.sqft + (isLot ? '' : ' sqft') + '</span>';
      body.appendChild(meta);
    }
    card.appendChild(body);

    var footer = document.createElement('div');
    footer.className = 'card-footer';
    var agent = document.createElement('span');
    agent.style.cssText = 'font-size:0.8rem;color:var(--forest-mid);font-weight:400';
    agent.textContent = 'Debra Eldin';
    footer.appendChild(agent);
    if (!l.badge || l.badge.toLowerCase() !== 'sold') {
      var book = document.createElement('a');
      book.className = 'btn btn-outline btn-sm';
      book.textContent = 'Book a Showing';
      book.href = CALENDLY_BASE + '?a1=' + encodeURIComponent(l.address);
      book.target = '_blank'; book.rel = 'noopener';
      book.onclick = function (e) { e.stopPropagation(); };
      footer.appendChild(book);
    }
    card.appendChild(footer);

    if (l.url) {
      var detail = document.createElement('a');
      detail.href = l.url; detail.target = '_blank'; detail.rel = 'noopener';
      detail.className = 'card-detail-link';
      detail.setAttribute('aria-label', 'View details for ' + l.address + ' (opens in a new tab)');
      detail.textContent = l.address;
      addr.textContent = ''; addr.appendChild(detail);
    }
    return card;
  }

  function renderListings(type) {
    var grid = document.getElementById(type + 'Grid');
    var empty = document.getElementById(type + 'Empty');
    if (!grid) return;
    var list = type === 'sold' ? DATA.homes.concat(DATA.lots).filter(function (l) { return (l.badge || '').toLowerCase() === 'sold'; }) :
      (DATA[type] || []).filter(function (l) { return (l.badge || '').toLowerCase() !== 'sold'; });
    if (grid.dataset.limit) list = list.slice(0, Number(grid.dataset.limit));
    if (!list.length) {
      grid.style.display = 'none';
      if (empty) { empty.hidden = false; empty.style.display = 'block'; }
      return;
    }
    grid.style.display = 'grid';
    if (empty) { empty.hidden = true; empty.style.display = 'none'; }
    grid.innerHTML = '';
    list.forEach(function (l, i) { grid.appendChild(makeListingCard(l, DATA.lots.indexOf(l) >= 0 ? 'lots' : 'homes', i)); });
    observeReveals(grid);
  }
  window.renderListings = renderListings;

  function switchTab(type) {
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
    document.getElementById('tab-' + type).classList.add('active');
    document.getElementById('tab-' + type).setAttribute('aria-pressed', 'true');
    document.getElementById('homesGrid').hidden = type !== 'homes';
    document.getElementById('lotsGrid').hidden = type !== 'lots';
    var he = document.getElementById('homesEmpty'), le = document.getElementById('lotsEmpty');
    if (he) { he.hidden = type !== 'homes' || document.getElementById('homesGrid').childElementCount > 0; he.style.display = he.hidden ? 'none' : 'block'; }
    if (le) { le.hidden = type !== 'lots' || document.getElementById('lotsGrid').childElementCount > 0; le.style.display = le.hidden ? 'none' : 'block'; }
  }
  window.switchTab = switchTab;

  // ═══════════════════════════════════════════════════════════
  // MORTGAGE CALCULATOR
  // ═══════════════════════════════════════════════════════════
  (function () {
    var priceEl = document.getElementById('calcPrice');
    var downEl = document.getElementById('calcDown');
    var rateEl = document.getElementById('calcRate');
    if (!priceEl) return;
    var term = 30;

    function fmtMoney(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

    function compute() {
      var price = parseFloat(priceEl.value) || 0;
      var downPct = parseFloat(downEl.value) || 0;
      var rate = parseFloat(rateEl.value) || 0;
      var down = price * (downPct / 100);
      var loan = price - down;
      var monthlyRate = rate / 100 / 12;
      var n = term * 12;
      var payment = monthlyRate === 0 ? loan / n : loan * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
      var totalPaid = payment * n;
      var totalInterest = totalPaid - loan;

      document.getElementById('calcPriceVal').textContent = fmtMoney(price);
      document.getElementById('calcDownVal').textContent = downPct.toFixed(0) + '% (' + fmtMoney(down) + ')';
      document.getElementById('calcRateVal').textContent = rate.toFixed(2) + '%';
      document.getElementById('calcMonthly').textContent = fmtMoney(payment);
      document.getElementById('calcLoanAmt').textContent = fmtMoney(loan);
      document.getElementById('calcTotalPaid').textContent = fmtMoney(totalPaid);
      document.getElementById('calcTotalInt').textContent = fmtMoney(totalInterest);
    }
    [priceEl, downEl, rateEl].forEach(function (el) { el.addEventListener('input', compute); });
    document.querySelectorAll('.calc-term-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.calc-term-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        term = parseInt(btn.dataset.term, 10);
        compute();
      });
    });
    compute();
  })();

  // ═══════════════════════════════════════════════════════════
  // TESTIMONIALS MARQUEE
  // ═══════════════════════════════════════════════════════════
  (function () {
    var track = document.getElementById('tTrack');
    if (!track) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var list = DATA.testimonials || [];
    var doubled = list.concat(list);
    doubled.forEach(function (t, i) {
      var card = document.createElement('div');
      card.className = 't-card';
      card.setAttribute('aria-hidden', i >= list.length ? 'true' : 'false');
      card.innerHTML = '<div class="t-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
        '<p class="t-quote">&ldquo;' + t.quote + '&rdquo;</p>' +
        '<span class="t-author">' + t.author + '</span>';
      track.appendChild(card);
    });

    if (reduceMotion) return;
    var pos = 0, speed = 0, dragging = false, lastX = 0;
    var thumb = document.getElementById('tThumb');
    var sbTrack = document.getElementById('tSbTrack');

    function totalW() { return track.scrollWidth / 2; }
    function baseSpeed() { return totalW() / 90000; }
    function updateThumb() {
      if (!thumb || !sbTrack) return;
      var w = Math.max(60, (window.innerWidth / totalW()) * sbTrack.offsetWidth);
      thumb.style.width = w + 'px';
      var progress = (-pos % totalW()) / totalW();
      thumb.style.left = (progress * (sbTrack.offsetWidth - w)) + 'px';
    }
    function tick() {
      if (!dragging) {
        pos -= baseSpeed();
        if (pos <= -totalW()) pos += totalW();
        track.style.transform = 'translateX(' + pos + 'px)';
        updateThumb();
      }
      requestAnimationFrame(tick);
    }
    if (thumb && sbTrack) {
      thumb.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; thumb.setPointerCapture(e.pointerId); });
      thumb.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX; lastX = e.clientX;
        var ratio = totalW() / sbTrack.offsetWidth;
        pos -= dx * ratio;
        if (pos > 0) pos -= totalW(); if (pos <= -totalW()) pos += totalW();
        track.style.transform = 'translateX(' + pos + 'px)';
        updateThumb();
      });
      thumb.addEventListener('pointerup', function () { dragging = false; });
      sbTrack.addEventListener('click', function (e) {
        if (e.target === thumb) return;
        var rect = sbTrack.getBoundingClientRect();
        var ratio = (e.clientX - rect.left) / rect.width;
        pos = -ratio * totalW();
        track.style.transform = 'translateX(' + pos + 'px)';
        updateThumb();
      });
    }
    window.addEventListener('resize', updateThumb);
    requestAnimationFrame(tick);
  })();

  // ═══════════════════════════════════════════════════════════
  // CONTACT FORM
  // ═══════════════════════════════════════════════════════════
  (function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var interest = form.elements.interest;
    var address = form.elements.property_address;
    function updateInquiry() {
      var valuation = interest.value === 'Home valuation';
      document.getElementById('valuationAddress').hidden = !valuation;
      address.disabled = !valuation; address.required = valuation;
    }
    interest.addEventListener('change', updateInquiry);
    document.querySelectorAll('[data-inquiry="valuation"]').forEach(function (link) {
      link.addEventListener('click', function () {
        interest.value = 'Home valuation'; updateInquiry();
        form.elements.name.focus({ preventScroll: true });
      });
    });
    updateInquiry();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.cfHoney && form.elements.cfHoney.value) return;
      var btn = form.querySelector('.cf-submit');
      var originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          form.reset(); updateInquiry();
          document.getElementById('formStatus').textContent = 'Message sent. Debra will be in touch soon. Thank you for reaching out.';
          btn.textContent = originalText; btn.disabled = false;
        } else { throw new Error('failed'); }
      }).catch(function () {
        document.getElementById('formStatus').textContent = 'Your message could not be sent. Please try again or email debraeldinrealtor@gmail.com.';
        btn.textContent = originalText; btn.disabled = false;
      });
    });
  })();

  // ═══════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════
  renderListings('homes');
  renderListings('lots');
  renderListings('sold');
  if (document.getElementById('tab-homes')) switchTab('homes');
})();
