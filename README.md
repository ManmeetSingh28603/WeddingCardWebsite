# Radhika & Raghav — wedding invitation

A static site: plain HTML, CSS and JavaScript, no build step and no
dependencies.

```
index.html           the invitation
invite-builder.html  writes the per-guest links; nothing on the site links to it
style.css            all styling and animation
script.js            CONFIG at the top, then behaviour
assets/              everything the site actually loads
apps-script/         the RSVP form's backend — not served, deployed to Google
```

Everything the site loads lives in `assets/`, all of it referenced. The source
media those were cut from (`Radhika.png`, `background.mp4`, `envelope.mp4`,
`video1–4.mp4`, `bg song.mp3` and the WhatsApp originals) has been deleted: it
was 42 MB the site never loaded, and every asset derived from it is already
here. If an asset ever needs re-cutting at a different size or crop, the
original has to come back from the client first.

Root-level `*.mp4` is gitignored, so working files dropped in the folder —
`herofinal.mp4`, `rumi gate wedding.mp4` — stay out of the repo. Only the copy
under `assets/` is served.

`wedding-details.txt` is a working document for the client — what is on record
and what is still missing. It is gitignored: it carries the families' mobile
numbers and this repo is public.

## Viewing it

Double-click `index.html`. Everything works from the filesystem; the only
degradation is that the flying grains during the scratch use fallback colours
instead of ones sampled from the foil, because a browser will not let a page
read pixels back from a `file://` image.

To serve it properly instead: `npx serve .`

## Changing the content

**Everything the invitation says lives in the `CONFIG` object at the top of
`script.js`.** Nothing below it needs touching to change a name, a time or a
number. Anything not yet supplied is marked `MISSING` in a comment there.

Two conventions worth knowing:

- An **empty string** removes a line rather than printing a blank. That is how
  the hashtag, every hero line and each card's dress code are handled — a gap
  where a line should be reads as a fault, a shorter card does not.
- A contact with an empty `tel` renders **without** call and WhatsApp buttons,
  since a `tel:+` link with no number leads nowhere.
- `CONFIG.lineage` holds both families' `GD/O` and `S/O` lines and **nothing
  renders them**. They were printed on the formal invitation card, which was
  removed on request; the strings are kept because deleting them would lose
  the only record of both sides' names in the project.
- **Blessings and RSVP are the bride's side only.** The groom's-side lists
  were never supplied and the placeholder pages came out on request; add a
  `groom` array back to either and restore its `page()` / `list()` call.

## The RSVP form

Under the phone numbers there is the **"Confirm Your
Presence"** form: name, members attending, contact number, then arrival and
departure (date, how they are travelling, and an optional ticket for each),
and an Aadhaar upload for hotel check-in.

Enough questions to read as a wall, so the fields are grouped under
**Arrival / Departure / For hotel check-in** rules.

There is no "Function attending" question. There was one; it was dropped on
request. Bringing it back means four edits that have to land together — the
select in `index.html`, a `functions` list in `CONFIG.attendance`, the
validation and payload field in `script.js`, and the column in `Code.gs`.

Three details in that form that are easy to undo by accident:

- **Tickets are optional and conditional.** They are hidden until a travel
  mode that *has* a ticket is chosen (`CONFIG.attendance.ticketlessModes`
  lists the ones that do not — Car). Switching to Car after attaching one
  **discards** it: a file the guest can no longer see or remove must not be
  sent on their behalf.
- **Three attachments now, so there is a combined cap.** base64 inflates each
  by a third, so three at the per-file limit would be ~40 MB on the wire —
  past what Apps Script accepts and hopeless on mobile data long before that.
  `maxTotalMB` catches the case where every file is individually legal.
- **The sheet re-heads itself.** The columns changed when travel was added,
  so `Code.gs` compares row 1 against `HEADERS` and, on a mismatch, renames
  the old tab and starts a clean one. Without that, new rows would land under
  old headings and nobody would notice until the planner tried to use it.

