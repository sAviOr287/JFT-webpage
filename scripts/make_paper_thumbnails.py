#!/usr/bin/env python3
"""Generate simple SVG thumbnails for paper metadata."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from textwrap import wrap

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "papers.json"
OUTPUT_DIR = ROOT / "Images" / "papers"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PALETTE = [
    (0x00, 0x52, 0xCC),
    (0x22, 0xA0, 0x7B),
    (0x94, 0x5C, 0xFF),
    (0xFF, 0x7A, 0x59),
    (0xF6, 0xC6, 0x3D),
]

WIDTH, HEIGHT = 1280, 720
MARGIN = 72


def pick_colour(tags: list[str]) -> tuple[int, int, int]:
    """Pick a deterministic colour based on the first tag."""
    if not tags:
        return PALETTE[0]
    fingerprint = hashlib.sha1("|".join(tags).encode("utf-8")).hexdigest()
    index = int(fingerprint, 16) % len(PALETTE)
    return PALETTE[index]


def lighten(colour: tuple[int, int, int], factor: float = 0.3) -> tuple[int, int, int]:
    return tuple(int(channel + (255 - channel) * factor) for channel in colour)


def to_rgb(value: tuple[int, int, int]) -> str:
    return f"rgb({value[0]}, {value[1]}, {value[2]})"


def generate_svg(title: str, tags: list[str], out_path: Path) -> None:
    primary = pick_colour(tags)
    secondary = lighten(primary, 0.45)
    tertiary = lighten(primary, 0.75)

    wrapped_title = wrap(title, width=26)

    lines = []
    for idx, line in enumerate(wrapped_title[:3]):
        y = MARGIN + 140 + idx * 80
        lines.append(
            f'<text x="{MARGIN}" y="{y}" font-size="64" font-weight="700" fill="rgba(16,20,24,0.94)" font-family="Inter, \'Segoe UI\', sans-serif">{line}</text>'
        )

    tag_line = " · ".join(tags[:3])
    tag_svg = (
        f'<text x="{MARGIN}" y="{HEIGHT - MARGIN}" font-size="32" fill="rgba(16,20,24,0.72)" font-family="Inter, \'Segoe UI\', sans-serif">{tag_line}</text>'
        if tag_line
        else ""
    )

    svg = f"""
    <svg xmlns='http://www.w3.org/2000/svg' width='{WIDTH}' height='{HEIGHT}' viewBox='0 0 {WIDTH} {HEIGHT}'>
      <defs>
        <linearGradient id='grad' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='{to_rgb(lighten(primary, 0.05))}' />
          <stop offset='55%' stop-color='{to_rgb(secondary)}' />
          <stop offset='100%' stop-color='{to_rgb(tertiary)}' />
        </linearGradient>
      </defs>
      <rect width='{WIDTH}' height='{HEIGHT}' fill='url(#grad)' rx='48' ry='48' />
      <circle cx='{WIDTH - 320}' cy='{HEIGHT / 2}' r='180' fill='rgba(255,255,255,0.22)' />
      <circle cx='{WIDTH - 190}' cy='{HEIGHT / 2 + 140}' r='110' fill='rgba(255,255,255,0.35)' />
      {''.join(lines)}
      {tag_svg}
    </svg>
    """
    out_path.write_text(svg.strip() + "\n", encoding="utf-8")


def main() -> None:
    if not DATA_PATH.exists():
        raise SystemExit(f"Missing metadata file: {DATA_PATH}")

    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    for paper in payload.get("papers", []):
        if not paper.get("thumbnail", "").endswith(".svg"):
            continue
        target = ROOT / paper["thumbnail"]
        target.parent.mkdir(parents=True, exist_ok=True)
        generate_svg(paper["title"], paper.get("tags", []), target)
        print(f"Generated {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
