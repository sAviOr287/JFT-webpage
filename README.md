# Jean-François Ton — Academic Website

This repository contains the static assets for the personal academic website published at [https://savior287.github.io/JFT-webpage/](https://savior287.github.io/JFT-webpage/).

## Structure

- `index.html` — homepage with bio, research interests, recent publications, and contact links.
- `works.html` — curated publication lists grouped by research theme; edit the HTML directly to add or reorder entries.
- `contact.html` — single source for email and professional networks.
- `blog*.html`, `misc.html`, `poetry.html` — placeholder pages preserved for future writing archives.
- `css/site.css` — lightweight styling shared across the site.

## Editing content

- Update text directly in the relevant HTML file; each section is intentionally short and separated by descriptive headings.
- Publications appear as simple `<li>` items inside `.publication-list`. Duplicate one of the existing list items and edit the title, venue, and authors.
- Add new research interests by copying a `<li class="tag">…</li>` element inside the `tag-list`.
- Navigation links reference section IDs (e.g., `#about`, `#contact`); keep these IDs unchanged unless you also update the menu.

## Local preview

Serve the folder with any static file server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. GitHub Pages serves the same static assets without extra build steps.
