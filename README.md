# Jean-François Ton · Research Portfolio

This repository powers the redesigned personal site for Jean-François Ton. The new build replaces the legacy
TEMPLATED theme with a bespoke, alignment-focused layout that highlights recent large language model work while keeping
archived causal and kernel research accessible.

## Project structure

- `index.html` – homepage with hero, research focus pillars, and scroll-reveal highlights sourced from the shared papers
  metadata.
- `works.html` – filterable publication catalogue that consumes the same metadata and degrades gracefully when
  JavaScript is disabled.
- `contact.html` – updated contact hub aligned with the current research scope.
- `data/papers.json` – single source of truth for paper metadata. Both the homepage and research catalogue render from
  this file.
- `css/base.css`, `css/layout.css`, `css/theme.css` – modern design system built with CSS Grid/Flexbox and custom reveal
  animations that honour `prefers-reduced-motion`.
- `js/papers.js` – loads `data/papers.json`, renders paper cards, and wires up filter controls.
- `js/reveal.js` – progressive enhancement for the Apple-style scroll reveals used across sections.
- `scripts/make_paper_thumbnails.py` – reproducible workflow for generating SVG thumbnails per paper entry.

## Updating papers

1. Edit `data/papers.json` to add or modify an entry. Each paper supports the following fields:
   - `id` – unique slug used for thumbnail filenames.
   - `title`, `authors`, `venue`, `date`, `summary` – primary metadata shown on cards.
   - `pdf`, `code` – optional outbound links.
   - `tags` – list of research areas used for filtering.
   - `image` – path to the thumbnail (see next section).
2. Run the thumbnail script to create or refresh the artwork:
   ```bash
   python3 scripts/make_paper_thumbnails.py
   ```
   SVGs are written to `Images/papers/` using a deterministic colour palette, making the workflow friendly for GitHub
   Pages deployments.
3. Commit the updated JSON and generated thumbnails. The homepage and Works page will update automatically on the next
   publish because they both read from the shared metadata file.

## Local development

The site is completely static. Open `index.html` in a browser or use a lightweight HTTP server for live reload while you
edit the HTML, CSS, or JavaScript assets. No build tooling is required.

## Deployment

The repository is structured for GitHub Pages (see `CNAME`). Push to the `main` branch and GitHub Pages will serve the
latest version at [https://savior287.github.io/JFT-webpage/](https://savior287.github.io/JFT-webpage/).
