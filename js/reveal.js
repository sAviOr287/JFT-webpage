(function () {
  const state = {
    observer: null,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
  };

  function ensureRevealElements(root = document) {
    const targets = Array.from(root.querySelectorAll('[data-reveal]'));

    if (!targets.length) {
      return;
    }

    if (state.prefersReducedMotion.matches || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => {
        el.classList.add('is-visible');
      });
      return;
    }

    if (!state.observer) {
      state.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              state.observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -10% 0px'
        }
      );
    }

    targets.forEach((target, index) => {
      if (!target.dataset.revealIndex) {
        target.style.setProperty('--reveal-index', index.toString());
        target.dataset.revealIndex = index.toString();
      }
      state.observer.observe(target);
    });
  }

  document.addEventListener('DOMContentLoaded', () => ensureRevealElements());

  window.JFT = window.JFT || {};
  window.JFT.Reveal = {
    refresh: ensureRevealElements
  };
})();
