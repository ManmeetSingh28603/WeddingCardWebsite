const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const has = (file) => fs.existsSync(path.join(root, file));

/* ── the pages exist ── */
for (const f of ['index.html', 'bride.html', 'groom.html',
                 'bride-invite-builder.html', 'groom-invite-builder.html']) {
  assert.ok(has(f), f + ' must exist');
}

/* ── the media each gate and each filmed card actually needs ── */
for (const f of ['assets/video/opening.mp4',            // bride gate
                 'assets/video/envelope-opening.mp4',   // groom gate
                 'assets/video/wedding-bg.mp4',         // wedding card
                 'assets/video/sangeet-bg.mp4',         // sangeet card
                 'assets/hero/opening_poster.webp',
                 'assets/hero/envelope_poster.jpg',
                 'assets/music/ishq-hai.mp3']) {
  assert.ok(has(f), f + ' must exist');
}

const bride = read('bride.html');
const groom = read('groom.html');
const index = read('index.html');
const script = read('script.js');
const css = read('style.css');
const brideBuilder = read('bride-invite-builder.html');
const groomBuilder = read('groom-invite-builder.html');

assert.match(bride, /data-invite-side="bride"/);
assert.match(groom, /data-invite-side="groom"/);

/* ── both gates are films now, and each has its own ── */
assert.match(bride, /assets\/video\/opening\.mp4/, 'bride opens on the Rumi Darwaza film');
assert.match(groom, /assets\/video\/envelope-opening\.mp4/, 'groom opens on the envelope film');
assert.match(groom, /data-shape="portrait"/, 'the groom film is portrait and is cropped as such');
assert.match(groom, /data-film-end="[\d.]+"/, 'the groom film hands over before its source runs on');
for (const [name, page] of [['bride', bride], ['groom', groom]]) {
  assert.match(page, /<video class="intro-film"/, name + ' needs a gate film');
  assert.doesNotMatch(page, /assets\/video\/envelope\.mp4/, name + ' must not use the retired envelope film');
}

/* ── the CSS envelope that the groom's film replaced is gone ── */
for (const [what, src] of [['groom.html', groom], ['style.css', css], ['script.js', script]]) {
  assert.doesNotMatch(src, /env-flap|env-seal|env-pocket|env-card|data-gate="envelope"/,
                      'the CSS envelope must not linger in ' + what);
}

/* ── the gate shows no names: they belong to the card behind it ── */
for (const [name, page] of [['bride', bride], ['groom', groom]]) {
  assert.doesNotMatch(page, /intro-couple|data-intro-names/,
                      name + ' must not put the couple on the gate');
}
assert.doesNotMatch(css, /\.intro-couple/, 'the gate-names rule must be gone too');
assert.doesNotMatch(script, /data-intro-names/, 'and its binding with it');

/* ── a film is laid out at ITS OWN aspect ratio, or the element
      letterboxes inside its own box and the gate shows side bands ── */
assert.match(css, /\.intro-film \{[^}]*aspect-ratio: 1280 \/ 720/s,
             'the landscape film needs a landscape box');
assert.match(css, /\.intro-film\[data-shape="portrait"\] \{[^}]*aspect-ratio: 720 \/ 1280/s,
             'the portrait film needs a portrait box');
assert.doesNotMatch(css, /aspect-ratio: 336 \/ 896/,
                    'the portrait box on the landscape film is what caused the borders');

/* ── and the prompt is visible again, now that it is the only wording
      on the bride's gate ── */
assert.doesNotMatch(css, /\.intro-prompt \{[^}]*display: none/s,
                    'the bride gate would have no instruction at all');

/* ── the score: same track both sides, in at 0:38, and NOT natively looped
      (native loop would drop back to 0 and replay the intro) ── */
for (const [name, page] of [['bride', bride], ['groom', groom]]) {
  assert.match(page, /assets\/music\/ishq-hai\.mp3/, name + ' must use the new score');
  assert.doesNotMatch(page, /<audio[^>]*\sloop/, name + ' must not loop the audio natively');
}
assert.match(script, /const MUSIC_START = 38;/);
assert.match(script, /currentTime = MUSIC_START/);

/* ── the two cards that open onto a film ── */
assert.match(script, /film: 'assets\/video\/wedding-bg\.mp4'/);
assert.match(script, /film: 'assets\/video\/sangeet-bg\.mp4', filmTone: 'night'/);
assert.match(script, /class="event-film"/);
assert.match(script, /preload="none"/, 'six cards must not pull six videos on load');
assert.match(css, /\.event\.is-open \.event-film \{ opacity: 1; \}/);
assert.match(css, /\.event\.is-open\.has-film--night::before/,
             'a night film needs the dark veil, or the type vanishes into it');

/* ── each side points at its own venue, with its own coordinates ── */
assert.match(script, /The Tivoli, Chattarpur/);
assert.match(script, /28\.4966351/, 'the Tivoli needs its own pin');
assert.match(script, /26\.7794782/, 'Damson Plum keeps its pin');
assert.match(script, /venue: TIVOLI/);
assert.match(script, /venue: DAMSON/);

/* ── lineage, and the descender fix that stopped Raghav colliding ── */
assert.match(script, /GS\/O Smt\. Madhu Khanna/);
assert.match(script, /GD\/O Lt\. Smt\. Vijay Rastogi/);
assert.match(css, /\.hero-names \{[^}]*--font-script/s, 'the names are set in the script face');
assert.doesNotMatch(css, /\.hero-names \{[^}]*line-height: \.82/s, 'the clipping line-height must not come back');

/* ── index is a way in, not a redirect ── */
assert.doesNotMatch(index, /http-equiv="refresh"/, 'index must not bounce straight to a card');
for (const link of ['bride.html', 'groom.html', 'bride-invite-builder.html', 'groom-invite-builder.html']) {
  assert.match(index, new RegExp('href="' + link.replace('.', '\.') + '"'), 'index links to ' + link);
}

/* ── the builders keep their per-side difference ── */
assert.match(brideBuilder, /id="blessings"/);
assert.doesNotMatch(groomBuilder, /id="blessings"/);

console.log('Invitation page configuration checks passed.');
