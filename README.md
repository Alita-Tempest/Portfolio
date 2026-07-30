# Portfolio — alita-tempest.github.io/Portfolio

Static site. No framework, no bundler, no package manager. Deploying is `git push`.

## Layout

```
index.html              home page — hero, work, profile, experience, education, capabilities, contact
projects/*.html         generated case studies (do not hand-edit — see below)
assets/css/board.css    the entire design system, one file
assets/js/board.js      all behaviour, one file, no dependencies
assets/fonts/           self-hosted variable woff2 subsets (100 KB total)
assets/img/             original photos and captures — the source of truth
assets/img/opt/         generated AVIF + WebP derivatives at 400/800/1200/1600w
tools/                  the two generators, plus their content data
```

## Editing content

**Project case studies are generated.** Editing `projects/*.html` directly will be
overwritten. Edit `tools/projects.json` instead, then:

```bash
python tools/build-projects.py
```

That rewrites all 13 case-study pages and the redirect stubs that keep the old
URLs (`Capstone1.html`, `blog.html`, …) working.

**The home page is hand-written.** Edit `index.html` directly.

## Adding images

Drop originals anywhere under `assets/img/`, then:

```bash
python tools/optimize-images.py
```

This generates AVIF and WebP at four widths into `assets/img/opt/`, never
touches the originals, and refreshes `assets/img/opt/manifest.json` — which is
where the generators read intrinsic dimensions from, so every `<img>` gets
correct `width`/`height` and nothing shifts as the page loads.

Add `--force` to rebuild derivatives that already exist.

To reference new images in a case study, use the path relative to `assets/img`
(e.g. `project/Capstone2/3.png`) in `tools/projects.json` and re-run the page
generator.

Gallery alt text and captions live in `tools/captions.json`, keyed relative to
`assets/img/project/` (e.g. `Capstone2/3.png`).

## Previewing

```bash
python tools/serve.py 8080
```

Then open <http://localhost:8080>. This is `http.server` plus a
`Cache-Control: no-store` header — without it browsers will keep serving a
cached `board.css` straight through a forced reload and you end up looking at
the previous stylesheet.

GitHub Pages serves this under `/Portfolio/`, so the speculation-rules prefetch
block in `index.html` only matches on the live site — harmless locally.

## Asset versioning

`board.css` and `board.js` are referenced with a `?v=<hash>` token, where the
hash is the first 8 hex digits of the file's SHA-256. `build-projects.py` stamps
it into the generated pages *and* rewrites it in `index.html`, so:

**Run `python tools/build-projects.py` after editing CSS or JS**, even if you
did not touch any content. Otherwise the version token goes stale and returning
visitors keep the old stylesheet. The rewrite is idempotent — tokens are
replaced, never appended.

## Moving to a custom domain

GitHub Pages supports custom domains on the **free** plan, with a free
auto-renewing Let's Encrypt certificate. The only cost is registering the domain
itself — GitHub is not a registrar.

1. Register a domain anywhere (Namecheap, Cloudflare, Porkbun, …).
2. At the registrar's DNS, add **either**:
   - **apex** (`example.com`) — four `A` records to `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; optionally the four
     matching `AAAA` records for IPv6; **or**
   - **subdomain** (`www.example.com`) — one `CNAME` to
     `alita-tempest.github.io`.
3. Repo **Settings → Pages → Custom domain**, enter it and save. That commits a
   `CNAME` file to the repo root. Then tick **Enforce HTTPS** once the
   certificate finishes provisioning (usually minutes, sometimes up to 24 h).

**Then update three things**, because the site currently lives under a
`/Portfolio/` sub-path and a custom domain serves from the root:

| Where | Change |
|---|---|
| `tools/build-projects.py` | `SITE = "https://alita-tempest.github.io/Portfolio"` → your domain |
| `index.html` | `<link rel="canonical">` and the two `og:` URL/image tags |
| `index.html` | speculation rules `"href_matches": "/Portfolio/projects/*"` → `"/projects/*"` |

Re-run `python tools/build-projects.py` afterwards. Every other path on the site
is relative, so nothing else needs touching.

## Outstanding

- `assets/img/placeholder-board.svg` stands in for AgroSense rev 3, the micro:bit
  programmer and the PFR controller until real board photography exists.
- The GA4 snippet in `index.html` is commented out pending a measurement ID.
- `assets/icons/` is no longer referenced by any page — kept in case the logos
  are wanted later.

## Notes

- Three themes (`silkscreen` / `copper` / `substrate`) are driven entirely by
  custom properties on `:root[data-layer]`. Adding a fourth means adding one
  block of tokens in §2 of `board.css` and one button in the nav.
- Scroll reveals use CSS `animation-timeline: view()` behind an `@supports`
  check, with an IntersectionObserver fallback for Firefox. Content is visible
  in both paths, and in neither (there is a `<noscript>` guard).
- All motion is gated on `prefers-reduced-motion` in both CSS and JS.
