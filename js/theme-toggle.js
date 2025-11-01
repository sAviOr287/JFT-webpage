(function () {
  const storageKey = 'jft-theme';
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle');

  if (!toggles.length) {
    return;
  }

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const setStoredTheme = (value) => {
    try {
      localStorage.setItem(storageKey, value);
    } catch (error) {
      // Ignore storage failures (e.g. private browsing).
    }
  };

  const syncToggleState = (theme) => {
    toggles.forEach((button) => {
      const isDark = theme === 'dark';
      button.setAttribute('aria-pressed', String(isDark));
      button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      const label = button.querySelector('.theme-toggle__label');
      if (label) {
        label.textContent = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      } else {
        button.textContent = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      }
    });
  };

  const applyTheme = (theme, shouldPersist = true) => {
    root.setAttribute('data-theme', theme);
    syncToggleState(theme);
    if (shouldPersist) {
      setStoredTheme(theme);
    }
  };

  const storedTheme = getStoredTheme();
  const initialTheme = root.getAttribute('data-theme') || storedTheme || 'light';

  if (initialTheme !== root.getAttribute('data-theme')) {
    root.setAttribute('data-theme', initialTheme);
  }

  syncToggleState(initialTheme);

  toggles.forEach((button) => {
    button.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  });

  const prefersDarkMedia = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  if (prefersDarkMedia && typeof prefersDarkMedia.addEventListener === 'function') {
    prefersDarkMedia.addEventListener('change', (event) => {
      if (getStoredTheme()) {
        return;
      }
      applyTheme(event.matches ? 'dark' : 'light', false);
    });
  } else if (prefersDarkMedia && typeof prefersDarkMedia.addListener === 'function') {
    prefersDarkMedia.addListener((event) => {
      if (getStoredTheme()) {
        return;
      }
      applyTheme(event.matches ? 'dark' : 'light', false);
    });
  }
})();
