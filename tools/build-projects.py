#!/usr/bin/env python3
"""
Generate the project case-study pages from tools/projects.json.

The site itself has no build step — this writes plain HTML into projects/ which
is what gets served. Re-run it after editing projects.json or captions.json:

    python tools/build-projects.py

Image markup is derived from assets/img/opt/manifest.json so every <img> gets
correct intrinsic width/height (no layout shift) and an accurate srcset.
"""

from __future__ import annotations

import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(__file__).resolve().parent / "projects.json"
CAPTIONS = Path(__file__).resolve().parent / "captions.json"
MANIFEST = ROOT / "assets" / "img" / "opt" / "manifest.json"
OUT = ROOT / "projects"

SITE = "https://alita-tempest.github.io/Portfolio"

manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
captions = json.loads(CAPTIONS.read_text(encoding="utf-8")) if CAPTIONS.exists() else {}

# Content hashes for the two assets that change often. Stamping them into the
# URL means a returning visitor never gets a stale stylesheet, and — more
# immediately — browsers stop serving a cached board.css during development,
# which they will happily do straight through a forced reload.
CSS_PATH = ROOT / "assets" / "css" / "board.css"
JS_PATH = ROOT / "assets" / "js" / "board.js"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


CSS_V = digest(CSS_PATH)
JS_V = digest(JS_PATH)


def e(s: str) -> str:
    return html.escape(s, quote=True)


# Anchors to another site that do not already declare a target. Prose in
# projects.json is hand-written, so this guarantees every outbound link opens
# in a new tab whether or not the author remembered.
_EXTERNAL = re.compile(r'<a\s+(?![^>]*\btarget=)([^>]*href="https?://[^"]*"[^>]*?)\s*>')


def externalise(markup: str) -> str:
    return _EXTERNAL.sub(r'<a \1 target="_blank" rel="noopener">', markup)


def caption_for(src: str) -> dict:
    """captions.json is keyed relative to assets/img/project; paths here are
    relative to assets/img. Try both so either convention resolves."""
    return captions.get(src) or captions.get(src.removeprefix("project/")) or {}


def picture(src: str, alt: str, sizes: str, *, eager: bool = False, cls: str = "") -> str:
    """Build a <picture> from a source path relative to assets/img."""
    if src.endswith(".svg"):
        return (
            f'<img{f" class={cls}" if cls else ""} src="../assets/img/{src}" alt="{e(alt)}" '
            f'width="640" height="400" {"" if eager else "loading=\"lazy\" "}decoding="async">'
        )

    entry = manifest.get(src)
    if not entry:
        raise SystemExit(f"! {src} is not in the image manifest — run tools/optimize-images.py")

    stem = src.rsplit(".", 1)[0]
    widths = entry["variants"]

    def srcset(ext: str) -> str:
        return ", ".join(f"../assets/img/opt/{stem}-{w}.{ext} {w}w" for w in widths)

    fallback_w = 800 if 800 in widths else widths[0]
    loading = "" if eager else 'loading="lazy" '
    priority = ' fetchpriority="high"' if eager else ""

    return (
        f"<picture>"
        f'<source type="image/avif" srcset="{srcset("avif")}" sizes="{sizes}">'
        f'<source type="image/webp" srcset="{srcset("webp")}" sizes="{sizes}">'
        f'<img{f" class={cls}" if cls else ""} src="../assets/img/opt/{stem}-{fallback_w}.webp" '
        f'alt="{e(alt)}" width="{entry["width"]}" height="{entry["height"]}" '
        f"{loading}decoding=\"async\"{priority}>"
        f"</picture>"
    )


def full_src(src: str) -> str:
    """Largest available derivative, for the lightbox."""
    if src.endswith(".svg"):
        return f"../assets/img/{src}"
    entry = manifest[src]
    stem = src.rsplit(".", 1)[0]
    return f"../assets/img/opt/{stem}-{max(entry['variants'])}.webp"


