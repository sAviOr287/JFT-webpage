#!/usr/bin/env python3
"""Mirror data/papers.json into works.html for offline loading."""

from __future__ import annotations

import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "papers.json"
WORKS_PATH = ROOT / "works.html"
SCRIPT_ID = 'papers-data'


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    payload = json.dumps(data, ensure_ascii=False, indent=2)

    script_block = (
        f'<script id="{SCRIPT_ID}" type="application/json">\n'
        f"{payload}\n"
        "</script>\n"
    )

    html = WORKS_PATH.read_text(encoding="utf-8")
    pattern = re.compile(
        r'<script id="papers-data" type="application/json">.*?</script>\n',
        flags=re.DOTALL,
    )

    if pattern.search(html):
        updated = pattern.sub(script_block, html)
    else:
        insertion_point = "</footer>\n\n"
        if insertion_point not in html:
            raise SystemExit("Could not locate footer insertion point in works.html")
        updated = html.replace(
            insertion_point,
            f"{insertion_point}{script_block}",
            1,
        )

    WORKS_PATH.write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    main()
