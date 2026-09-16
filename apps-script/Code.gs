/* ============================================================
   Radhika & Raghav — RSVP endpoint
   ------------------------------------------------------------
   Receives one attendance form from the website, files the ID
   upload in a Drive folder and appends a row to this sheet.

   Deploy: Extensions > Apps Script from the Google Sheet, paste
   this in, then Deploy > New deployment > Web app with
     Execute as .......... Me
     Who has access ...... Anyone
   Copy the /exec URL into CONFIG.attendance.endpoint in script.js.

   Full walkthrough in SETUP.md, next to this file.
   ============================================================ */


/* ── Settings ───────────────────────────────────────────────── */

/* Leave blank when this script is bound to the sheet (the normal
   case). Only fill it in if you deploy the script standalone. */
const SPREADSHEET_ID = '';

const SHEET_NAME  = 'RSVP';

/* ── The two sides ────────────────────────────────────────────────
   Every reply says which card it came from. It is written to the parent
   sheet — the one this script is bound to, which holds everything — and
   then copied into that side's OWN workbook, so the bride's planner and
   the groom's can each be given a file containing only their guests.
   A tab cannot be shared on its own; a file can.

   The uploads are split the same way. A link in the bride's workbook
   points into the bride's folder, so giving a planner one side's file and
   one side's folder shows them that side and nothing else.

   Both the workbooks and the folders are made by the script on first use
   and remembered by id in Script Properties, so renaming one here does
   NOT move what already exists — rename it in Drive to match. Run
   sideLinks() from the editor to print the URLs to share. */
const SIDES = {
  bride: { label: 'Bride', sheet: 'Bride Guest', file: 'RSVP — Bride Guest',
           folder: 'Bride Side Guest Files' },
  groom: { label: 'Groom', sheet: 'Groom Guest', file: 'RSVP — Groom Guest',
           folder: 'Groom Side Guest Files' },
};

/* Where a reply goes when it names no side — only possible from a page
   cached before the side was added to the payload. It still lands in the
   parent, marked so it is obvious, and is copied to neither workbook. */
const UNKNOWN_SIDE = '— not recorded —';

/* An address to alert on every submission. Blank sends nothing.
   Gmail allows 100 of these a day on a free account. */
const NOTIFY_EMAIL = '';

/* Must match CONFIG.attendance.aadhaarRequired on the site. Set both to
   false if the hotel turns out not to need ID copies in advance. */
const AADHAAR_REQUIRED = true;

/* Must not be smaller than CONFIG.attendance.maxFileMB on the site,
   or guests will pass the browser's check and fail here. */
const MAX_FILE_MB = 10;

/* Three attachments per guest, so the three together are capped as well.
   Keep in step with CONFIG.attendance.maxTotalMB. */
const MAX_TOTAL_MB = 20;

const ALLOWED_EXT = [
  'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp',
  'pdf', 'doc', 'docx',
];

/* Column order. Change this and the sheet re-heads itself on the next
   submission — see sheet_(), which archives a sheet whose headings no
   longer match rather than writing new rows under the old ones. */
const HEADERS = [
  'Received at', 'Side', 'Name', 'Members attending',
  'Arrival date', 'Arriving by', 'Arrival ticket',
  'Departure date', 'Departing by', 'Departure ticket',
  'Contact number', 'Aadhaar card',
];

/* Which column each attachment lands in, by its position in HEADERS.
   Stated once so the row writer and the rebuild agree. */
const ATTACH_COL = { arriveTicket: 7, departTicket: 10, aadhaar: 12 };

/* The three uploads, in the order their columns appear. */
const ATTACHMENTS = [
  { key: 'arriveTicket', label: 'Arrival ticket'   },
  { key: 'departTicket', label: 'Departure ticket' },
  { key: 'aadhaar',      label: 'Aadhaar'          },
];


/* ── Entry points ───────────────────────────────────────────── */

/* Opening the /exec URL in a browser lands here. It exists so you
   can confirm the deployment is live without sending a real RSVP. */
function doGet() {
  return json_({ ok: true, message: 'RSVP endpoint is live.' });
}

