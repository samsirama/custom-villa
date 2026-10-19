/**
 * VILLA JOGLO - Interactive Front-End Engine
 * Features:
 * 1. Bilingual Switcher (ID / EN) with localStorage persistence
 * 2. Dark/Light Mode with localStorage persistence
 * 3. Left Fullscreen Hamburger Navigation with Active Page Auto-Highlight
 * 4. Dynamic Sticky Navbar (no top links, ultra-minimal Lepari style)
 * 5. Interactive Detail Gallery (thumbnails with cross-fade & caption)
 * 6. Dynamic Bilingual WhatsApp Concierge Booking
 * 7. AOS Animation Initialization
 */

(function () {
  'use strict';

  // ==========================================
  // 1. BILINGUAL ENGINE (ID / EN)
  // ==========================================
  const LANG_KEY = 'villa_joglo_lang';

  function getPreferredLang() {
    const storedLang = localStorage.getItem(LANG_KEY);
    if (storedLang === 'en' || storedLang === 'id') {
      return storedLang;
    }
    return 'id'; // Default to Indonesian
  }

  function applyLang(lang) {
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    localStorage.setItem(LANG_KEY, lang);

    // Update active states on language switcher buttons
    const langBtns = document.querySelectorAll('[data-lang-btn]');
    langBtns.forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang-btn');
      if (btnLang === lang) {
        btn.classList.add('text-brass', 'font-bold', 'border-b', 'border-brass');
        btn.classList.remove('text-stone-400', 'font-normal');
      } else {
        btn.classList.remove('text-brass', 'font-bold', 'border-b', 'border-brass');
        btn.classList.add('text-stone-400', 'font-normal');
      }
    });

    // Update dynamic WhatsApp link message if present
    if (typeof updateWhatsAppLink === 'function') {
      updateWhatsAppLink();
    }
  }

  // Pre-apply language before DOM ready to prevent flickering
  applyLang(getPreferredLang());

  // ==========================================
  // 2. THEME ENGINE (Dark / Light Mode)
  // ==========================================
  const THEME_KEY = 'villa_joglo_theme';

  function getPreferredTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === 'dark';

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggleIcons(isDark);
  }

  function toggleTheme() {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  function updateThemeToggleIcons(isDark) {
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    toggleButtons.forEach((btn) => {
      const sunIcon = btn.querySelector('.theme-icon-sun');
      const moonIcon = btn.querySelector('.theme-icon-moon');
      const labelText = btn.querySelector('.theme-label');

      if (sunIcon && moonIcon) {
        if (isDark) {
          sunIcon.classList.remove('hidden');
          moonIcon.classList.add('hidden');
        } else {
          sunIcon.classList.add('hidden');
          moonIcon.classList.remove('hidden');
        }
      }

      if (labelText) {
        labelText.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
      }
    });
  }

  // Pre-apply theme before DOM ready
  applyTheme(getPreferredTheme());

  // ==========================================
  // 3. WHATSAPP DYNAMIC CONCIERGE GENERATOR
  // ==========================================
  function updateWhatsAppLink() {
    const waBookingBtn = document.getElementById('waBookingBtn');
    if (!waBookingBtn) return;

    const unitTitleEl = document.getElementById('unitDetailTitle');
    const checkinInput = document.getElementById('bookCheckin');
    const checkoutInput = document.getElementById('bookCheckout');
    const guestsSelect = document.getElementById('bookGuests');
    const currentLang = document.documentElement.getAttribute('lang') || 'id';

    const unitName = unitTitleEl ? unitTitleEl.textContent.trim() : 'Joglo Ageng';
    const checkinVal = checkinInput && checkinInput.value ? checkinInput.value : 'TBD';
    const checkoutVal = checkoutInput && checkoutInput.value ? checkoutInput.value : 'TBD';
    const guestsVal = guestsSelect ? guestsSelect.value : '2 Guests';
    const waPhone = '6281234567890';

    let message = '';
    if (currentLang === 'en') {
      message = `Hello Villa Joglo Concierge, I would like to inquiry & book:\n\n• Unit: *${unitName}*\n• Check-in: *${checkinVal}*\n• Check-out: *${checkoutVal}*\n• Guests: *${guestsVal}*\n\nPlease confirm availability and rate. Thank you.`;
    } else {
      message = `Halo Concierge Villa Joglo, saya ingin menanyakan ketersediaan & reservasi:\n\n• Unit: *${unitName}*\n• Check-in: *${checkinVal}*\n• Check-out: *${checkoutVal}*\n• Jumlah Tamu: *${guestsVal}*\n\nMohon konfirmasi ketersediaan dan penawaran spesialnya. Terima kasih.`;
    }

    waBookingBtn.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  }

  // ==========================================
  // 4. ACTIVE MENU AUTO-HIGHLIGHT
  // ==========================================
  function highlightActiveMenu() {
    const currentPath = window.location.pathname.toLowerCase();
    let currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    if (!currentFile || currentFile === '') {
      currentFile = 'index.html';
    }

    const navLinks = document.querySelectorAll('#fullscreenNav [data-nav-item]');
    navLinks.forEach((link) => {
      const targetFile = link.getAttribute('data-nav-item');
      const isMatch = targetFile === currentFile || 
                     (targetFile === 'index.html' && (currentFile === '' || currentFile === 'index.html'));

      const activeBadge = link.querySelector('.nav-active-badge');
      const linkLabel = link.querySelector('.nav-text-label');

      if (isMatch) {
        link.classList.add('text-brass');
        link.classList.remove('text-stone-900', 'dark:text-stone-100');
        if (linkLabel) linkLabel.classList.add('font-semibold');
        if (activeBadge) activeBadge.classList.remove('hidden');
      } else {
        link.classList.remove('text-brass');
        link.classList.add('text-stone-900', 'dark:text-stone-100');
        if (linkLabel) linkLabel.classList.remove('font-semibold');
        if (activeBadge) activeBadge.classList.add('hidden');
      }
    });
  }

  // ==========================================
  // DOMContentLoaded Initializations
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    // Re-verify UI states
    applyLang(getPreferredLang());
    updateThemeToggleIcons(document.documentElement.classList.contains('dark'));
    highlightActiveMenu();

    // Bind Language switchers
    const langBtns = document.querySelectorAll('[data-lang-btn]');
    langBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = btn.getAttribute('data-lang-btn');
        applyLang(selectedLang);
      });
    });

    // Bind Theme toggles
    const themeToggles = document.querySelectorAll('[data-theme-toggle]');
    themeToggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });

    // ==========================================
    // FULLSCREEN NAVIGATION OVERLAY
    // ==========================================
    const menuToggleBtns = document.querySelectorAll('[data-menu-toggle]');
    const fullscreenNav = document.getElementById('fullscreenNav');

    function openMenu() {
      if (!fullscreenNav) return;
      fullscreenNav.classList.add('is-active');
      document.body.classList.add('overflow-hidden');
      menuToggleBtns.forEach((btn) => btn.classList.add('menu-open'));
    }

    function closeMenu() {
      if (!fullscreenNav) return;
      fullscreenNav.classList.remove('is-active');
      document.body.classList.remove('overflow-hidden');
      menuToggleBtns.forEach((btn) => btn.classList.remove('menu-open'));
    }

    menuToggleBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = fullscreenNav && fullscreenNav.classList.contains('is-active');
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    });

    if (fullscreenNav) {
      const navLinks = fullscreenNav.querySelectorAll('a');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && fullscreenNav && fullscreenNav.classList.contains('is-active')) {
        closeMenu();
      }
    });

    // ==========================================
    // DYNAMIC STICKY NAVBAR SCROLL
    // ==========================================
    const siteHeader = document.getElementById('siteHeader');
    if (siteHeader) {
      const handleScroll = () => {
        if (window.scrollY > 30) {
          siteHeader.classList.add('bg-[#FAF7F2]/95', 'dark:bg-[#120E0C]/95', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-stone-200/80', 'dark:border-stone-800/80');
          siteHeader.classList.remove('py-6');
          siteHeader.classList.add('py-4');
        } else {
          siteHeader.classList.remove('bg-[#FAF7F2]/95', 'dark:bg-[#120E0C]/95', 'backdrop-blur-md', 'shadow-sm', 'border-b', 'border-stone-200/80', 'dark:border-stone-800/80');
          siteHeader.classList.remove('py-4');
          siteHeader.classList.add('py-6');
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // ==========================================
    // DETAIL PAGE GALLERY SWITCHER
    // ==========================================
    const mainHeroImg = document.getElementById('mainGalleryImg');
    const galleryThumbs = document.querySelectorAll('.gallery-thumb-btn');
    const galleryCaption = document.getElementById('galleryImageCaption');

    if (mainHeroImg && galleryThumbs.length > 0) {
      galleryThumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          const newSrc = thumb.getAttribute('data-full-img');
          const newAlt = thumb.getAttribute('data-alt');
          const caption = thumb.getAttribute('data-caption');

          if (newSrc && mainHeroImg.src !== newSrc) {
            mainHeroImg.style.opacity = '0.3';
            mainHeroImg.style.transform = 'scale(0.99)';

            setTimeout(() => {
              mainHeroImg.src = newSrc;
              mainHeroImg.alt = newAlt || 'Villa Joglo';
              if (galleryCaption && caption) {
                galleryCaption.textContent = caption;
              }
              mainHeroImg.style.opacity = '1';
              mainHeroImg.style.transform = 'scale(1)';
            }, 200);

            galleryThumbs.forEach((btn) => {
              btn.classList.remove('ring-2', 'ring-[#C09A67]', 'scale-105');
              btn.classList.add('opacity-70');
            });
            thumb.classList.add('ring-2', 'ring-[#C09A67]', 'scale-105');
            thumb.classList.remove('opacity-70');
          }
        });
      });
    }

    // ==========================================
    // BOOKING CARD DATE PICKER & WHATSAPP SYNC
    // ==========================================
    const checkinInput = document.getElementById('bookCheckin');
    const checkoutInput = document.getElementById('bookCheckout');
    const guestsSelect = document.getElementById('bookGuests');
    const waBookingBtn = document.getElementById('waBookingBtn');

    if (checkinInput && checkoutInput) {
      const today = new Date();
      const checkinDate = new Date();
      checkinDate.setDate(today.getDate() + 3);
      const checkoutDate = new Date();
      checkoutDate.setDate(today.getDate() + 5);

      const formatDate = (d) => d.toISOString().split('T')[0];
      checkinInput.value = formatDate(checkinDate);
      checkoutInput.value = formatDate(checkoutDate);
      checkinInput.min = formatDate(today);
      checkoutInput.min = formatDate(today);

      checkinInput.addEventListener('change', updateWhatsAppLink);
      checkoutInput.addEventListener('change', updateWhatsAppLink);
    }

    if (guestsSelect) {
      guestsSelect.addEventListener('change', updateWhatsAppLink);
    }

    if (waBookingBtn) {
      updateWhatsAppLink();
    }

    // ==========================================
    // AOS INIT
    // ==========================================
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 850,
        once: true,
        offset: 50,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      });
    }
  });
})();
