#!/usr/bin/env python3
"""
Generate responsive AVIF + WebP derivatives for every image under assets/img.

Originals are never modified. Derivatives land in assets/img/opt/ mirroring the
source folder structure, named <stem>-<width>.<ext>.

Also writes assets/img/opt/manifest.json mapping each source path to its
intrinsic dimensions and the widths that were actually generated, so the HTML
can carry explicit width/height (no layout shift) and an accurate srcset.

Re-run this after adding new board photos:

    python tools/optimize-images.py

Add --force to rebuild derivatives that already exist.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "assets" / "img"
OUT_DIR = SRC_DIR / "opt"
MANIFEST = OUT_DIR / "manifest.json"

WIDTHS = (400, 800, 1200, 1600)
SOURCE_EXTS = {".jpg", ".jpeg", ".png"}

# Screenshots of schematics and PCB layouts carry fine 1px lines that lossy
# codecs smear, so PNG sources get a higher quality floor than photographs.
QUALITY = {
    "photo": {"avif": 55, "webp": 78},
    "graphic": {"avif": 68, "webp": 88},
}

# Pillow's AVIF encoder: 0 is slowest/best, 10 is fastest. 6 keeps a full run
# to a few minutes without a meaningful size penalty.
AVIF_SPEED = 6


def classify(img: Image.Image, path: Path) -> str:
    """PNG sources are almost always screenshots here; JPEGs are camera photos."""
    return "graphic" if path.suffix.lower() == ".png" else "photo"


def iter_sources() -> list[Path]:
    files = [
        p
        for p in sorted(SRC_DIR.rglob("*"))
        if p.is_file()
        and p.suffix.lower() in SOURCE_EXTS
        and OUT_DIR not in p.parents
    ]
    return files


def process(path: Path, force: bool) -> dict | None:
    rel = path.relative_to(SRC_DIR)
    try:
        with Image.open(path) as opened:
            im = ImageOps.exif_transpose(opened)
            src_w, src_h = im.size
            kind = classify(im, path)
            q = QUALITY[kind]

            # Flatten alpha onto white only when the codec would otherwise carry
            # a channel the source never used.
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "A" in im.getbands() else "RGB")

            out_base = OUT_DIR / rel.parent
            out_base.mkdir(parents=True, exist_ok=True)

            generated = []
            for w in WIDTHS:
                # Never upscale — a 400px source has no 1600px variant.
                if w > src_w and w != min(WIDTHS):
                    continue
                target_w = min(w, src_w)
                target_h = max(1, round(src_h * target_w / src_w))
                resized = im.resize((target_w, target_h), Image.LANCZOS)

                for fmt, ext in (("AVIF", "avif"), ("WEBP", "webp")):
                    dest = out_base / f"{rel.stem}-{w}.{ext}"
                    if dest.exists() and not force:
                        continue
                    params = {"quality": q[ext]}
                    if fmt == "AVIF":
                        params["speed"] = AVIF_SPEED
                    else:
                        params["method"] = 6
                    resized.save(dest, fmt, **params)

                generated.append(w)

            return {
                "src": rel.as_posix(),
                "width": src_w,
                "height": src_h,
                "kind": kind,
                "variants": generated,
            }
    except Exception as exc:  # noqa: BLE001 - report and keep going
        print(f"  !! {rel.as_posix()}: {exc}", file=sys.stderr)
        return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="rebuild existing derivatives")
    args = ap.parse_args()

    sources = iter_sources()
    if not sources:
        print("No source images found.", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Processing {len(sources)} images -> {OUT_DIR.relative_to(ROOT).as_posix()}")

    manifest = {}
    for i, path in enumerate(sources, 1):
        rel = path.relative_to(SRC_DIR).as_posix()
        print(f"[{i:>3}/{len(sources)}] {rel}")
        entry = process(path, args.force)
        if entry:
            manifest[rel] = entry

    MANIFEST.write_text(json.dumps(manifest, indent=1, sort_keys=True), encoding="utf-8")

    src_bytes = sum(p.stat().st_size for p in sources)
    out_bytes = sum(p.stat().st_size for p in OUT_DIR.rglob("*") if p.is_file())
    print(
        f"\nDone. {len(manifest)} images. "
        f"Originals {src_bytes / 1048576:.1f} MB -> derivatives {out_bytes / 1048576:.1f} MB"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
