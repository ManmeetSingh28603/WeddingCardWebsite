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
const FOLDER_NAME = 'Radhika & Raghav — Aadhaar uploads';

/* An address to alert on every submission. Blank sends nothing.
   Gmail allows 100 of these a day on a free account. */
const NOTIFY_EMAIL = '';

/* Must not be smaller than CONFIG.attendance.maxFileMB on the site,
   or guests will pass the browser's check and fail here. */
const MAX_FILE_MB = 10;

const ALLOWED_EXT = [
  'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp',
  'pdf', 'doc', 'docx',
];

const HEADERS = [
  'Received at', 'Name', 'Members joining', 'Date of joining',
  'Date of leaving', 'Contact number', 'Function attending',
  'Aadhaar file', 'Aadhaar link',
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

    const file = saveUpload_(clean);

    sheet_().appendRow([
      new Date(),
      clean.name,
      clean.members,
      clean.arrive,
      clean.depart,
      "'" + clean.phone,      // leading quote keeps Sheets from eating a 0
      clean.attending,
      file.getName(),
      file.getUrl(),
    ]);

    notify_(clean, file);
    return json_({ ok: true });

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
    return { error: 'Members joining must be between 1 and 30.' };
  }

  const arrive = toDate_(d.arrive);
  const depart = toDate_(d.depart);
  if (!arrive) return { error: 'Please give the date of joining.' };
  if (!depart) return { error: 'Please give the date of leaving.' };
  if (depart < arrive) return { error: 'The date of leaving falls before the date of joining.' };

  const phone = String(d.phone || '').replace(/\D/g, '');
  if (phone.length < 10 || phone.length > 15) {
    return { error: 'Please give a valid contact number.' };
  }

  const attending = String(d.attending || '').trim();
  if (!attending) return { error: 'Please choose a function.' };

  const f = d.file || {};
  const fname = String(f.name || '').trim();
  const b64   = String(f.data || '');
  if (!fname || !b64) return { error: 'Please attach the Aadhaar card.' };

  const ext = (fname.split('.').pop() || '').toLowerCase();
  if (ALLOWED_EXT.indexOf(ext) === -1) {
    return { error: 'The Aadhaar card must be an image, a PDF or a Word document.' };
  }

  /* base64 carries 3 bytes in every 4 characters. */
  const bytes = Math.ceil(b64.length * 3 / 4);
  if (bytes > MAX_FILE_MB * 1024 * 1024) {
    return { error: 'That file is larger than ' + MAX_FILE_MB + ' MB.' };
  }

  return {
    name: name,
    members: members,
    arrive: arrive,
    depart: depart,
    phone: phone,
    attending: attending,
    file: { name: fname, ext: ext, type: String(f.type || ''), data: b64 },
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


/* ── Drive + Sheet ──────────────────────────────────────────── */

function saveUpload_(clean) {
  const blob = Utilities.newBlob(
    Utilities.base64Decode(clean.file.data),
    clean.file.type || 'application/octet-stream',
    uploadName_(clean)
  );
  return folder_().createFile(blob);
}

/* Named so the folder is legible on its own: the planner can find a
   guest's ID without going through the sheet. */
function uploadName_(clean) {
  const safe  = clean.name.replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 50) || 'Guest';
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
  return safe + ' — ' + stamp + '.' + clean.file.ext;
}

function folder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* deleted — remake it */ }
  }
  const found  = DriveApp.getFoldersByName(FOLDER_NAME);
  const folder = found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', folder.getId());
  return folder;
}

function sheet_() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#f6e7d2');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd-mmm-yyyy hh:mm');
    sh.getRange('D:E').setNumberFormat('dd-mmm-yyyy');
    sh.getRange('F:F').setNumberFormat('@');   // keep the number a string
    sh.setColumnWidth(1, 150); sh.setColumnWidth(2, 190); sh.setColumnWidth(3, 130);
    sh.setColumnWidth(4, 130); sh.setColumnWidth(5, 130); sh.setColumnWidth(6, 140);
    sh.setColumnWidth(7, 230); sh.setColumnWidth(8, 230); sh.setColumnWidth(9, 260);
  }
  return sh;
}


/* ── Notification ───────────────────────────────────────────── */

function notify_(clean, file) {
  if (!NOTIFY_EMAIL) return;
  const day = function (d) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'd MMM yyyy');
  };
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'RSVP — ' + clean.name + ' (' + clean.members + ')',
      body: [
        'Name ................ ' + clean.name,
        'Members joining ..... ' + clean.members,
        'Date of joining ..... ' + day(clean.arrive),
        'Date of leaving ..... ' + day(clean.depart),
        'Contact ............. ' + clean.phone,
        'Function ............ ' + clean.attending,
        '',
        'Aadhaar: ' + file.getUrl(),
      ].join('\n'),
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
