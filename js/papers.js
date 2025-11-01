const filtersContainer = document.querySelector('[data-papers-filters]');
const libraryContainer = document.querySelector('[data-papers-target="library"]');
const emptyMessage = libraryContainer?.querySelector('[data-paper-empty]') ?? null;

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

const VENUE_PATTERNS = [
  { pattern: /arXiv|preprint/i, label: 'Preprint' },
  { pattern: /NeurIPS|Neural Information Processing Systems/i, label: 'NeurIPS' },
  { pattern: /ICLR|Learning Representations/i, label: 'ICLR' },
  { pattern: /ICML|International Conference on Machine Learning/i, label: 'ICML' },
  { pattern: /AISTATS|Artificial Intelligence and Statistics/i, label: 'AISTATS' },
  { pattern: /AAAI|Association for the Advancement of Artificial Intelligence/i, label: 'AAAI' },
  { pattern: /NAACL|North American Chapter of the Association for Computational Linguistics/i, label: 'NAACL' },
  { pattern: /SIGIR/i, label: 'SIGIR' },
  { pattern: /JMLR|Journal of Machine Learning Research/i, label: 'JMLR' },
  { pattern: /Journal of Spatial Statistics/i, label: 'Journal of Spatial Statistics' },
  { pattern: /Patent/i, label: 'Patent' },
];

const CATEGORY_CONFIG = [
  { id: 'large-language-models', title: 'Large Language Models', tags: ['LLM Alignment'] },
  { id: 'responsible-ai', title: 'Responsible AI', tags: ['Responsible AI'] },
  { id: 'meta-learning', title: 'Meta Learning', tags: ['Meta Learning'] },
  { id: 'efficient-learning', title: 'Efficient Learning', tags: ['Efficient Methods', 'Kernel Methods', 'Bayesian Inference'] },
];

const normaliseName = (text = '') =>
  text
    .replace(/JF\s+Ton/gi, 'Jean-François Ton')
    .replace(/Jean[-\s]?Francois Ton/gi, 'Jean-François Ton')
    .replace(/TON Jean-Francois/gi, 'Jean-François Ton');

const renderAuthors = (element, authorsText = '') => {
  const clean = normaliseName(authorsText);
  if (!clean) {
    element.textContent = '';
    return;
  }

  const pattern = /(Jean-François Ton\*?)/gi;
  let lastIndex = 0;
  let match;
  let hasMatch = false;

  while ((match = pattern.exec(clean)) !== null) {
    if (match.index > lastIndex) {
      element.append(document.createTextNode(clean.slice(lastIndex, match.index)));
    }
    const strong = document.createElement('strong');
    strong.textContent = match[0].replace(/Jean-François/i, 'Jean-François');
    element.append(strong);
    lastIndex = match.index + match[0].length;
    hasMatch = true;
  }

  if (lastIndex < clean.length) {
    element.append(document.createTextNode(clean.slice(lastIndex)));
  }

  if (!hasMatch) {
    element.textContent = clean;
  }
};

