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
/* Holds tickets as well as ID copies now. Renaming this does NOT move an
   existing folder — the script remembers the one it made by id — so if
   yours is still called "Aadhaar uploads", rename it in Drive to match. */
const FOLDER_NAME = 'Radhika & Raghav — RSVP uploads';

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
  'Received at', 'Name', 'Members attending',
  'Arrival date', 'Arriving by', 'Arrival ticket',
  'Departure date', 'Departing by', 'Departure ticket',
  'Contact number', 'Function attending', 'Aadhaar card',
];

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

    sheet_().appendRow([
      new Date(),
      clean.name,
      clean.members,
      clean.arrive,
      clean.arriveBy,
      linkCell_(saved.arriveTicket),
      clean.depart,
      clean.departBy,
      linkCell_(saved.departTicket),
      "'" + clean.phone,      // leading quote keeps Sheets from eating a 0
      clean.attending,
      linkCell_(saved.aadhaar),
    ]);

    notify_(clean, saved);
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

  const attending = String(d.attending || '').trim();
  if (!attending) return { error: 'Please choose a function.' };

  /* The tickets are optional — a guest driving in has none, and many reply
     before they have booked. Only the Aadhaar card is insisted on, and
     only while the site is still asking for it. */
  const src = d.files || {};
  const files = {};
  let total = 0;

  for (var i = 0; i < ATTACHMENTS.length; i++) {
    const spec = ATTACHMENTS[i];
    const f = src[spec.key];
    if (!f || !f.data) {
      if (spec.key === 'aadhaar' && AADHAAR_REQUIRED) {
        return { error: 'Please attach the Aadhaar card.' };
      }
      files[spec.key] = null;
      continue;
    }

    const fname = String(f.name || '').trim();
    const b64   = String(f.data || '');
    if (!fname || !b64) { files[spec.key] = null; continue; }

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

    files[spec.key] = { name: fname, ext: ext, type: String(f.type || ''), data: b64, label: spec.label };
  }

  if (total > MAX_TOTAL_MB * 1024 * 1024) {
    return { error: 'Those attachments come to more than ' + MAX_TOTAL_MB + ' MB together.' };
  }

  return {
    name: name,
    members: members,
    arrive: arrive,
    arriveBy: arriveBy,
    depart: depart,
    departBy: departBy,
    phone: phone,
    attending: attending,
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


/* ── Drive + Sheet ──────────────────────────────────────────── */

/* Returns { aadhaar, arriveTicket, departTicket }, each a Drive File or
   null where nothing was attached. */
function saveUploads_(clean) {
  const folder = folder_();
  const out = {};
  for (var i = 0; i < ATTACHMENTS.length; i++) {
    const key = ATTACHMENTS[i].key;
    const f = clean.files[key];
    if (!f) { out[key] = null; continue; }
    const blob = Utilities.newBlob(
      Utilities.base64Decode(f.data),
      f.type || 'application/octet-stream',
      uploadName_(clean, f)
    );
    out[key] = folder.createFile(blob);
  }
  return out;
}

/* Named so the folder is legible on its own: the planner can find a
   guest's ticket or ID without going through the sheet at all. */
function uploadName_(clean, f) {
  const safe  = clean.name.replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 50) || 'Guest';
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
  return safe + ' — ' + f.label + ' — ' + stamp + '.' + f.ext;
}

/* One cell per attachment: clickable, and still readable as a filename.
   HYPERLINK survives a download as .xlsx, so it stays clickable in the
   copy the planner is sent. */
function linkCell_(file) {
  if (!file) return '';
  return '=HYPERLINK("' + file.getUrl() + '","' + file.getName().replace(/"/g, '""') + '")';
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

  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#f6e7d2');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('dd-mmm-yyyy hh:mm');
    sh.getRange('D:D').setNumberFormat('dd-mmm-yyyy');   // arrival
    sh.getRange('G:G').setNumberFormat('dd-mmm-yyyy');   // departure
    sh.getRange('J:J').setNumberFormat('@');             // keep the number a string
    const widths = [150, 190, 140, 130, 120, 240, 130, 120, 240, 140, 230, 240];
    for (var i = 0; i < widths.length; i++) sh.setColumnWidth(i + 1, widths[i]);
  }
  return sh;
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
      'Function ............ ' + clean.attending,
      '',
    ];
    for (var i = 0; i < ATTACHMENTS.length; i++) {
      const spec = ATTACHMENTS[i];
      const f = saved[spec.key];
      lines.push(spec.label + ': ' + (f ? f.getUrl() : '— none attached —'));
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
