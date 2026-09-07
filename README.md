# Radhika & Raghav — wedding invitation

A static site: plain HTML, CSS and JavaScript, no build step and no
dependencies.

```
index.html    structure + the SVG ornament library (arch, skyline, chandeliers, boughs)
style.css     all styling and animation
script.js     CONFIG at the top, then behaviour
assets/       everything the site actually loads
apps-script/  the RSVP form's backend — not served, deployed to Google
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
  the hashtag and the invocation are currently handled — a gap where a line
  should be reads as a fault, a shorter card does not.
- A contact with an empty `tel` renders **without** call and WhatsApp buttons,
  since a `tel:+` link with no number leads nowhere.
- `CONFIG.couple.heroCrest` is `false`: the crest opens the invitation and
  then stands aside, because the hero film carries the hotel's own sign and
  the crest landed on top of the building. Set it `true` to put the crest
  back in the hero — the flight from the opening card comes back with it.

## The RSVP form

Under the phone numbers there is a **map button** and a **"Confirm Your
Presence"** form: name, members joining, dates in and out, contact number,
which function they are coming to, and an Aadhaar upload for hotel check-in.

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
| Invocation | the line above "We request the honor" is hidden until one is set |
| Groom's grandparents | only the parents' line (`S/O …`) was supplied |
| Groom's side blessings | the whole list |
| Groom's side RSVP | no names or numbers |
| Dress codes | all three functions |
| Third wardrobe artwork | only two trolleys exist, so Reception borrows the Sangeet one |

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
| `scratch/foil.png` | supplied JPEG, backdrop keyed out to alpha |
| `music/kamaicha.png`, `music/bow.png` | as above |
| `wardrobe/dress_mayra.png`, `dress_sangeet.png` | as above |
| `hero/crest.webp` | `Radhika.png`, backdrop keyed out, trimmed and scaled to 1100px |
| `video/hero.mp4`, `hero/hero_poster.webp` | `background.mp4` — the hero plays as video, the poster holds the frame while it buffers |
| `video/opening.mp4`, `hero/opening_poster.webp` | `herofinal.mp4` — the opening gate, copied byte-for-byte; the poster is its first frame, uncropped so it lines up with the film |
| `music/music.mp3` | `bg song.mp3` |
| `events/sangeet.webp` + `events/jhoomer.webp` | project originals |
| `video/wedding.mp4` + `events/wedding_fg.webp` | project originals |
| `video/reception.mp4` + `events/reception_fg.webp` | project originals |
| `invite/palace.webp` + `invite/bough.webp` | project originals |
| `og/og.jpg`, `favicon.png`, `apple-touch-icon.png` | composed from the couple's names |

The supplied JPEGs arrived with a flat backdrop where transparency was needed,
so each was cut back to alpha before use.

Every section panel is now the original artwork at full quality, each with its
own transparent overlay — a blossom bough or the pair of chandeliers — that
drifts against the scroll. Wedding and Reception are films, Sangeet and the
Invitation are stills, which is how the source project renders them.

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

The hero is the one film that stays a film — it has the hotel, the fort and
the couple in a single shot, so there is no separate cut-out layer over it.
Its watermark strip is cut with `clip-path` rather than `object-fit`, because
clip-path percentages resolve against the element's own box and so crop
exactly at every viewport ratio; the element is laid out at the film's own
aspect ratio for that to work. If you swap in a film of a different shape,
change the `aspect-ratio` on `.hero-film` to match.

`.hero-film` is anchored by its **floor**. The couple stand at the foot of the
frame and they are the subject, so they are what must never be cropped. An
earlier attempt to hold the sky at the top instead pushed them off the bottom
of a phone and left only their heads showing — don't reintroduce it.

On a phone that still leaves the sky across roughly the top fifth of the
screen, which is where the venue line sits: about 90px of clearance above the
hotel's roofline at 390x844. It is only a short desktop window that runs out
of sky, and the venue line is small enough now to sit high in what remains.

## Section artwork

Every function now has a real painting behind it. If a fourth is ever added
without one, its panel falls back to a CSS watercolour gradient in that
function's palette with an SVG palace elevation along the foot — those are
marked `painted ground` in `style.css`. Give the event an `art.still` in
`CONFIG.events` to use a painting instead, and drop its `art.ornament` at the
same time if the painting already contains that ornament.
