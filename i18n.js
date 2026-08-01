/* ═══════════════════════════════════════════
   KrishiSetu — js/i18n.js
   (Internationalization setup with i18next)
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  const supportedLngs = {
    en: 'English',
    hi: 'हिन्दी',
    mr: 'मराठी',
    gu: 'ગુજરાતી',
    bn: 'বাংলা',
    ta: 'தமிழ்',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
    ml: 'മലയാളം',
    pa: 'ਪੰਜਾਬੀ',
  };

  // --- 1. i18next Initialization ---
  await i18next
    .use(i18nextBrowserLanguageDetector)
    .use(i18nextHttpBackend)
    .init({
      fallbackLng: 'en',
      debug: false, // Set to true for debugging
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      backend: {
        loadPath: 'locales/{{lng}}.json',
      },
    });

  // --- 2. Update Content Function ---
  const updateContent = () => {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      // Use innerHTML to support HTML tags in translations
      element.innerHTML = i18next.t(key);
    });
  };

  // --- 3. Language Selector Setup ---
  const langDropdownContainer = document.getElementById('language-dropdown');
  const langBtn = document.getElementById('language-btn');
  const selectedLangLabel = document.getElementById('selected-language');
  const langMenu = document.getElementById('language-menu');

  if (langDropdownContainer && langBtn && selectedLangLabel && langMenu) {
    // Populate dropdown menu
    langMenu.innerHTML = ''; // Clear any existing items
    Object.entries(supportedLngs).forEach(([code, label]) => {
      const button = document.createElement('button');
      button.className = 'lang-menu-item';
      button.textContent = label;
      button.dataset.lang = code;

      button.addEventListener('click', () => {
        const selectedCode = button.dataset.lang;
        if (i18next.language !== selectedCode) {
          i18next.changeLanguage(selectedCode);
        }
        langMenu.classList.remove('open');
        langBtn.classList.remove('open');
      });
      langMenu.appendChild(button);
    });

    // Toggle dropdown
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('open');
      langBtn.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      langMenu.classList.remove('open');
      langBtn.classList.remove('open');
    });
  }

  // --- 4. Update UI on Language Change ---
  const updateUIForLanguage = (lng) => {
    // Update button label
    if (selectedLangLabel) {
      selectedLangLabel.textContent = supportedLngs[lng] || 'English';
    }
    // Highlight active language in dropdown
    document.querySelectorAll('.lang-menu-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.lang === lng);
    });

    // Set document language attribute
    document.documentElement.lang = lng;

    // Translate all content
    updateContent();

    // Show a confirmation toast
    showToast(i18next.t('toast.languageChanged', { language: supportedLngs[lng] }));
  };

  // --- 5. Initial Load & Event Listener ---
  i18next.on('languageChanged', (lng) => {
    updateUIForLanguage(lng);
  });

  // Initial content update on page load
  updateUIForLanguage(i18next.language);

  // --- Expose a sync function for dynamic content if needed later ---
  window.translateDynamicContent = (element) => {
    element.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = i18next.t(key);
    });
  };
});