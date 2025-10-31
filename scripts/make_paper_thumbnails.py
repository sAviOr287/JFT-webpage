#!/usr/bin/env python3
"""Generate simple SVG thumbnails for each paper entry.

The utility reads ``data/papers.json`` and emits 16:9 SVG artwork into
``Images/papers`` using only the Python standard library. Palettes are selected
via a deterministic hash so thumbnails remain stable between runs—ideal for
GitHub Pages deployments.
"""
from __future__ import annotations

import hashlib
import json
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "papers.json"
OUTPUT_DIR = ROOT / "Images" / "papers"

PALETTES = [
    ("#5D7BFF", "#1C2340"),
    ("#58F7FF", "#123A6A"),
    ("#FF8EF6", "#391740"),
    ("#9AF87A", "#123C2A"),
    ("#FFC46B", "#42250C"),
]

TITLE_WRAP_WIDTH = 26


def slugify(text: str) -> str:
    """Generate a lowercase slug for filenames."""
    parts = ["".join(ch.lower() for ch in block if ch.isalnum()) for block in text.split()]
    return "-".join(part for part in parts if part)


def select_palette(identifier: str) -> tuple[str, str]:
    """Pick a colour pair based on a stable hash of ``identifier``."""
    digest = hashlib.sha1(identifier.encode("utf-8")).digest()
    index = digest[0] % len(PALETTES)
    return PALETTES[index]


def wrap_title(title: str) -> list[str]:
    wrapped = textwrap.wrap(title, TITLE_WRAP_WIDTH)
    return wrapped[:3] or [title]


def build_svg(title: str, subtitle: str, primary: str, secondary: str) -> str:
    lines = wrap_title(title)
    text_elements = []
    start_y = 120
    for offset, line in enumerate(lines):
        y = start_y + offset * 42
        text_elements.append(
            f'<text x="64" y="{y}" font-size="32" font-family="Raleway, Helvetica, Arial, sans-serif" '
            f'font-weight="600" fill="#ffffff">{line}</text>'
        )

    subtitle_svg = (
        f'<text x="64" y="{start_y + len(lines) * 42 + 24}" font-size="20" '
        f'font-family="Inter, Helvetica, Arial, sans-serif" fill="rgba(255,255,255,0.78)">{subtitle}</text>'
    )

    joined_text = "\n  ".join(text_elements)

    return (
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" '
        'preserveAspectRatio="xMidYMid slice">\n'
        "  <defs>\n"
        f"    <linearGradient id=\"gradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n"
        f"      <stop offset=\"0%\" stop-color=\"{primary}\" />\n"
        f"      <stop offset=\"100%\" stop-color=\"{secondary}\" />\n"
        "    </linearGradient>\n"
        "  </defs>\n"
        "  <rect width=\"1280\" height=\"720\" fill=\"url(#gradient)\" rx=\"32\" />\n"
        "  <rect x=\"32\" y=\"32\" width=\"1216\" height=\"656\" fill=\"rgba(0,0,0,0.18)\" rx=\"28\" />\n"
        f"  {joined_text}\n"
        f"  {subtitle_svg}\n"
        '</svg>\n'
    )


def main() -> None:
    if not DATA_FILE.exists():
        raise SystemExit(f"Missing papers metadata: {DATA_FILE}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with DATA_FILE.open(encoding="utf-8") as handle:
        papers = json.load(handle)

    for entry in papers:
        identifier = entry.get("id") or slugify(entry.get("title", "paper"))
        title = entry.get("title", "Untitled Work")
        tags = entry.get("tags", [])
        subtitle = ", ".join(tag.title() for tag in tags[:2]) or entry.get("venue", "Research")
        primary, secondary = select_palette(identifier)
        svg = build_svg(title, subtitle, primary, secondary)
        destination = OUTPUT_DIR / f"{identifier}.svg"
        destination.write_text(svg, encoding="utf-8")
        print(f"generated {destination.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
