/* Exercises the Apps Script's own logic in Node, with just enough of the
   Google globals stubbed to run validate_, saveUploads_ and linkRich_.
   The point is the two things that changed: a field is now a LIST, and a
   cell with several links has to be rich text with the offsets right. */
const fs = require('fs');
const assert = require('assert');

const made = [];          // every Drive file the run "creates"
const richCalls = [];     // every rich-text value built

global.Utilities = {
  base64Decode: (s) => Buffer.from(s, 'base64'),
  newBlob: (bytes, type, name) => ({ bytes, type, name }),
  formatDate: () => '2026-11-01 1200',
};
global.Session = { getScriptTimeZone: () => 'Asia/Kolkata' };
global.SpreadsheetApp = {
  newRichTextValue: () => {
    const v = { text: '', links: [] };
    const b = {
      setText(t) { v.text = t; return b; },
      setLinkUrl(a, z, url) { v.links.push({ a, z, url, slice: v.text.slice(a, z) }); return b; },
      build() { richCalls.push(v); return v; },
    };
    return b;
  },
};
global.DriveApp = {};
global.MailApp = { sendEmail: () => {} };
global.console = console;

const src = fs.readFileSync(require('path').resolve(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');
/* folder_() would reach Drive, so it is replaced after the file loads. */
const mod = new Function(src + `
  ;return { validate_, saveUploads_, linkRich_, uploadName_,
            setFolder: (f) => { folder_ = () => f; } };`)();

const fakeFolder = {
  createFile: (blob) => {
    const f = { _n: blob.name, getName: () => f._n, getUrl: () => 'https://drive/' + made.length };
    made.push(f);
    return f;
  },
};
mod.setFolder(fakeFolder);

const b64 = Buffer.from('%PDF-1.4 hello').toString('base64');
const file = (n) => ({ name: n, type: 'application/pdf', data: b64 });
const base = {
  name: 'Test Family', members: 3,
  arrive: '2026-11-18', arriveBy: 'Flight',
  depart: '2026-11-22', departBy: 'Flight',
  phone: '9415022314', website: '',
};

/* ── 1. the new shape: lists ─────────────────────────────────────── */
let clean = mod.validate_({ ...base, files: {
  aadhaar: [file('a1.pdf'), file('a2.pdf'), file('a3.pdf')],
  arriveTicket: [file('t1.pdf')],
  departTicket: [],
} });
assert.ok(!clean.error, 'lists rejected: ' + clean.error);
assert.equal(clean.files.aadhaar.length, 3, 'three Aadhaar files');
assert.equal(clean.files.arriveTicket.length, 1);
assert.equal(clean.files.departTicket.length, 0);
console.log('ok  a list of three is accepted');

/* ── 2. the OLD shape still works, so a cached page keeps sending ── */
let old = mod.validate_({ ...base, files: {
  aadhaar: file('solo.pdf'), arriveTicket: null, departTicket: null,
} });
assert.ok(!old.error, 'single object rejected: ' + old.error);
assert.equal(old.files.aadhaar.length, 1, 'a bare object becomes a list of one');
console.log('ok  a single object is still accepted');

/* ── 3. a required field with nothing in it is still refused ─────── */
const none = mod.validate_({ ...base, files: { aadhaar: [], arriveTicket: [], departTicket: [] } });
assert.ok(none.error && /Aadhaar/.test(none.error), 'empty Aadhaar must be refused');
console.log('ok  an empty required list is refused');

/* ── 4. a bad extension anywhere in the list is refused ──────────── */
const bad = mod.validate_({ ...base, files: {
  aadhaar: [file('ok.pdf'), { name: 'x.exe', type: 'x', data: b64 }],
  arriveTicket: [], departTicket: [],
} });
assert.ok(bad.error && /image, a PDF/.test(bad.error), 'bad extension must be refused');
console.log('ok  one bad file refuses the whole field');

/* ── 5. every file reaches Drive, numbered only when there are many ─ */
const saved = mod.saveUploads_(clean);
assert.equal(saved.aadhaar.length, 3, 'three files created');
assert.equal(saved.arriveTicket.length, 1);
assert.equal(saved.departTicket.length, 0);
assert.ok(/\(1\)/.test(saved.aadhaar[0].getName()), 'numbered when several: ' + saved.aadhaar[0].getName());
assert.ok(!/\(\d\)/.test(saved.arriveTicket[0].getName()), 'not numbered when alone: ' + saved.arriveTicket[0].getName());
console.log('ok  every file saved; numbered only where it helps');

/* ── 6. the cell links each name to its own file, at the right offsets ─ */
const rich = mod.linkRich_(saved.aadhaar);
assert.ok(rich, 'a rich value is returned');
assert.equal(rich.links.length, 3, 'three links in the cell');
for (var i = 0; i < 3; i++) {
  assert.equal(rich.links[i].slice, saved.aadhaar[i].getName(),
    'link ' + i + ' covers its own name, got "' + rich.links[i].slice + '"');
  assert.equal(rich.links[i].url, saved.aadhaar[i].getUrl(), 'link ' + i + ' points at its own file');
}
assert.equal(mod.linkRich_([]), null, 'nothing attached leaves the cell empty');
console.log('ok  each name in the cell links to its own file');

console.log('\nApps Script multi-file checks passed.');
