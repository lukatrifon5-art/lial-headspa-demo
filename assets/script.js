// Homepage entrance overlay: shows the logo briefly, then fades away
const introOverlay = document.getElementById('introOverlay');
if (introOverlay) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      introOverlay.classList.add('hide');
      setTimeout(() => introOverlay.remove(), 900);
    }, 900);
  });
}

// Header scroll state
const siteHeader = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu toggle
const burger = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  // Lock background scroll while the menu is open — also sidesteps iOS Safari
  // quirks where scrolling mid-interaction can shift how fixed elements anchor.
  const setMenuOpen = (open) => {
    burger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
}

// Sticky CTA visibility: hidden over hero and footer
const stickyCta = document.getElementById('stickyCta');
const heroEl = document.querySelector('.hero, .page-hero');
const footerEl = document.querySelector('footer');
if (stickyCta && heroEl && footerEl) {
  let heroVisible = true;
  let footerVisible = false;
  const updateStickyCta = () => stickyCta.classList.toggle('show', !heroVisible && !footerVisible);

  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    updateStickyCta();
  }, { threshold: 0.1 });
  heroObserver.observe(heroEl);

  const footerObserver = new IntersectionObserver(([entry]) => {
    footerVisible = entry.isIntersecting;
    updateStickyCta();
  }, { threshold: 0.05 });
  footerObserver.observe(footerEl);
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// Carousels (reviews, ...): continuous CSS marquee, truly infinite, never pauses
document.querySelectorAll('.carousel-wrap').forEach((wrap) => {
  const track = wrap.querySelector('.carousel-track');
  if (!track) return;
  const prevBtn = wrap.querySelector('.carousel-arrow.prev');
  const nextBtn = wrap.querySelector('.carousel-arrow.next');

  // Duplicate the item set once: the CSS animation moves exactly -50% (one set's
  // width), so the loop point always lines up pixel-perfectly with no JS math.
  const originalItems = Array.from(track.children);
  originalItems.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3');
    track.appendChild(clone);
  });

  const visibleCount = () => (window.innerWidth <= 760 ? 1 : window.innerWidth <= 960 ? 2 : 3);
  const gap = parseFloat(getComputedStyle(track).columnGap) || 26;
  const secondsPerCard = 4.5;

  // Only touch the animation's CSS custom properties when the width actually
  // changed by a meaningful amount, so mobile browser-chrome resize events
  // (address bar show/hide) don't restart or jitter the marquee needlessly.
  let lastCardWidth = null;
  const sizeTrack = () => {
    const count = visibleCount();
    const cardWidth = (wrap.clientWidth - gap * (count - 1)) / count;
    if (lastCardWidth !== null && Math.abs(cardWidth - lastCardWidth) < 1) return;
    lastCardWidth = cardWidth;
    track.style.setProperty('--card-width', cardWidth + 'px');
    track.style.setProperty('--marquee-duration', (originalItems.length * secondsPerCard) + 's');
    // Exact pixel distance to the start of the cloned set. Using -50% here would be
    // wrong: the track's total width includes one extra gap at the original/clone
    // boundary, so 50% of it lands half a gap short of the clone's actual start,
    // causing a small but real jump every time the animation loops.
    const slideDistance = originalItems.length * (cardWidth + gap);
    track.style.setProperty('--slide-distance', slideDistance + 'px');
  };
  sizeTrack();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeTrack, 200);
  });

  const nudge = (dir) => {
    const anim = track.getAnimations()[0];
    if (!anim) return;
    const durationMs = parseFloat(getComputedStyle(track).animationDuration) * 1000;
    let next = (anim.currentTime || 0) + dir * secondsPerCard * 1000;
    if (durationMs > 0) {
      // Wrap into [0, durationMs) so it can never go negative and freeze the animation
      next = ((next % durationMs) + durationMs) % durationMs;
    }
    anim.currentTime = next;
  };
  if (nextBtn) nextBtn.addEventListener('click', () => nudge(1));
  if (prevBtn) prevBtn.addEventListener('click', () => nudge(-1));
});

// Service detail modal (pachete.html): click a price item to see a photo + description
const serviceModal = document.getElementById('serviceModal');
if (serviceModal) {
  const modalPhoto = serviceModal.querySelector('.service-modal-photo img');
  const modalName = serviceModal.querySelector('h3');
  const modalDuration = serviceModal.querySelector('.service-modal-duration');
  const modalPrice = serviceModal.querySelector('.service-modal-price');
  const modalDesc = serviceModal.querySelector('.service-modal-desc');
  const modalCloseBtn = serviceModal.querySelector('.service-modal-close');

  document.querySelectorAll('.price-item[data-name]').forEach((item) => {
    item.addEventListener('click', () => {
      const group = item.closest('.price-group');
      modalPhoto.src = group ? group.dataset.photo : '';
      modalPhoto.alt = item.dataset.name;
      modalName.textContent = item.dataset.name;
      modalDuration.textContent = item.dataset.duration;
      modalPrice.textContent = item.dataset.price;
      modalDesc.textContent = item.dataset.desc;
      serviceModal.classList.add('open');
    });
  });

  const closeServiceModal = () => serviceModal.classList.remove('open');
  modalCloseBtn.addEventListener('click', closeServiceModal);
  serviceModal.addEventListener('click', (e) => { if (e.target === serviceModal) closeServiceModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeServiceModal(); });
}

// Cookie consent banner (essential-only cookies, no tracking) - shown once until accepted
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
if (cookieBanner && cookieAccept) {
  const CONSENT_KEY = 'lial-cookie-consent';
  if (!localStorage.getItem(CONSENT_KEY)) {
    setTimeout(() => cookieBanner.classList.add('show'), 1200);
  }
  cookieAccept.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    cookieBanner.classList.remove('show');
  });
}

