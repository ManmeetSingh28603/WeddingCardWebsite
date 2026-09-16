/* ============================================================
   Wedding invitation — behaviour
   Intro gate · Hero card · Scratch-to-reveal · Save the dates ·
   Venue · Blessings · RSVP · Countdown · Music
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   THE ONE PLACE TO EDIT
   Everything the invitation says lives in this object. Nothing
   below it needs touching to change a name, a time or a number.
   ════════════════════════════════════════════════════════════ */
let CONFIG = {

  couple: {
    names:   'Radhika & Raghav',
    bride:   'Radhika',
    groom:   'Raghav',
    venue:   'Hotel Damson Plum, Lucknow',
    /* MISSING — not supplied. Left empty, which hides it in the scratch
       section and the footer rather than printing a placeholder. */
    hashtag: '',
  },

  dates: {
    year: 2026,
    /* These three are FALLBACKS. The dates actually printed in the hero,
       under the foil and in the footer are derived from whichever
       functions are on screen — see spanOf() — so a guest invited only to
       the Reception is not told the celebration runs 18–25 November.
       They are used only if that derivation finds no dated events. */
    scratchNumber: '18 – 25',        // revealed under the foil
    scratchMonth:  'November 2026',
    footer:        '18<sup>th</sup> – 25<sup>th</sup> November 2026',
    /* Drives the countdown; mo is 0-indexed, so 10 = November. Set to the
       wedding itself. The year is not stated anywhere in the details, but
       20 Nov falls on a Friday and 21 Nov on a Saturday in 2026 and in no
       neighbouring year, so 2026 is the only fit — which puts the Hawan on
       Thursday the 19th. */
    moment: { y: 2026, mo: 10, d: 21, h: 13, min: 0 },
  },

  /* The invitation card the gate opens onto. */
  hero: {
    eyebrow: 'Together with our families',
    /* The mark inside the gold ring. Empty removes the ring entirely. */
    mark:    'ॐ',
    invite:  'With joyous hearts, we invite you to celebrate the beginning of our beautiful new chapter.',
    /* Fallback only — see CONFIG.dates. */
    dates:   '18 · 25 November',
  },

  /* ── Per-guest invitations ──────────────────────────────────────
     One invitation, many links. A link carries the functions that
     guest is invited to:

       .../WeddingCardWebsite/?e=wedding,reception

     and only those cards render. The plain URL, with no ?e at all, is
     the general invitation and shows every function. Nothing else about
     the page changes, and no per-guest data lives in the repo — the
     link IS the configuration, so inviting someone never needs a code
     change or a redeploy.

     A link can also drop the Blessings section:

       .../WeddingCardWebsite/?e=wedding&b=0

     Blessings SHOW by default, so the plain URL is unaffected and only
     a link that says otherwise hides them.

     invite-builder.html is the tool that writes the links. */
  invite: {
    param: 'e',
    blessingsParam: 'b',
    attendParam: 'a',
  },

  scratch: {
    heading: 'With immense joy and love',
    cta:     'Scratch to reveal',
  },

  venue: {
    kicker:  'Find your way to us',
    name:    'Hotel Damson Plum',
    /* Reverse-geocoded from the Maps link below, NOT supplied by the
       family — worth having them confirm it before the cards go out. */
    address: 'Shaheed Path, Ahmamau, Sarojini Nagar,<br />Lucknow, Uttar Pradesh 226030',
    mapUrl:  'https://maps.app.goo.gl/DXLwTFf2VQH3iJxq8',
    /* Google's keyless embed form. Coordinates come from the link above,
       so the pin lands on the hotel itself rather than on a name search. */
    lat: 26.7794782,
    lng: 80.9931704,
    zoom: 16,
  },

  /* The families' lineage lines. They used to be printed on the formal
     invitation card, which was removed on request, so NOTHING renders
     these today — they are kept because deleting them would lose the only
     record of both sides' names in the project. Say the word and they go
     under the names in the hero. */
  lineage: {
    bride: [
      'GD/O Late Smt Vijay Rastogi &amp; Shri Sharad Chandra Rastogi',
      'D/O Smt Meetu Rastogi &amp; Shri Atul Chandra Rastogi',
    ],
    /* only the parents' line was supplied for the groom */
    groom: [
      'S/O Smt. Sonia Khanna &amp; Late Manoj Khanna',
    ],
  },

  /* One card per function. Tapping a card expands it in place into the
     full invitation — see initEventCards().

     `id` is what a guest link names, so these strings are part of every
     link already sent out: renaming one breaks those links.

     No card says whose side a function is on. Guests are told which
     functions they are invited to by their own link, and the cards read
     the same for everyone.

       at     when the countdown aims at this function; noon if absent
       art    the painting behind the card
       theme  which particle treatment plays: marigold | stars | breeze

     Every card that has a film takes its closed face from that film — a
     single frame cut out of it (assets/cards/*-still.jpg) — so the shut
     card and the opened one are the same scene, and no two cards on a page
     look alike. Before this, three paintings were shared between six
     functions and the groom's Engagement and Reception drew the same one.
     The still doubles as the video's poster, so opening a card has nothing
     to flash through. */
  events: [
    {
      id: 'haldi', title: 'Haldi &amp; Mehendi',
      day: '18', suffix: 'th', weekday: 'Wednesday', month: 'November',
      time: '1:00 pm onwards',
      at: { h: 13, min: 0 },
      copy: 'Turmeric, marigolds and far too much laughter — the celebration opens here.',
      art: 'assets/cards/haldi-mehendi-still.jpg', theme: 'marigold',
      /* Its own set at last — the same bougainvillea arch, but a different
         one from Bloomsville's, which this card had been borrowing. Light
         scene, so the wording stays dark. filmCrop drops the bottom of the
         frame, where this source carries its generator's mark. */
      film: 'assets/video/haldi-mehendi-bg.mp4', filmCrop: 'bottom',
    },
    {
      id: 'hawan', title: 'Hawan',
      day: '19', suffix: 'th', weekday: 'Thursday', month: 'November',
      time: '7:30 pm onwards',
      at: { h: 19, min: 30 },
      copy: 'The first of the rites, and the quiet beginning of everything that follows.',
      art: 'assets/cards/hawan-still.jpg', theme: 'marigold',
      /* a night rite: dark sky, lit mandap — so the wording flips to cream.
         filmCrop drops the bottom of the frame, where the source carries
         its generator's mark. */
      film: 'assets/video/hawan-bg.mp4', filmTone: 'night', filmCrop: 'bottom',
    },
    {
      /* The three shared functions carry the couple's own names for them.
         `subtitle` keeps the function underneath, so a guest still knows
         which rite Bloomsville is. */
      id: 'mehendi', title: 'Bloomsville', subtitle: 'Mehendi',
      day: '20', suffix: 'th', weekday: 'Friday', month: 'November',
      time: '2:00 pm onwards',
      at: { h: 14, min: 0 },
      copy: 'Where henna blooms, laughter flows and everyone gathers to celebrate the bride and groom and the beginning of their forever.',
      art: 'assets/cards/mehendi-still.jpg', theme: 'marigold',
      film: 'assets/video/mehendi-bg.mp4',
    },
    {
      id: 'sangeet', title: 'Sparkle Street', subtitle: 'Engagement &amp; Sangeet',
      day: '20', suffix: 'th', weekday: 'Friday', month: 'November',
      time: '8:00 pm onwards',
      at: { h: 20, min: 0 },
      /* A function that runs to a timetable prints the timetable instead of
         a single time; `time` is still the one-line version the shut card
         and the countdown use. */
      schedule: [
        { what: 'Ring Ceremony', when: '8:00 pm' },
        { what: 'Sangeet',       when: '8:30 pm onwards' },
      ],
      copy: 'A dazzling evening of music, dance, laughter and celebration as we mark the beginning of forever and raise a toast to the love, joy and togetherness that brought us all to RaRaLand.',
      /* The ballroom — a dancing floor under chandeliers. It arrived as
         reception.mp4 but belongs to this evening, not the quiet one on
         the 25th, and is named for the card it serves. */
      art: 'assets/cards/sangeet-still.jpg', theme: 'stars',
      film: 'assets/video/sangeet-bg.mp4', filmTone: 'night',
    },
    {
      id: 'wedding', title: 'The Forever Land', subtitle: 'Wedding',
      day: '21', suffix: 'st', weekday: 'Saturday', month: 'November',
      time: '1:00 pm onwards',
      at: { h: 13, min: 0 },
      schedule: [
        { what: 'Baraat',    when: '1:00 pm' },
        { what: 'Varmala',   when: '2:00 pm' },
        { what: 'Pheras',    when: '3:00 pm onwards' },
        { what: 'Reception', when: '7:30 pm onwards' },
      ],
      copy: 'Where two journeys become one. The heart of RaRaLand, a beautiful celebration of love, family and the beginning of our forever together.',
      art: 'assets/cards/wedding-still.jpg', theme: 'breeze',
      film: 'assets/video/wedding-bg.mp4',
    },
    {
      id: 'reception', title: 'Reception',
      day: '25', suffix: 'th', weekday: 'Wednesday', month: 'November',
      time: '7:00 pm onwards',
      at: { h: 19, min: 0 },
      copy: 'One last evening together, to close the celebration the way it began.',
      /* A garden under strung lights — its own film, so the lit-courtyard
         one it had been borrowing is retired. No crop: unlike its three
         siblings from the same generator, this export carries no mark. */
      art: 'assets/cards/reception-still.jpg', theme: 'stars',
      film: 'assets/video/reception-bg.mp4', filmTone: 'night',
    },
  ],

  /* One page per side, each built from its own list below. */
  blessings: {
    note: 'With the love and good wishes of our families.',
    bride: [
      {
        title: 'With Best Compliments',
        names: [
          'Smt Vijaylaxmi Rastogi',
          'Shri Rajnikant Rastogi',
          'Smt Malini Rastogi',
          'Ritu &ndash; Abhishek',
          'Meenal &ndash; Ajay',
          'Pragya &ndash; Prateek',
        ],
      },
      {
        title: 'Awaiting Eyes',
        names: [
          'Keshav',
          'Shashwat &ndash; Vasundhra',
          'Arnav, Tvisha, Aradhya &amp; Ritanshi',
        ],
      },
    ],
    groom: [
      {
        title: 'With Best Compliments',
        names: [
          'Shriya Khanna Sehra',
          'Akash Sehra',
        ],
      },
      {
        title: 'Awaiting Eyes',
        names: [
          'Soraya Khanna Sehra',
        ],
      },
    ],
  },

  /* `tel` is the full international form behind the call and WhatsApp
     links; `shown` is what is printed on the page. */
  /* One side only, on request — no groom's-side contacts were supplied
     and the placeholder row, which had no working call or WhatsApp
     button, has been taken out. */
  rsvp: {
    bride: [
      { name: 'Atul Chandra Rastogi', shown: '94150 22314', tel: '919415022314' },
      { name: 'Meetu Rastogi',        shown: '99199 96769', tel: '919919996769' },
    ],
  },

  /* The attendance form under the RSVP contacts.
     GitHub Pages only serves files, so the form posts to a Google
     Apps Script web app, which files the upload in Drive and appends
     a row to the Google Sheet the hosts share with their planner.
     apps-script/SETUP.md is the ten-minute walkthrough. */
  attendance: {
    /* The deployed Apps Script web app. Blank renders the form as
       normal but tells anyone who submits that it is not connected
       yet — better than hiding it, and better than swallowing a
       guest's details.
       Editing apps-script/Code.gs does NOT change what this URL
       serves. Redeploy as a new VERSION of the SAME deployment
       (Deploy > Manage deployments > pencil), or the code and the
       URL drift apart; a brand new deployment gets a new URL and
       this one keeps answering with the old code. */
    endpoint: 'https://script.google.com/macros/s/AKfycbyVICsmwBZ37vwKcLHxjIbcC6H4SZDRK_pqXH-M63FKzQjz4lG6Q7BZHPXJwM6cf9M/exec',

    /* The map link lives in CONFIG.venue, which the Venue section reads.
       It is deliberately not repeated here: one place, one link. */

    /* There is deliberately no `functions` list here any more. The form
       used to ask which function a guest was coming to; it was dropped on
       request. Adding it back means the select in index.html, the
       validation, the payload field, and the column in apps-script/Code.gs
       — the sheet re-heads itself when that column list changes. */

    /* How guests travel in and out. */
    travelModes: ['Flight', 'Train', 'Car'],

    /* Modes with no ticket to attach: picking one hides that upload rather
       than leaving a field nobody can fill. Match the spelling above. */
    ticketlessModes: ['Car'],

    /* Bounds on the date pickers. Wide enough for guests who travel in
       early or stay on, tight enough to catch a mistyped year. */
    dateMin: '2026-11-01',
    dateMax: '2026-12-15',

    /* Raise MAX_FILE_MB in apps-script/Code.gs alongside this, or the
       browser lets through what the script then rejects. Photographs
       are shrunk before upload, so this only really binds on PDFs. */
    maxFileMB: 10,

    /* A guest can now attach three files. base64 inflates each by a third,
       so three at the per-file cap would be ~40 MB on the wire — past what
       Apps Script accepts, and hopeless on mobile data long before that.
       This caps the three together. Keep MAX_TOTAL_MB in Code.gs in step. */
    maxTotalMB: 20,

    /* false drops the upload field entirely — use it if the hotel turns
       out not to need ID copies in advance. */
    aadhaarRequired: true,
  },
};