NAV = """  <header class="nav" data-stuck="true">
    <a class="nav__mark" href="../index.html">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="6.5" y="6.5" width="11" height="11" stroke="currentColor" stroke-width="1.4"/>
        <circle cx="9.2" cy="9.2" r="1" fill="currentColor"/>
        <g stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <path d="M6.5 10H2.5M6.5 14H2.5M17.5 10h4M17.5 14h4M10 6.5v-4M14 6.5v-4M10 17.5v4M14 17.5v4"/>
        </g>
      </svg>
      <b>KVST</b><span>/&nbsp;hardware</span>
    </a>
    <!-- Lives in the fixed nav rather than the hero, so it stays reachable the
         whole way down a case study instead of scrolling away with the header. -->
    <a class="nav__back" href="../index.html#work">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13 8H3m4-4-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>All work</span>
    </a>
    <nav aria-label="Sections">
      <ul class="nav__links">
        <li><a class="nav__link" href="../index.html#work">Work</a></li>
        <li><a class="nav__link" href="../index.html#about">Profile</a></li>
        <li><a class="nav__link" href="../index.html#experience">Experience</a></li>
        <li><a class="nav__link" href="../index.html#education">Education</a></li>
        <li><a class="nav__link" href="../index.html#skills">Capabilities</a></li>
        <li><a class="nav__link" href="../index.html#contact">Contact</a></li>
      </ul>
    </nav>
    <div class="layers" role="group" aria-labelledby="layers-label">
      <span class="layers__name" id="layers-label">Layer</span>
      <button class="layers__btn" data-layer="silkscreen" aria-pressed="false" title="Silkscreen layer (light)">
        <span class="visually-hidden">Silkscreen layer</span>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" stroke="currentColor" stroke-width="1.3"/><path d="M5 8h6M5 10.5h3.5M5 5.5h6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </button>
      <button class="layers__btn" data-layer="copper" aria-pressed="true" title="Copper layer (dark)">
        <span class="visually-hidden">Copper layer</span>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 5h4l2.5 2.5H14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 11h5l2-2h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11.5" cy="5" r="1.4" fill="currentColor"/></svg>
      </button>
      <button class="layers__btn" data-layer="substrate" aria-pressed="false" title="Bare substrate (FR-4)">
        <span class="visually-hidden">Substrate layer</span>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.5" y="4.5" width="11" height="7" stroke="currentColor" stroke-width="1.3"/><path d="M2.5 7h11M2.5 9h11" stroke="currentColor" stroke-width="1" stroke-opacity=".6"/></svg>
      </button>
    </div>
    <button class="nav__menu" aria-expanded="false" aria-label="Menu">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="16" height="16"><path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
  </header>
"""

LIGHTBOX = """  <dialog class="lightbox" aria-label="Image viewer">
    <div class="lightbox__inner">
      <!-- No src attribute: an empty one makes the browser request the page itself.
           board.js sets it when the viewer opens. -->
      <img alt="">
      <div class="lightbox__bar">
        <button class="lightbox__btn" data-lb="prev" aria-label="Previous image">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3 5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="lightbox__btn" data-lb="next" aria-label="Next image">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 3 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <span class="lightbox__cap"></span>
        <button class="lightbox__btn" data-lb="close" aria-label="Close">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>
  </dialog>
"""

ARROW = ('<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">'
         '<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" '
         'stroke-linecap="round" stroke-linejoin="round"/></svg>')


