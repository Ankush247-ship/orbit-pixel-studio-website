# Orbit Pixel Studio — Website

Marketing website for Orbit Pixel Studio (digital solutions studio: websites,
AI, marketing, branding, SEO, content, lead generation).

## Project structure

```
/
├── index.html
├── about.html
├── services.html
├── portfolio.html
├── pricing.html
├── contact.html
├── css/
│   ├── style.css          (design system — colors, type, layout, components)
│   ├── responsive.css      (tablet ≤1024px, mobile ≤680px, small ≤400px)
│   └── animations.css      (keyframes + GSAP reveal states + fallback rules)
├── js/
│   ├── main.js              (Lenis smooth scroll, navbar scroll state, custom cursor, particles, footer year)
│   ├── navigation.js         (mobile menu open/close, active nav link — works with or without GSAP)
│   ├── animations.js        (GSAP timelines, ScrollTrigger reveals, fallback logic)
│   ├── contact.js            (enquiry form validation + WhatsApp handoff, contact.html only)
│   └── portfolio.js          (category filtering, portfolio.html only)
└── assets/
    └── logo/                (referenced by all pages — not included in this handoff)
```

**Not included in this handoff:** the `assets/` folder (logo PNGs, favicons)
— referenced by `<img>`/`<link rel="icon">` tags on every page but not part
of any upload so far. Drop your existing `assets/logo/` folder in alongside
these files and every image/icon reference will resolve.

## Pages

- **index.html** — home: hero, stats, services grid, why-us, process
  timeline, portfolio teaser, CTA
- **about.html** — mission, philosophy (Create/Innovate/Grow), team, CTA
- **services.html** — full service breakdown (SEO, social, leads, design,
  video, AI content, web dev, video shoot, ads)
- **portfolio.html** — filterable work grid by category
- **pricing.html** — individual service pricing + package tiers
- **contact.html** — enquiry form, direct contact methods, Google trust bar

## Technologies

- Plain HTML/CSS/JS — no build step, no npm, no framework
- [GSAP 3.12.5](https://cdnjs.com/libraries/gsap) + ScrollTrigger — scroll
  animations (loaded via cdnjs CDN)
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scrolling
  (loaded via unpkg CDN)
- Google Fonts (via CDN, referenced in `style.css`)

## How to run

No build tools required. Since the pages use relative paths (`css/`, `js/`,
`assets/`), open them through a local server rather than double-clicking the
file:

```bash
# from the project root
python3 -m http.server 8080
# then visit http://localhost:8080/index.html
```

Any static server works (VS Code "Live Server", `npx serve`, etc.).

## How to edit content

- Text, links, sections: edit directly in the relevant `.html` file — there's
  no templating layer.
- Global colors/spacing/typography: `css/style.css` (look for the `:root`
  variables near the top).
- Breakpoint-specific layout tweaks: `css/responsive.css`.
- To add a new scroll-reveal element anywhere: add `data-reveal` (fade+rise),
  `data-reveal-fade` (fade only), or `data-reveal-scale` (scale+fade) to the
  element. For a staggered group (e.g. a grid of cards), wrap the group in
  `data-reveal-group` and mark each child `data-reveal-item`. No JS changes
  needed — `animations.js` picks these up automatically via
  `gsap.utils.toArray`.
- The enquiry form (`contact.html`) doesn't post to a backend — `contact.js`
  composes a WhatsApp message from the field values and opens
  `wa.me/919529008060` with it prefilled. Change `WHATSAPP_NUMBER` in
  `contact.js` to update the destination.

## External dependencies

| Library | Source | Purpose | Required for content to display? |
|---|---|---|---|
| GSAP 3.12.5 | cdnjs.cloudflare.com | Scroll animations, timelines | No |
| ScrollTrigger | cdnjs.cloudflare.com | Scroll-triggered reveals | No |
| Lenis 1.1.13 | unpkg.com | Smooth scrolling feel | No |
| Google Fonts | fonts.googleapis.com | Typography | No (falls back to system fonts) |

None of these are required for the site to be readable and usable — see
below.

## Animation system & GSAP fallback behavior

Content visibility **never** depends on GSAP loading successfully. This is
enforced at three independent layers, present on all six pages:

1. **CSS default state (`css/animations.css`)** — `[data-reveal]` and related
   attributes are `opacity: 1; transform: none` by default. They are only
   switched to a pre-animation hidden state (`opacity: 0`) under the
   `.gsap-anim-ready` class on `<html>` — and that class is only ever added
   by JS after GSAP + ScrollTrigger are confirmed loaded.

2. **`js/animations.js` guard** — checks `window.gsap` and
   `window.ScrollTrigger` exist before doing anything. If either is missing,
   or `gsap.registerPlugin(ScrollTrigger)` throws, it immediately adds a
   `.reveal-fallback` class (forces everything visible) and exits — the
   animation code never runs. The actual animation setup is also wrapped in
   its own `try/catch`, so a runtime error mid-animation (e.g. a missing
   element) falls back to visible instead of leaving anything stuck hidden.

3. **Inline watchdog (bottom of every page, independent of `animations.js`)**
   — runs on `window.load` + 2.5s, and unconditionally again at 6s no matter
   what. It checks whether GSAP/ScrollTrigger loaded and whether any reveal
   element is still at `opacity: 0`; if so, it forces `.reveal-fallback`.
   This catches CDN failures, slow networks, ad-blockers, or any script
   elsewhere on the page throwing before `animations.js` even runs.

Separately, `navigation.js` (mobile menu) and `portfolio.js` (category
filter) each carry their own `if (window.gsap) {...} else {...}` branch, so
those interactions work identically with or without GSAP loaded.

**Net effect:** with GSAP CDN blocked, ScrollTrigger failing, JS disabled
entirely, or any script error, all text, cards, images, buttons, and sections
render fully visible immediately — animation is a pure enhancement on top.

## Other fixes made in this pass

- Footer heading tags changed from `<h4>` to `<h3>` on `index.html`,
  `services.html`, and `pricing.html` so the heading hierarchy (h1 → h2 → h3)
  is correct sitewide, matching `about.html`/`contact.html`/`portfolio.html`.
- Added a visually-hidden `<h2 class="sr-only">Our Services</h2>` on
  `services.html` — the service list previously jumped from `<h1>` straight
  to `<h3>` with no `<h2>` in between.
- Fixed a broken Google review link (`writereview?placeid=` with an empty
  place ID) on every page that had it — replaced with a working Google Maps
  search link for "Orbit Pixel Studio" until you have the real Place ID.
- Footer logo images now use `loading="lazy"` for consistency with the other
  pages (navbar and hero logos stay eager since they're above the fold).

## Deployment

The site is static — deploy by uploading the files as-is to any static host
(InfinityFree, Netlify, Vercel, GitHub Pages, etc.), preserving the
`css/`, `js/`, `assets/` folder structure so the relative paths in the HTML
resolve. No environment variables or server-side processing required.
