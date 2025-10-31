(function () {
  const listContainers = document.querySelectorAll('[data-role="papers-list"]');

  if (!listContainers.length) {
    return;
  }

  const TAG_LABELS = {
    'llm': 'LLMs & Alignment',
    'post-training': 'Post-Training',
    'reward-modeling': 'Reward Modeling',
    'multi-agent': 'Multi-Agent Systems',
    'evaluation': 'Evaluation',
    'kernels': 'Kernel Methods',
    'causality': 'Causality',
    'conformal': 'Conformal Prediction'
  };

  function formatDate(isoDate) {
    try {
      return new Intl.DateTimeFormat('en', {
        month: 'short',
        year: 'numeric'
      }).format(new Date(isoDate));
    } catch (error) {
      return isoDate;
    }
  }

  function createTagList(tags) {
    if (!tags?.length) {
      return null;
    }

    const list = document.createElement('ul');
    list.className = 'tag-list';
    tags.forEach((tag) => {
      const item = document.createElement('li');
      item.textContent = TAG_LABELS[tag] || tag;
      list.appendChild(item);
    });
    return list;
  }

  function createCard(paper) {
    const article = document.createElement('article');
    article.className = 'paper-card';
    article.setAttribute('data-reveal', '');
    article.dataset.tags = (paper.tags || []).join(' ');

    const media = document.createElement('div');
    media.className = 'paper-card__media';
    const img = document.createElement('img');
    img.src = paper.image;
    img.alt = `${paper.title} thumbnail`;
    media.appendChild(img);

    const content = document.createElement('div');
    content.className = 'paper-card__content';

    const meta = document.createElement('div');
    meta.className = 'paper-card__meta';
    meta.textContent = `${paper.venue} • ${formatDate(paper.date)}`;

    const title = document.createElement('h3');
    title.className = 'paper-card__title';
    title.textContent = paper.title;

    const summary = document.createElement('p');
    summary.className = 'paper-card__summary';
    summary.textContent = paper.summary;

    const authorLine = document.createElement('p');
    authorLine.className = 'paper-card__meta';
    authorLine.textContent = paper.authors;

    const linkGroup = document.createElement('div');
    linkGroup.className = 'paper-card__links';

    if (paper.pdf) {
      const pdfLink = document.createElement('a');
      pdfLink.href = paper.pdf;
      pdfLink.target = '_blank';
      pdfLink.rel = 'noopener';
      pdfLink.textContent = 'Paper';
      linkGroup.appendChild(pdfLink);
    }

    if (paper.code) {
      const codeLink = document.createElement('a');
      codeLink.href = paper.code;
      codeLink.target = '_blank';
      codeLink.rel = 'noopener';
      codeLink.textContent = 'Code';
      linkGroup.appendChild(codeLink);
    }

    content.append(meta, title, summary, authorLine);
    const tagList = createTagList(paper.tags);
    if (tagList) {
      content.appendChild(tagList);
    }
    content.appendChild(linkGroup);

    article.append(media, content);
    return article;
  }

  function filterPapers(papers, filterTag) {
    if (!filterTag || filterTag === 'all') {
      return papers;
    }
    return papers.filter((paper) => paper.tags?.includes(filterTag));
  }

  function renderInto(container, papers, filterTag) {
    const limit = container.dataset.limit ? parseInt(container.dataset.limit, 10) : undefined;
    const view = container.dataset.view || 'all';
    let items = papers;

    if (view === 'latest' && typeof limit === 'number') {
      items = papers.slice(0, limit);
    }

    items = filterPapers(items, filterTag);

    container.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'section__description';
      empty.textContent = 'No papers available for this selection yet.';
      container.appendChild(empty);
      return;
    }

    items.forEach((paper, index) => {
      const card = createCard(paper);
      card.style.setProperty('--reveal-index', index.toString());
      container.appendChild(card);
    });

    window.JFT?.Reveal?.refresh(container);
  }

  function setupFilters(papers) {
    const filterBars = document.querySelectorAll('[data-role="papers-filter"]');
    if (!filterBars.length) {
      return;
    }

    const sortedTags = Array.from(
      papers.reduce((set, paper) => {
        paper.tags?.forEach((tag) => set.add(tag));
        return set;
      }, new Set())
    );

    filterBars.forEach((bar) => {
      const targetId = bar.dataset.target;
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }

      const makeChip = (tag, label) => {
        const button = document.createElement('button');
        button.className = 'filter-chip';
        button.type = 'button';
        button.dataset.filter = tag;
        button.textContent = label;
        return button;
      };

      const allChip = makeChip('all', 'All');
      allChip.classList.add('is-active');
      bar.appendChild(allChip);

      sortedTags.forEach((tag) => {
        const label = TAG_LABELS[tag] || tag;
        bar.appendChild(makeChip(tag, label));
      });

      bar.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-filter]');
        if (!button) {
          return;
        }

        const selected = button.dataset.filter;
        bar.querySelectorAll('button[data-filter]').forEach((chip) => {
          chip.classList.toggle('is-active', chip === button);
        });

        renderInto(target, papers, selected);
      });
    });
  }

  fetch('data/papers.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to load papers data');
      }
      return response.json();
    })
    .then((papers) => {
      const sorted = papers
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      listContainers.forEach((container) => {
        if (!container.id) {
          container.id = `papers-${Math.random().toString(36).slice(2, 8)}`;
        }
        renderInto(container, sorted, container.dataset.filter || 'all');
      });

      setupFilters(sorted);
    })
    .catch((error) => {
      listContainers.forEach((container) => {
        const message = document.createElement('p');
        message.className = 'section__description';
        message.textContent = 'Research updates are temporarily unavailable. Please try again later.';
        container.innerHTML = '';
        container.appendChild(message);
      });
      console.error(error);
    });
})();
