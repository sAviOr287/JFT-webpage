# Repository Guidelines

## Project Structure & Module Organization
The site is a static build served from the repository root. Landing and section pages (`index.html`, `works.html`, `contact.html`, `blog*.html`) sit at the top level for GitHub Pages compatibility. Styling is under `css/` (`base.css`, `layout.css`, `theme.css`), behaviour lives in `js/` (`papers.js` powers the Works filters, `reveal.js` handles scroll reveals). Data-driven content stays in `data/papers.json`, while generated thumbnails belong in `Images/papers/`. Supporting media (`PDFs/`, `fonts/`, `Images/`) and helper utilities (`scripts/make_paper_thumbnails.py`) round out the structure.

## Build, Test, and Development Commands
Run a local preview from the repo root with `python3 -m http.server 8000`, then browse to `http://localhost:8000` to verify layouts. Regenerate publication artwork whenever `thumbnail` entries change via `python3 scripts/make_paper_thumbnails.py`, which writes SVGs into `Images/papers/`. Use `python3 -m json.tool data/papers.json` before committing to confirm the metadata remains valid JSON.

## Coding Style & Naming Conventions
Keep HTML and CSS indented with two spaces; reuse existing BEM-style class names (`hero__headline`, `site-header__inner`) instead of inventing new patterns. JavaScript files prefer descriptive camelCase functions and early returns. Publication IDs, asset filenames, and URL slugs follow kebab-case (`coordinated-rlhf-multi-agent`). Python helper scripts should follow standard PEP 8 spacing.

## Testing Guidelines
Because the project ships static assets, rely on manual verification in modern browsers after each change. Confirm dynamic sections by checking the console for `papers.js` errors and toggling filters on `works.html`. When editing `data/papers.json`, ensure every entry includes `id`, `title`, `tags`, and at least one link; missing fields surface as broken cards. For accessibility changes, test keyboard navigation through the header and hero calls to action.

## Commit & Pull Request Guidelines
Commits should use short, imperative summaries (`Add multi-agent paper`, `Fix hero spacing`) mirroring the existing history and group related asset updates together. Include regenerated SVGs and JSON edits in the same commit so reviewers can follow the data-to-asset link. Pull requests describe the user-facing impact, list modified pages, and provide before/after screenshots or localhost URLs when visual changes occur. Reference relevant issues or TODOs and call out any manual steps required post-merge (e.g., rerunning the thumbnail script).
