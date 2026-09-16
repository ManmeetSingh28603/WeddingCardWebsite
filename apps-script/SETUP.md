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

## Three files, not one

A reply says which card it came from, and the script files it twice:

| | |
| --- | --- |
| **the parent** — the sheet this script is bound to | every guest, both sides. The record. |
| **RSVP — Bride Guest** | the bride's guests only, in a tab called `Bride Guest` |
| **RSVP — Groom Guest** | the groom's guests only, in `Groom Guest` |

The two side workbooks are **separate files**, not tabs, because Google shares
by file and not by tab: the bride's planner can be given her workbook without
seeing the groom's guests. The uploads split the same way, into **Bride Side
Guest Files** and **Groom Side Guest Files**, so a link in one workbook never
points into the other side's folder.

Run **`sideLinks`** from the editor (Run ▸ sideLinks, then read the log) to
print the two workbook URLs and the two folder URLs to hand out.

> **The parent is the record; the side workbooks are a copy of it.** That is
> deliberate. If a copy ever fails, the guest's reply is already safe in the
> parent, and **`rebuildSides`** restores both workbooks from it. Run that
> after editing the parent by hand, too — it never invents a row, it only
> repeats what the parent says.

Everything is made on first use and remembered by id, so there is nothing to
create by hand. Renaming a workbook or folder in `SIDES` does **not** move
one that already exists — rename it in Drive to match.


## What lands in the sheet

One row per guest, twelve columns:

| | |
| --- | --- |
| Received at | when they replied |
| Side | which card they replied from — `Bride` or `Groom` |
| Name · Members attending · Contact number | who is coming |
| Arrival date · Arriving by · Arrival ticket | in |
| Departure date · Departing by · Departure ticket | out |
| Aadhaar card | for hotel check-in |

Each attachment column holds one clickable link per file, named after it.
A guest can attach several — a family replying together has an Aadhaar card
each, and often a ticket each — and they arrive on their own lines in the
one cell.

> A cell can hold **one** `=HYPERLINK()` formula and no more, so several
> links in a cell are written as rich text instead. That is a Sheets value,
> not a formula: it survives a download as `.xlsx`, but a CSV export keeps
> only the names. Export `.xlsx` if the planner needs the links.

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

## Checking it, and clearing up afterwards

A check run leaves rows named `ZZ TEST …`. **`deleteTestRows`** takes them out
of the parent and rebuilds both side workbooks from what is left. The files
they uploaded stay in Drive — delete those from the two folders yourself.


## Redeploying after a site change

The site and this script have to agree on the shape of what is posted. The
script reads **either** shape — one file per field, or a list — so a page a
guest has cached from before a change keeps working.

It does not run the other way. A site that sends lists to a deployment older
than that change gets every reply refused. So when both have changed:

1. paste the new `Code.gs`, **Deploy → Manage deployments → Edit → Version:
   New version → Deploy**, then
2. publish the site.

Done in that order there is no window where a guest can be turned away.

The side routing is gentler than that: the old script ignores the extra
`side` field, and the new one files a reply that names no side into the
parent marked `— not recorded —` rather than guessing. Neither half can break
the form. But routing only starts once **both** are live, so keep the same
order.


## Changing things later

Everything on the site side is in `CONFIG.attendance` at the top of
`script.js`:

| Key | What it does |
| --- | --- |
| `endpoint` | the `/exec` URL. Blank = the form still renders, but says it is not connected yet |
| `mapUrl` | where the map button goes |
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
