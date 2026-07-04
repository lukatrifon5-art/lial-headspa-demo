# Lia L Head Spa — Sitewide Visual Refresh

## Goal

Make the site "10x better" sitewide, with equal intensity across all customer-facing pages, without discarding the identity that's already been built and approved across many prior iterations.

## Scope

**In scope:** `index.html`, `despre.html`, `ce-este-head-spa.html`, `pachete.html`, `contact.html`.

**Out of scope:** `admin.html`, `404.html`, `confidentialitate.html` — utility/legal surfaces, not brand-forward.

## Token system (mostly unchanged)

The existing tokens are already a distinctive, deliberate choice (warm ink/cream/gold/moss, not a generic AI-cliché palette) and stay as-is:

- Color: `--ink #17140f`, `--ink-soft #2a251c`, `--cream #FAF7F0`, `--stone #EDE7DA`, `--gold #B8933F`, `--gold-soft #C9A768`, `--gold-light #E7D6A8`, `--moss #4A5D3A`, `--moss-soft #6E7F5C`, `--moss-pale #E4E9DC`, `--white #FFFFFF`.
- Type: Cormorant Garamond (display, serif) + Poppins (body, sans) — kept.
- Layout: existing alternating cream / ink / moss-pale section rhythm — kept.

No new colors or fonts are introduced. The refresh spends its effort on one signature element and a rigor pass, not a palette swap.

## Signature element: the "ritual thread"

A thin, animated gold line (SVG, `stroke: var(--gold)`), styled like a single strand catching light — a literal, specific nod to what a head spa actually does (touch, hair, scalp), not a generic wave/blob divider.

- Used at section-transition points (roughly 4-5 per page), not on every section.
- On scroll into view, the line draws itself in via `stroke-dashoffset` animation, ease-out, 600-800ms, once per page load per divider (not re-triggered on scroll-back).
- Respects `prefers-reduced-motion`: renders fully drawn/static, no animation, when the user has that preference set.
- On the homepage hero specifically, it gets a slightly more elaborate treatment (tracing near/around the hero content) as the one deliberate "big" moment on the site. Interior pages get the simpler divider version only — the boldness is spent in one place.
- Implemented as a small reusable inline SVG snippet + a shared CSS class/animation, not duplicated markup logic, so all 5 pages stay visually and behaviorally consistent.

## Rigor pass (sitewide, all 5 in-scope pages)

Concrete fixes, not redesign:

- **Contrast**: verify gold-on-cream and gold-on-ink text meets 4.5:1; gold stays restricted to large/display text (as it already mostly is), never small body copy.
- **Touch targets**: nav links, burger menu, buttons, and form inputs ≥44×44px on mobile.
- **Motion timing**: unify all micro-interactions to the existing `--ease` token, 150-300ms for simple transitions, ≤400ms for complex ones.
- **Reduced motion**: confirm reveal-on-scroll, magnetic buttons, and the new ritual-thread all check `prefers-reduced-motion`.
- **Stagger**: card grids (benefits, packages) get a 30-50ms stagger on scroll-reveal entrance instead of firing all at once.
- **Forms**: booking form on `contact.html` — confirm visible labels, error message placement directly below the relevant field, and focus moves to the first invalid field on a failed submit.

## Testing

Playwright-verified per the project's existing pattern: visually check each of the 5 pages at mobile (375px) and desktop widths, confirm the ritual-thread animates once and respects reduced-motion, and re-test the booking form's error states after the forms rigor pass.

## Out of scope / explicitly not doing

- No new color palette or fonts.
- No changes to `admin.html`, `404.html`, `confidentialitate.html`.
- No reintroduction of the custom cursor (explicitly disliked and removed earlier).
- No Telegram integration (explicitly deferred by the client earlier).