function doPost(e) {
  /* Two guests submitting at the same instant would otherwise read
     the same last row and one would overwrite the other. */
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30 * 1000);
  } catch (err) {
    return json_({ ok: false, error: 'The form is busy. Please try again in a moment.' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'Empty request.' });
    }

    const data = JSON.parse(e.postData.contents);

    /* The honeypot. A guest never sees that field, so anything that
       filled it in is a bot. Answer as though it worked and write
       nothing — a rejection just tells the bot to try again. */
    if (data.website) return json_({ ok: true });

    const clean = validate_(data);
    if (clean.error) return json_({ ok: false, error: clean.error });

    /* Saved before the row is written, so a Drive failure means no row
       rather than a row pointing at a file that was never created. */
    const saved = saveUploads_(clean);

    const sheet = sheet_();
    sheet.appendRow([
      new Date(),
      clean.side ? SIDES[clean.side].label : UNKNOWN_SIDE,
      clean.name,
      clean.members,
      clean.arrive,
      clean.arriveBy,
      '',                     // arrival ticket — set as rich text below
      clean.depart,
      clean.departBy,
      '',                     // departure ticket
      "'" + clean.phone,      // leading quote keeps Sheets from eating a 0
      '',                     // Aadhaar
    ]);

    const row = sheet.getLastRow();
    for (var k in ATTACH_COL) {
      const rich = linkRich_(saved[k]);
      if (rich) sheet.getRange(row, ATTACH_COL[k]).setRichTextValue(rich);
    }

    /* The parent is the record. The side workbook is a copy of it, so a
       failure here must not fail the guest — their reply is already safe,
       and rebuildSides() can restore the copy at any time. */
    let sideRow = null;
    try {
      if (clean.side) sideRow = mirrorRow_(clean.side, sheet, row);
    } catch (err) {
      console.error('side copy failed (row ' + row + ' is safe in the parent): ' + err);
    }

    notify_(clean, saved);
    /* The counts come back so a deployment can be checked end to end
       without opening the files. Guests never see this. */
    return json_({ ok: true, filed: { side: clean.side || null, parentRow: row, sideRow: sideRow } });

  } catch (err) {
    /* Logged in full for you, summarised for the guest. */
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong at our end. Please try again, or call us.' });
  } finally {
    lock.releaseLock();
  }
}


/* ── Validation ─────────────────────────────────────────────── */

/* The browser checks all of this too. It is repeated here because
   anyone can post to the endpoint directly. */
function validate_(d) {
  const name = String(d.name || '').trim();
  if (name.length < 2)   return { error: 'Please give a name.' };
  if (name.length > 80)  return { error: 'That name is too long.' };

  const members = Math.floor(Number(d.members));
  if (!(members >= 1 && members <= 30)) {
    return { error: 'Members attending must be between 1 and 30.' };
  }

  const arrive = toDate_(d.arrive);
  const depart = toDate_(d.depart);
  if (!arrive) return { error: 'Please give the arrival date.' };
  if (!depart) return { error: 'Please give the departure date.' };
  if (depart < arrive) return { error: 'The departure date falls before the arrival date.' };

  const phone = String(d.phone || '').replace(/\D/g, '');
  if (phone.length < 10 || phone.length > 15) {
    return { error: 'Please give a valid contact number.' };
  }

  const arriveBy = String(d.arriveBy || '').trim();
  const departBy = String(d.departBy || '').trim();
  if (!arriveBy) return { error: 'Please choose how you are arriving.' };
  if (!departBy) return { error: 'Please choose how you are leaving.' };

  /* The tickets are optional — a guest driving in has none, and many reply
     before they have booked. Only the Aadhaar card is insisted on, and
     only while the site is still asking for it. */
  /* Each field arrives as a LIST — a family replying together has an
     Aadhaar card each, and often a ticket each. A single object is still
     accepted so that a page cached from before the change keeps working. */
  const src = d.files || {};
  const files = {};
  let total = 0;

  for (var i = 0; i < ATTACHMENTS.length; i++) {
    const spec = ATTACHMENTS[i];
    const raw  = src[spec.key];
    const list = raw == null ? [] : (Array.isArray(raw) ? raw : [raw]);
    const kept = [];

    for (var j = 0; j < list.length; j++) {
      const f = list[j];
      if (!f || !f.data) continue;

      const fname = String(f.name || '').trim();
      const b64   = String(f.data || '');
      if (!fname || !b64) continue;

      const ext = (fname.split('.').pop() || '').toLowerCase();
      if (ALLOWED_EXT.indexOf(ext) === -1) {
        return { error: spec.label + ' must be an image, a PDF or a Word document.' };
      }

      /* base64 carries 3 bytes in every 4 characters. */
      const bytes = Math.ceil(b64.length * 3 / 4);
      if (bytes > MAX_FILE_MB * 1024 * 1024) {
        return { error: spec.label + ' is larger than ' + MAX_FILE_MB + ' MB.' };
      }
      total += bytes;

      kept.push({ name: fname, ext: ext, type: String(f.type || ''), data: b64, label: spec.label });
    }

    if (!kept.length && spec.key === 'aadhaar' && AADHAAR_REQUIRED) {
      return { error: 'Please attach the Aadhaar card.' };
    }
    files[spec.key] = kept;
  }

  if (total > MAX_TOTAL_MB * 1024 * 1024) {
    return { error: 'Those attachments come to more than ' + MAX_TOTAL_MB + ' MB together.' };
  }

  /* Only the two known values are trusted; anything else is treated as
     unrecorded rather than used to name a folder or a sheet. */
  const side = SIDES[String(d.side || '').toLowerCase()] ? String(d.side).toLowerCase() : '';

  return {
    side: side,
    name: name,
    members: members,
    arrive: arrive,
    arriveBy: arriveBy,
    depart: depart,
    departBy: departBy,
    phone: phone,
    files: files,
  };
}

