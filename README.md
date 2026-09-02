# Wedding invitation — static site

A rebuild of the kirtiwedsharsh.in invitation in plain HTML, CSS and JavaScript.
No build step and no dependencies: three files plus an `assets/` folder.

```
index.html    structure + the SVG ornament library (arch, skyline, chandeliers, boughs)
style.css     all styling and animation
script.js     CONFIG at the top, then behaviour
assets/       images
```

## Viewing it

Double-click `index.html`. Everything works from the filesystem; the only
degradation is that the flying grains during the scratch use fallback colours
instead of ones sampled from the foil, because a browser will not let a page
read pixels back from a `file://` image.

To serve it properly instead:

```
npx serve .
```

## Changing the content

**Everything the invitation says lives in the `CONFIG` object at the top of
`script.js`** — names, dates, venue, hashtag, the four events, the dress codes,
the blessings lists and the RSVP contacts. Nothing below `CONFIG` needs
touching to change a name, a time or a phone number.

Placeholders that still need real content are written as `— name & name —`,
`— firm name —` and `00000 00000`, so they are obvious on the page:

- `CONFIG.invitation.brideLineage` / `groomLineage`
- `CONFIG.blessings.groom` / `bride`
- `CONFIG.rsvp.groom` / `bride` — `tel` is the full international number used
  for the call and WhatsApp links, `shown` is what is printed

The countdown reads zero until `CONFIG.dates.moment` is set to a date in the
future.

## Assets

| File | Source |
| --- | --- |
| `hero/crest.png`, `hero/couple.png` | supplied JPEGs, backdrop keyed out to alpha |
| `scratch/foil.png`, `music/kamaicha.png` | as above |
| `wardrobe/dress_mayra.png`, `dress_sangeet.png` | as above |
| `hero/sky.webp`, `invite/palace.webp`, `events/mandap.webp` | single frames cut from the supplied recordings |

The supplied JPEGs arrived with a flat backdrop where the originals had
transparency, so each was cut back to alpha before use — otherwise the crest
sits on the hero sky in a white box.

The three MP4s were phone screen-recordings of the source site, with its
floating music control (and on one, a screen-recorder watermark) burned into
the bottom of the frame. Two of them held a still image for their whole length,
and the third animated only slightly, so all three became stills with that
bottom strip cropped away — 313 KB of WebP in place of 3.5 MB of video. The
originals are untouched in this folder if you want them back.

## Still missing

- **`assets/music/music.mp3`** — drop a file in and the kamaicha control
  appears by itself. With no file it stays hidden and nothing else changes.
- **Two wardrobe artworks.** Only two trolleys were supplied, so Wedding and
  Reception borrow the nearest match. Add `dress_wedding.png` and
  `dress_reception.png` to `assets/wardrobe/` and point `CONFIG.wardrobe[n].art`
  at them.
- **Section artwork.** Mayra, Sangeet and Reception have no painting of their
  own, so each is drawn in CSS — a watercolour gradient in that function's
  palette with an SVG palace elevation along the foot. Every one of those is
  marked `painted ground` in `style.css`. To use a real painting instead, give
  that event an `art.still` in `CONFIG.events` the way the Wedding card has one.