const extractArxivId = (venue = '') => {
  const patterns = [
    /arXiv(?:\s+preprint)?\s+arXiv:(\d{4}\.\d{4,5}(?:v\d+)?)/i,
    /arXiv:(\d{4}\.\d{4,5}(?:v\d+)?)/i,
  ];
  for (const pattern of patterns) {
    const match = venue.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

const normaliseArxivLink = (link) => {
  if (!link) {
    return null;
  }
  if (/^https?:\/\//i.test(link)) {
    return link;
  }
  if (/^\d{4}\.\d{4,5}(?:v\d+)?$/.test(link)) {
    return `https://arxiv.org/abs/${link}`;
  }
  return `https://arxiv.org/abs/${link.replace(/^arXiv:/i, '')}`;
};

const getPrimaryLink = (paper) => {
  if (paper.links?.arxiv) {
    return normaliseArxivLink(paper.links.arxiv);
  }
  const venueId = extractArxivId(paper.venue || '');
  if (venueId) {
    return `https://arxiv.org/abs/${venueId}`;
  }
  if (paper.links?.pdf && paper.links.pdf.includes('arxiv.org')) {
    return paper.links.pdf;
  }
  if (paper.links?.scholar) {
    return paper.links.scholar;
  }
  return null;
};

const formatBadgeLabel = (paper) => paper.display_date || (paper.date ? String(new Date(paper.date).getFullYear()) : '');

const formatVenue = (paper) => {
  if (paper.links?.arxiv || /arXiv|preprint/i.test(paper.venue || '')) {
    return 'Preprint';
  }

  const venueText = (paper.venue || '').trim();
  if (!venueText) {
    return '';
  }

  for (const { pattern, label } of VENUE_PATTERNS) {
    if (pattern.test(venueText)) {
      return label;
    }
  }

  return venueText
    .replace(/\s+/g, ' ')
    .replace(/\s*\(.+?\)\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const formatVenueTag = (paper, label) => {
  const resolvedLabel = (label ?? formatVenue(paper) ?? '').trim();
  if (!resolvedLabel) {
    return null;
  }

  const extractYear = (value) => {
    if (!value) {
      return '';
    }
    const match = String(value).match(/\d{4}/);
    return match ? match[0] : '';
  };

  const displayYear = extractYear(paper.display_date) || extractYear(paper.date);
  if (!displayYear) {
    return resolvedLabel;
  }

  return `${resolvedLabel} \u2019${displayYear.slice(-2)}`;
};

const buildPaperItem = (paper) => {
  const link = getPrimaryLink(paper);
  if (!link) {
    return null;
  }

  const item = document.createElement('li');
  item.className = 'timeline__item reveal-on-scroll';
  item.dataset.paper = '';
  item.dataset.tags = (paper.tags || []).join('|');
  if (paper.date) {
    item.dataset.date = paper.date;
  }

  const badge = document.createElement('div');
  badge.className = 'timeline__badge timeline__badge--paper';
  badge.textContent = formatBadgeLabel(paper);

  const panel = document.createElement('a');
  panel.className = 'timeline__panel timeline__panel--link paper-panel';
  panel.href = link;
  panel.target = '_blank';
  panel.rel = 'noopener';

  const venueLabel = formatVenue(paper);
  const venueTag = formatVenueTag(paper, venueLabel);

  if (venueTag) {
    const venuePill = document.createElement('span');
    const tagSlug = venueLabel ? venueLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'generic';
    venuePill.className = `paper-panel__tag paper-panel__tag--${tagSlug}`;
    venuePill.textContent = venueTag;
    panel.appendChild(venuePill);
  }

  const header = document.createElement('header');
  header.className = 'timeline__header';

  const title = document.createElement('h3');
  title.textContent = paper.title;
  header.appendChild(title);

  const authors = document.createElement('p');
  authors.className = 'paper-panel__authors';
  renderAuthors(authors, paper.authors || '');

  panel.append(header, authors);
  item.append(badge, panel);

  return item;
};

const buildCategorySection = (category, papers) => {
  const section = document.createElement('section');
  section.className = 'timeline-section papers-section';
  section.setAttribute('data-papers-group', '');
  section.setAttribute('aria-labelledby', `papers-${category.id}`);

  const heading = document.createElement('h3');
  heading.className = 'papers-group__title';
  heading.id = `papers-${category.id}`;
  heading.textContent = category.title;

  const list = document.createElement('ol');
  list.className = 'timeline timeline--papers';

  papers.forEach((paper) => {
    const item = buildPaperItem(paper);
    if (item) {
      list.appendChild(item);
    }
  });

  if (!list.children.length) {
    return null;
  }

  section.append(heading, list);
  return section;
};

const dedupePapers = (papers = []) => {
  const seen = new Set();
  return papers.filter((paper) => {
    if (!paper.id) {
      return true;
    }
    if (seen.has(paper.id)) {
      return false;
    }
    seen.add(paper.id);
    return true;
  });
};

const groupPapers = (papers) =>
  CATEGORY_CONFIG.map((category) => {
    const entries = papers
      .filter((paper) => (paper.tags || []).some((tag) => category.tags.includes(tag)))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return { category, entries };
  }).filter((group) => group.entries.length);

const applyReveal = () => {
  if (libraryContainer && typeof window.__applyReveal === 'function') {
    window.__applyReveal(libraryContainer);
  }
};

const hydrateFilters = () => {
  const items = Array.from(libraryContainer.querySelectorAll('[data-paper]')).map((element, index) => {
    const tags = (element.dataset.tags || '')
      .split('|')
      .map((tag) => tag.trim())
      .filter(Boolean);
    element.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    return { element, tags };
  });

  const formatTag = (tag) => TAG_LABELS[tag] || tag;

  const updateVisibility = (selectedTag = 'All') => {
    let visibleCount = 0;
    items.forEach((paper) => {
      const shouldShow = selectedTag === 'All' || paper.tags.includes(selectedTag);
      paper.element.hidden = !shouldShow;
      if (shouldShow) {
        paper.element.style.transitionDelay = `${Math.min(visibleCount * 90, 360)}ms`;
        visibleCount += 1;
      }
    });

    const groups = Array.from(libraryContainer.querySelectorAll('[data-papers-group]'));
    groups.forEach((group) => {
      const hasVisible = group.querySelector('[data-paper]:not([hidden])');
      group.hidden = !hasVisible;
    });

    if (emptyMessage) {
      emptyMessage.hidden = visibleCount !== 0;
    }

    applyReveal();
  };

  let currentTag = 'All';

  if (filtersContainer) {
    const allTags = new Set();
    items.forEach((paper) => paper.tags.forEach((tag) => allTags.add(tag)));
    const sortedTags = Array.from(allTags).sort((a, b) => a.localeCompare(b));

    if (sortedTags.length) {
      const renderButtons = () => {
        filtersContainer.innerHTML = '';
        const makeButton = (value, label, isActive) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'filter-button' + (isActive ? ' is-active' : '');
          button.textContent = label;
          button.setAttribute('data-filter-tag', value);
          button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          return button;
        };

        filtersContainer.appendChild(makeButton('All', 'All', currentTag === 'All'));
        sortedTags.forEach((tag) => {
          filtersContainer.appendChild(makeButton(tag, formatTag(tag), currentTag === tag));
        });
      };

      filtersContainer.removeAttribute('hidden');
      filtersContainer.removeAttribute('aria-hidden');
      renderButtons();

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
        renderButtons();
        updateVisibility(currentTag);
      });
    } else {
      filtersContainer.setAttribute('hidden', 'true');
      filtersContainer.setAttribute('aria-hidden', 'true');
    }
  }

  updateVisibility(currentTag);
};

const renderPapers = (groups) => {
  libraryContainer.querySelectorAll('[data-papers-group]').forEach((element) => element.remove());
  const fragment = document.createDocumentFragment();
  groups.forEach(({ category, entries }) => {
    const section = buildCategorySection(category, entries);
    if (section) {
      fragment.appendChild(section);
    }
  });
  libraryContainer.appendChild(fragment);
};

const loadAndRender = async () => {
  if (!libraryContainer) {
    return;
  }

  const readInlineData = () => {
    const element = document.getElementById('papers-data');
    if (!element) {
      return null;
    }
    try {
      return JSON.parse(element.textContent);
    } catch (error) {
      console.error('Unable to parse inline publications JSON.', error);
      return null;
    }
  };

  const processPayload = (payload) => {
    const papers = dedupePapers(payload?.papers || []);
    const groups = groupPapers(papers);
    if (!groups.length) {
      if (emptyMessage) {
        emptyMessage.hidden = false;
        emptyMessage.textContent = 'Publications are coming soon.';
      }
      return false;
    }
    renderPapers(groups);
    hydrateFilters();
    return true;
  };

  const inlineData = readInlineData();
  if (inlineData && processPayload(inlineData)) {
    return;
  }

  try {
    const response = await fetch('data/papers.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load publications (${response.status})`);
    }
    const payload = await response.json();
    if (processPayload(payload)) {
      return;
    }
    if (emptyMessage) {
      emptyMessage.hidden = false;
      emptyMessage.textContent = 'Publications are coming soon.';
    }
  } catch (error) {
    if (inlineData && processPayload(inlineData)) {
      return;
    }
    if (emptyMessage) {
      emptyMessage.hidden = false;
      emptyMessage.textContent =
        window.location.protocol === 'file:'
          ? 'Unable to load publications while viewing from the file system. Please serve the site locally or check your connection.'
          : 'Unable to load publications right now.';
    }
    console.error(error);
  }
};

loadAndRender();
