# Jean-François Ton — Research Website

This repository contains the source for the personal research website hosted on GitHub Pages at [https://savior287.github.io/JFT-webpage/](https://savior287.github.io/JFT-webpage/).

## Structure

- `index.html` — landing page with the latest highlights, research focus, and quick contact details.
- `works.html` — interactive research library with filters powered by `data/papers.json` and `js/papers.js`.
- `contact.html` — collaboration and speaking enquiries.
- `data/papers.json` — single source of truth for publication metadata.
- `css/` — modern component-based design system (`base.css`, `layout.css`, `theme.css`).
- `js/reveal.js` — accessibility-aware scroll animations.
- `js/papers.js` — renders publication cards and filter controls on demand.
- `scripts/make_paper_thumbnails.py` — utility to regenerate paper artwork.

## Updating publications

1. Edit `data/papers.json` and add or update an entry. Each object supports:
   - `id`: unique slug used for thumbnails.
   - `title`, `authors`, `venue`, `date`, and optional `display_date` or `summary`.
   - `tags`: controls the filters available on the Works page.
   - `thumbnail`: path to a `.svg` generated asset or custom image.
   - `links`: dictionary with keys such as `arxiv`, `pdf`, `code`, etc.
2. Run the thumbnail generator (optional but recommended when using SVG thumbnails):

   ```bash
   python3 scripts/make_paper_thumbnails.py
   ```

   The script creates branded 16:9 SVGs in `Images/papers/` for any entry referencing an SVG thumbnail path.
3. Commit the JSON and artwork changes; the homepage and Works page will update automatically because they read from the JSON file at runtime.

## Local preview

Serve the folder with any static file server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. GitHub Pages serves the same static assets without extra build steps.