const SIDE = document.documentElement.dataset.inviteSide === 'groom' ? 'groom' : 'bride';

/* Two venues, one per side. Each carries its own link AND its own
   coordinates: the "Find your way to us" map is pinned by lat/lng, so a
   shared link with the wrong name and address underneath — which is what
   both cards had — sends half the guests to the wrong city. */
const DAMSON = {
  name: 'Hotel Damson Plum',
  address: 'Shaheed Path, Ahmamau, Sarojini Nagar,<br />Lucknow, Uttar Pradesh 226030',
  mapUrl: 'https://maps.app.goo.gl/DXLwTFf2VQH3iJxq8',
  lat: 26.7794782, lng: 80.9931704,
};
const TIVOLI = {
  name: 'The Tivoli, Chattarpur',
  address: 'Sant Shri Nagpal Marg, Chhattarpur,<br />New Delhi, Delhi 110030',
  mapUrl: 'https://maps.app.goo.gl/U9xHcH8F4znFgR7Z7',
  lat: 28.4966351, lng: 77.1853145,
};
/* Every function has its own room or address, so the venue is looked up per
   event rather than derived from a side. `city` is simply the second line,
   and an empty mapUrl prints no link at all. The two addresses came from the
   supplied Maps links, which resolve to SADAR APARTMENT, Mayur Vihar, New
   Delhi 110091 and Metro City Gate no. 1, Balmikinagar, Lucknow 226006. */
const V_SADAR      = { name: 'Sadar Apartments',   city: 'Mayur Vihar, New Delhi',
                       mapUrl: 'https://maps.app.goo.gl/PHzP42YCLCTQx3pS6' };
const V_METROCITY  = { name: 'Metrocity, Papermill Colony', city: 'Gate No. 1, Lucknow',
                       mapUrl: 'https://maps.app.goo.gl/Vvieqmicfh3h9fyS8' };
const V_CLOVE      = { name: 'Clove Area, 1st Floor', city: 'Hotel Damson Plum, Lucknow', mapUrl: DAMSON.mapUrl };
const V_HALL_FIRST = { name: '1st Floor Hall',     city: 'Hotel Damson Plum, Lucknow',  mapUrl: DAMSON.mapUrl };
const V_HALL_GROUND= { name: 'Ground Floor Hall',  city: 'Hotel Damson Plum, Lucknow',  mapUrl: DAMSON.mapUrl };
const V_TIVOLI     = { name: TIVOLI.name,          city: 'New Delhi',                   mapUrl: TIVOLI.mapUrl };
const EVENT_VENUES = {
  haldi:     V_SADAR,
  hawan:     V_METROCITY,
  mehendi:   V_CLOVE,
  sangeet:   V_HALL_FIRST,
  wedding:   V_HALL_GROUND,
  reception: V_TIVOLI,
};
const SIDE_CONFIGS = {
  bride: {
    names: 'Radhika & Raghav', order: ['bride', 'groom'], blessings: true,
    /* Her card opens on a Shrinathji pichwai where the other carries the
       ॐ. Only this side has one; leave it off and the glyph stands. */
    markImage: 'assets/hero/nathji.jpg',
    events: ['hawan', 'mehendi', 'sangeet', 'wedding'], rsvp: CONFIG.rsvp.bride,
    venue: DAMSON,
  },
  groom: {
    names: 'Raghav & Radhika', order: ['groom', 'bride'], blessings: true,
    events: ['haldi', 'mehendi', 'sangeet', 'wedding', 'reception'],
    rsvp: [{ name: 'Sonia Khanna', shown: '97171 94045', tel: '919717194045' }],
    /* the groom's side gathers at the Tivoli, so that is the map on his card */
    venue: TIVOLI,
  },
};

CONFIG.lineage = {
  bride: [
    'GD/O Lt. Smt. Vijay Rastogi &amp; Shri Sharad Chandra Rastogi',
    'D/O Smt. Meetu Rastogi &amp; Shri Atul Chandra Rastogi',
  ],
  groom: [
    'GS/O Smt. Madhu Khanna &amp; Shri R.N Khanna',
    'S/O Smt. Sonia Khanna &amp; Shri Manoj Khanna',
  ],
};
Object.assign(CONFIG.venue, SIDE_CONFIGS[SIDE].venue);
/* Feeds the <title> and any [data-venue] line, so it has to follow the
   side too — the groom's card is not a Damson Plum card. */
CONFIG.couple.venue = SIDE === 'groom' ? 'The Tivoli, Chattarpur' : 'Hotel Damson Plum, Lucknow';
CONFIG.events = CONFIG.events.map((event) => ({
  ...event,
  venue: EVENT_VENUES[event.id]
    || { name: DAMSON.name, city: 'Lucknow', mapUrl: DAMSON.mapUrl },
}));
const SIDE_CONFIG = SIDE_CONFIGS[SIDE];
CONFIG.couple.names = SIDE_CONFIG.names;
CONFIG.rsvp.bride = SIDE_CONFIG.rsvp;
CONFIG.events = CONFIG.events.filter((event) => SIDE_CONFIG.events.includes(event.id));
/* ════════════════════════════════════════════════════════════
   Nothing below here needs editing for ordinary changes.
   ════════════════════════════════════════════════════════════ */


const CFG = { reducedMotion: false };

/* Only the tap's TRAILING events carry user activation on Android Chrome —
   pointerdown and touchstart never do. Every audio retry uses this list. */
const RETRY_EVENTS = ['pointerup', 'touchend', 'click', 'keydown'];

document.addEventListener('DOMContentLoaded', () => {
  CFG.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderStrings();
  renderVenue();
  renderEventCards();
  renderBlessings();
  renderRsvp();

  initMusic();
  initIntro();
  initHero();
  initEventCards();
  initFooter();
  initBlessings();
  initRsvp();
  initAttendance();
  initCountdownSection();
  initScratch();
});


/* ============================================================
   SHARED HELPERS
   ============================================================ */

/* Add a class the first time an element comes into view, then stop watching.
   Under reduced motion the class is applied at once. */
function revealOnce(el, className, options) {
  if (!el) return;
  if (CFG.reducedMotion || !('IntersectionObserver' in window)) {
    el.classList.add(className);
    return;
  }
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    el.classList.add(className);
    obs.disconnect();
  }, options || { threshold: 0.2 }).observe(el);
}

/* Stamp an ascending delay across a list, so a group arrives in reading
   order without a hand-written delay per element in the CSS. */
function stagger(nodes, prop, step, start) {
  Array.prototype.forEach.call(nodes, (el, i) => {
    el.style.setProperty(prop, `${(start || 0) + i * step}ms`);
  });
}

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};


/* ============================================================
   CONTENT — rendered from CONFIG
   ============================================================ */

