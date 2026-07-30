# Outstanding items

Updated 30 Jul 2026. Nothing is blocking a deploy.

---

## Settled

- **AgroSense rev 3 artwork** — done. All four copper layers plus both 3D renders
  are on the case study, sourced from `D:\AgroSense Node rev 3`.
- **micro:bit USB-host programmer** and **Robotics controller board (PFR)** keep
  the placeholder **permanently**. Both are Dletabotix work, so the artwork is the
  company's. Each page now states that explicitly rather than promising
  photography that was never coming.
- **Certificate links** — checked, all 8 working.
- **Contact form** — live, Web3Forms key `3cc71d6d…`.
- **No custom domain.** The site stays at `alita-tempest.github.io/Portfolio`;
  canonical URLs, OG tags and the prefetch path are already correct for it.
- **No firmware / source links** on the ARIA case study.
- **Unreferenced files removed** — 21 orphaned images, 138 of their derivatives,
  and `assets/icons/` (26 files). All were tracked in git, so recoverable with
  `git restore` if any turn out to be wanted.

### The rev-3 revision question, answered

The board photos staged out of the ARIA figures folder were **byte-identical
duplicates** of the AgroSense 2.0 photos already on that page:

| Staged file | Identical to |
|---|---|
| `assembled.png` | `Capstone2/7.png` |
| `before-assembly.png` | `Capstone2/6.png` |
| `power-rails.png` | `Capstone2/8.png` |

They were rev 2, not rev 3, so they were removed rather than mislabelled. The two
composite layer plots (`top-bottom.png`, `inner-layers.png`) went too, superseded
by the per-layer rev-3 exports.

---

## Open, if you want them

- [ ] **ARIA is described as "Ongoing"**, following your CV. Change once the
      project is submitted.
- [ ] **Hero portrait.** `About.jpg` is a 3000 × 4000 phone photo. It works, but a
      shot of you at the bench with a board would suit the site better than a
      plain headshot.

---

## Worth knowing

- **Send yourself a test message** through the contact form once deployed. Free
  tier is 250 submissions a month, delivered to the address you registered with
  Web3Forms.
- **Reduced motion** is gated in both CSS and JS, but I could not toggle the OS
  setting end to end.
- **Cross-document view transitions** (a card morphing into the case-study hero)
  need Chrome or Safari. Firefox navigates normally, by design.
- **Run `python tools/build-projects.py` after editing `board.css` or
  `board.js`**, even with no content change — it refreshes the `?v=`
  cache-busting token. Skip it and returning visitors keep the old stylesheet.
- **`python tools/optimize-images.py` also prunes nothing** — it only adds. If you
  delete a source image, delete its derivatives under `assets/img/opt/` too, or
  re-run it after removing them so the manifest stays accurate.
