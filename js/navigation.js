(function () {
  const nav = document.querySelector('.site-navigation');
  const toggle = document.querySelector('.nav-toggle');

  if (!nav || !toggle) {
    return;
  }

  const closeNav = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.dataset.open = 'false';
  };

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    nav.dataset.open = String(!isExpanded);
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      closeNav();
    }
  });
})();