Pages only serves files, so the form posts to a **Google Apps Script web
app**, which saves the upload to a Drive folder and appends a row to a Google
Sheet — the sheet *is* the Excel file the planner gets. Setup takes about ten
minutes and is written out in **[`apps-script/SETUP.md`](apps-script/SETUP.md)**.

**This is deployed and working** — `CONFIG.attendance.endpoint` holds the live
`/exec` URL, and a real submission has been round-tripped through it: the row
reached the Sheet, the file reached Drive, CORS passed with no preflight, and
all seven server-side validations were probed and reject correctly.

> Blank that endpoint out and the form still renders, but tells anyone who
> submits to call instead — better than hiding it, and much better than
> swallowing a guest's details. A console warning fires on load in that state.

**Editing `apps-script/Code.gs` does nothing on its own.** Redeploy it as a new
*version of the same deployment* (Deploy → Manage deployments → pencil), which
keeps the URL. A brand new deployment gets a *new* URL and the site carries on
talking to the old one.

The `/exec` URL is public — unavoidably, since it sits in the page source of a
static site. That exposes no guest data: the script has no read path, `doGet`
returns a fixed string and `doPost` only appends. The realistic risk is junk
rows, which the honeypot and validation blunt but do not rate-limit; if spam
ever appears, redeploy for a fresh URL and the old one dies.

Why not a Google Form: switching on file upload there makes every guest sign
in to a Google account first, which would lose the older half of the guest
list. This keeps the site's own design and asks nothing of the guest.

Three things worth not undoing:

- **The post goes out as `text/plain`.** That keeps it a "simple" request so
  the browser skips the CORS preflight — an Apps Script web app cannot answer
  an `OPTIONS` call, and the whole submission fails if one is sent. It is
  still JSON in the body; only the header is a lie.
- **Photographs are downscaled to 1800px before upload.** A phone camera
  produces 3–6 MB of resolution nobody needs to read an ID card, and on hotel
  wifi that is the difference between a form that sends and one that times
  out. PDFs, Word files and HEIC are passed through untouched.
- **Inputs are held at 16px or larger.** Below that, iOS Safari zooms the page
  the moment a field takes focus and never zooms back out.

The Aadhaar copies are other people's government ID. `SETUP.md` covers this,
but in short: share the Sheet and the Drive folder to **named email
addresses**, never "anyone with the link", and delete the folder once everyone
has checked out. Setting `CONFIG.attendance.aadhaarRequired` to `false`
removes the field altogether if the hotel turns out not to need it.

## Still missing

Placeholders on the page are written as `— dress code —`, `— name —` and so
on, so they are obvious. These are what is outstanding:

| | |
| --- | --- |
| Hashtag | not supplied — the line is hidden in the scratch section and the footer |
| Groom's grandparents | only the parents' line (`S/O …`) was supplied. Kept in `CONFIG.lineage`, which renders nowhere since the invitation card was removed |
| Dress codes | all six functions. The line is hidden on a card until `dress` is filled in |
| Times | Haldi &amp; Mehendi, Hawan and Reception all show `— time —` until given |
| Mehendi time | shows Afternoon; an exact time would be better |
| Venue address | reverse-geocoded from the Maps link, not supplied — worth confirming |

Two things were inferred rather than given, and are worth confirming:

- **The year is 2026.** It was never stated, but 20 November falls on a Friday
  and 21 November on a Saturday only in 2026, which is what the details say.
- **The first group of bride's-side names** was supplied without a heading, so
  it sits under "With Best Compliments". The template also supports "Special
  Request", "Sharing the Joy" and "Establishments" blocks; add them to
  `CONFIG.blessings` if the families use them.

## Assets

