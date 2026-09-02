# Radhika & Raghav — wedding invitation

A static site: plain HTML, CSS and JavaScript, no build step and no
dependencies.

```
index.html    structure + the SVG ornament library (arch, skyline, chandeliers, boughs)
style.css     all styling and animation
script.js     CONFIG at the top, then behaviour
assets/       images
video1–4.mp4  the source films the section stills were cut from
```

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

## Still missing

Placeholders on the page are written as `— dress code —`, `— name —` and so
on, so they are obvious. These are what is outstanding:

| | |
| --- | --- |
| Hashtag | not supplied — the line is hidden in the scratch section and the footer |
| Invocation | the line above "We request the honor" is hidden until one is set |
| Venue city | the venue reads "Hotel Damson Plum" with no city |
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
| `hero/couple.png`, `scratch/foil.png` | supplied JPEGs, backdrop keyed out to alpha |
| `music/kamaicha.png`, `music/bow.png` | as above |
| `wardrobe/dress_mayra.png`, `dress_sangeet.png` | as above |
| `hero/crest.webp` | `Radhika.png`, backdrop keyed out, trimmed and scaled to 1100px |
| `hero/sky.webp` | the clean fountain painting, used whole |
| `music/music.mp3` | `bg song.mp3` |
| `events/sangeet.webp` | video1 |
| `events/wedding.webp` | video2 |
| `events/reception.webp` | video3 |
| `invite/palace.webp` | video4 |
| `og/og.jpg`, `favicon.png`, `apple-touch-icon.png` | composed from the couple's names |

The supplied JPEGs arrived with a flat backdrop where transparency was needed,
so each was cut back to alpha before use.

The four films are phone screen-recordings and every one of them carries a
floating music control and a recorder watermark burned along the bottom of the
frame, so each still has that bottom strip cropped away. They also barely
move — the reason they are stills rather than video.

`hero/couple.png` is placeholder art: it is the illustrated couple from the
reference invitation, not Radhika and Raghav. Swap it when there is artwork of
your own.

## Section artwork

Every function now has a real painting behind it. If a fourth is ever added
without one, its panel falls back to a CSS watercolour gradient in that
function's palette with an SVG palace elevation along the foot — those are
marked `painted ground` in `style.css`. Give the event an `art.still` in
`CONFIG.events` to use a painting instead, and drop its `art.ornament` at the
same time if the painting already contains that ornament.
