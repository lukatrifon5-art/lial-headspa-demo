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
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
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

// Booking form: demo mode — validates fully and shows a friendly confirmation,
// not yet wired to a live backend (Telegram/GitHub) until the client confirms.
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const statusEl = document.getElementById('bookingStatus');
  const nameInput = document.getElementById('bf-name');
  const phoneInput = document.getElementById('bf-phone');
  const dateInput = document.getElementById('bf-date');
  const timeSelect = document.getElementById('bf-time');
  const nameError = document.getElementById('bf-name-error');
  const phoneError = document.getElementById('bf-phone-error');
  const dateError = document.getElementById('bf-date-error');
  const timeError = document.getElementById('bf-time-error');

  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  dateInput.setAttribute('min', todayISO);

  const openDatePicker = () => { try { dateInput.showPicker(); } catch (err) {} };
  dateInput.addEventListener('focus', openDatePicker);
  dateInput.addEventListener('click', openDatePicker);

  const syncDateValueState = () => dateInput.classList.toggle('has-value', !!dateInput.value);
  syncDateValueState();

  const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const loadTimeSlots = () => {
    timeSelect.innerHTML = '<option value="">Alege o oră</option>';
    TIME_SLOTS.forEach((slot) => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot;
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
    const ok = dateInput.value >= todayISO;
    dateError.textContent = ok ? '' : 'Alege o dată din prezent sau din viitor.';
    return ok;
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
    validateDate();
    if (dateInput.value && validateDate()) {
      loadTimeSlots();
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

    // Demo mode: simulate a short delay, then confirm — no data leaves the browser.
    await new Promise((resolve) => setTimeout(resolve, 700));
    statusEl.textContent = 'Mulțumim! (Demo) — pe site-ul live, cererea ar ajunge instant la echipa Lia L.';
    statusEl.classList.add('success');
    bookingForm.reset();
    timeSelect.innerHTML = '<option value="">Alege întâi data</option>';
    timeSelect.disabled = true;
    submitBtn.disabled = false;
  });
}