// Booking form: sends the request to a serverless function that reserves the
// slot in GitHub (source of truth the admin panel reads from) and notifies
// the owner on Telegram once that's configured.
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const statusEl = document.getElementById('bookingStatus');
  const nameInput = document.getElementById('bf-name');
  const phoneInput = document.getElementById('bf-phone');
  const packageSelect = document.getElementById('bf-package');
  const dateInput = document.getElementById('bf-date');
  const timeSelect = document.getElementById('bf-time');
  const messageInput = document.getElementById('bf-message');
  const nameError = document.getElementById('bf-name-error');
  const phoneError = document.getElementById('bf-phone-error');
  const dateError = document.getElementById('bf-date-error');
  const timeError = document.getElementById('bf-time-error');

  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  dateInput.setAttribute('min', todayISO);

  let closedDates = [];
  fetch('/api/closed-dates').then((r) => r.json()).then((data) => {
    closedDates = data.dates || [];
  }).catch(() => {});

  const openDatePicker = () => { try { dateInput.showPicker(); } catch (err) {} };
  dateInput.addEventListener('focus', openDatePicker);
  dateInput.addEventListener('click', openDatePicker);

  const syncDateValueState = () => dateInput.classList.toggle('has-value', !!dateInput.value);
  syncDateValueState();

  const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const loadTimeSlots = async (date) => {
    timeSelect.innerHTML = '<option value="">Se încarcă orele...</option>';
    timeSelect.disabled = true;
    let takenTimes = [];
    try {
      const res = await fetch(`/api/booked-slots?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      takenTimes = data.times || [];
    } catch (err) {
      // If the check fails, still let the visitor pick a time — the server
      // re-validates availability for real when the booking is submitted.
    }
    timeSelect.innerHTML = '<option value="">Alege o oră</option>';
    TIME_SLOTS.forEach((slot) => {
      const opt = document.createElement('option');
      opt.value = slot;
      const taken = takenTimes.includes(slot);
      opt.textContent = taken ? `${slot} (indisponibil)` : slot;
      opt.disabled = taken;
      timeSelect.appendChild(opt);
    });
    timeSelect.disabled = false;
  };

  const NAME_RE = /^[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,}(\s+[A-Za-zĂÂÎȘȚăâîșțŞŢşţ]{2,})+$/;
  const PHONE_RE = /^\+373[0-9]{8}$/;

  const validateName = () => {
    const ok = NAME_RE.test(nameInput.value.trim());
    nameError.textContent = ok ? '' : 'Introdu numele și prenumele complet.';
    return ok;
  };
  const validatePhone = () => {
    const digits = phoneInput.value.replace(/[\s()-]/g, '');
    const ok = PHONE_RE.test(digits);
    phoneError.textContent = ok ? '' : 'Format: +373 urmat de 8 cifre (ex: +373 691 23 456).';
    return ok;
  };
  const validateDate = () => {
    if (!dateInput.value) { dateError.textContent = ''; return true; }
    if (dateInput.value < todayISO) {
      dateError.textContent = 'Alege o dată din prezent sau din viitor.';
      return false;
    }
    if (closedDates.includes(dateInput.value)) {
      dateError.textContent = 'Această zi este nelucrătoare. Alege altă dată.';
      return false;
    }
    dateError.textContent = '';
    return true;
  };
  const validateTime = () => {
    const ok = !!timeSelect.value;
    timeError.textContent = ok ? '' : 'Alege o oră pentru rezervare.';
    return ok;
  };

  nameInput.addEventListener('blur', validateName);
  phoneInput.addEventListener('blur', validatePhone);
  dateInput.addEventListener('change', () => {
    syncDateValueState();
    if (dateInput.value && validateDate()) {
      loadTimeSlots(dateInput.value);
    } else {
      timeSelect.innerHTML = '<option value="">Alege întâi data</option>';
      timeSelect.disabled = true;
    }
  });
  timeSelect.addEventListener('change', validateTime);

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameOk = validateName();
    const phoneOk = validatePhone();
    const dateOk = validateDate();
    const timeOk = validateTime();
    if (!nameOk || !phoneOk || !dateOk || !timeOk) return;

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    statusEl.textContent = 'Se trimite...';
    statusEl.className = 'booking-status';

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          service: packageSelect.value,
          date: dateInput.value,
          time: timeSelect.value,
          message: messageInput.value.trim(),
        }),
      });
      const result = await response.json();

      if (response.status === 409) {
        timeError.textContent = result.error;
        statusEl.textContent = 'Ora aleasă tocmai a fost rezervată de altcineva. Alege alta.';
        statusEl.classList.add('error');
        loadTimeSlots(dateInput.value);
        submitBtn.disabled = false;
        return;
      }
      if (!response.ok) {
        statusEl.textContent = result.error || 'Nu am putut trimite cererea. Încearcă din nou sau sună-ne direct.';
        statusEl.classList.add('error');
        submitBtn.disabled = false;
        return;
      }

      statusEl.textContent = 'Mulțumim! Cererea ta a fost înregistrată — te vom contacta pentru confirmare.';
      statusEl.classList.add('success');
      bookingForm.reset();
      timeSelect.innerHTML = '<option value="">Alege întâi data</option>';
      timeSelect.disabled = true;
      submitBtn.disabled = false;
    } catch (err) {
      statusEl.textContent = 'Nu am putut trimite cererea. Verifică conexiunea și încearcă din nou.';
      statusEl.classList.add('error');
      submitBtn.disabled = false;
    }
  });
}
