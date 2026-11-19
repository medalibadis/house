/**
 * Luxury Arabic Wedding Invitation Web Application
 * Interactivity: Envelope Opening, Countdown, Action Grid, RSVP Modal, Calendar & Music
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const envelopeScreen = document.getElementById('envelope-cover-screen');
  const interactiveEnvelope = document.getElementById('interactive-envelope');
  const mainInvitation = document.getElementById('main-invitation-container');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const reopenCoverBtn = document.getElementById('reopen-cover-btn');
  const toastContainer = document.getElementById('toast-container');

  // Modals
  const rsvpModal = document.getElementById('rsvp-modal');
  const rsvpCloseBtn = document.getElementById('rsvp-modal-close');
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpSuccessState = document.getElementById('rsvp-success-state');
  const rsvpEditBtn = document.getElementById('rsvp-edit-btn');
  const stepperMinus = document.getElementById('stepper-minus');
  const stepperPlus = document.getElementById('stepper-plus');
  const guestCountInput = document.getElementById('guest-count');
  const radioLabels = document.querySelectorAll('.radio-label');

  const locationModal = document.getElementById('location-modal');
  const locCloseBtn = document.getElementById('loc-modal-close');
  const locModalSubtitle = document.getElementById('loc-modal-subtitle');
  const locModalTime = document.getElementById('loc-modal-time');

  // Countdown Elements
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  let isCoverOpened = false;

  // =========================================================================
  // 1. STAGE 1: ENVELOPE OPENING INTERACTION
  // =========================================================================
  function openEnvelope() {
    if (isCoverOpened) return;
    isCoverOpened = true;

    // Trigger 3D Opening Animation on Envelope
    interactiveEnvelope.classList.add('is-opening');

    // Trigger Gold Confetti / Sparkle Effect
    createSparkles(interactiveEnvelope);

    // Auto-start ambient music
    if (window.ambientMusic) {
      window.ambientMusic.play();
      audioToggleBtn.classList.add('playing');
    }

    // After letter slide animation completes, transition to full page
    setTimeout(() => {
      envelopeScreen.classList.add('opened-hide');
      mainInvitation.classList.remove('hidden-initial');
      mainInvitation.classList.add('visible-active');

      // Scroll smoothly to top of main card
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger scroll reveals
      initScrollReveals();
    }, 950);
  }

  interactiveEnvelope.addEventListener('click', openEnvelope);
  interactiveEnvelope.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  // Re-close envelope handler
  if (reopenCoverBtn) {
    reopenCoverBtn.addEventListener('click', () => {
      isCoverOpened = false;
      mainInvitation.classList.remove('visible-active');
      mainInvitation.classList.add('hidden-initial');
      envelopeScreen.classList.remove('opened-hide');
      interactiveEnvelope.classList.remove('is-opening');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Gold sparkle burst animation on seal pop
  function createSparkles(targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 22; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle-particle';
      const angle = (Math.PI * 2 * i) / 22 + (Math.random() - 0.5);
      const distance = 40 + Math.random() * 85;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const size = 4 + Math.random() * 5;
      const colors = ['#ECC680', '#D4AF37', '#7A1C33', '#FFFFFF'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      sparkle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1500;
        box-shadow: 0 0 8px ${color};
        transform: translate(-50%, -50%);
        transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease;
      `;
      document.body.appendChild(sparkle);

      requestAnimationFrame(() => {
        sparkle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
        sparkle.style.opacity = '0';
      });

      setTimeout(() => sparkle.remove(), 850);
    }
  }

  // =========================================================================
  // 2. AUDIO MUSIC CONTROLLER
  // =========================================================================
  audioToggleBtn.addEventListener('click', () => {
    if (window.ambientMusic) {
      const isNowPlaying = window.ambientMusic.toggle();
      if (isNowPlaying) {
        audioToggleBtn.classList.add('playing');
        showToast('تم تشغيل الموسيقى الهادئة ♫');
      } else {
        audioToggleBtn.classList.remove('playing');
        showToast('تم كتم الموسيقى');
      }
    }
  });

  // =========================================================================
  // 3. LIVE COUNTDOWN TIMER ("العد التنازلي")
  // Target: December 25, 2026 at 10:30:00
  // =========================================================================
  const targetDate = new Date('2026-12-25T10:30:00');

  function updateCountdown() {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      if (cdDays) cdDays.textContent = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMinutes) cdMinutes.textContent = '00';
      if (cdSeconds) cdSeconds.textContent = '00';
      const statusText = document.getElementById('countdown-status-text');
      if (statusText) statusText.textContent = 'بارك الله لهما وبارك عليهما وجمع بينهما في خير!';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =========================================================================
  // 4. INTERACTIVE ACTION GRID ("اضغط للتفاعل")
  // =========================================================================

  // 1. موقع العقد الشرعي
  const btnLocAqd = document.getElementById('btn-location-aqd');
  if (btnLocAqd) {
    btnLocAqd.addEventListener('click', () => {
      openLocationModal({
        title: 'موقع العقد الشرعي',
        subtitle: 'قاعة الماسة - بلدية قمار (ولاية الوادي)',
        time: 'الجمعة 25 ديسمبر 2026 - الساعة 10:30 صباحاً',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Salle+des+fetes+El+Massa+Guemar+El+Oued'
      });
    });
  }

  // 2. موقع مأدبة الغداء
  const btnLocLunch = document.getElementById('btn-location-lunch');
  if (btnLocLunch) {
    btnLocLunch.addEventListener('click', () => {
      openLocationModal({
        title: 'موقع مأدبة الغداء',
        subtitle: 'قاعة الماسة - بلدية قمار (ولاية الوادي)',
        time: 'الجمعة 25 ديسمبر 2026 - الساعة 11:00 صباحاً',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Salle+des+fetes+El+Massa+Guemar+El+Oued'
      });
    });
  }

  // 3. تأكيد الحضور (RSVP)
  const btnRsvp = document.getElementById('btn-rsvp');
  if (btnRsvp) {
    btnRsvp.addEventListener('click', openRsvpModal);
  }

  // 4. إضافة للتقويم (.ics download)
  const btnCalendar = document.getElementById('btn-calendar');
  if (btnCalendar) {
    btnCalendar.addEventListener('click', downloadICalendarFile);
  }

  // 5. مشاركة الدعوة (Web Share API / Copy Link)
  const btnShare = document.getElementById('btn-share');
  if (btnShare) {
    btnShare.addEventListener('click', shareInvitation);
  }

  // =========================================================================
  // 5. LOCATION MODAL LOGIC
  // =========================================================================
  function openLocationModal({ title, subtitle, time, mapsUrl }) {
    const titleEl = document.getElementById('loc-modal-title');
    const gmapsLink = document.getElementById('gmaps-direct-link');

    if (titleEl) titleEl.textContent = title;
    if (locModalSubtitle) locModalSubtitle.textContent = subtitle;
    if (locModalTime) locModalTime.textContent = time;
    if (gmapsLink && mapsUrl) gmapsLink.href = mapsUrl;

    locationModal.classList.add('active');
    locationModal.setAttribute('aria-hidden', 'false');
  }

  function closeLocationModal() {
    locationModal.classList.remove('active');
    locationModal.setAttribute('aria-hidden', 'true');
  }

  if (locCloseBtn) locCloseBtn.addEventListener('click', closeLocationModal);
  locationModal.addEventListener('click', (e) => {
    if (e.target === locationModal) closeLocationModal();
  });

  // =========================================================================
  // 6. RSVP MODAL & LOCALSTORAGE STATE
  // =========================================================================
  function openRsvpModal() {
    checkSavedRsvp();
    rsvpModal.classList.add('active');
    rsvpModal.setAttribute('aria-hidden', 'false');
  }

  function closeRsvpModal() {
    rsvpModal.classList.remove('active');
    rsvpModal.setAttribute('aria-hidden', 'true');
  }

  if (rsvpCloseBtn) rsvpCloseBtn.addEventListener('click', closeRsvpModal);
  rsvpModal.addEventListener('click', (e) => {
    if (e.target === rsvpModal) closeRsvpModal();
  });

  // Radio button UI toggle
  radioLabels.forEach(label => {
    label.addEventListener('click', () => {
      radioLabels.forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const radio = label.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const countWrapper = document.getElementById('guest-count-wrapper');
        if (countWrapper) {
          countWrapper.style.display = radio.value === 'attending' ? 'flex' : 'none';
        }
      }
    });
  });

  // Guest count stepper (+ / -)
  if (stepperMinus && stepperPlus && guestCountInput) {
    stepperMinus.addEventListener('click', () => {
      let val = parseInt(guestCountInput.value, 10) || 1;
      if (val > 1) guestCountInput.value = val - 1;
    });

    stepperPlus.addEventListener('click', () => {
      let val = parseInt(guestCountInput.value, 10) || 1;
      if (val < 10) guestCountInput.value = val + 1;
    });
  }

  // RSVP Form Submission
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const guestName = document.getElementById('guest-name').value.trim();
      const attendanceStatus = document.querySelector('input[name="attendance_status"]:checked')?.value || 'attending';
      const guestCount = guestCountInput ? guestCountInput.value : '1';
      const guestWishes = document.getElementById('guest-wishes')?.value.trim() || '';

      if (!guestName) {
        showToast('يرجى إدخال اسمك الكريم');
        return;
      }

      const rsvpData = {
        name: guestName,
        status: attendanceStatus,
        guests: attendanceStatus === 'attending' ? guestCount : 0,
        wishes: guestWishes,
        date: new Date().toISOString()
      };

      try {
        localStorage.setItem('wedding_rsvp_submission', JSON.stringify(rsvpData));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      displayRsvpSuccess(rsvpData);
      showToast('تم حفظ تأكيد حضوركم بنجاح!');
    });
  }

  function displayRsvpSuccess(data) {
    rsvpForm.classList.add('hidden');
    rsvpSuccessState.classList.remove('hidden');

    const msgEl = document.getElementById('rsvp-success-message');
    if (msgEl) {
      if (data.status === 'attending') {
        msgEl.innerHTML = `مرحباً بك يا <strong>${data.name}</strong>، يشرفنا ويسعدنا حضورك (${data.guests} فرد) بمشيئة الله تعالى.`;
      } else {
        msgEl.innerHTML = `شكراً لتواصلك يا <strong>${data.name}</strong>، ونقدر اعتذارك ونتمنى أن نلتقي بكم في مناسبات قادمة بكل خير.`;
      }
    }
  }

  if (rsvpEditBtn) {
    rsvpEditBtn.addEventListener('click', () => {
      rsvpSuccessState.classList.add('hidden');
      rsvpForm.classList.remove('hidden');
    });
  }

  function checkSavedRsvp() {
    try {
      const saved = localStorage.getItem('wedding_rsvp_submission');
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.name) {
          displayRsvpSuccess(data);
          return;
        }
      }
    } catch (e) {
      // Ignore
    }
    rsvpSuccessState.classList.add('hidden');
    rsvpForm.classList.remove('hidden');
  }

  // =========================================================================
  // 7. CALENDAR ICS GENERATOR & DOWNLOAD
  // =========================================================================
  function downloadICalendarFile() {
    // Target event: 25 Dec 2026, 10:30:00 to 16:30:00 (UTC+1 Algeria)
    // 10:30 Algeria = 09:30 UTC -> 20261225T093000Z
    // 16:30 Algeria = 15:30 UTC -> 20261225T153000Z
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//Ibrahim Hossam Eddine//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:wedding-ibrahim-20261225@invitation.dz',
      'DTSTAMP:20261119T000000Z',
      'DTSTART:20261225T093000Z',
      'DTEND:20261225T153000Z',
      'SUMMARY:حفل زفاف ابراهيم حسام الدين',
      'DESCRIPTION:يتشرف السيد سليم كير بدعوتكم لحضور حفل زفاف ابنه ابراهيم حسام الدين بقاعة الماسة - قمار (العقد الشرعي الساعة 10:30 صباحاً، مأدبة الغداء الساعة 11:00 صباحاً).',
      'LOCATION:قاعة الماسة للأفراح والاحتفالات، قمار، ولاية الوادي، الجزائر',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:تذكير: حفل زفاف ابراهيم حسام الدين غداً بمشيئة الله',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'wedding-ibrahim-hossam-eddine.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تحميل موعد الزفاف إلى التقويم 📅');
  }

  // =========================================================================
  // 8. SHARE INVITATION (Web Share API & Clipboard Fallback)
  // =========================================================================
  async function shareInvitation() {
    const shareData = {
      title: 'دعوة زفاف ابراهيم حسام الدين',
      text: 'يتشرف السيد سليم كير بدعوتكم لحضور زفاف ابنه ابراهيم حسام الدين يوم الجمعة 25 ديسمبر 2026 بقاعة الماسة - قمار',
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast('تمت مشاركة الدعوة بنجاح!');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(window.location.href);
        }
      }
    } else {
      copyToClipboard(window.location.href);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast('تم نسخ رابط الدعوة إلى الحافظة! ✨'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast('تم نسخ رابط الدعوة إلى الحافظة! ✨');
    } catch (e) {
      showToast('تعذر نسخ الرابط تلقائياً');
    }
    document.body.removeChild(tempInput);
  }

  // =========================================================================
  // 9. TOAST NOTIFICATION UTILITY
  // =========================================================================
  let toastTimeout = null;
  function showToast(message) {
    if (!toastContainer) return;
    toastContainer.textContent = message;
    toastContainer.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastContainer.classList.remove('show');
    }, 3200);
  }

  // =========================================================================
  // 10. SCROLL REVEAL OBSERVER
  // =========================================================================
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    reveals.forEach(el => observer.observe(el));
  }

  // Initial check on load
  initScrollReveals();

  // URL Parameter or Hash support for direct invitation preview (?opened=1 or #invitation)
  if (window.location.search.includes('opened=1') || window.location.hash === '#invitation') {
    isCoverOpened = true;
    envelopeScreen.classList.add('opened-hide');
    mainInvitation.classList.remove('hidden-initial');
    mainInvitation.classList.add('visible-active');
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
  }
});

