const featuredContainer = document.querySelector('[data-papers-target="featured"]');
const libraryContainer = document.querySelector('[data-papers-target="library"]');
const filtersContainer = document.querySelector('[data-papers-filters]');
const featuredFallback = featuredContainer?.querySelector('[data-paper-error]') || null;

const VENUE_PATTERNS = [
  { regex: /international conference on machine learning|icml/i, short: 'ICML' },
  { regex: /international conference on learning representations|learning representations|iclr/i, short: 'ICLR' },
  { regex: /conference on neural information processing systems|advances in neural information processing systems|neurips/i, short: 'NeurIPS' },
  { regex: /association for the advancement of artificial intelligence|aaai/i, short: 'AAAI' },
  { regex: /international conference on artificial intelligence and statistics|aistats/i, short: 'AISTATS' },
  { regex: /conference on empirical methods in natural language processing|emnlp/i, short: 'EMNLP' },
  { regex: /annual meeting of the association for computational linguistics|acl/i, short: 'ACL' },
  { regex: /journal of machine learning research|jmlr/i, short: 'JMLR' },
  { regex: /journal of spatial statistics/i, short: 'J. Spatial Statistics' },
  { regex: /sigir/i, short: 'SIGIR' },
  { regex: /naacl/i, short: 'NAACL' },
  { regex: /arxiv/i, short: 'arXiv' },
  { regex: /us patent/i, short: 'US Patent' },
  { regex: /european patent/i, short: 'EU Patent' },
  { regex: /preprint/i, short: 'Preprint' },
];

const TAG_LABELS = {
  'LLM Alignment': 'LLMs',
  'Preference Learning': 'Preference',
  'Multi-Agent Systems': 'Multi-Agent',
  'Kernel Methods': 'Kernels',
  'Responsible AI': 'Responsible AI',
  'Causality': 'Causality',
  'Patent': 'Patent',
  'Recommender Systems': 'RecSys',
  'Bayesian Inference': 'Bayesian',
  'Uncertainty': 'Uncertainty',
  'Meta Learning': 'Meta-Learning',
  'Bandits': 'Bandits',
  'Reinforcement Learning': 'RL',
  'Efficient Methods': 'Efficiency',
  'Tool Use': 'Tool Use',
};

if (featuredFallback) {
  featuredFallback.hidden = true;
}

(async function loadPapers() {
  const response = await fetch('data/papers.json');
  if (!response.ok) {
    throw new Error(`Failed to load papers: ${response.status}`);
  }

  const payload = await response.json();
  const papers = (payload.papers || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (featuredContainer) {
    const featured = papers.filter((paper) => paper.featured !== false).slice(0, 4);
    renderPapers(featured, featuredContainer);
  }

  if (libraryContainer) {
    renderPapers(papers, libraryContainer);
  }

  if (filtersContainer && libraryContainer) {
    filtersContainer.removeAttribute('hidden');
    filtersContainer.removeAttribute('aria-hidden');
    initialiseFilters(papers, filtersContainer, libraryContainer);
  }
})().catch((error) => {
  clearContainer(featuredContainer, featuredFallback);
  clearContainer(libraryContainer);

  if (filtersContainer) {
    filtersContainer.replaceChildren();
    filtersContainer.setAttribute('hidden', 'true');
    filtersContainer.setAttribute('aria-hidden', 'true');
  }

  if (featuredFallback) {
    featuredFallback.hidden = false;
  }

  console.error('Failed to load papers data.', error);
});

function renderPapers(list, container) {
  const fallback = container.querySelector('[data-paper-error]');
  clearContainer(container, fallback);
  if (fallback) {
    fallback.hidden = true;
  }
  if (!list.length) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'text-muted';
    emptyMessage.textContent = 'No papers available yet.';
    container.appendChild(emptyMessage);
    return;
  }

  list.forEach((paper, index) => {
    const card = document.createElement('article');
    card.className = 'paper-card reveal-on-scroll';
    card.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    const dateLabel = paper.display_date || formatDate(paper.date);
    const venueLabel = formatVenue(paper.venue);
    const authorsLabel = highlightAuthor(paper.authors || '');

    const imageMarkup = paper.thumbnail
      ? `<img src="${paper.thumbnail}" alt="${paper.title} thumbnail" loading="lazy" />`
      : '';

    const tagsMarkup = (paper.tags || [])
      .map((tag) => `<span class="pill">${formatTag(tag)}</span>`)
      .join('');

    const linksMarkup = Object.entries(paper.links || {})
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => {
        const label = key.replace(/_/g, ' ');
        return `<a href="${value}" target="_blank" rel="noopener">${capitalise(label)}</a>`;
      })
      .join('');

    card.innerHTML = `
      <div class="paper-card__image">${imageMarkup}</div>
      <div class="paper-card__body">
        <h3>${paper.title}</h3>
        <div class="paper-card__meta">
          ${dateLabel ? `<span>${dateLabel}</span>` : ''}
          ${venueLabel ? `<span>${venueLabel}</span>` : ''}
          ${authorsLabel ? `<span>${authorsLabel}</span>` : ''}
        </div>
        ${paper.summary ? `<p>${paper.summary}</p>` : ''}
        ${tagsMarkup ? `<div class="hero__meta">${tagsMarkup}</div>` : ''}
        ${linksMarkup ? `<div class="paper-card__links">${linksMarkup}</div>` : ''}
      </div>
    `;

    if (!paper.thumbnail) {
      card.classList.add('paper-card--no-image');
    }

    container.appendChild(card);
  });

  if (typeof window.__applyReveal === 'function') {
    window.__applyReveal(container);
  }
}