def render(p: dict, index: dict) -> str:
    parts: list[str] = []

    # ---- head ----------------------------------------------------------
    parts.append(f"""<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{e(p['title'])} — K. V. Siva Teja</title>
  <meta name="description" content="{e(p['lede'])}">
  <link rel="canonical" href="{SITE}/projects/{p['slug']}.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{e(p['title'])} — K. V. Siva Teja">
  <meta property="og:description" content="{e(p['lede'])}">
  <meta name="theme-color" content="#0d1512" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f7f8f7" media="(prefers-color-scheme: light)">
  <link rel="icon" href="../favicon.png" type="image/png">
  <link rel="preload" href="../assets/fonts/spacegrotesk-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../assets/css/board.css?v={CSS_V}">
  <noscript>
    <style>.reveal {{ opacity: 1 !important; translate: none !important; }}</style>
  </noscript>
  <script>
    try {{
      var l = localStorage.getItem('layer');
      if (!l) l = matchMedia('(prefers-color-scheme: light)').matches ? 'silkscreen' : 'copper';
      document.documentElement.dataset.layer = l;
    }} catch (e) {{ }}
  </script>
</head>

<body>
  <a class="skip-link" href="#case">Skip to content</a>
  <div class="substrate" aria-hidden="true"></div>
  <div class="reticle" aria-hidden="true"></div>
{NAV}
  <main id="case">
    <section class="case-hero">
      <div class="shell">
        <p class="mono" style="margin-block-end:var(--gap-s)">{p['ref']} &nbsp;·&nbsp; {e(p['kicker'])}</p>
        <h1 class="case-hero__title">{e(p['title'])}</h1>
        <p class="case-hero__lede">{e(p['lede'])}</p>
        <dl class="case-hero__meta">""")

    for k, v in p["meta"].items():
        parts.append(f"          <div><dt>{e(k)}</dt><dd>{v}</dd></div>")

    parts.append("""        </dl>
      </div>
    </section>
""")

    # ---- hero figure ---------------------------------------------------
    hero = p["hero"]
    parts.append(f"""    <div class="shell">
      <figure class="case-figure case-figure--hero fids">
        <span class="fid" aria-hidden="true"></span>
        {picture(hero['src'], hero['alt'], '(min-width:82rem) 1160px, 92vw', eager=True)}
        <figcaption><span>{e(hero['caption'])}</span><span>{p['ref']}</span></figcaption>
      </figure>
    </div>
""")

    # ---- body + aside --------------------------------------------------
    parts.append('    <div class="shell case-body">\n      <div>')
    for sec in p["body"]:
        parts.append(f"        <section>\n          <h2>{e(sec['h'])}</h2>")
        for para in sec["p"]:
            parts.append(f"          <p>{para}</p>")
        parts.append("        </section>")
    parts.append("      </div>\n")

    parts.append('      <aside class="case-aside">')
    if p.get("metrics"):
        parts.append('        <div class="metrics">')
        for m in p["metrics"]:
            sub = f"<small>{e(m['s'])}</small>" if m.get("s") else ""
            parts.append(
                f'          <div class="metric"><b>{m["v"]}</b><span>{e(m["l"])}</span>{sub}</div>'
            )
        parts.append("        </div>")

    if p.get("specs"):
        parts.append('        <table class="specs">')
        parts.append(f'          <caption>{e(p.get("specs_caption", "Build specification"))}</caption>')
        parts.append("          <tbody>")
        for k, v in p["specs"]:
            parts.append(f"            <tr><th scope=\"row\">{e(k)}</th><td>{v}</td></tr>")
        parts.append("          </tbody>\n        </table>")
    parts.append("      </aside>\n    </div>\n")

    # ---- gallery -------------------------------------------------------
    # The hero is already shown full width above; don't repeat it below.
    gallery = [g for g in p.get("gallery", []) if g != hero["src"]]
    if gallery:
        parts.append(f"""    <section class="section">
      <div class="shell">
        <header class="legend">
          <span class="legend__id">{p['ref']}</span>
          <h2 class="legend__title">Gallery</h2>
          <span class="legend__rule"></span>
          <span class="legend__meta">{len(gallery)} images</span>
        </header>
        <div class="gallery">""")
        for src in gallery:
            cap = caption_for(src)
            alt = cap.get("alt") or f"{p['title']} — image"
            label = cap.get("caption") or "View"
            parts.append(
                f'          <figure class="shot" role="button" tabindex="0" '
                f'data-full="{full_src(src)}" data-caption="{e(label)}">'
                f'{picture(src, alt, "(min-width:82rem) 270px, (min-width:46rem) 30vw, 92vw")}'
                f"<figcaption>{e(label)}</figcaption></figure>"
            )
        parts.append("        </div>\n      </div>\n    </section>\n")

    # ---- pager ---------------------------------------------------------
    prev, nxt = index.get(p.get("prev")), index.get(p.get("next"))
    parts.append('    <div class="shell">\n      <nav class="pager" aria-label="More projects">')
    if prev:
        parts.append(
            f'        <a href="{prev["slug"]}.html"><span class="mono">← Previous</span>'
            f'<b>{e(prev["title"])}</b></a>'
        )
    if nxt:
        parts.append(
            f'        <a href="{nxt["slug"]}.html"><span class="mono">Next →</span>'
            f'<b>{e(nxt["title"])}</b></a>'
        )
    parts.append("      </nav>")

    parts.append(f"""      <footer class="footer">
        <div class="footer__grid">
          <p>Want the full design files or a walkthrough of the decisions on this board?
            <a href="../index.html#contact">Get in touch</a>.</p>
          <p class="mono">© <span data-year>2026</span> K. V. Siva Teja</p>
        </div>
      </footer>
    </div>
  </main>
{LIGHTBOX}
  <script src="../assets/js/board.js?v={JS_V}" defer></script>
</body>

</html>
""")
    return "\n".join(parts)


