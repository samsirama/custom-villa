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
  // 3. WHATSAPP CONTEXTUAL CONCIERGE GENERATOR
  // ==========================================
  function updateWhatsAppLink() {
    const currentLang = document.documentElement.getAttribute('lang') || 'id';
    const waPhone = '6281234567890';

    // 1. Update all unit cards with data-wa-unit-name attribute (in stay.html, index.html, detail-unit.html)
    const unitWaButtons = document.querySelectorAll('[data-wa-unit-name]');
    unitWaButtons.forEach((btn) => {
      const unitName = btn.getAttribute('data-wa-unit-name');
      const unitCode = btn.getAttribute('data-wa-unit-code');
      const unitLabel = unitCode ? `${unitName} (${unitCode})` : unitName;
      const refUrl = window.location.href.split('#')[0] || 'https://villajoglo.com/stay.html';

      let msg = '';
      if (currentLang === 'en') {
        msg = `Hello Villa Joglo, I would like to inquire further about ${unitLabel}. (${refUrl})`;
      } else {
        msg = `Halo Villa Joglo, saya ingin bertanya lebih lanjut tentang ${unitLabel}. (${refUrl})`;
      }

      btn.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    });

    // 2. Update Detail Unit Booking Form (on detail-unit.html)
    const waBookingBtn = document.getElementById('waBookingBtn');
    if (waBookingBtn) {
      const unitTitleEl = document.getElementById('unitDetailTitle');
      const checkinInput = document.getElementById('bookCheckin');
      const checkoutInput = document.getElementById('bookCheckout');
      const guestsSelect = document.getElementById('bookGuests');

      const unitName = unitTitleEl ? unitTitleEl.textContent.trim() : 'Joglo Ageng';
      const checkinVal = checkinInput && checkinInput.value ? checkinInput.value : '';
      const checkoutVal = checkoutInput && checkoutInput.value ? checkoutInput.value : '';
      const guestsVal = guestsSelect ? guestsSelect.value : '2 Tamu Dewasa';
      const refUrl = window.location.href.split('#')[0] || 'https://villajoglo.com/detail-unit.html';

      let msg = '';
      if (currentLang === 'en') {
        msg = `Hello Villa Joglo, I would like to inquire further about ${unitName} (Unit J1). (${refUrl})\n\n• Check-in: ${checkinVal || 'TBD'}\n• Check-out: ${checkoutVal || 'TBD'}\n• Guests: ${guestsVal}`;
      } else {
        msg = `Halo Villa Joglo, saya ingin bertanya lebih lanjut tentang ${unitName} (Unit J1). (${refUrl})\n\n• Check-in: ${checkinVal || 'TBD'}\n• Check-out: ${checkoutVal || 'TBD'}\n• Jumlah Tamu: ${guestsVal}`;
      }

      waBookingBtn.href = `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
    }
  }

  // ==========================================
  // 4. ACTIVE MENU AUTO-HIGHLIGHT & SCROLL SPY
  // ==========================================
  let currentActiveTarget = '';

  function getActiveSectionFromScroll() {
    const filosofiSection = document.getElementById('filosofi');
    const pengalamanSection = document.getElementById('pengalaman');

    if (!filosofiSection && !pengalamanSection) return '';

    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY < 300) {
      return 'index.html';
    }

    const viewportMiddle = scrollY + (window.innerHeight / 2.5);

    if (pengalamanSection) {
      const top = pengalamanSection.offsetTop;
      const bottom = top + pengalamanSection.offsetHeight;
      if (viewportMiddle >= top && viewportMiddle < bottom) {
        return 'pengalaman';
      }
    }

    if (filosofiSection) {
      const top = filosofiSection.offsetTop;
      const bottom = top + filosofiSection.offsetHeight;
      if (viewportMiddle >= top && viewportMiddle < bottom) {
        return 'filosofi';
      }
    }

    return 'index.html';
  }

  function highlightActiveMenu(explicitTarget) {
    const currentPath = window.location.pathname.toLowerCase();
    let currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    if (!currentFile || currentFile === '') {
      currentFile = 'index.html';
    }

    let activeTarget = explicitTarget;
    if (!activeTarget) {
      if (currentFile === 'stay.html') {
        activeTarget = 'stay.html';
      } else if (currentFile === 'detail-unit.html') {
        activeTarget = 'detail-unit.html';
      } else {
        // on index.html
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (hash === 'filosofi') {
          activeTarget = 'filosofi';
        } else if (hash === 'pengalaman') {
          activeTarget = 'pengalaman';
        } else {
          activeTarget = getActiveSectionFromScroll();
        }
      }
    }

    currentActiveTarget = activeTarget;

    const navLinks = document.querySelectorAll('#fullscreenNav [data-nav-item]');
    navLinks.forEach((link) => {
      const target = link.getAttribute('data-nav-item');
      const isMatch = (target === activeTarget) || 
                      (target === 'index.html' && (!activeTarget || activeTarget === 'index.html'));

      const activeBadge = link.querySelector('.nav-active-badge');
      const linkLabel = link.querySelector('.nav-text-label');
      const numberSpan = link.querySelector('.nav-num') || link.querySelector('span:first-child');

      if (isMatch) {
        link.classList.add('text-brass');
        link.classList.remove('text-stone-900', 'dark:text-stone-100');
        if (linkLabel) linkLabel.classList.add('font-semibold');
        if (numberSpan) {
          numberSpan.classList.add('text-brass', 'font-semibold');
          numberSpan.classList.remove('text-stone-400');
        }
        if (activeBadge) activeBadge.classList.remove('hidden');
      } else {
        link.classList.remove('text-brass');
        link.classList.add('text-stone-900', 'dark:text-stone-100');
        if (linkLabel) linkLabel.classList.remove('font-semibold');
        if (numberSpan) {
          numberSpan.classList.remove('text-brass', 'font-semibold');
          numberSpan.classList.add('text-stone-400');
        }
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
    updateWhatsAppLink();

    // Listen to hash changes (e.g. #filosofi, #pengalaman)
    window.addEventListener('hashchange', () => {
      highlightActiveMenu();
    });

    // Scroll spy for index.html
    const currentPath = window.location.pathname.toLowerCase();
    let currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    if (!currentFile || currentFile === '' || currentFile === 'index.html') {
      window.addEventListener('scroll', () => {
        const detected = getActiveSectionFromScroll();
        if (detected && detected !== currentActiveTarget && !window.location.hash) {
          highlightActiveMenu(detected);
        }
      }, { passive: true });
    }

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
      highlightActiveMenu(); // update highlight when menu opens
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
      const navLinks = fullscreenNav.querySelectorAll('[data-nav-item]');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          const target = link.getAttribute('data-nav-item');
          highlightActiveMenu(target);
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
