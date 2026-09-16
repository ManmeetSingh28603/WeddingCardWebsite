/* Runs the real Code.gs against a fake Sheets/Drive, so the routing can be
   checked before it is ever deployed: a bride reply must land in the bride
   workbook and the bride folder, a groom reply in the groom's, and neither
   in the other. Also covers the rebuild, which is what makes the side
   workbooks disposable. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

/* ── a fake spreadsheet, faithful enough for what Code.gs asks of it ── */
function Sheet(name) {
  const rows = [];          // array of arrays
  const rich = [];          // parallel, same shape
  const api = {
    _rows: rows, _rich: rich, _widths: {}, _formats: {}, _frozen: 0,
    getName: () => name,
    setName(n) { name = n; return api; },
    getLastRow: () => rows.length,
    getLastColumn: () => rows.reduce((m, r) => Math.max(m, r.length), 0),
    appendRow(vals) { rows.push(vals.slice()); rich.push(vals.map(() => null)); return api; },
    setFrozenRows(n) { api._frozen = n; return api; },
    setColumnWidth(c, w) { api._widths[c] = w; return api; },
    deleteRow(r) { rows.splice(r - 1, 1); rich.splice(r - 1, 1); return api; },
    deleteRows(r, n) { rows.splice(r - 1, n); rich.splice(r - 1, n); return api; },
    getParent: () => api._parent,
    getRange(r, c, nr, nc) {
      nr = nr || 1; nc = nc || 1;
      const range = {
        getValues() {
          const out = [];
          for (var i = 0; i < nr; i++) {
            const row = rows[r - 1 + i] || [];
            const line = [];
            for (var j = 0; j < nc; j++) line.push(row[c - 1 + j] === undefined ? '' : row[c - 1 + j]);
            out.push(line);
          }
          return out;
        },
        setValues(vals) {
          for (var i = 0; i < nr; i++) {
            while (rows.length < r - 1 + i + 1) { rows.push([]); rich.push([]); }
            const row = rows[r - 1 + i];
            for (var j = 0; j < nc; j++) row[c - 1 + j] = vals[i][j];
          }
          return range;
        },
        getRichTextValues() {
          const out = [];
          for (var i = 0; i < nr; i++) {
            const row = rich[r - 1 + i] || [];
            const line = [];
            for (var j = 0; j < nc; j++) line.push(row[c - 1 + j] === undefined ? null : row[c - 1 + j]);
            out.push(line);
          }
          return out;
        },
        setRichTextValues(vals) {
          for (var i = 0; i < nr; i++) {
            while (rich.length < r - 1 + i + 1) { rows.push([]); rich.push([]); }
            const row = rich[r - 1 + i];
            for (var j = 0; j < nc; j++) row[c - 1 + j] = vals[i][j];
          }
          return range;
        },
        setRichTextValue(v) {
          while (rich.length < r) { rows.push([]); rich.push([]); }
          rich[r - 1][c - 1] = v;
          return range;
        },
        setNumberFormat() { return range; },
        setFontWeight() { return range; },
        setBackground() { return range; },
      };
      return range;
    },
  };
  return api;
}

function Book(title, id) {
  const sheets = [];
  const api = {
    getId: () => id,
    getUrl: () => 'https://sheets/' + id,
    getName: () => title,
    getSheets: () => sheets.slice(),
    getSheetByName: (n) => sheets.find((s) => s.getName() === n) || null,
    insertSheet(n) { const s = Sheet(n); s._parent = api; sheets.push(s); return s; },
  };
  return api;
}

const books = {};
const folders = {};
const props = {};
let made = 0;