function renderStrings() {
  document.querySelectorAll('[data-couple-names]').forEach(n => { n.textContent = CONFIG.couple.names; });
  document.querySelectorAll('[data-venue]').forEach(n => { n.textContent = CONFIG.couple.venue; });

  /* An unset line is removed rather than printed empty — an invitation with
     a blank where the hashtag goes reads as a fault, a shorter one does not. */
  document.querySelectorAll('[data-hashtag]').forEach(n => {
    if (CONFIG.couple.hashtag) n.textContent = CONFIG.couple.hashtag;
    else n.remove();
  });

  /* ── the hero card ──
     Every line here follows the same convention as the hashtag: an empty
     string takes the line away rather than printing a gap. */
  const line = (sel, value, asHtml) => {
    document.querySelectorAll(sel).forEach((n) => {
      if (!value) { n.remove(); return; }
      if (asHtml) n.innerHTML = value; else n.textContent = value;
    });
  };
  const H = CONFIG.hero || {};
  line('[data-hero-eyebrow]', H.eyebrow);
  line('[data-hero-mark]',    H.mark);
  /* A painting, not a glyph — so the gold ring opens out into a framed
     panel. A pichwai inside a 54px circle reads as a smudge. */
  if (SIDE_CONFIG.markImage) {
    document.querySelectorAll('[data-hero-mark]').forEach((n) => {
      n.classList.add('hero-mark--art');
      n.textContent = '';
      const img = el('img');
      img.src = SIDE_CONFIG.markImage;
      img.alt = '';
      n.appendChild(img);
    });
  }
  line('[data-hero-invite]',  H.invite);
  line('[data-hero-dates]',   '');

  document.querySelectorAll('[data-bride-name]').forEach(n => { n.textContent = CONFIG.couple.bride; });
  document.querySelectorAll('[data-groom-name]').forEach(n => { n.textContent = CONFIG.couple.groom; });
  document.querySelectorAll('[data-bride-lineage]').forEach(n => { n.innerHTML = CONFIG.lineage.bride.join('<br>'); });
  document.querySelectorAll('[data-groom-lineage]').forEach(n => { n.innerHTML = CONFIG.lineage.groom.join('<br>'); });
  document.querySelectorAll('.hero-names').forEach((names) => {
    const bride = names.querySelector('[data-person="bride"]');
    const groom = names.querySelector('[data-person="groom"]');
    const amp = names.querySelector('.hero-amp');
    const first = SIDE_CONFIG.order[0] === 'groom' ? groom : bride;
    const second = SIDE_CONFIG.order[1] === 'groom' ? groom : bride;
    if (first && amp && second) names.replaceChildren(first, amp, second);
  });

  const S = CONFIG.scratch || {};
  line('[data-scratch-heading]', S.heading);
  line('[data-scratch-cta]',     S.cta);

  /* Dates follow whichever functions this link shows — see spanOf(). The
     CONFIG.dates strings are the fallback for when nothing is dated. */
  const span = spanOf(visibleEvents());
  const num = document.querySelector('[data-date-num]');
  const mon = document.querySelector('[data-date-month]');
  if (num) num.textContent = span ? span.number : CONFIG.dates.scratchNumber;
  if (mon) mon.textContent = span ? span.month  : CONFIG.dates.scratchMonth;
  const fd = document.querySelector('[data-footer-date]');
  if (fd) fd.innerHTML = span ? span.footer : CONFIG.dates.footer;
  document.title = `${CONFIG.couple.names} — ${CONFIG.couple.venue}`;
}

/* ============================================================
   VENUE — name, address and the map
   The embed is Google's keyless ?output=embed form and is pinned by
   coordinate rather than by name search, so it lands on the hotel
   itself. Nothing here needs an API key.
   ============================================================ */
function renderVenue() {
  const V = CONFIG.venue;
  const section = document.getElementById('venue');
  if (!section || !V) return;

  const put = (sel, value, asHtml) => {
    const n = section.querySelector(sel);
    if (!n) return;
    if (!value) { n.remove(); return; }
    if (asHtml) n.innerHTML = value; else n.textContent = value;
  };
  put('[data-venue-kicker]', V.kicker);
  put('[data-venue-name]',   V.name);
  put('[data-venue-address]', V.address, true);

  const frame = document.getElementById('venueMapFrame');
  const open  = document.getElementById('venueOpen');

  if (open) {
    if (V.mapUrl) open.href = V.mapUrl;
    else open.remove();
  }
  if (frame) {
    if (Number.isFinite(V.lat) && Number.isFinite(V.lng)) {
      frame.src = `https://www.google.com/maps?q=${V.lat},${V.lng}`
                + `&z=${V.zoom || 16}&hl=en&output=embed`;
    } else {
      /* No coordinates means no map worth showing — drop the frame and
         leave the address and the button, which still work. */
      frame.remove();
    }
  }
}


/* ============================================================
   SAVE THE DATES — one card per function
   ============================================================ */
/* Which functions this particular link is for.

   ?e=wedding,reception  ->  just those two cards
   no ?e at all          ->  every function, the general invitation

   A list that matches nothing falls back to the whole programme on
   purpose: a guest following a mistyped or truncated link should land on
   the invitation, not on an empty page. Computed once and reused, so the
   cards, the dates and the countdown can never disagree. */
let VISIBLE_EVENTS = null;

function visibleEvents() {
  if (VISIBLE_EVENTS) return VISIBLE_EVENTS;
  const all = CONFIG.events;
  let picked = all;
  try {
    const raw = new URLSearchParams(location.search).get((CONFIG.invite || {}).param || 'e');
    if (raw) {
      const want = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      const hit = all.filter(ev => want.indexOf(ev.id) !== -1);
      if (hit.length) picked = hit;
    }
  } catch (_) { /* no URL API, or a malformed query — show everything */ }
  VISIBLE_EVENTS = picked;
  return picked;
}

/* The span the visible functions cover, so the hero, the foil and the
   footer never announce dates a guest is not invited to. Returns null if
   nothing is dated, and the CONFIG.dates strings stand in. */
function spanOf(events) {
  const dated = events.filter(e => Number.isFinite(Number(e.day)));
  if (!dated.length) return null;
  const byDay = [...dated].sort((a, b) => Number(a.day) - Number(b.day));
  const lo = byDay[0], hi = byDay[byDay.length - 1];
  const year = (CONFIG.dates && CONFIG.dates.year) || '';
  const one  = lo.day === hi.day;
  return {
    number: one ? `${lo.day}` : `${lo.day} – ${hi.day}`,
    month:  `${lo.month} ${year}`,
    hero:   one ? `${lo.day} ${lo.month}` : `${lo.day} · ${hi.day} ${lo.month}`,
    footer: one
      ? `${lo.day}<sup>${lo.suffix}</sup> ${lo.month} ${year}`
      : `${lo.day}<sup>${lo.suffix}</sup> – ${hi.day}<sup>${hi.suffix}</sup> ${lo.month} ${year}`,
    first: lo,
  };
}

