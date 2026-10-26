# Editorial Redesign Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to execute inline; use a fresh read-only reviewer before publication.

**Goal:** Deliver the user's requested substantial visual upgrade and richer scroll choreography on the existing GitHub Pages demo.

**Architecture:** Preserve the current static multipage application, booking logic and demo cabinet. Give the public page a dedicated editorial stylesheet and a small progressive-enhancement motion module. No framework migration or scroll-hijacking.

**Requirements:** The approved concept and demo-only scope remain binding. The user explicitly requests direct redesign using [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) and [UI Skills](https://github.com/ibelick/ui-skills), more details and scroll animation, followed by the established publication workflow.

## Art direction

Warm ivory paper, dark olive, soft clay accents. Existing locally hosted Cyrillic Cormorant Garamond + Manrope; readable 16px body, expressive 90–140px desktop hero and 50–76px mobile type. Portrait-led asymmetrical opening, chapter markers, large personal statements, alternating quiet and dense sections, a generated still-life as an atmospheric interlude (explicitly not a real office photo). Native line illustrations and a circular motif unify the page. No invented reviews or achievements.

UI UX Pro Max's broad design-system suggestions were checked: the initial Liquid Glass and retried Neumorphism results do not fit this editorial browser surface. Use verified general typography/contrast/responsive guidance and the relevant scroll storytelling recommendations, rather than adopting those mismatched styles. UI Skills baseline and motion-performance rules are applied to the existing CSS/native stack. Its React-only library prescription is inapplicable to this dependency-free static app; its improve-ui audit-only workflow is not the execution workflow because the user explicitly requests implementation.

## Motion contract

- One owner: native CSS transforms/opacity, CSS scroll/view timelines where supported; IntersectionObserver for visibility and one-shot reveals.
- Scenes: immediate readable hero → short staggered title/portrait entrance → chapter and list reveals → atmospheric interlude → scroll-linked ornamental lines → calm, stable booking form.
- Feedback <=200ms; one-shot scene reveals 550–900ms. No continuous JS scroll handler, no rAF polling, no animated layout, blur or gradients, no cursor replacement.
- Offscreen and hidden-document loops pause. A visible motion toggle pauses decorative/scroll effects and makes all text readable. Reduced-motion renders the final static composition; no-JS leaves all content visible.
- Sticky chapter navigation is desktop-only; phone content stacks intentionally. Fixed UI respects safe-area insets and never covers the form.

## Tasks

- [x] Add a meaningful browser test that fails against the old page: pause/resume motion, scroll reveal, reduced-motion and no-JS readability. Old page failed because the motion control was absent.
- [x] Recompose the public page, introduce `site/assets/editorial.css` and `site/assets/motion.mjs`, retain booking selectors and behavior.
- [x] Integrate the generated atmospheric image if successful; self-host and document its role. Preserve the original portrait. The final JPEG is 319,088 bytes; the original generated PNG is preserved outside the repository.
- [x] Verify widths 320/390/768/1024/1440, desktop/mobile screenshots, normal/reduced/no-JS motion, keyboard and entire booking/admin flow.
- [x] Run unit and browser suites, module checks, link/asset crawl and clean diff verification. Seven unit and nine browser tests pass; all primary demo flows remain working. Screenshots cover normal, paused and reduced motion. Lazy image screenshots explicitly await decode, avoiding partial JPEG render captures.
- [ ] Fresh independent review, fix material findings, commit and push to the existing repository; wait for successful Pages deployment and verify live behavior.

## Independent review and final polish

Fresh read-only review found no Critical or Important issues. Its one minor finding was the 601–760px CTA breakpoint (enabled in the new stylesheet but positioned only by the old <=600px stylesheet). Because this is part of the user's expressly requested responsive visual polish, it is corrected before publication: a 700px regression first demonstrated `position: static`; the dedicated public stylesheet now owns fixed placement and the hidden transform through 760px. No other review issues were deferred. Scope decisions: existing professional facts remain sourced from the original research, demo authentication remains intentional, and deployment is verified separately after publication.

## Review focus

- Motion never leaves content invisible after pause, reduced-motion changes, rapid scrolling or observer failure.
- Responsive large headings/cards never create horizontal overflow.
- Progress and ornaments use compositor properties; no global scroll listener or persistent animation polling.
- Form, login and cabinet retain their working demo semantics and honest disclosures.
- Generated still-life is atmospheric imagery, never presented as the actual consulting room.

## Generated asset provenance

Built-in ImageGen; final project asset: `site/assets/images/olive-still-life.jpg`. No portrait editing. Exact generation prompt:

> Use case: photorealistic-natural. Asset type: editorial atmospheric still life for a high-end Russian psychologist's personal website, not a real office photo. A quiet close photograph of a single sculptural olive branch with delicate leaves in a handmade matte dark olive ceramic vase, resting on pale warm travertine beside softly folded unbleached linen. Warm side sunlight casts a large, beautiful delicate leaf shadow across an aged ivory plaster wall. Tiny real imperfections in ceramic, linen and stone. Minimal Mediterranean editorial photography, art-book quality, muted ivory, olive, honey light. Landscape composition, branch and vase on the RIGHT third; LEFT half mostly empty textured ivory wall with light and leaf shadows, suitable for placing website typography over it. Restrained, tactile, poetic, intimate, beautifully lit, natural camera capture, fine grain, no people, no text, no watermarks, no room furniture, no literal medical symbolism. Horizontal wide image.

The large-image motion exception is deliberately limited to this one below-fold still-life: native view-timeline translateY from -3% to +3%, desktop only, no layout animation or JS measurement; static fallback under pause or reduced motion. This creates depth while retaining the motion-performance rules.