/* Built at midday so that no timezone shift can roll the date onto
   the day before, which is what a midnight Date does in Sheets. */
function toDate_(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}


/* ── Run these by hand, from the editor ─────────────────────── */

/* The links to share. The bride's planner gets the bride workbook and the
   bride folder; the groom's gets his. Neither can see the other's, and
   neither needs the parent. Run this and read the log. */
function sideLinks() {
  const out = ['Parent (everything): ' + sheet_().getParent().getUrl(), ''];
  for (var side in SIDES) {
    const ss = sideBook_(side);
    out.push(SIDES[side].label + ' workbook: ' + ss.getUrl());
    out.push(SIDES[side].label + ' folder:   ' + folder_(side).getUrl());
    out.push('');
  }
  console.log(out.join('\n'));
  return out.join('\n');
}

/* Rebuilds both side workbooks from the parent.

   The parent is the record; the side files are a copy of it. That is what
   makes this safe to run at any time — it never invents a row, it only
   restores what the parent already says. Use it after editing the parent
   by hand, or if a side copy ever failed at submission time. */
function rebuildSides() {
  const sheet = sheet_();
  const last  = sheet.getLastRow();
  const wiped = {};

  for (var side in SIDES) {
    const dest = sideSheet_(side);
    if (dest.getLastRow() > 1) {
      dest.deleteRows(2, dest.getLastRow() - 1);
    }
    wiped[side] = 0;
  }
  if (last < 2) { console.log('Parent is empty — nothing to rebuild.'); return wiped; }

  const values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const rich   = sheet.getRange(2, 1, last - 1, HEADERS.length).getRichTextValues();

  for (var i = 0; i < values.length; i++) {
    const label = String(values[i][1] || '').trim();
    for (var key in SIDES) {
      if (SIDES[key].label !== label) continue;
      const dest = sideSheet_(key);
      const to = dest.getRange(dest.getLastRow() + 1, 1, 1, HEADERS.length);
      to.setValues([values[i]]);
      to.setRichTextValues([rich[i]]);
      wiped[key]++;
    }
  }
  console.log('Rebuilt from ' + values.length + ' parent rows: ' + JSON.stringify(wiped));
  return wiped;
}

/* Removes the rows a check run left behind — any whose Name begins
   "ZZ TEST" — from the parent, then rebuilds the sides from what is left.
   The uploaded files stay in Drive; delete those from the folders. */
