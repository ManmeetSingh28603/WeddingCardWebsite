const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

assert.ok(fs.existsSync(path.join(root, 'bride.html')), 'bride invitation page must exist');
assert.ok(fs.existsSync(path.join(root, 'groom.html')), 'groom invitation page must exist');
assert.ok(fs.existsSync(path.join(root, 'bride-invite-builder.html')), 'bride builder must exist');
assert.ok(fs.existsSync(path.join(root, 'groom-invite-builder.html')), 'groom builder must exist');
assert.ok(fs.existsSync(path.join(root, 'assets/video/envelope.mp4')), 'envelope gate media must exist');

const bride = read('bride.html');
const groom = read('groom.html');
const script = read('script.js');
const brideBuilder = read('bride-invite-builder.html');
const groomBuilder = read('groom-invite-builder.html');

assert.match(bride, /data-invite-side="bride"/);
assert.match(groom, /data-invite-side="groom"/);
assert.match(bride, /assets\/video\/envelope\.mp4/);
assert.match(groom, /assets\/video\/envelope\.mp4/);
assert.match(script, /SIDE_CONFIGS/);
assert.match(script, /Sonia/);
assert.match(script, /The Tivoli, Chattarpur/);
assert.match(script, /GD\/O Lt\. Smt\. Vijay Rastogi/);
assert.doesNotMatch(groomBuilder, /id="blessings"/);
assert.match(brideBuilder, /id="blessings"/);

console.log('Invitation page configuration checks passed.');