function reset() {
  for (const k in books) delete books[k];
  for (const k in folders) delete folders[k];
  for (const k in props) delete props[k];
  made = 0;
  books.parent = Book('Parent', 'parent');
  /* a brand-new spreadsheet arrives with one empty Sheet1 */
  books.parent.insertSheet('Sheet1');
}

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => books.parent,
  openById: (id) => { if (!books[id]) throw new Error('no such book ' + id); return books[id]; },
  create: (title) => {
    const id = 'book' + (++made);
    books[id] = Book(title, id);
    books[id].insertSheet('Sheet1');       // as Google does
    return books[id];
  },
  newRichTextValue: () => {
    const v = { text: '', links: [] };
    const b = {
      setText(t) { v.text = t; return b; },
      setLinkUrl(a, z, url) { v.links.push({ url, slice: v.text.slice(a, z) }); return b; },
      build() { return v; },
    };
    return b;
  },
};
global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => (k in props ? props[k] : null),
    setProperty: (k, v) => { props[k] = v; },
  }),
};
global.DriveApp = {
  getFolderById: (id) => { if (!folders[id]) throw new Error('gone'); return folders[id]; },
  getFoldersByName: (n) => {
    const hit = Object.values(folders).find((f) => f.getName() === n);
    let served = false;
    return { hasNext: () => !!hit && !served, next: () => { served = true; return hit; } };
  },
  createFolder: (n) => {
    const id = 'folder' + (++made);
    const files = [];
    folders[id] = {
      getId: () => id, getName: () => n, getUrl: () => 'https://drive/' + id, _files: files,
      createFile: (blob) => {
        const f = { getName: () => blob.name, getUrl: () => 'https://file/' + id + '/' + files.length };
        files.push(f);
        return f;
      },
    };
    return folders[id];
  },
};
global.Utilities = {
  base64Decode: (s) => Buffer.from(s, 'base64'),
  newBlob: (bytes, type, name) => ({ bytes, type, name }),
  formatDate: () => '2026-11-01 1200',
};
global.Session = { getScriptTimeZone: () => 'Asia/Kolkata' };
global.MailApp = { sendEmail: () => {} };
/* doPost serialises on a script lock; nothing here is concurrent. */
global.LockService = { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) };
global.ContentService = {
  createTextOutput: (t) => ({ _t: t, getContent: () => t, setMimeType: function () { return this; } }),
  MimeType: { JSON: 'json' },
};