function deleteTestRows() {
  const sheet = sheet_();
  const last  = sheet.getLastRow();
  if (last < 2) return 0;
  const names = sheet.getRange(2, 3, last - 1, 1).getValues();   // column C = Name
  var gone = 0;
  /* Bottom up, so removing one does not shift the rows still to check. */
  for (var i = names.length - 1; i >= 0; i--) {
    if (/^ZZ TEST/i.test(String(names[i][0] || ''))) { sheet.deleteRow(i + 2); gone++; }
  }
  rebuildSides();
  console.log('Removed ' + gone + ' test row(s) and rebuilt the side workbooks.');
  return gone;
}


/* ── Drive + Sheet ──────────────────────────────────────────── */

/* Returns { aadhaar, arriveTicket, departTicket }, each an ARRAY of Drive
   Files — empty where nothing was attached. */
function saveUploads_(clean) {
  const folder = folder_(clean.side);
  const out = {};
  for (var i = 0; i < ATTACHMENTS.length; i++) {
    const key  = ATTACHMENTS[i].key;
    const list = clean.files[key] || [];
    const made = [];
    for (var j = 0; j < list.length; j++) {
      const f = list[j];
      const blob = Utilities.newBlob(
        Utilities.base64Decode(f.data),
        f.type || 'application/octet-stream',
        uploadName_(clean, f, list.length > 1 ? j + 1 : 0)
      );
      made.push(folder.createFile(blob));
    }
    out[key] = made;
  }
  return out;
}

/* Named so the folder is legible on its own: the planner can find a
   guest's ticket or ID without going through the sheet at all. */
function uploadName_(clean, f, nth) {
  const safe  = clean.name.replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 50) || 'Guest';
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
  /* Numbered only when there is more than one of a kind, so a single
     attachment keeps the name the planner is used to. */
  const part  = nth ? ' (' + nth + ')' : '';
  return safe + ' — ' + f.label + part + ' — ' + stamp + '.' + f.ext;
}

/* One cell per attachment: clickable, and still readable as a filename.
   HYPERLINK survives a download as .xlsx, so it stays clickable in the
   copy the planner is sent. */
/* A cell can hold ONE =HYPERLINK() formula and no more, so several files
   in one cell have to be rich text instead: the names on their own lines,
   each linked separately. Returned as a value to set after the row is
   appended, since rich text cannot go through appendRow. */
function linkRich_(files) {
  const list = files || [];
  if (!list.length) return null;
  const names = list.map(function (f) { return f.getName(); });
  const b = SpreadsheetApp.newRichTextValue().setText(names.join('\n'));
  var at = 0;
  for (var i = 0; i < list.length; i++) {
    b.setLinkUrl(at, at + names[i].length, list[i].getUrl());
    at += names[i].length + 1;          /* + the newline */
  }
  return b.build();
}

/* One folder per side, so a planner given the bride's folder cannot browse
   the groom's guests' ID copies. A reply with no side recorded falls back
   to the bride's — it has to go somewhere, and the row says it is unknown.
   Remembered by id, so renaming FOLDER in SIDES does not move an existing
   folder; rename it in Drive to match. */
function folder_(side) {
  const spec  = SIDES[side] || SIDES.bride;
  const key   = 'FOLDER_ID_' + (SIDES[side] ? side : 'bride');
  const props = PropertiesService.getScriptProperties();
  const id    = props.getProperty(key);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* deleted — remake it */ }
  }
  const found  = DriveApp.getFoldersByName(spec.folder);
  const folder = found.hasNext() ? found.next() : DriveApp.createFolder(spec.folder);
  props.setProperty(key, folder.getId());
  return folder;
}

/* That side's own workbook, made on first use and remembered by id. */
function sideBook_(side) {
  const spec = SIDES[side];
  if (!spec) return null;
  const key   = 'SHEET_ID_' + side;
  const props = PropertiesService.getScriptProperties();
  const id    = props.getProperty(key);
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (err) { /* deleted — remake it */ }
  }
  const ss = SpreadsheetApp.create(spec.file);
  props.setProperty(key, ss.getId());
  return ss;
}

/* The tab inside it, headed and formatted exactly like the parent so a
   row can be copied across without translating anything. */
