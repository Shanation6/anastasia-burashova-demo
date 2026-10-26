# Psychologist GitHub Pages Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish the approved Russian psychologist presentation and working demo booking/admin flow on GitHub Pages.

**Architecture:** Dependency-free multipage HTML/CSS/ES modules under `site/`, deployed by GitHub Actions. Browser-local synthetic demonstration records and a clearly disclosed session gate replace the originally proposed backend, as requested by the user. No network form submissions or real client records.

**Tech Stack:** HTML, CSS, JavaScript, Node built-in test runner, Python local HTTP preview, GitHub Pages Actions.

**Spec:** [Approved design and demo amendment](../specs/2026-10-26-psychologist-site-design.md).

## Global Constraints

- Russian, responsive editorial design: cream, forest green, real portrait, verifiable professional facts.
- Demo only: no guaranteed therapeutic outcome, invented reviews, real booking delivery or secure-backend claims.
- All paths relative to support the GitHub repository subpath.
- Separate `admin/login.html` and `admin/index.html`; long demo passphrase openly described as demo.
- No credentials from GitHub or real personal data in source or logs.

## Review Focus

- GitHub Pages repository subpath: links and assets resolve when mounted below root.
- Browser storage unavailable or corrupted: clear recovery, no false saved-success.
- Form contact validation: blanks, oversized input and missing consent rejected; no real contacts requested.
- Stored malicious markup: records rendered with textContent, never user-supplied HTML.
- Demo session expired / exit: cabinet redirects to login; scope explicitly discloses lack of real security.

### Task 1: Booking and demo state

**Files:** `package.json`, `tests/demo.test.mjs`, `site/assets/demo-store.mjs`.
**Interfaces:** `validateBooking(input)` returns normalized booking or throws; `createDemoStore(storage)` exposes list/add/update/remove/reset; demo state in localStorage, session flag in sessionStorage.

- [ ] Write failing Node tests for required consent, contact trimming and limits, safe synthetic initial records, persistence, status change, deletion, corrupted and denied storage.
- [ ] Run `node --test`; observe missing implementation failure.
- [ ] Implement store/validation without external dependencies; run full suite.

### Task 2: Public website and admin demo

**Files:** `site/index.html`, `site/assets/styles.css`, `site/assets/main.mjs`, `site/assets/admin.mjs`, `site/admin/login.html`, `site/admin/index.html`, `site/privacy.html`, `site/consent.html`, images/fonts and licenses.
**Interfaces:** UI consumes Task 1 exports; forms use native labelled fields; status messages use live regions; FAQ native details; deletion uses native dialog.

- [ ] Download and inspect authentic portrait; self-host licensed Cyrillic Cormorant Garamond and Manrope fonts.
- [ ] Build approved public story, formats/pricing, source-linked reviews, FAQ and demo form.
- [ ] Build separate demo login, synthetic list, search/filter/status/delete/reset/logout states.
- [ ] Verify in browser: desktop, phone, keyboard, reduced motion, invalid form and full booking→cabinet path; no page overflow or console errors.

### Task 3: Repository and publication

**Files:** `.github/workflows/pages.yml`, `.gitignore`, `README.md`, execution notes.

- [ ] Add Pages deployment of `site/`, document demo login, sources, limitations and local preview.
- [ ] Run Node suite, module syntax checks and local relative-link/asset crawl under a repository subpath.
- [ ] Commit verified source, obtain fresh independent review, address material findings.
- [ ] Create a new public GitHub repository using the existing authenticated account; push and enable GitHub Pages Actions.
- [ ] Observe deployment success and fetch the final live URL. Return live site, admin demo and repository links.

## Execution notes

- User approved the concept and explicitly requested implementation and GitHub publication; execute inline without another approval round.
- New empty project folder: initialize its own repository, no existing branch or source needs worktree isolation.
- Original server/security requirements intentionally superseded by the user's demo-only GitHub Pages instruction.