const src = fs.readFileSync(path.resolve(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');
const mod = new Function(src + `
  ;return { doPost, validate_, rebuildSides, deleteTestRows, sideLinks,
            folder_, sideSheet_, SIDES, HEADERS, UNKNOWN_SIDE };`)();

const b64 = Buffer.from('%PDF-1.4 x').toString('base64');
const file = (n) => ({ name: n, type: 'application/pdf', data: b64 });
const post = (over) => JSON.parse(mod.doPost({ postData: { contents: JSON.stringify(Object.assign({
  name: 'Guest', members: 2,
  arrive: '2026-11-18', arriveBy: 'Flight',
  depart: '2026-11-22', departBy: 'Flight',
  phone: '9415022314',
  files: { aadhaar: [file('id.pdf')], arriveTicket: [], departTicket: [] },
  website: '',
}, over)) } }).getContent());

/* ════════════════════════════════════════════════════════════════ */
reset();

/* ── 1. each side lands in its own workbook, and only its own ────── */
let r = post({ side: 'bride', name: 'Bride Guest One' });
assert.equal(r.ok, true, 'bride reply accepted');
assert.equal(r.filed.side, 'bride');
r = post({ side: 'groom', name: 'Groom Guest One' });
assert.equal(r.filed.side, 'groom');
r = post({ side: 'bride', name: 'Bride Guest Two' });

const parent = books.parent.getSheetByName('RSVP');
const brideSh = mod.sideSheet_('bride');
const groomSh = mod.sideSheet_('groom');
const namesOf = (sh) => sh._rows.slice(1).map((row) => row[2]);

assert.equal(parent.getLastRow(), 4, 'parent holds the heading and three replies');
assert.deepEqual(namesOf(brideSh), ['Bride Guest One', 'Bride Guest Two'], 'bride workbook');
assert.deepEqual(namesOf(groomSh), ['Groom Guest One'], 'groom workbook');
console.log('ok  each side lands in its own workbook, and only its own');

/* ── 2. the side is written on the parent row ────────────────────── */
assert.equal(parent._rows[1][1], 'Bride', 'parent row says which side');
assert.equal(parent._rows[2][1], 'Groom');
console.log('ok  the parent records the side');

/* ── 3. the workbooks and tabs are named as asked ────────────────── */
assert.equal(brideSh.getName(), 'Bride Guest');
assert.equal(groomSh.getName(), 'Groom Guest');
assert.equal(brideSh.getParent().getName(), 'RSVP — Bride Guest');
assert.equal(groomSh.getParent().getName(), 'RSVP — Groom Guest');
console.log('ok  workbooks and tabs carry the names asked for');

/* ── 4. the uploads are filed in that side's own folder ──────────── */
const brideFolder = mod.folder_('bride');
const groomFolder = mod.folder_('groom');
assert.equal(brideFolder.getName(), 'Bride Side Guest Files');
assert.equal(groomFolder.getName(), 'Groom Side Guest Files');
assert.equal(brideFolder._files.length, 2, 'two bride IDs in the bride folder');
assert.equal(groomFolder._files.length, 1, 'one groom ID in the groom folder');
assert.notEqual(brideFolder.getId(), groomFolder.getId(), 'the folders are not the same folder');
console.log('ok  uploads are split into one folder per side');

/* ── 5. the attachment link survives the copy into the side book ─── */
const AAD = mod.HEADERS.indexOf('Aadhaar card');
const copied = brideSh._rich[1][AAD];
assert.ok(copied && copied.links && copied.links.length === 1,
  'the link is carried across, not flattened to text');
assert.equal(copied.links[0].slice, copied.text, 'and it covers the file name');
console.log('ok  the attachment link survives into the side workbook');

/* ── 6. a reply naming no side is kept, marked, and copied nowhere ─ */
const before = { b: namesOf(brideSh).length, g: namesOf(groomSh).length };
r = post({ name: 'No Side Given' });                 // an old cached page
assert.equal(r.ok, true, 'it is still accepted — the reply is not lost');
assert.equal(r.filed.side, null);
assert.equal(parent._rows[parent._rows.length - 1][1], mod.UNKNOWN_SIDE, 'marked on the parent');
assert.equal(namesOf(brideSh).length, before.b, 'not guessed into the bride book');
assert.equal(namesOf(groomSh).length, before.g, 'nor the groom book');
/* and a junk value is treated the same way, never used to name a folder */
r = post({ side: '../../etc', name: 'Junk Side' });
assert.equal(r.filed.side, null, 'an unknown side is not trusted');
console.log('ok  a reply with no usable side is kept, marked, and copied nowhere');

/* ── 7. rebuild restores the side books from the parent alone ────── */
brideSh.deleteRows(2, brideSh.getLastRow() - 1);      // someone wrecks a side book
groomSh.deleteRows(2, groomSh.getLastRow() - 1);
assert.equal(namesOf(brideSh).length, 0);
mod.rebuildSides();
assert.deepEqual(namesOf(mod.sideSheet_('bride')), ['Bride Guest One', 'Bride Guest Two'],
  'the bride book is restored');
assert.deepEqual(namesOf(mod.sideSheet_('groom')), ['Groom Guest One'],
  'the groom book is restored');
assert.ok(mod.sideSheet_('bride')._rich[1][AAD].links.length === 1,
  'and the links come back with it');
console.log('ok  rebuildSides restores both books from the parent');

/* ── 8. rebuild does not double up when run twice ────────────────── */
mod.rebuildSides();
assert.equal(namesOf(mod.sideSheet_('bride')).length, 2, 'still two, not four');
console.log('ok  rebuilding twice does not duplicate');

/* ── 9. the test-row cleanup takes them out of every book ────────── */
post({ side: 'bride', name: 'ZZ TEST — DELETE THIS ROW' });
post({ side: 'groom', name: 'ZZ TEST — another' });
assert.equal(namesOf(mod.sideSheet_('bride')).length, 3);
const gone = mod.deleteTestRows();
assert.equal(gone, 2, 'both test rows removed');
assert.deepEqual(namesOf(mod.sideSheet_('bride')), ['Bride Guest One', 'Bride Guest Two']);
assert.deepEqual(namesOf(mod.sideSheet_('groom')), ['Groom Guest One']);
assert.ok(!parent._rows.slice(1).some((row) => /^ZZ TEST/.test(String(row[2]))),
  'and none left in the parent');
console.log('ok  deleteTestRows clears the parent and both books');

/* ── 10. the links to hand out ───────────────────────────────────── */
const links = mod.sideLinks();
assert.ok(/Bride workbook: https/.test(links) && /Bride folder:/.test(links), 'bride links');
assert.ok(/Groom workbook: https/.test(links) && /Groom folder:/.test(links), 'groom links');
console.log('ok  sideLinks prints a workbook and a folder for each side');

console.log('\nApps Script routing checks passed.');
