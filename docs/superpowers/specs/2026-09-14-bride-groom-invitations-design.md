# Bride and Groom Invitations — Design

## Goal

Publish two independent, guest-configurable wedding invitations: one for the bride's events and one for the groom's events, while retaining the existing visual language, RSVP workflow, cards, map treatment, music, scratch reveal, countdown, and footer.

## Entry points

- `bride.html` is the bride-side invitation.
- `groom.html` is the groom-side invitation.
- `bride-invite-builder.html` creates bride-side guest links.
- `groom-invite-builder.html` creates groom-side guest links.
- `index.html` redirects existing shared links to `bride.html` so no old recipient sees a stale design.

## Shared experience

Both invitation pages share `style.css`, the existing art assets, RSVP attendance form, scratch reveal, countdown, venue panel, event-card interactions, music control, and floral footer. The first screen changes from Rumi Darwaza to the supplied envelope gate. The historical `envelope.mp4` and its poster are restored into `assets/` from the repository's already-versioned media; the local replica directory contains no envelope asset.

The envelope title is side-specific: `Radhika & Raghav` for bride, `Raghav & Radhika` for groom.

## Content rules

Both pages remove the hero date line beneath the invitation sentence and display the agreed Radhika and Raghav family lines beneath their respective names. The groom page never renders a Blessings section. The bride page continues to allow Blessings to be turned off per guest link.

Bride events, in chronological order: Hawan (19 Nov), Mehendi (20 Nov afternoon), Engagement & Sangeet (20 Nov evening), Wedding (21 Nov).

Groom events, in chronological order: Haldi & Mehendi (18 Nov), Engagement & Sangeet (20 Nov), Wedding (21 Nov), Reception (25 Nov).

Cards never identify a bride or groom side. Wedding cards use Hotel Damson Plum; Reception cards use The Tivoli, Chattarpur. The supplied Google Maps short link is used for the visible map action.

Groom RSVP contains Sonia (9717194045); no groom Blessings page is shown.

## Guest links and builders

Each builder owns an exact event list for its corresponding page. It emits links using existing `e` and `b` query parameters. Selected event IDs determine the visible cards and countdown target. The bride builder keeps the Blessings selector; the groom builder omits it because that page has no blessings.

## Validation

Verify every new page locally at phone and desktop sizes, verify builders generate side-correct links, test event filtering and the bride `b=0` behavior, and confirm envelopes complete into the corresponding hero. Check the live GitHub Pages endpoints after push.