function renderEventCards() {
  const host = document.getElementById('eventsGrid');
  if (!host) return;

  visibleEvents().forEach((ev, i) => {
    const card = document.createElement('article');
    /* filmTone: 'night' flips the opened card to a dark veil and cream
       type — deep ink over a night sky reads as nothing. */
    card.className = `event event--${ev.theme || 'marigold'}`
      + (ev.film ? ' has-film' : '')
      + (ev.film && ev.filmTone === 'night' ? ' has-film--night' : '');
    card.id = `evt-${ev.id}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');
    card.style.setProperty('--card-delay', `${i * 90}ms`);

    /* `note` is optional: an empty one prints nothing at all rather than
       an empty row. */
    const note  = ev.note  ? `<p class="event-note">${ev.note}</p>` : '';
    /* preload="none": the film is only wanted once the card is opened, and
       a grid of six must not pull six videos on load. The still art is the
       poster, so the swap has nothing to flash through. */
    const film  = ev.film
      ? `<video class="event-film" src="${ev.film}"${ev.art ? ` poster="${ev.art}"` : ''}${ev.filmCrop ? ` data-crop="${ev.filmCrop}"` : ''}
                muted loop playsinline webkit-playsinline preload="none"
                disablepictureinpicture aria-hidden="true"></video>`
      : '';
    const when  = `${ev.day}<sup>${ev.suffix}</sup> ${ev.month}`;
    /* The couple's own name for a function goes on top; the function it
       actually is goes underneath it, in both the shut and opened card. */
    const alias = ev.subtitle ? `<p class="event-alias">${ev.subtitle}</p>` : '';
    const popAlias = ev.subtitle ? `<p class="pop-alias">${ev.subtitle}</p>` : '';
    /* With a timetable the single time would just repeat its first row, so
       the opened card shows the date alone and lets the list say the rest. */
    const runs = Array.isArray(ev.schedule) && ev.schedule.length ? ev.schedule : null;
    const popWhen = runs ? `${ev.weekday}, ${when}`
                         : `${ev.weekday}, ${when} &middot; ${ev.time}`;
    const sched = runs
      ? `<ul class="pop-run">${runs.map(r =>
          `<li><span class="pop-run-what">${r.what}</span><span class="pop-run-when">${r.when}</span></li>`
        ).join('')}</ul>`
      : '';

    card.innerHTML =
      `<div class="event-art" aria-hidden="true"></div>
       ${film}
       <div class="event-sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
       <div class="event-summary">
         <h3 class="event-name">${ev.title}</h3>
         ${alias}
         <p class="event-day">${when}</p>
         <p class="event-time">${ev.time}</p>
         ${note}
         <p class="event-open">Tap to open</p>
       </div>
       <button class="event-close" type="button" aria-label="Close ${stripTags(ev.title)} invitation">&times;</button>
       <div class="event-detail">
         <p class="pop-kicker">We invite you to our</p>
         <h3 class="pop-name">${ev.title}</h3>
         ${popAlias}
         <p class="pop-when">${popWhen}</p>
         <p class="pop-copy">${ev.copy}</p>
         ${sched}
         <p class="pop-venue">${ev.venue.name}${ev.venue.city ? `<br />${ev.venue.city}` : ''}</p>
         ${ev.venue.mapUrl ? `<a class="event-map-link" href="${ev.venue.mapUrl}" target="_blank" rel="noopener noreferrer">Show location on map</a>` : ''}
       </div>`;

    /* The painting is set as a style rather than in the markup so a missing
       file leaves a tinted card instead of a broken image box. */
    const art = card.querySelector('.event-art');
    if (ev.art) art.style.backgroundImage = `url("${ev.art}")`;

    host.appendChild(card);
  });
}

function stripTags(s) { return String(s).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&'); }


/* Expanding cards, FLIP-style: let the card jump to its opened geometry,
   measure both boxes, then animate the inverse transform back to zero. The
   browser only ever paints the end state, so the growth stays smooth even
   though the layout change is instant. */
function initEventCards() {
  const host = document.getElementById('eventsGrid');
  const section = document.getElementById('events');
  if (!host || !section) return;

  const cards = [...host.querySelectorAll('.event')];
  let openCard = null;

  const animate = (card, opening) => {
    const first = card.getBoundingClientRect();

    card.classList.toggle('is-open', opening);
    document.body.classList.toggle('has-open-card', opening);
    card.setAttribute('aria-expanded', String(opening));
    openCard = opening ? card : null;

    /* The film runs only while the card is open — a closed card must not
       leave a video decoding behind the grid. */
    const film = card.querySelector('.event-film');
    if (film) {
      if (opening) {
        try { film.currentTime = 0; } catch (_) {}
        const play = film.play();
        if (play && play.catch) play.catch(() => {});   /* the still stands in */
      } else {
        film.pause();
      }
    }

    const last = card.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;

    if (CFG.reducedMotion) return;

    /* An opened card is centred by its own translate, so the inverse has to
       be composed on top of that rather than replacing it. */
    const base = opening ? 'translate(-50%, -50%)' : 'none';
    const inverse = opening
      ? `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
      : `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;

    card.animate([{ transform: inverse }, { transform: base }],
                 { duration: 620, easing: 'cubic-bezier(.16,.82,.24,1)', fill: 'both' });
  };

  cards.forEach((card) => {
    const close = card.querySelector('.event-close');

    card.addEventListener('click', (e) => {
      if (e.target.closest('.event-close')) return;
      if (!card.classList.contains('is-open')) animate(card, true);
    });
    card.addEventListener('keydown', (e) => {
      const open = card.classList.contains('is-open');
      if ((e.key === 'Enter' || e.key === ' ') && !open) { e.preventDefault(); animate(card, true); }
      if (e.key === 'Escape' && open) animate(card, false);
    });
    if (close) {
      close.addEventListener('click', (e) => { e.stopPropagation(); animate(card, false); });
    }
  });

  /* Escape and a tap on the dimmed backdrop both close, wherever focus is. */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openCard) animate(openCard, false);
  });
  document.addEventListener('click', (e) => {
    if (openCard && !e.target.closest('.event')) animate(openCard, false);
  }, true);

  cards.forEach((card, i) => {
    revealOnce(card, 'is-shown', { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  });
  revealOnce(section, 'is-visible', { threshold: 0.1 });
}


/* The footer used to ride along on the countdown's reveal. It is its own
   section now, so it needs its own trigger — without one its lines stay
   blurred at opacity 0, because the CSS that clears them keys off an
   ancestor it no longer has. */
function initFooter() {
  revealOnce(document.querySelector('.wedding-footer'), 'is-visible',
             { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
}


/* Blessings show unless a link says otherwise: ?b=0 takes the section
   away entirely, heading and all, rather than leaving an empty panel. */
function wantsBlessings() { return linkAllows('blessingsParam', 'b'); }

/* Confirm Your Presence is the same story: on unless the link says
   otherwise, so a guest who is only being told about the day — not asked
   to register — gets ?a=0 and never sees the form. */
function wantsAttendance() { return linkAllows('attendParam', 'a'); }

/* Both read the same shape of switch, so they share the reading of it. */
function linkAllows(configKey, fallbackParam) {
  try {
    const key = (CONFIG.invite || {})[configKey] || fallbackParam;
    const raw = new URLSearchParams(location.search).get(key);
    if (raw === null) return true;
    return !/^(0|no|off|false)$/i.test(raw.trim());
  } catch (_) { return true; }
}

function renderBlessings() {
  if (!SIDE_CONFIG.blessings) return;
  const host = document.getElementById('blessings');
  if (!host) return;

  if (!wantsBlessings()) { host.remove(); return; }

  const page = (side, label, blocks, note) => {
    const art = el('article', `bl-page bl-page--${side}`);
    art.setAttribute('aria-label', `Blessings — ${label}`);
    art.appendChild(Object.assign(el('div', 'bl-art'), { ariaHidden: 'true' }));

    const inner = el('div', 'bl-inner');
    inner.appendChild(el('div', 'bl-rule',
      '<span class="bl-rule-line"></span><span class="bl-rule-diamond">&#9670;</span><span class="bl-rule-line"></span>'));
    inner.appendChild(el('h2', 'bl-heading', 'Blessings'));
    if (note) inner.appendChild(el('p', 'bl-note', note));
    inner.appendChild(el('p', 'bl-side', label));

    blocks.forEach(b => {
      const blk = el('div', 'bl-block');
      blk.appendChild(el('h3', 'bl-block-title', b.title));
      blk.appendChild(el('p', 'bl-names', b.names.map(n => `<span>${n}</span>`).join('')));
      inner.appendChild(blk);
    });

    art.appendChild(inner);
    return art;
  };

  /* Whichever side's card this is, and only if that side has a list. */
  const list = CONFIG.blessings[SIDE];
  if (!list || !list.length) { host.remove(); return; }
  host.appendChild(page(SIDE, SIDE === 'groom' ? 'Groom’s Side' : 'Bride’s Side',
                        list, CONFIG.blessings.note));
}

function renderRsvp() {
  const host = document.getElementById('rsvpLists');
  if (!host) return;

  const list = (label, people) => {
    host.appendChild(el('p', 'rsvp-side', label));
    const ul = el('ul', 'rsvp-contacts');
    ul.setAttribute('aria-label', `${label} contacts`);
    people.forEach(p => {
      const li = el('li', 'rsvp-row');
      /* A contact with no number gets no buttons: `tel:+` and a bare wa.me
         link both lead nowhere, and a dead button is worse than none. */
      const actions = p.tel
        ? `<div class="rsvp-actions">
             <a href="tel:+${p.tel}" class="rsvp-action rsvp-action--phone" aria-label="Call ${p.name}">
               <svg aria-hidden="true"><use href="#ic-phone"/></svg>
             </a>
             <a href="https://wa.me/${p.tel}" class="rsvp-action rsvp-action--wa" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ${p.name}">
               <svg aria-hidden="true"><use href="#ic-wa"/></svg>
             </a>
           </div>`
        : '';
      li.innerHTML =
        `<div class="rsvp-identity">
           <span class="rsvp-name">${p.name}</span>
           <span class="rsvp-num">${p.shown}</span>
         </div>${actions}`;
      ul.appendChild(li);
    });
    host.appendChild(ul);
  };

  /* The numbers come from SIDE_CONFIG, so the heading has to follow the
     side too — the groom's card was listing his mother under "Bride's Side". */
  list(SIDE === 'groom' ? 'Groom’s Side' : 'Bride’s Side', CONFIG.rsvp.bride);
}


/* ============================================================
   PARALLAX — the foreground ornaments of the painted panels.
   One shared scroll loop for every registered overlay: each drifts
   against its own section's progress, so the depth reads as you
   scroll past.

   The drift is written as a CSS variable rather than a transform,
   because these same elements carry a sway ANIMATION — a transform
   set here would be overwritten by the keyframes every frame.
   ============================================================ */
const DRIFT_LAYERS = [];

/* ============================================================
   BLESSINGS — every block is watched on its own, so a list this
   long arrives a group at a time, as it is read.
   ============================================================ */
function initBlessings() {
  if (!SIDE_CONFIG.blessings) {
    document.getElementById('blessings')?.remove();
    return;
  }
  const section = document.getElementById('blessings');
  if (!section) return;

  section.querySelectorAll('.bl-page').forEach((page) => {
    stagger(page.querySelectorAll('.bl-rule, .bl-heading, .bl-note, .bl-side'), '--bl-delay', 160, 60);
    /* a low threshold: the page is taller than the viewport, so waiting for
       a fifth of it would hold the masthead back until it had scrolled past */
    revealOnce(page, 'is-visible', { threshold: 0.02 });
  });

  section.querySelectorAll('.bl-block').forEach((block) => {
    /* names cascade within their own block, capped so a long list never
       leaves its last line waiting seconds */
    block.querySelectorAll('.bl-names span').forEach((n, i) => {
      n.style.setProperty('--bl-name-delay', `${180 + Math.min(i, 9) * 68}ms`);
    });
    revealOnce(block, 'is-shown', { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
  });
}


/* ============================================================
   RSVP
   ============================================================ */
function initRsvp() {
  const section = document.getElementById('rsvp');
  if (!section) return;

  section.querySelectorAll('.rsvp-rule, .rsvp-heading, .rsvp-sub-rule, .rsvp-note, .rsvp-side, .rsvp-row, .attend')
    .forEach((n, i) => n.style.setProperty('--rsvp-delay', `${i * 90}ms`));

  if (CFG.reducedMotion) { section.classList.add('is-visible'); return; }

  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    section.classList.add('is-visible');
    obs.disconnect();
  }, { threshold: 0.18, rootMargin: '0px 0px -12% 0px' }).observe(section);
}


/* ============================================================
   ATTENDANCE FORM

   The site is static, so there is nothing here to receive a form.
   Instead it posts JSON to the Google Apps Script web app named in
   CONFIG.attendance.endpoint, which files the upload in Drive and
   appends a row to the hosts' Google Sheet. apps-script/SETUP.md
   has the deployment steps.

   The upload is read and shrunk when the guest picks it, not when
   they submit: the wait then happens while they are still filling
   in the rest of the form rather than after they press Send.
   ============================================================ */
function initAttendance() {
  const wrap = document.getElementById('attend');
  const form = document.getElementById('attendForm');
  if (!wrap || !form) return;
  /* ?a=0 takes the whole panel away — heading, form and all — rather than
     leaving a form nobody is meant to fill in. */
  if (!wantsAttendance()) { wrap.remove(); return; }

  const A  = CONFIG.attendance || {};
  const id = (x) => document.getElementById(x);

  const fName     = id('afName');
  const fMembers  = id('afMembers');
  const fPhone    = id('afPhone');
  const fArrive   = id('afArrive');
  const fArriveBy = id('afArriveBy');
  const fDepart   = id('afDepart');
  const fDepartBy = id('afDepartBy');
  const fTrap     = id('afWebsite');
  const submit    = id('afSubmit');
  const status    = id('afStatus');
  const done      = id('attendDone');
  const again     = id('attendAgain');

  const MAX_MB       = Number(A.maxFileMB) || 10;
  const MAX_TOTAL_MB = Number(A.maxTotalMB) || 20;
  const EXT_OK = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp', 'pdf', 'doc', 'docx'];

  /* The Aadhaar upload can be switched off wholesale from CONFIG. */
  const wantsFile = A.aadhaarRequired !== false;
  if (!wantsFile) {
    const field = id('afAadhaarField');
    if (field) field.remove();
  }

  if (!A.endpoint) {
    console.warn('[RSVP] CONFIG.attendance.endpoint is empty — the attendance ' +
                 'form will render but cannot send. See apps-script/SETUP.md.');
  }

  /* ---- the dropdowns ----------------------------------------- */
  const fillSelect = (sel, values) => {
    (values || []).forEach((label) => {
      const opt = document.createElement('option');
      opt.value = label;
      opt.textContent = label;
      sel.appendChild(opt);
    });
  };
  fillSelect(fArriveBy, A.travelModes);
  fillSelect(fDepartBy, A.travelModes);

  /* ---- the date pickers -------------------------------------- */
  [fArrive, fDepart].forEach((d) => {
    if (A.dateMin) d.min = A.dateMin;
    if (A.dateMax) d.max = A.dateMax;
  });
  /* Picking the arrival narrows the departure picker, so leaving
     before you arrive stops being reachable rather than being caught
     afterwards by an error message. */
  fArrive.addEventListener('change', () => {
    fDepart.min = fArrive.value || A.dateMin || '';
    if (fDepart.value && fArrive.value && fDepart.value < fArrive.value) fDepart.value = '';
  });


  /* ---- errors ------------------------------------------------- */
  const errNode = (input) => form.querySelector(`[data-error-for="${input.id}"]`);

  function err(input, msg, box) {
    const p = errNode(input);
    if (p) { p.textContent = msg; p.classList.add('is-shown'); }
    (box || input).classList.add('is-bad');
    input.setAttribute('aria-invalid', 'true');
  }
  function clearErr(input, box) {
    const p = errNode(input);
    if (p) { p.textContent = ''; p.classList.remove('is-shown'); }
    (box || input).classList.remove('is-bad');
    input.removeAttribute('aria-invalid');
  }

  [fName, fMembers, fPhone, fArrive, fDepart].forEach((i) => {
    i.addEventListener('input',  () => clearErr(i));
    i.addEventListener('change', () => clearErr(i));
  });


  /* ---- the uploads -------------------------------------------- */
  /* Three of these now — the Aadhaar card and a ticket at each end — so
     each field gets its own small controller rather than three copies of
     the same handler. `picked` on a controller holds the base64 payloads
     once a guest has chosen, and is the ONLY record that files are
     attached: it must never disagree with what the input holds.

     It is a LIST. A family replying together has an Aadhaar card each and
     often a ticket each, and one input that took one file made them send
     a second form or leave the rest out. */
  function makeUpload(inputId, emptyLabel) {
    const input = id(inputId);
    if (!input) return null;
    const field = input.closest('.af-field');
    const box   = field && field.querySelector('.af-file');
    const text  = box && box.querySelector('.af-file-text');

    const ctl = {
      input, field, box, picked: [],
      clear() {
        ctl.picked = [];
        input.value = '';
        if (box) box.classList.remove('is-filled');
        if (text) text.textContent = emptyLabel;
        clearErr(input, box);
      },
    };

    input.addEventListener('change', async () => {
      clearErr(input, box);
      ctl.picked = [];
      if (box) box.classList.remove('is-filled');

      const files = input.files ? Array.prototype.slice.call(input.files) : [];
      if (!files.length) { if (text) text.textContent = emptyLabel; return; }

      /* Every file is checked before any is read: rejecting the fifth of
         five after a long wait, with the other four already in hand, is
         the worst moment to tell someone their file is the wrong kind. */
      for (var i = 0; i < files.length; i++) {
        const ext = (files[i].name.split('.').pop() || '').toLowerCase();
        if (EXT_OK.indexOf(ext) === -1) {
          input.value = '';
          if (text) text.textContent = emptyLabel;
          err(input, 'Please attach images, PDFs or Word documents only.', box);
          return;
        }
      }

      if (text) text.textContent = files.length > 1 ? 'Reading ' + files.length + ' files…' : 'Reading…';
      try {
        const done = [];
        for (var j = 0; j < files.length; j++) done.push(await prepareUpload(files[j]));
        ctl.picked = done;
        if (text) text.textContent = done.length === 1
          ? done[0].name
          : done.length + ' files attached';
        if (box) box.classList.add('is-filled');
      } catch (e) {
        input.value = '';
        ctl.picked = [];
        if (text) text.textContent = emptyLabel;
        err(input, (e && e.message) || 'That file could not be read.', box);
      }
    });

    return ctl;
  }

  const upAadhaar = wantsFile ? makeUpload('afAadhaar', 'Choose a file') : null;
  const upArrive  = makeUpload('afArriveTicket', 'Attach ticket');
  const upDepart  = makeUpload('afDepartTicket', 'Attach ticket');
  const uploads   = [upAadhaar, upArrive, upDepart].filter(Boolean);

  /* A car has no ticket, so that upload appears and disappears with the
     travel mode. Anything already attached is dropped as the field goes
     away: a file the guest can no longer see or remove must not be sent
     on their behalf. */
  const ticketless = (A.ticketlessModes || []).map((s) => String(s).toLowerCase());
  const syncTicket = (sel, up) => {
    if (!up || !up.field) return;
    const show = !!sel.value && ticketless.indexOf(sel.value.toLowerCase()) === -1;
    if (!show) up.clear();
    up.field.hidden = !show;
  };
  fArriveBy.addEventListener('change', () => syncTicket(fArriveBy, upArrive));
  fDepartBy.addEventListener('change', () => syncTicket(fDepartBy, upDepart));

  async function prepareUpload(file) {
    const small = await shrinkImage(file);
    if (small.size > MAX_MB * 1024 * 1024) {
      const mb = (small.size / 1024 / 1024).toFixed(1);
      throw new Error(`That file is ${mb} MB. Please attach one under ${MAX_MB} MB.`);
    }
    return {
      name: small.name,
      type: small.type || 'application/octet-stream',
      data: await readBase64(small),
    };
  }

  /* A photograph off a phone runs 3–6 MB, nearly all of it resolution
     nobody needs to read an ID card — and on hotel wifi that is the
     difference between a form that sends and one that times out. So
     anything longer than 1800px on its long edge comes down to 1800px
     of JPEG, which stays legible and usually lands under 500 KB.
     Left untouched: PDFs, Word files, images already small, and HEIC,
     which a browser canvas cannot decode. */
  async function shrinkImage(file) {
    if (!/^image\//i.test(file.type)) return file;
    if (/heic|heif/i.test(file.type)) return file;
    if (file.size <= 900 * 1024) return file;
    if (typeof createImageBitmap !== 'function' || typeof File !== 'function') return file;

    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { return file; }

    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width  * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) { if (bmp.close) bmp.close(); return file; }
    ctx.drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
    /* Re-encoding a flat PNG can make it bigger. Keep whichever won. */
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, '') || 'aadhaar';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  }

  function readBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error('That file could not be read.'));
      r.onload  = () => {
        const s = String(r.result);
        const comma = s.indexOf(',');       /* drop the data: prefix */
        resolve(comma === -1 ? s : s.slice(comma + 1));
      };
      r.readAsDataURL(blob);
    });
  }


  /* ---- validation --------------------------------------------- */

  /* Strips the country code so the sheet holds one shape. Ten digits
     must open 6–9, which is every Indian mobile; anything longer is
     read as an overseas number and left as dialled, because guests
     fly in. */
  function tidyPhone(raw) {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.length === 12 && d.slice(0, 2) === '91') d = d.slice(2);
    else if (d.length === 11 && d[0] === '0')      d = d.slice(1);
    return d;
  }

  function validate() {
    let first = null;
    const fail = (input, msg, box) => { err(input, msg, box); if (!first) first = input; };

    if (fName.value.trim().length < 2) fail(fName, 'Please give your name.');

    const members = Number(fMembers.value);
    if (!Number.isFinite(members) || members < 1 || members > 30 || members % 1 !== 0) {
      fail(fMembers, 'A whole number from 1 to 30.');
    }

    const phone = tidyPhone(fPhone.value);
    const phoneOk = phone.length === 10 ? /^[6-9]/.test(phone) : (phone.length > 10 && phone.length <= 15);
    if (!phoneOk) fail(fPhone, 'Please give a valid mobile number.');

    if (!fArrive.value) fail(fArrive, 'Please pick a date.');
    if (!fDepart.value) fail(fDepart, 'Please pick a date.');
    /* ISO dates compare correctly as plain strings. */
    if (fArrive.value && fDepart.value && fDepart.value < fArrive.value) {
      fail(fDepart, 'This is before you arrive.');
    }

    if (!fArriveBy.value) fail(fArriveBy, 'Please choose one.');
    if (!fDepartBy.value) fail(fDepartBy, 'Please choose one.');

    /* Tickets stay optional throughout — plenty of guests reply before
       they have booked anything. Only the Aadhaar card is insisted on. */
    if (upAadhaar && !upAadhaar.picked.length) {
      fail(upAadhaar.input, 'Please attach the Aadhaar card.', upAadhaar.box);
    }

    return first;
  }

  /* base64 carries three bytes in every four characters, and each field
     now holds a list, so this sums across every attached file. */
  const attachedBytes = () => uploads.reduce(
    (n, u) => n + (u.picked || []).reduce(
      (m, f) => m + Math.ceil(f.data.length * 3 / 4), 0), 0);


  /* ---- sending ------------------------------------------------- */
  const say = (msg, bad) => {
    status.textContent = msg;
    status.classList.toggle('is-bad', !!bad);
    status.classList.add('is-shown');
  };
  const hush = () => {
    status.textContent = '';
    status.classList.remove('is-shown', 'is-bad');
  };
  function setSending(on) {
    submit.disabled = on;
    submit.classList.toggle('is-sending', on);
    const label = submit.querySelector('.af-submit-label');
    if (label) label.textContent = on ? 'Sending' : 'Send confirmation';
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (submit.disabled) return;
    hush();

    const bad = validate();
    if (bad) {
      bad.focus({ preventScroll: true });
      /* File inputs are off-screen by design, so scroll to the box
         standing in for one instead of to the input itself. */
      const up = uploads.find((u) => u.input === bad);
      const target = (up && up.box) || bad;
      target.scrollIntoView({ block: 'center', behavior: CFG.reducedMotion ? 'auto' : 'smooth' });
      return;
    }

    if (!A.endpoint) {
      say('The form is not connected yet. Please call us on the numbers above and we will note you down.', true);
      return;
    }

    /* Belongs to no single field — three files can each be legal and still
       be too much together, and Apps Script would simply refuse the post. */
    const total = attachedBytes();
    if (total > MAX_TOTAL_MB * 1024 * 1024) {
      say(`Those attachments come to ${(total / 1048576).toFixed(1)} MB together, ` +
          `over the ${MAX_TOTAL_MB} MB limit. Please attach smaller files, or send ` +
          `the tickets on WhatsApp instead.`, true);
      return;
    }

    setSending(true);
    say('Sending your details…', false);

    try {
      const res = await fetch(A.endpoint, {
        method: 'POST',
        /* text/plain keeps this a "simple" request, so the browser
           skips the CORS preflight — an Apps Script web app cannot
           answer an OPTIONS call and the whole post would fail. */
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name:      fName.value.trim(),
          members:   Number(fMembers.value),
          arrive:    fArrive.value,
          arriveBy:  fArriveBy.value,
          depart:    fDepart.value,
          departBy:  fDepartBy.value,
          phone:     tidyPhone(fPhone.value),
          /* Which card this reply came from. The script files bride and
             groom guests in separate workbooks off this one field. */
          side:      SIDE,
          /* Lists, one entry per file. The Apps Script reads either shape,
             but a deployment older than this one expects a single object
             and will reject the form — redeploy Code.gs alongside. */
          files: {
            aadhaar:      upAadhaar ? upAadhaar.picked : [],
            arriveTicket: upArrive  ? upArrive.picked  : [],
            departTicket: upDepart  ? upDepart.picked  : [],
          },
          website:   fTrap ? fTrap.value : '',
        }),
        redirect: 'follow',
      });

      const out = await res.json().catch(() => null);
      if (!out || out.ok !== true) {
        /* Tagged, so the catch below knows this text was written for a
           guest to read. An untagged throw is the browser's own — a
           dropped connection surfaces as "Failed to fetch", which is
           not something to show someone replying to a wedding card. */
        const refusal = new Error((out && out.error) || 'We could not save your details. Please try again.');
        refusal.forGuest = true;
        throw refusal;
      }

      /* Wind the form back down before hiding it: "Send another" brings
         this same element back, and it should not return mid-send. */
      setSending(false);
      hush();
      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ block: 'center', behavior: CFG.reducedMotion ? 'auto' : 'smooth' });

    } catch (e) {
      setSending(false);
      say(e && e.forGuest
        ? e.message
        : 'We could not reach the server. Please check your connection and try again — or call us on the numbers above.', true);
    }
  });

  /* Each controller's `picked` has to describe whatever is in its input
     and nothing else. A reset empties the inputs but cannot reach a
     closure variable, which would leave the form willing to send the
     previous guest's ID with no file on screen. Hanging the cleanup on
     the event keeps the two in step however the reset was triggered. */
  form.addEventListener('reset', () => {
    /* Deferred: a reset empties the inputs AFTER this event, so clearing
       the controllers first would leave each one's input.value = '' undone
       by the reset that follows. One tick later the DOM has settled. */
    setTimeout(() => {
      uploads.forEach((u) => u.clear());
      if (upArrive && upArrive.field)  upArrive.field.hidden = true;
      if (upDepart && upDepart.field) upDepart.field.hidden = true;
    }, 0);
    fDepart.min = A.dateMin || '';
    form.querySelectorAll('.af-error.is-shown').forEach((p) => {
      p.textContent = '';
      p.classList.remove('is-shown');
    });
    form.querySelectorAll('.is-bad').forEach((n) => n.classList.remove('is-bad'));
    form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
    hush();
    setSending(false);
  });

  /* Several households often reply from one phone. */
  if (again) {
    again.addEventListener('click', () => {
      form.reset();
      done.hidden = true;
      form.hidden = false;
      fName.focus({ preventScroll: true });
      form.scrollIntoView({ block: 'center', behavior: CFG.reducedMotion ? 'auto' : 'smooth' });
    });
  }
}


/* ============================================================
   COUNTDOWN + FOOTER
   ============================================================ */
function initCountdownSection() {
  const section = document.getElementById('countdown');
  if (!section) return;

  section.querySelectorAll('[data-countdown-letters]').forEach((node) => {
    const text = (node.textContent || '').trim();
    node.setAttribute('aria-label', text);
    node.textContent = '';
    Array.from(text).forEach((char, index) => {
      const span = document.createElement('span');
      if (char === ' ') { span.className = 'cd-space'; span.innerHTML = '&nbsp;'; }
      else span.textContent = char;
      span.style.setProperty('--letter-delay', `${index * 34}ms`);
      node.appendChild(span);
    });
  });

  /* Counts to the FIRST function this link shows, not always the wedding:
     a guest invited only to the Reception wants to know how long until
     their evening. Falls back to CONFIG.dates.moment when nothing on
     screen is dated. `at` gives the hour; noon if a function has none,
     which only shifts the hours column, never the days. */
  const M = CONFIG.dates.moment;
  const first = (spanOf(visibleEvents()) || {}).first;
  const target = first
    ? new Date(M.y, M.mo, Number(first.day),
               (first.at && first.at.h) || 12, (first.at && first.at.min) || 0, 0).getTime()
    : new Date(M.y, M.mo, M.d, M.h, M.min, 0).getTime();
  const units = {
    days:    section.querySelector('[data-unit="days"]'),
    hours:   section.querySelector('[data-unit="hours"]'),
    minutes: section.querySelector('[data-unit="minutes"]'),
    seconds: section.querySelector('[data-unit="seconds"]'),
  };
  const pad = v => String(Math.max(0, v)).padStart(2, '0');

  const setUnit = (key, value) => {
    const node = units[key];
    if (!node) return;
    const next = key === 'days' ? String(Math.max(0, value)) : pad(value);
    if (node.textContent === next) return;
    const card = node.closest('.countdown-card');
    node.textContent = next;
    if (!CFG.reducedMotion && card) {
      card.classList.remove('is-changing');
      void card.offsetWidth;
      card.classList.add('is-changing');
      setTimeout(() => card.classList.remove('is-changing'), 520);
    }
  };

  const update = () => {
    const distance = Math.max(0, target - Date.now());
    const total = Math.floor(distance / 1000);
    setUnit('days', Math.floor(total / 86400));
    setUnit('hours', Math.floor((total % 86400) / 3600));
    setUnit('minutes', Math.floor((total % 3600) / 60));
    setUnit('seconds', total % 60);
  };

  update();
  setInterval(update, 1000);

  if (CFG.reducedMotion) { section.classList.add('is-visible'); return; }
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    section.classList.add('is-visible');
    obs.disconnect();
  }, { threshold: 0.28 }).observe(section);
}


/* ============================================================
   BACKGROUND MUSIC
   The score starts on the opening tap — the user gesture browsers
   require. We prime inside the gesture and keep a retry net armed
   for Android, where the first attempt can still be refused.
   ============================================================ */
let bgAudio = null, musicBtn = null;
let musicFailed = false, musicStarted = false, awayPaused = false;

function setMusicState(playing) {
  if (!musicBtn) return;
  musicBtn.classList.toggle('is-muted', !playing);
  musicBtn.setAttribute('aria-label', playing ? 'Mute music' : 'Play music');
}

/* The control belongs to the invitation, not to the opening card: it is
   brought in with the hero and never sits over the gate. Idempotent. */
function showMusicControl() {
  if (!musicBtn || musicFailed) return;
  musicBtn.hidden = false;
  setMusicState(!!(bgAudio && !bgAudio.paused));
  requestAnimationFrame(() => musicBtn.classList.add('is-ready'));
}

function initMusic() {
  bgAudio = document.getElementById('bgMusic');
  /* The element carries no `loop`: looping natively would drop the play
     head back to 0 and replay the 38-second intro every time round. */
  if (bgAudio) {
    bgAudio.addEventListener('ended', () => {
      try { bgAudio.currentTime = MUSIC_START; bgAudio.play(); } catch (_) {}
    });
  }
  musicBtn = document.getElementById('musicBtn');
  if (!bgAudio || !musicBtn) return;

  musicBtn.addEventListener('click', () => {
    if (bgAudio.paused) {
      try { bgAudio.muted = false; bgAudio.volume = 1; } catch (_) {}
      const p = bgAudio.play();
      if (p && p.catch) p.catch(() => {});
      setMusicState(true);
    } else {
      bgAudio.pause();
      setMusicState(false);
    }
  });

  /* no score file — hide the control entirely rather than offering a
     button that does nothing */
  bgAudio.addEventListener('error', () => {
    musicFailed = true;
    if (musicBtn) musicBtn.hidden = true;
  }, { once: true });

  /* background-tab etiquette — never override a manual pause */
  const pauseAway = () => {
    if (!bgAudio || bgAudio.paused) return;
    awayPaused = true;
    bgAudio.pause();
  };
  const resumeBack = () => {
    if (!awayPaused || !bgAudio) return;
    awayPaused = false;
    const p = bgAudio.play();
    if (p && p.catch) p.catch(() => {});
  };
  document.addEventListener('visibilitychange', () => { document.hidden ? pauseAway() : resumeBack(); });
  window.addEventListener('pagehide', pauseAway);
  window.addEventListener('pageshow', resumeBack);
}

function cleanupMusicRetry() {
  RETRY_EVENTS.forEach(ev => document.removeEventListener(ev, retryBgMusic));
}
function retryBgMusic() {
  cleanupMusicRetry();
  musicStarted = false;
  startBgMusic();
}

/* Where the score comes in — the first 38 seconds of the track are an
   intro nobody needs to sit through. */
const MUSIC_START = 38;

/* Start the score and reveal the toggle. Idempotent. On rejection, arm
   one-shot listeners on the trailing gesture events so the SAME tap — or
   the next one — recovers. */
function startBgMusic() {
  if (!bgAudio || musicFailed || musicStarted) return;
  if (!bgAudio.paused) { musicStarted = true; return; }
  musicStarted = true;
  /* The track opens on 38 seconds of intro; the song proper starts there,
     and so does the invitation. `loop` on the element would send it back
     to 0 and replay that intro, so the loop is handled below instead. */
  try { bgAudio.muted = false; bgAudio.volume = 1; bgAudio.currentTime = MUSIC_START; } catch (_) {}
  const p = bgAudio.play();
  if (p && p.catch) {
    p.catch(() => {
      musicStarted = false;
      cleanupMusicRetry();                 /* never double-arm */
      RETRY_EVENTS.forEach(ev => document.addEventListener(ev, retryBgMusic, { passive: true }));
    });
  }
  setMusicState(true);
}


/* ============================================================
   INTRO  (tap-to-begin gate)
   ============================================================ */
function lockScroll(on) {
  document.documentElement.style.overflow = on ? 'hidden' : '';
  document.body.style.overflow = on ? 'hidden' : '';
}

function initIntro() {
  const screen = document.getElementById('introScreen');
  if (!screen) return;

  const film = document.getElementById('introVideo');
  const dissolve = document.getElementById('ivoryDissolve');
  const prompt = document.getElementById('introPrompt');
  const promptText = document.getElementById('introPromptText');

  let begun = false, finished = false, touchHandled = false, begunAt = 0;
  lockScroll(true);

  const finish = () => {
    if (finished) return;
    finished = true;
    if (prompt) prompt.classList.add('is-gone');
    startBgMusic();
    screen.classList.add('is-fading');

    /* The veil must be shut BEFORE the hero is revealed and before the card
       starts fading off it, or the scene shows through the fade. Ask the
       hero whether the flight is armed rather than running it first: this
       is the one ordering that guarantees no glimpse. */
    const hero = document.getElementById('hero');
    /* No flight any more — the crest that used to fly from the opening
       card into the hero went when the hero became the floral card. The
       veil simply cross-dissolves. */
    const holding = false;

    if (dissolve) {
      if (holding) dissolve.classList.add('is-hold');   /* opaque immediately */
      dissolve.classList.add('is-active');
    }

    let torn = false;
    const teardown = () => {
      if (torn) return;
      torn = true;
      if (dissolve) dissolve.remove();
      lockScroll(false);
    };

    if (holding) {
      let lifted = false;
      liftIvoryVeil = () => {
        if (lifted) return;
        lifted = true;
        if (dissolve) dissolve.classList.add('is-lifting');
        setTimeout(teardown, VEIL_LIFT_MS);
      };
      /* safety net: if the landing never reports in, draw the veil back
         anyway rather than leaving the guest on a blank ivory screen */
      setTimeout(() => liftIvoryVeil && liftIvoryVeil(), 6500);
    }

    revealHero();

    setTimeout(() => screen.remove(), 1600);
    /* With no flight there is no landing to wait for, so the plain
       cross-dissolve keeps its own teardown. */
    if (!holding) setTimeout(teardown, 2400);
  };

  const begin = () => {
    if (begun) return;
    begun = true;
    begunAt = Date.now();

    /* The score starts on THIS tap and plays under the film. Called
       synchronously inside the gesture handler so the activation token
       covers it; startBgMusic carries its own retry net if refused. */
    startBgMusic();

    if (!film) { finish(); return; }
    try { film.currentTime = 0; } catch (_) {}
    /* the film is silent throughout — a muted play is always permitted, so
       the gate starts opening instantly even on the pointerdown path */
    film.muted = true;
    film.playsInline = true;
    const p = film.play();
    /* refused outright: hand over rather than strand the guest on a still */
    if (p && p.catch) p.catch(() => finish());

    /* Ten seconds is a long time to hold someone at the door, so once the
       gate is plainly moving the prompt turns into the way out. Delayed so
       it does not swap under the finger that just tapped it. */
    if (prompt && promptText) {
      setTimeout(() => {
        if (finished) return;
        promptText.textContent = 'Tap to skip';
        prompt.classList.add('is-playing');
      }, 1400);
    }

    /* The bride's film closes on the hotel revealed through the open gate —
       that last frame is the hand-off. The groom's runs on past the moment
       that matters, into the backdrop its source template used, so it
       carries data-film-end and hands over on the light blowing out of the
       envelope instead. Paused there, so the held frame — the brightest in
       the film — is what the dissolve fades out of. */
    const cutAt = parseFloat(film.dataset.filmEnd);
    const cut = Number.isFinite(cutAt) && cutAt > 0 ? cutAt : null;
    if (cut) {
      film.addEventListener('timeupdate', () => {
        if (film.currentTime >= cut) { film.pause(); finish(); }
      });
    }
    film.addEventListener('ended', finish, { once: true });
    /* Safety, for when neither arrives: a stalled buffer, a tab sent to the
       background mid-play. Sized off whichever end comes first, so swapping
       in a longer film does not silently start cutting it short. */
    const full = Number.isFinite(film.duration) && film.duration > 0 ? film.duration : 10;
    const len = cut ? Math.min(cut, full) : full;
    setTimeout(finish, Math.round(len * 1000) + 6000);
  };

  /* No film to open — take the gate away entirely rather than leave a tap
     that does nothing, and arm the score on the first gesture instead. */
  if (film) {
    film.addEventListener('error', () => {
      if (begun || finished) return;
      finished = true;
      screen.remove();
      if (dissolve) dissolve.remove();
      lockScroll(false);
      revealHero();
      ['pointerup', 'touchend', 'click'].forEach((ev) => {
        document.addEventListener(ev, startBgMusic, { once: true, passive: true });
      });
    }, { once: true });
  }

  /* pointerdown is the earliest possible start; touchend / click / keydown
     cover the activation-carrying paths. touchHandled stops the synthetic
     click from firing a second time.
     A tap once the film is running skips to the invitation — but ONE
     physical tap fires pointerdown, then touchend, then click, so a bare
     "already begun means skip" would open the gate and slam it in the same
     gesture. The grace window is what separates that cascade from a guest
     genuinely tapping again. */
  const SKIP_AFTER_MS = 700;
  const onGesture = () => {
    if (begun) {
      if (Date.now() - begunAt > SKIP_AFTER_MS) finish();
      return;
    }
    begin();
  };
  const gestureStart = () => { touchHandled = true; onGesture(); };
  screen.addEventListener('pointerdown', gestureStart, { passive: true });
  screen.addEventListener('touchend', gestureStart, { passive: true });
  screen.addEventListener('click', () => {
    if (touchHandled) { touchHandled = false; return; }
    onGesture();
  });
  screen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onGesture(); }
  });
}


/* ============================================================
   HERO
   ============================================================ */
/* Crest flight beats, measured from the moment the card opens. The whole
   performance happens against the HELD ivory veil, so nothing of the scene
   is in sight until the crest is home:
     500   the crest is struck out of the ivory
     1300  the gold shine crosses it
     2400  it sets off for its place
     3700  it lands — only then does the veil draw back (CSS) */
/* how long the veil takes to draw back once the crest is home — must match
   the .is-lifting transition, since it decides when the veil is torn down */
const VEIL_LIFT_MS = 1100;

/* Set by the intro: draws the held veil back and takes it down. Called by
   the crest's landing, so the scene arrives with the crest however the
   flight ended. Idempotent. */
let liftIvoryVeil = null;

function revealHero() {
  const hero = document.getElementById('hero');
  if (hero) hero.classList.add('is-animated');
  showMusicControl();
}

function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;


  if (document.getElementById('introScreen')) return;
  if (CFG.reducedMotion) { hero.classList.add('is-animated'); return; }
  requestAnimationFrame(() => setTimeout(() => hero.classList.add('is-animated'), 360));
}

/* Built during the intro, not at the hand-off: creating this element costs
   an image decode and the rasterising of a full-size mask, and doing that
   at the moment the card closes is what stalls the first paint of the
   reveal. Made here, it is warm by the time it is needed. */

/* ============================================================
   SCRATCH TO REVEAL + BLOSSOM SHOWER
   The oval is cut by a canvas clip path rather than a CSS mask:
   mask-image switches between alpha and luminance behaviour across
   browsers, and the foil has to disappear exactly on the oval.
   ============================================================ */
function initScratch() {
  const canvas   = document.getElementById('scratchCanvas');
  const petalCv  = document.getElementById('petalCanvas');
  const hint     = document.getElementById('scratchHint');
  const revealEl = document.getElementById('scratchReveal');
  const hashtag  = document.getElementById('scratchHashtag');
  const section  = document.getElementById('scratchSection');
  const wrap     = document.getElementById('scratchFrameWrap');
  const glint    = document.getElementById('scratchGlint');
  const sandCv   = document.getElementById('sandCanvas');
  if (!canvas || !petalCv || !section) return;

  const ctx  = canvas.getContext('2d', { willReadFrequently: true });
  const pCtx = petalCv.getContext('2d');
  const sCtx = sandCv ? sandCv.getContext('2d') : null;
  const reduce = CFG.reducedMotion;

  /* ── prompts ── */
  let promptsDismissed = false;
  const dismissPrompts = () => {
    if (promptsDismissed) return;
    promptsDismissed = true;
    if (glint) glint.classList.add('hidden');
    if (wrap) wrap.classList.remove('attention');
  };

  let isDrawing = false, lastPos = null, revealed = false, lastCheck = 0;
  const GRID = 32;
  const coverage = new Uint8Array(GRID * GRID);

  /* ── sand: warm grains that fly off the surface while scratching ── */
  let sand = [], sandRAF = null, sandAccum = 0;
  /* Gilt fallback, replaced at runtime by colours read back out of the bar
     itself so the grains match whatever the foil was painted as. */
  /* The foil, the dust it throws off and the label on it all have to
     agree, so they are stated once. The bride's is olive, off the card's
     own --olive-ink; the groom's is a baby pink off his blush envelope,
     with a deep rose label because cream on baby pink cannot be read. */
  const FOIL = SIDE === 'groom'
    ? { stops: ['#fbdfe2', '#f6c8cd', '#efb2b9', '#e299a2', '#d1848e'],
        sheen: 'rgba(255,246,247,.5)',
        label: 'rgba(122,58,66,.95)',
        sand:  ['#f6c8cd', '#efb2b9', '#e299a2', '#d1848e', '#fdeef0'] }
    : { stops: ['#9aa473', '#87925f', '#6d7654', '#5a6344', '#454e36'],
        sheen: 'rgba(246,240,206,.34)',
        label: 'rgba(255,246,226,.94)',
        sand:  ['#9aa473', '#87925f', '#6d7654', '#5a6344', '#dfe6c4'] };
  let SAND_COLORS = FOIL.sand.slice();
  let paletteReady = false;

  function samplePalette(w, h, dpr) {
    if (paletteReady) return;
    try {
      /* Sampled along the bar rather than in a disc — it is wide and short
         now, so points clustered near the middle would all land on the
         same stripe of the gradient. */
      const pts = [[.12,.5],[.28,.34],[.4,.62],[.5,.45],[.62,.3],[.74,.6],[.88,.5],[.5,.7],[.2,.68]];
      const cols = [];
      for (const [fx, fy] of pts) {
        const d = ctx.getImageData(Math.round(fx * w * dpr), Math.round(fy * h * dpr), 1, 1).data;
        if (d[3] > 20) cols.push(`rgb(${d[0]},${d[1]},${d[2]})`);
      }
      if (cols.length >= 3) { SAND_COLORS = cols; paletteReady = true; }
    } catch (_) { /* not ready yet — keep the fallback */ }
  }

  function sizeSand() {
    if (!sCtx) return;
    const dpr = window.devicePixelRatio || 1;
    const r = section.getBoundingClientRect();
    sandCv.width  = Math.round(r.width * dpr);
    sandCv.height = Math.round(r.height * dpr);
    sCtx.setTransform(1, 0, 0, 1, 0, 0);
    sCtx.scale(dpr, dpr);
  }

  function spawnSand(clientX, clientY, dirX, dirY) {
    if (!sCtx || reduce) return;
    const dpr = window.devicePixelRatio || 1;
    const r = section.getBoundingClientRect();
    if (sandCv.width !== Math.round(r.width * dpr) || sandCv.height !== Math.round(r.height * dpr)) sizeSand();
    const x = clientX - r.left, y = clientY - r.top;
    const n = 3 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) {
      const speed = 30 + Math.random() * 70;
      const spread = (Math.random() - 0.5) * 60;
      sand.push({
        x, y,
        vx: dirX * speed * 0.6 + spread,
        vy: dirY * speed * 0.3 - (30 + Math.random() * 60),   /* initial upward pop */
        g: 320 + Math.random() * 140,
        size: 0.5 + Math.random(),
        color: SAND_COLORS[(Math.random() * SAND_COLORS.length) | 0],
        life: 1,
        decay: 1.4 + Math.random() * 1.2,
      });
    }
    startSand();
  }

  function startSand() {
    if (sandRAF) return;
    let last = performance.now();
    (function step(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const r = section.getBoundingClientRect();
      sCtx.clearRect(0, 0, r.width, r.height);
      const alive = [];
      for (const p of sand) {
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0) continue;
        sCtx.globalAlpha = Math.max(0, Math.min(1, p.life));
        sCtx.fillStyle = p.color;
        sCtx.beginPath();
        sCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        sCtx.fill();
        alive.push(p);
      }
      sCtx.globalAlpha = 1;
      sand = alive;
      sandRAF = sand.length ? requestAnimationFrame(step) : null;
    })(last);
  }

  /* ── the foil ──
     The frame sits in normal flow, so the wrap's height comes from its own
     proportions. setup() is fired from several triggers so at least one
     always wins whatever order things finish loading in. */
  function setup() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    canvas.width  = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    drawFoil(rect.width, rect.height);
    samplePalette(rect.width, rect.height, dpr);
  }

  function drawFoil(w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    /* A rounded bar now, not an oval — cut as a clip path rather than a CSS
       mask, because mask-image switches between alpha and luminance
       behaviour across browsers and the gilt has to end exactly on the
       rounded edge. */
    const r = Math.min(h / 2, 26);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(0, 0, w, h, r);
    else {
      ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
    }
    ctx.clip();

    /* Foil, lit from the upper left, with a highlight band raked across it
       so the bar reads as foil rather than as flat paint. See FOIL above
       for which colours, and why each card gets its own. */
    const g = ctx.createLinearGradient(0, 0, w, h);
    FOIL.stops.forEach((c, i) => g.addColorStop(i / (FOIL.stops.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const sheen = ctx.createLinearGradient(0, h * 0.1, w * 0.55, h);
    sheen.addColorStop(0,    'rgba(255,255,255,0)');
    sheen.addColorStop(0.45, FOIL.sheen);
    sheen.addColorStop(0.6,  'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = FOIL.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${Math.max(12, Math.min(16, h * 0.3))}px "Cormorant Garamond", Georgia, serif`;
    const label = (CONFIG.scratch && CONFIG.scratch.cta) || 'Scratch to reveal';
    ctx.letterSpacing = '.18em';
    ctx.fillText(label, w / 2, h / 2 + 1);
    ctx.restore();
  }

  /* The bar sits in normal flow and needs no image, so the first paint is
     enough to size it; the later triggers are belt and braces for fonts
     and late layout shifts. */
  requestAnimationFrame(setup);
  window.addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(setup)));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup).catch(() => {});
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (!revealed) setup(); }).observe(canvas);

  /* ── erase ──
     Sized off the bar's HEIGHT, not its width: the bar is wide and short,
     and a radius taken from the width would clear the whole thing in a
     single touch. */
  const brushR = () => {
    const r = canvas.getBoundingClientRect();
    return Math.max(14, Math.min(26, r.height * 0.42));
  };

  function erase(x, y) {
    const r = brushR();
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.6, 'rgba(0,0,0,0.85)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    mark(x, y, r);
  }

  function scratchLine(a, b) {
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / 6));
    for (let i = 0; i <= steps; i++) {
      erase(a.x + (b.x - a.x) * (i / steps), a.y + (b.y - a.y) * (i / steps));
    }
  }

  /* coverage is tracked on a coarse grid rather than by reading pixels back
     every move — getImageData on each pointermove is what makes a scratch
     card stutter */
  function mark(x, y, r) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const cw = rect.width / GRID, ch = rect.height / GRID;
    const x0 = Math.max(0, Math.floor((x - r) / cw)), x1 = Math.min(GRID - 1, Math.floor((x + r) / cw));
    const y0 = Math.max(0, Math.floor((y - r) / ch)), y1 = Math.min(GRID - 1, Math.floor((y + r) / ch));
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) coverage[gy * GRID + gx] = 1;
  }

  /* The bar fills its box, so every cell counts — unlike the oval this
     replaced, where the corners could never be cleared and had to be left
     out of the fraction. */
  function getCoverage() {
    let done = 0;
    for (let i = 0; i < coverage.length; i++) if (coverage[i]) done++;
    return done / coverage.length;
  }

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (revealed) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    isDrawing = true;
    lastPos = getPos(e);
    erase(lastPos.x, lastPos.y);
    if (hint) hint.classList.add('hidden');
    dismissPrompts();
    sandAccum = 0;
    spawnSand(e.clientX, e.clientY, 0, -1);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing || revealed) return;
    e.preventDefault();
    const pos = getPos(e);
    const prev = lastPos || pos;
    scratchLine(prev, pos);

    const dx = pos.x - prev.x, dy = pos.y - prev.y;
    const len = Math.hypot(dx, dy);
    sandAccum += len;
    if (len > 0 && sandAccum >= 7) {
      sandAccum = 0;
      spawnSand(e.clientX, e.clientY, dx / len, dy / len);
      /* a little grit under the finger on devices that support it */
      if (!reduce && navigator.vibrate) navigator.vibrate(6);
    }
    lastPos = pos;

    const now = performance.now();
    if (now - lastCheck > 200) {
      lastCheck = now;
      if (getCoverage() >= 0.45) complete();
    }
  });

  canvas.addEventListener('pointerup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    lastPos = null;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    if (!revealed && getCoverage() >= 0.45) complete();
  });
  canvas.addEventListener('pointercancel', () => { isDrawing = false; lastPos = null; });

  function complete() {
    if (revealed) return;
    revealed = true;
    dismissPrompts();
    canvas.classList.add('gone');
    if (hint) hint.classList.add('hidden');
    if (revealEl) revealEl.classList.add('show');
    if (hashtag) setTimeout(() => hashtag.classList.add('visible'), 700);
    startPetals();
  }

  /* ── the blossom shower ── */
  function startPetals() {
    if (reduce || !pCtx) return;
    const dpr = window.devicePixelRatio || 1;
    const r = section.getBoundingClientRect();
    petalCv.width = Math.round(r.width * dpr);
    petalCv.height = Math.round(r.height * dpr);
    pCtx.setTransform(1, 0, 0, 1, 0, 0);
    pCtx.scale(dpr, dpr);
    petalCv.classList.add('active');

    const COLORS = ['#f2a8c0', '#e88bab', '#f6c2d2', '#dd7fa2', '#f9d6e0'];
    const petals = Array.from({ length: 46 }, () => ({
      x: Math.random() * r.width,
      y: -20 - Math.random() * r.height * 0.6,
      w: 7 + Math.random() * 8,
      vy: 34 + Math.random() * 52,
      vx: -14 + Math.random() * 28,
      rot: Math.random() * Math.PI * 2,
      vr: (-1 + Math.random() * 2) * 1.6,
      sway: 0.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
    }));

    const started = performance.now();
    let last = started;
    (function step(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const age = (now - started) / 1000;
      pCtx.clearRect(0, 0, r.width, r.height);

      let visible = 0;
      for (const p of petals) {
        p.phase += p.sway * dt;
        p.x += (p.vx + Math.sin(p.phase) * 26) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        /* everything fades together over the last two seconds, so the
           shower ends as one gesture rather than petal by petal */
        if (age > 6) p.life = Math.max(0, 1 - (age - 6) / 2);
        if (p.y > r.height + 30) continue;
        visible++;
        pCtx.save();
        pCtx.translate(p.x, p.y);
        pCtx.rotate(p.rot);
        pCtx.globalAlpha = 0.9 * p.life;
        pCtx.fillStyle = p.color;
        pCtx.beginPath();
        pCtx.ellipse(0, 0, p.w / 2, p.w / 3.1, 0, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
      }
      pCtx.globalAlpha = 1;

      if (visible && age < 8.5) requestAnimationFrame(step);
      else { petalCv.classList.remove('active'); pCtx.clearRect(0, 0, r.width, r.height); }
    })(last);
  }

  /* one pulse as the card arrives, so it is noticed at all */
  if (wrap && !reduce) {
    revealOnce(wrap, 'attention', { threshold: 0.45 });
  }
  window.addEventListener('resize', () => { if (!revealed) setup(); sizeSand(); }, { passive: true });
  sizeSand();
}
