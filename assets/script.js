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
const heroEl = document.querySelector('.hero');
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

  const todayISO = new Date().toISOString().split('T')[0];
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

// Lightbox for gallery
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  const closeLightbox = () => lightbox.classList.remove('open');
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}