| File | Source |
| --- | --- |
| `music/kamaicha.png`, `music/bow.png` | supplied JPEGs, backdrop keyed out to alpha |
| `hero/crest.webp` | `Radhika.png`, backdrop keyed out, trimmed and scaled to 1100px. **Unused** — kept only because `CONFIG.couple.crest` still points at it |
| `hero/floral_frame.webp` | `background.png`, re-composed — see below |
| `cards/hawan.webp`, `cards/sangeet.webp`, `cards/wedding.webp` | the reference invitation's card paintings, re-encoded from 5.9 MB of PNG to 864 KB of WebP |
| `scratch/couple.webp` | the reference scratch illustration, white ground flood-filled to alpha |
| `video/opening.mp4`, `hero/opening_poster.webp` | `herofinal.mp4` — the opening gate, copied byte-for-byte; the poster is its first frame, uncropped so it lines up with the film |
| `music/music.mp3` | `bg song.mp3` |
| `og/og.jpg`, `favicon.png`, `apple-touch-icon.png` | composed from the couple's names |

The supplied JPEGs arrived with a flat backdrop where transparency was needed,
so each was cut back to alpha before use.

Two films are cropped in CSS because something is burned into the frame:
`hero.mp4` (a floating music control along the foot) and `opening.mp4` (the
generator's sparkle watermark). See the note below on how those are removed.

## The opening gate

The Rumi Darwaza film is the gate: it opens on the closed doors and ends on
Hotel Damson Plum revealed through them, which is the hand-off to the hero
(the `ended` event, not a timer). The tap plays it through and starts the
score under it. If the film ever fails to load, the gate removes itself
rather than leaving a tap that does nothing.

**The film carries no wording of its own**, unlike the envelope card it
replaced, so `.intro-prompt` is the only thing telling a guest to tap. It is
not decoration. It sits over a dusk-stone scrim because cream text alone
washed out against the lit sandstone.

It runs **ten seconds**, against the envelope's six. That is a long time to
hold someone at the door, so once the gate is plainly moving the prompt turns
into "Tap to skip" and any further tap hands straight over. The catch: one
physical tap fires `pointerdown`, then `touchend`, then `click`, so a bare
"already begun means skip" would open the gate and slam it in the same
gesture — `SKIP_AFTER_MS` is the grace window that separates the cascade from
a guest genuinely tapping again. Both paths are verified.

The film is **landscape 1280x720** shown **full-bleed**, where the envelope
was portrait and letterboxed. Two things follow from that:

- The watermark sits 7.6% in from the right edge, so `clip-path` takes 12%
  off **both** sides. Symmetric because the arch is centred and shaving one
  edge alone would swing it off axis. Those percentages resolve against the
  element's own box, so the crop is exact at every viewport — the element is
  laid out at the film's own aspect ratio for that to hold.
- The element is deliberately **wider than its container**, which is how a
  landscape frame covers a portrait screen. `.intro-screen` therefore needs
  `overflow: hidden`: on desktop the gate is re-centred onto the 480px column,
  and without it the film runs out across the whole page while the scrim and
  prompt stay in the column.

Swap in a film of another shape and three numbers move together: the
`aspect-ratio`, and both terms of the `width: max(131.6%, 100svh * 1.7778)`
that keep what survives the cut covering the screen.

## The hero card

What the gate opens onto: eyebrow, ॐ in a gold ring, the names in
**Italiana**, the invitation sentence, and the dates between gold rules. It
follows the reference invitation, which is **light** — `#f5eee3` ground with
`#313b29` ink. The screenshot of it looks dark only because of the phone it
was taken on; its own CSS says otherwise, so nothing here is tinted.

The palette lives in its own tokens — `--card-ground`, `--deep-ink`,
`--olive-ink`, `--gold-ink`, `--font-name`, `--font-sans` — kept apart from
the watercolour tokens above them, which still dress the gate, blessings,
RSVP and countdown.

### The floral ground, and why it is not `background.png`

The supplied `background.png` is **3811×1902, landscape 2:1**, with artwork
only on the left **31%** and the right **19%** and an empty middle of
**49.5%**. Cover-fitted to a 480-wide portrait column it shows the middle
27% — which is the empty part. **Every flower crops away.**

So the two bands were cut out and rebuilt as a portrait frame,
`assets/hero/floral_frame.webp` (1200×2100, 83 KB against the original's
5 MB): left band top-left and turned 180° for bottom-right, right band
top-right and turned for bottom-left, over a ground sampled from the
original's own middle (`#f7f2ed`). Each band's two inward edges are erased
to a gradient — without that the rectangles show as hard seams against the
ground, which is exactly what the first attempt did.

**Replacing it:** a portrait export of the same artwork can be dropped
straight in and the re-composition thrown away. Another landscape one needs
the same treatment, and the band boundaries have to be re-measured — they
are specific to this file.

## Save the dates

Six cards, built from `CONFIG.events`. Tapping one expands it in place into
the full invitation using a FLIP: the card jumps to its opened geometry, both
boxes are measured, and only the inverse transform is animated back to zero,
so nothing reflows mid-flight.

Only three paintings exist for six cards, so the daytime ceremonies share the
marigold and the two evening ones share the night. Three more would give
every function its own.

**No card says whose side a function is on.** Guests are told what they are
invited to by their own link; the cards read the same for everyone.

One thing not to undo: **the backdrop hangs off `.schedule`, not off `body`.**
`.schedule` carries a `z-index` and is therefore its own stacking context, so
a backdrop painted at body level can never come between the section and one
of the section's own children — the opened card rendered *underneath* the
dim. Both now live in the same context and the section is lifted above its
neighbours while a card is open.

Escape, the × button, and a tap on the backdrop all close; all three are
tested.

## One invitation, many links

Guests are invited to different functions, and there is still only one
invitation. The link carries the list:

```
https://…/WeddingCardWebsite/?e=wedding,reception
```

and only those cards render. The plain URL, with no `?e` at all, is the
general invitation and shows everything.

**Open `invite-builder.html` to make a link** — tick the functions, copy, or
hand it straight to WhatsApp. Nothing is stored anywhere and no per-guest
data lives in the repo, so inviting someone never needs a code change or a
redeploy: the link *is* the configuration.

Three things follow from that:

- **The ids in `CONFIG.events` are part of every link already sent.**
  Renaming one silently breaks those links. `invite-builder.html` keeps its
  own copy of the list and has to be edited in step.
- **The dates follow the visible cards.** Hero, foil and footer all read from
  `spanOf()`, so a guest invited only to the Reception is told *25 November*,
  not *18–25 November*. The countdown aims at their first function too. The
  `CONFIG.dates` strings are only a fallback for when nothing is dated.
- **An unknown or empty list falls back to the whole programme**, on purpose:
  a guest following a mistyped or truncated link should land on the
  invitation, not on an empty page.

## Where the celebration is

Heading, address, and a Google Maps embed in the keyless `?output=embed`
form — **no API key anywhere**. It is pinned by coordinate rather than by a
name search, so it lands on the hotel and not on whatever the search decides.
The frame is desaturated a little so the bright blue map sits inside the
invitation rather than on top of it, and the "Open in Maps" button is held
clear of Google's attribution strip, which their terms require stay legible.

The address is **reverse-geocoded from the Maps link, not supplied by the
family** — worth confirming before the cards go out.

## What was removed, and what it took with it

Three things came out on request, and it is worth recording what left with
them so nobody goes hunting:

| Removed | What went with it |
| --- | --- |
| The formal invitation card | the invocation line, the "We request the honor" wording, and **both families' lineage lines** — those strings survive in `CONFIG.lineage` but render nowhere |
| The Wardrobe planner | the per-function dress-code rail. Dress codes now belong on the cards, where the line stays hidden until `dress` is filled in |
| The Reception | brought back as a card on 25 November |

The scratch section's arch, the wardrobe niche, the palace skyline and the
blossom boughs went with them — six SVG symbols and 8.4 MB of artwork,
deleted once nothing referenced them.

The crest flight is **gone** — 125 lines of JS, its config, and the 224 KB
`crest.webp` it flew. It could never arm once the hero stopped having a
crest; the intro now simply cross-dissolves, which is what it already did.
