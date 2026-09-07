# RSVP form — setup

The website is static: GitHub Pages serves files and cannot receive
anything back. So the form posts to a **Google Apps Script web app**,
which writes a row into a **Google Sheet** and drops the ID upload into a
**Google Drive folder**.

That combination was chosen because it is free, needs no server, and — the
part that matters most for a wedding — **guests do not need a Google
account**. A Google Form with file upload switched on forces every guest to
sign in before they can attach anything, which would lose the older half of
the guest list.

The Sheet is the Excel file. `File > Download > Microsoft Excel (.xlsx)`
whenever the planner wants a copy, or just share the live Sheet so it is
never out of date.

**One-time setup, about ten minutes.** Until step 6 is done the form is on
the page but cannot send.

---

## What lands in the sheet

One row per guest, twelve columns:

| | |
| --- | --- |
| Received at | when they replied |
| Name · Members attending · Contact number | who is coming |
| Arrival date · Arriving by · Arrival ticket | in |
| Departure date · Departing by · Departure ticket | out |
| Function attending | Ring Ceremony, Wedding, or both |
| Aadhaar card | for hotel check-in |

The three attachment columns hold a clickable link named after the file.
`HYPERLINK` survives a download as `.xlsx`, so it stays clickable in the copy
the planner is sent.

> **Already have a sheet from before travel details were added?** Nothing to
> do. The columns changed, so the first submission after you redeploy renames
> your existing tab to `RSVP (before <date>)` and starts a clean `RSVP`
> alongside it. Nothing is deleted, and no row is ever written under headings
> that do not match it.

## 1. Make the Sheet

New sheet at <https://sheets.new>. Name it something like
**Radhika & Raghav — RSVP**.

Don't add headings. The script writes them the first time a guest submits.

## 2. Open the script editor

In that sheet: **Extensions → Apps Script**.

## 3. Paste the code

Delete whatever is in `Code.gs` and paste the whole of
[`Code.gs`](./Code.gs) from this folder. Save (Ctrl+S).

Optional, at the top of the file:

```js
const NOTIFY_EMAIL = 'you@example.com';   // emails you on every RSVP
```

## 4. Deploy it

**Deploy → New deployment**. Click the gear beside "Select type" and choose
**Web app**. Then:

| Field | Set it to |
| --- | --- |
| Description | `RSVP` |
| Execute as | **Me** |
| Who has access | **Anyone** |

Press **Deploy**.

> **"Who has access: Anyone" does not make your Sheet public.** It means
> the script may run for a guest who is not signed in — which is the whole
> point. The script is the only thing that can reach the Sheet, and it only
> ever appends.

## 5. Approve the permissions

Google will warn you, because the script is unpublished and yours:

**Review permissions → your account → Advanced → Go to (project name)
(unsafe) → Allow.**

It is asking for Drive and Sheets because it saves the upload and writes
the row.

## 6. Copy the URL into the site

Copy the **Web app URL** — it ends in `/exec`. Open `script.js` and put it in
`CONFIG.attendance`:

```js
attendance: {
  endpoint: 'https://script.google.com/macros/s/AKfy...long.../exec',
```

Commit and push. That is it.

## 7. Check it

Open the `/exec` URL in a browser. You should see:

```json
{"ok":true,"message":"RSVP endpoint is live."}
```

Then send one real RSVP through the website and confirm the row lands in the
Sheet and the file in the Drive folder.

---

## Giving the planner access

Two things have to be shared, and they are separate. Share only the Sheet
and the links in it will not open for them.

**The Sheet** — open it, **Share**, add the planner's email, role
**Viewer**. Use **Commenter** if you want them to be able to flag rows, or
**Editor** if they will manage arrivals in it.

**The uploads folder** — in Drive, find **`Radhika & Raghav — RSVP uploads`**
(the script creates it on the first submission). Share it with the same
address, **Viewer**.

Every file is named `Guest name — what it is — date`, so the folder is
usable on its own without going through the sheet.

> If your folder is still called **`Aadhaar uploads`**, that is the one from
> before tickets were added. The script keeps using it — it remembers the
> folder by id, not by name — so just rename it in Drive to match.

### Sending an actual Excel file

`File → Download → Microsoft Excel (.xlsx)`.

Worth knowing: an export is a snapshot, so it stops updating the moment it
is sent, and the Aadhaar column holds links rather than the files
themselves. For a planner who wants live numbers, sharing the Sheet is
better than mailing a file.

---

## About the Aadhaar copies

These are government ID documents for people who are not you, so a few
things are worth being deliberate about:

- **Share to named email addresses, never "Anyone with the link."** That
  setting on the Sheet or the folder would put every guest's ID one
  forwarded link away from anyone.
- **Keep the circle small** — the family and the planner. The hotel needs to
  *see* an ID at check-in; it rarely needs its own copy of all of them in
  advance, so ask before forwarding the set on.
- **Delete the folder after the wedding.** There is no reason to keep them
  once everyone has checked out, and it is the one step that reliably closes
  the risk.
- The form tells guests why it is being asked for and who sees it. If the
  hotel turns out not to need it, drop the field: set
  `CONFIG.attendance.aadhaarRequired` to `false` in `script.js` and the
  field disappears from the form.

---

## Changing things later

Everything on the site side is in `CONFIG.attendance` at the top of
`script.js`:

| Key | What it does |
| --- | --- |
| `endpoint` | the `/exec` URL. Blank = the form still renders, but says it is not connected yet |
| `mapUrl` | where the map button goes |
| `functions` | the Function attending options |
| `travelModes` | the Arriving/Departing by options |
| `ticketlessModes` | modes with no ticket to attach — picking one hides that upload. Must match the spelling in `travelModes` |
| `dateMin` / `dateMax` | the window the date pickers allow |
| `maxFileMB` | per-file cap. Raise `MAX_FILE_MB` in `Code.gs` to match, or the browser will let through what the script then rejects |
| `maxTotalMB` | cap on the three attachments together. Pair with `MAX_TOTAL_MB` in `Code.gs` |
| `aadhaarRequired` | `false` removes the upload field entirely. Set `AADHAAR_REQUIRED` in `Code.gs` to match |

Tickets are always optional — a guest driving in has none, and plenty reply
before they have booked. Only the Aadhaar card is insisted on.

**After editing `Code.gs` you must redeploy**, or the change never goes
live: **Deploy → Manage deployments → pencil icon → Version: New version →
Deploy.** This keeps the same URL. Creating a *new deployment* instead gives
you a different URL and the site keeps talking to the old one.
