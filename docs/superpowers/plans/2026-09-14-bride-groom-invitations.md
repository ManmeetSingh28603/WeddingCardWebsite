# Bride and Groom Invitations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver two side-specific, guest-configurable invitations with envelope gates, accurate events, maps, RSVP, and builders.

**Architecture:** Use shared CSS and common invitation JavaScript, with page-level side configuration selected by an HTML data attribute. Keep two static invitation entry points and two static builders so guest links remain simple GitHub Pages URLs.

**Tech Stack:** HTML, CSS, vanilla JavaScript, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-14-bride-groom-invitations-design.md`

## Global Constraints

- Use the already-versioned envelope source media and publish it under `assets/`.
- Do not retain a Rumi Darwaza opening on either invitation.
- Do not show a Blessings section or Blessings selector on groom pages.
- Do not add bride-side/groom-side labels to event cards.
- Preserve the existing Apps Script RSVP field schema.

---

### Task 1: Shared side-aware invitation content

**Files:**
- Modify: `script.js`, `index.html`, `style.css`
- Create: `bride.html`, `groom.html`, `assets/video/envelope.mp4`, `assets/hero/envelope_poster.webp`

**Interfaces:**
- Consumes: `document.documentElement.dataset.inviteSide`
- Produces: `SIDE_CONFIGS.bride` and `SIDE_CONFIGS.groom` selected before rendering content.

- [ ] Restore the envelope media from commit `9cf8a6f` and replace the current gate source in the shared invitation markup.
- [ ] Add page-specific side configuration for name order, event records, RSVP people, venue labels, and blessing availability.
- [ ] Render family detail blocks under both names and suppress the hero date line.
- [ ] Create `bride.html` and `groom.html` with their corresponding `data-invite-side` values; make `index.html` redirect to the bride page.
- [ ] Run a local static server and check each page loads without JavaScript errors.
- [ ] Commit the shared side-aware invitation implementation.

### Task 2: Bride and groom link builders

**Files:**
- Modify: `invite-builder.html`
- Create: `bride-invite-builder.html`, `groom-invite-builder.html`

**Interfaces:**
- Consumes: page URL and side-specific event ID list.
- Produces: links to `bride.html?e=...&b=...` or `groom.html?e=...`.

- [ ] Create the bride builder with Hawan, Mehendi, Engagement & Sangeet, Wedding, and Blessings toggle.
- [ ] Create the groom builder with Haldi & Mehendi, Engagement & Sangeet, Wedding, Reception, and no Blessings control.
- [ ] Convert the legacy builder page into a redirect to the bride builder for compatibility.
- [ ] Test a partial-event link from each builder and assert the correct card count and side-specific heading.
- [ ] Commit the builders.

### Task 3: Visual and live verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: deployed GitHub Pages URLs.
- Produces: documented direct links to both invitations and builders.

- [ ] Verify the envelope-to-hero transition, RSVP contacts, map labels, event titles, cards, and blessings behavior on 390px and desktop viewports.
- [ ] Update the README with all four direct URLs and builder usage.
- [ ] Push `main`, wait for the GitHub Pages build, and request each live endpoint.
- [ ] Commit the documentation and deployment-ready changes.