function sideSheet_(side) {
  const ss = sideBook_(side);
  if (!ss) return null;
  const spec = SIDES[side];
  let sh = ss.getSheetByName(spec.sheet);
  if (!sh) {
    /* A new spreadsheet arrives with one tab called Sheet1. Use it rather
       than leaving an empty one lying beside the real thing. */
    const first = ss.getSheets()[0];
    sh = (ss.getSheets().length === 1 && first.getLastRow() === 0)
      ? first.setName(spec.sheet)
      : ss.insertSheet(spec.sheet);
  }
  if (sh.getLastRow() === 0) dressSheet_(sh);
  return sh;
}

/* Copies one row of the parent — values AND the rich text that carries the
   attachment links — into that side's sheet. Formulas would lose the
   links: they return values, and a link is formatting, not a value. */
function mirrorRow_(side, sh, row) {
  const dest = sideSheet_(side);
  if (!dest) return null;
  const from = sh.getRange(row, 1, 1, HEADERS.length);
  const to   = dest.getRange(dest.getLastRow() + 1, 1, 1, HEADERS.length);
  to.setValues(from.getValues());
  to.setRichTextValues(from.getRichTextValues());
  return dest.getLastRow();
}

function sheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sh = ss.getSheetByName(SHEET_NAME);

  /* The columns changed when travel details were added. Writing new rows
     under the old headings would put arrival dates under "Contact number"
     and nobody would notice until the planner tried to use it — so a sheet
     whose headings no longer match is set aside intact and a fresh one
     started. Nothing is deleted; the old rows keep their old headings. */
  if (sh && sh.getLastRow() > 0 && !headersMatch_(sh)) {
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    let archived = SHEET_NAME + ' (before ' + stamp + ')';
    let n = 2;
    while (ss.getSheetByName(archived)) archived = SHEET_NAME + ' (before ' + stamp + ') ' + (n++);
    sh.setName(archived);
    sh = null;
  }

  if (!sh) sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sh.getLastRow() === 0) dressSheet_(sh);
  return sh;
}

/* Headings, widths and number formats. The side workbooks are dressed the
   same way as the parent, so a row copies across without translating
   anything and reads identically wherever the planner opens it. */
function dressSheet_(sh) {
  sh.appendRow(HEADERS);
  sh.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#f6e7d2');
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('dd-mmm-yyyy hh:mm');
  sh.getRange('E:E').setNumberFormat('dd-mmm-yyyy');   // arrival
  sh.getRange('H:H').setNumberFormat('dd-mmm-yyyy');   // departure
  sh.getRange('K:K').setNumberFormat('@');             // keep the number a string
  /* One per column of HEADERS, in order. */
  const widths = [150, 90, 190, 140, 130, 120, 240, 130, 120, 240, 140, 240];
  for (var i = 0; i < widths.length; i++) sh.setColumnWidth(i + 1, widths[i]);
}

function headersMatch_(sh) {
  const width = Math.max(sh.getLastColumn(), 1);
  const row = sh.getRange(1, 1, 1, width).getValues()[0];
  if (width !== HEADERS.length) return false;
  for (var i = 0; i < HEADERS.length; i++) {
    if (String(row[i]).trim() !== HEADERS[i]) return false;
  }
  return true;
}


/* ── Notification ───────────────────────────────────────────── */

function notify_(clean, saved) {
  if (!NOTIFY_EMAIL) return;
  const day = function (d) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'd MMM yyyy');
  };
  try {
    const lines = [
      'Name ................ ' + clean.name,
      'Members attending ... ' + clean.members,
      'Arriving ............ ' + day(clean.arrive) + ' by ' + clean.arriveBy,
      'Departing ........... ' + day(clean.depart) + ' by ' + clean.departBy,
      'Contact ............. ' + clean.phone,
      '',
    ];
    for (var i = 0; i < ATTACHMENTS.length; i++) {
      const spec = ATTACHMENTS[i];
      const list = saved[spec.key] || [];
      if (!list.length) { lines.push(spec.label + ': — none attached —'); continue; }
      lines.push(spec.label + ':');
      for (var j = 0; j < list.length; j++) lines.push('  ' + list[j].getUrl());
    }
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'RSVP — ' + clean.name + ' (' + clean.members + ')',
      body: lines.join('\n'),
    });
  } catch (err) {
    /* A failed alert must never fail the RSVP — the row is saved. */
    console.error('notify failed: ' + err);
  }
}


/* ── Helpers ────────────────────────────────────────────────── */

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