function clearContainer(container, preserveNode) {
  if (!container) {
    return;
  }

  if (!preserveNode) {
    container.replaceChildren();
    return;
  }

  Array.from(container.children).forEach((child) => {
    if (child !== preserveNode) {
      child.remove();
    }
  });
}

function initialiseFilters(papers, filtersContainer, libraryContainer) {
  const allTags = new Set();
  papers.forEach((paper) => {
    (paper.tags || []).forEach((tag) => allTags.add(tag));
  });
  const tags = Array.from(allTags).sort((a, b) => a.localeCompare(b));

  const renderButtons = (activeTag = 'All') => {
    filtersContainer.innerHTML = '';
    const allButton = createFilterButton('All', 'All', activeTag === 'All');
    filtersContainer.appendChild(allButton);
    tags.forEach((tag) => {
      const button = createFilterButton(tag, formatTag(tag), tag === activeTag);
      filtersContainer.appendChild(button);
    });
  };

  let currentTag = 'All';
  renderButtons(currentTag);

  filtersContainer.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-filter-tag]');
    if (!target) {
      return;
    }
    const tag = target.getAttribute('data-filter-tag');
    if (tag === currentTag) {
      return;
    }
    currentTag = tag;
    renderButtons(currentTag);
    const filtered = tag === 'All' ? papers : papers.filter((paper) => (paper.tags || []).includes(tag));
    renderPapers(filtered, libraryContainer);
  });
}

function createFilterButton(value, displayLabel, isActive) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'filter-button' + (isActive ? ' is-active' : '');
  button.textContent = displayLabel;
  button.setAttribute('data-filter-tag', value);
  button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  return button;
}

function capitalise(value) {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function formatVenue(venue) {
  if (!venue) {
    return '';
  }
  for (const { regex, short } of VENUE_PATTERNS) {
    if (regex.test(venue)) {
      return short;
    }
  }
  return venue;
}

function formatTag(tag) {
  return TAG_LABELS[tag] || tag;
}

function highlightAuthor(authors) {
  if (!authors) {
    return '';
  }
  const pattern = /(Jean[-\s]?Fran[çc]ois Ton\*?|JF Ton\*?|J\.?F\.? Ton\*?|Ton Jean[-\s]?Fran[çc]ois\*?|TON Jean-Francois\*?)/gi;
  return authors.replace(pattern, (match) => `<strong>${match}</strong>`);
}
