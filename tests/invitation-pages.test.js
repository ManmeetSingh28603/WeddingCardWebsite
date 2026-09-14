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

/* ── the media each gate actually needs ── */
assert.ok(has('assets/video/opening.mp4'), 'the bride gate film must exist');
assert.ok(has('assets/hero/opening_poster.webp'), 'the bride gate poster must exist');
assert.ok(has('assets/music/ishq-hai.mp3'), 'the score must exist');

const bride = read('bride.html');
const groom = read('groom.html');
const index = read('index.html');
const script = read('script.js');
const css = read('style.css');
const brideBuilder = read('bride-invite-builder.html');
const groomBuilder = read('groom-invite-builder.html');

assert.match(bride, /data-invite-side="bride"/);
assert.match(groom, /data-invite-side="groom"/);

/* ── the two gates are different, and neither is the old envelope film ── */
assert.match(bride, /assets\/video\/opening\.mp4/, 'bride opens on the Rumi Darwaza film');
assert.doesNotMatch(groom, /<video/, 'groom has no film — its gate is CSS');
assert.match(groom, /data-gate="envelope"/);
assert.match(groom, /class="env-flap"/);
assert.match(css, /\.intro-screen\.is-opening \.env-flap/, 'the flap needs an open state');
for (const [name, page] of [['bride', bride], ['groom', groom]]) {
  assert.doesNotMatch(page, /assets\/video\/envelope\.mp4/, name + ' must not use the retired envelope film');
}

/* ── the score: same track both sides, in at 0:38, and NOT natively looped
      (native loop would drop back to 0 and replay the intro) ── */
for (const [name, page] of [['bride', bride], ['groom', groom]]) {
  assert.match(page, /assets\/music\/ishq-hai\.mp3/, name + ' must use the new score');
  assert.doesNotMatch(page, /<audio[^>]*\sloop/, name + ' must not loop the audio natively');
}
assert.match(script, /const MUSIC_START = 38;/);
assert.match(script, /currentTime = MUSIC_START/);

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
  assert.match(index, new RegExp('href="' + link.replace('.', '\\.') + '"'), 'index links to ' + link);
}

/* ── the builders keep their per-side difference ── */
assert.match(brideBuilder, /id="blessings"/);
assert.doesNotMatch(groomBuilder, /id="blessings"/);

console.log('Invitation page configuration checks passed.');
