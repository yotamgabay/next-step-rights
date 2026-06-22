# Product

## Register

product

## Users

Limb amputees in Israel (and the people helping them) trying to understand and
claim the rights, benefits and allowances they're entitled to. They arrive
under stress, often unfamiliar with the bureaucracy, frequently on mobile, and
may rely on assistive technology. Hebrew-first, RTL.

## Product Purpose

A single, clear home ("הצעד הבא") where an amputee can discover which rights
apply to their situation — by topic and by cause of amputation — and get plain-
language guidance from a digital assistant. Success is a user understanding what
they're owed and how to claim it without legal jargon. The site provides
information only; it is not legal or medical advice.

## Brand Personality

Trustworthy, warm, plain-spoken. Calm and supportive, never clinical or
salesy. Three words: dependable, human, clear.

## Anti-references

Government-portal coldness; insurance-form density; anything that feels like
marketing/SaaS slop (eyebrow kickers, identical icon-card walls, decorative
gradients, side-stripe accent cards, ghost-card border+soft-shadow combos).

## Design Principles

- Accessibility is the product, not a layer. A rights portal for disabled users
  must clear WCAG AA at minimum (AAA where it's free).
- Plain language over completeness. Say the next step, not the whole law.
- Honest affordances. Nothing should look interactive unless it is.
- One system, applied consistently. Use the tokens in `src/theme.ts`; don't
  introduce one-off colors or off-scale sizes.

## Accessibility & Inclusion

Target WCAG 2.1 AA (AAA where easy). Body and placeholder text ≥4.5:1; visible
keyboard focus (global `:focus-visible`); skip-to-content link; 44px touch
targets; `prefers-reduced-motion` respected. RTL throughout.
