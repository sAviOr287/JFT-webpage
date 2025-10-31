(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer;

  const applyReveal = (root = document) => {
    const nodes = Array.from(root.querySelectorAll('.reveal-on-scroll'));
    if (prefersReducedMotion) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '0px 0px -10% 0px',
          threshold: 0.25,
        }
      );
    }

    nodes.forEach((node) => observer.observe(node));
  };

  window.__applyReveal = applyReveal;
  applyReveal(document);
})();