def main() -> int:
    projects = json.loads(DATA.read_text(encoding="utf-8"))
    index = {p["slug"]: p for p in projects}
    OUT.mkdir(exist_ok=True)

    for p in projects:
        dest = OUT / f"{p['slug']}.html"
        dest.write_text(externalise(render(p, index)), encoding="utf-8")
        print(f"  wrote {dest.relative_to(ROOT).as_posix()}")

    # Meta-refresh stubs so the old URLs keep working.
    redirects = {
        "Capstone1.html": "agrosense-1.html",
        "Capstone2.html": "agrosense-2.html",
        "32bit_ALU.html": "alu-32bit.html",
        "Arduino12V.html": "arduino-nano-12v.html",
        "Cassie.html": "network-rover.html",
        "NightVision.html": "night-vision-rover.html",
        "Bluetooth.html": "bluetooth-rover.html",
        "Home_AUtomation.html": "home-automation.html",
        "Vacuum.html": "vacuum-robot.html",
        "blog.html": "colophon.html",
        # merged into the combined Dletabotix case study
        "microbit-programmer.html": "dletabotix.html",
        "pfr-controller.html": "dletabotix.html",
    }
    for old, new in redirects.items():
        (OUT / old).write_text(
            f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved — K. V. Siva Teja</title>
<link rel="canonical" href="{SITE}/projects/{new}">
<meta http-equiv="refresh" content="0; url={new}">
<meta name="robots" content="noindex">
</head>
<body>
<p>This page moved to <a href="{new}">{new}</a>.</p>
</body>
</html>
""",
            encoding="utf-8",
        )
    print(f"  wrote {len(redirects)} redirect stubs")

    # index.html's project cards are hand-written while these pages are
    # generated, so the two can drift — a hero swapped here leaves the card on
    # the home page still showing the old image. Flag it rather than let it ship.
    idx_src = (ROOT / "index.html").read_text(encoding="utf-8")
    drift = []
    for m in re.finditer(
        r'<article class="card[^"]*"[^>]*data-slug="([^"]+)"(.*?)</article>', idx_src, re.S
    ):
        slug, block = m.group(1), m.group(2)
        img = re.search(r'<img[^>]*src="([^"]+)"', block)
        if not img or slug not in index:
            continue
        card = img.group(1)
        card_src = (
            re.sub(r"-\d+\.(?:webp|avif)$", "", card.split("opt/")[1])
            if "opt/" in card
            else card.split("assets/img/")[-1].rsplit(".", 1)[0]
        )
        hero = index[slug]["hero"]["src"].rsplit(".", 1)[0]
        if card_src != hero:
            drift.append(f"{slug}: card shows {card_src}, case study hero is {hero}")
    if drift:
        print("\n  ! home-page card thumbnails out of sync with case-study heroes:")
        for d in drift:
            print(f"      {d}")
    else:
        print("  card thumbnails match case-study heroes")

    # index.html is hand-written, so patch its asset URLs in place. Idempotent:
    # an existing ?v= token is replaced rather than appended to.
    idx = ROOT / "index.html"
    src = idx.read_text(encoding="utf-8")
    # Use a lambda replacement rather than a \1 backreference: the version is a
    # hex digest, so "\1" followed by hex would be parsed as a longer group number.
    patched = re.sub(
        r"assets/css/board\.css(?:\?v=[0-9a-f]+)?",
        lambda _m: f"assets/css/board.css?v={CSS_V}",
        src,
    )
    patched = re.sub(
        r"assets/js/board\.js(?:\?v=[0-9a-f]+)?",
        lambda _m: f"assets/js/board.js?v={JS_V}",
        patched,
    )
    if patched != src:
        idx.write_text(patched, encoding="utf-8")
        print(f"  stamped index.html  css=?v={CSS_V}  js=?v={JS_V}")
    print(f"\nDone. {len(projects)} case studies.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
