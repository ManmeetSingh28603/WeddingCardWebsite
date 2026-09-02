/* ============================================================
   Wedding invitation — behaviour
   Intro gate · Hero · Scratch-to-reveal · Invitation · Events ·
   Wardrobe · Blessings · RSVP · Countdown · Music
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   THE ONE PLACE TO EDIT
   Everything the invitation says lives in this object. Nothing
   below it needs touching to change a name, a time or a number.
   ════════════════════════════════════════════════════════════ */
const CONFIG = {

  couple: {
    names:   'Kirti & Harsh',        // hero fallback + footer
    bride:   'Kirti',
    groom:   'Harsh',
    venue:   'Fairmont, Jaipur',
    hashtag: '#dilseHarshKi',
  },

  dates: {
    scratchNumber: '23 – 24',        // revealed under the foil
    scratchMonth:  'August 2026',
    footer:        '23<sup>rd</sup> – 24<sup>th</sup> August 2026',
    /* drives the countdown; mo is 0-indexed, so 7 = August */
    moment: { y: 2026, mo: 7, d: 24, h: 12, min: 0 },
  },

  invitation: {
    mantra:  '|| Shri Mahaviraya Namah ||',
    request: ['We request the honor', 'of your presence for', 'the wedding celebration of'],
    /* ↓ replace with the family's own lines */
    brideLineage: [
      'GD/O — grandparents’ names —',
      'D/O — parents’ names —',
    ],
    groomLineage: [
      'GS/O — grandparents’ names —',
      'S/O — parents’ names —',
    ],
  },

  events: [
    {
      id: 'mayra', palette: 'mayra',
      day: '23', suffix: 'rd', month: 'August, 2026',
      title: 'Rangilo Mayra',
      sub: 'Mayra Ceremony with Dandiya',
      time: '1:00 pm onwards',
      venue: 'At Zui',
      art: { ornament: 'bough', particles: 'motes' },
    },
    {
      id: 'sangeet', palette: 'sangeet',
      day: '23', suffix: 'rd', month: 'August, 2026',
      title: 'Celestial Evening',
      sub: 'Sangeet',
      time: '7:30 pm onwards',
      venue: 'At Grand Ballroom',
      art: { ornament: 'jhoomer', particles: 'stars' },
    },
    {
      id: 'wedding', palette: 'wedding',
      day: '24', suffix: 'th', month: 'August, 2026',
      title: 'Shubh Vivah',
      time: '10:00 am onwards',
      /* two places, not a timetable: the one time above covers the day */
      schedule: ['Baraat from Saheliyon ki Badi', 'Varmala & Pheras at Pool Side'],
      art: { still: 'assets/events/mandap.webp', ornament: 'vine', particles: 'motes' },
    },
    {
      id: 'reception', palette: 'reception',
      day: '24', suffix: 'th', month: 'August, 2026',
      title: 'The First Dance',
      sub: 'Reception',
      time: '7:00 pm onwards',
      venue: 'At Grand Ballroom',
      art: { ornament: 'vine', particles: 'motes' },
    },
  ],

  /* Only two trolley artworks were supplied. Wedding and Reception borrow
     the nearest match; drop dress_wedding.png / dress_reception.png into
     assets/wardrobe/ and point `art` at them to finish the set. */
  wardrobe: [
    { id: 'mayra',     label: 'Mayra',     dress: 'Traditional Rajasthani or Gujarati Style', art: 'assets/wardrobe/dress_mayra.png' },
    { id: 'sangeet',   label: 'Sangeet',   dress: 'Indo Western Bling',                       art: 'assets/wardrobe/dress_sangeet.png' },
    { id: 'wedding',   label: 'Wedding',   dress: 'Traditional',                              art: 'assets/wardrobe/dress_mayra.png' },
    { id: 'reception', label: 'Reception', dress: 'Dress Your Best',                          art: 'assets/wardrobe/dress_sangeet.png' },
  ],

  /* ↓ replace the placeholder names with the family's own lists */
  blessings: {
    note: 'With the love and good wishes of our families.',
    groom: [
      { title: 'With Best Compliments', names: ['— name & name —', '— name & name —', '— name & name —'] },
      { title: 'Awaiting Eyes',         names: ['— names of the children —'] },
      { title: 'Special Request',       names: ['— name & name —', '— name & name —'] },
      { title: 'Sharing the Joy',       names: ['— name & name —', '— name & name —'] },
      { title: 'Establishments (Groom Side)', names: ['— firm name —', '— city | city —'] },
    ],
    bride: [
      { title: 'With Best Compliments', names: ['— name & name —', '— name & name —', '— name & name —'] },
      { title: 'Awaiting Eyes',         names: ['— names of the children —'] },
      { title: 'Special Request',       names: ['— name & name —', '— name & name —'] },
      { title: 'Sharing the Joy',       names: ['— name & name —', '— name & name —'] },
      { title: 'Establishment (Bride Side)', names: ['— firm name —', '— address —'] },
    ],
  },

  /* ↓ replace with real names and numbers. `tel` is the full international
     form used for the call and WhatsApp links; `shown` is what is printed. */
  rsvp: {
    groom: [
      { name: '— name —', shown: '00000 00000', tel: '910000000000' },
      { name: '— name —', shown: '00000 00000', tel: '910000000000' },
    ],
    bride: [
      { name: '— name —', shown: '00000 00000', tel: '910000000000' },
      { name: '— name —', shown: '00000 00000', tel: '910000000000' },
    ],
  },
};
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
  renderInvitation();
  renderEvents();
  renderBlessings();
  renderRsvp();

  initMusic();
  initIntro();
  initHero();
  initInvite();
  initEvents();
  initWardrobe();
  initBlessings();
  initRsvp();
  initCountdownSection();
  initLayerDrift();
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
  document.querySelectorAll('[data-hashtag]').forEach(n => { n.textContent = CONFIG.couple.hashtag; });
  const num = document.querySelector('[data-date-num]');
  const mon = document.querySelector('[data-date-month]');
  if (num) num.textContent = CONFIG.dates.scratchNumber;
  if (mon) mon.textContent = CONFIG.dates.scratchMonth;
  const fd = document.querySelector('[data-footer-date]');
  if (fd) fd.innerHTML = CONFIG.dates.footer;
  document.title = `${CONFIG.couple.names} — ${CONFIG.couple.venue}`;
}

function renderInvitation() {
  const inv = CONFIG.invitation;
  const mantra = document.querySelector('[data-mantra]');
  if (mantra) mantra.textContent = inv.mantra;

  const req = document.querySelector('.inv-request');
  if (req) req.innerHTML = inv.request.map(l => `<span>${l}</span>`).join('');

  const bn = document.querySelector('[data-bride-name]');
  const gn = document.querySelector('[data-groom-name]');
  if (bn) bn.textContent = CONFIG.couple.bride;
  if (gn) gn.textContent = CONFIG.couple.groom;

  const bl = document.querySelector('[data-bride-lineage]');
  const gl = document.querySelector('[data-groom-lineage]');
  if (bl) bl.innerHTML = inv.brideLineage.map(l => `<span>${l}</span>`).join('');
  if (gl) gl.innerHTML = inv.groomLineage.map(l => `<span>${l}</span>`).join('');
}

function renderEvents() {
  const host = document.getElementById('events');
  if (!host) return;

  CONFIG.events.forEach((ev) => {
    const card = el('article', `ev-card ev-card--${ev.palette}`);
    card.setAttribute('aria-labelledby', `evTitle-${ev.id}`);

    /* ── the painting ── */
    const art = el('div', 'ev-art');
    art.setAttribute('aria-hidden', 'true');
    if (ev.art && ev.art.still) {
      const plate = new Image();
      plate.className = 'plate';
      plate.src = ev.art.still;
      plate.alt = '';
      plate.draggable = false;
      plate.loading = 'lazy';
      plate.decoding = 'async';
      /* a card that loses its plate still has its painted ground underneath */
      plate.addEventListener('error', () => { plate.style.display = 'none'; }, { once: true });
      art.appendChild(plate);
    } else {
      art.appendChild(el('div', 'ev-still'));
      /* a painted card gets a horizon of its own — without one the panel
         reads as a bare gradient behind the type */
      art.insertAdjacentHTML('beforeend',
        '<svg class="ev-skyline" viewBox="0 0 400 210" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
        '<use href="#orn-skyline"/></svg>');
    }
    if (ev.art && ev.art.ornament) {
      const o = ev.art.ornament;
      /* The bough is drawn growing from the left, and these cards hang it in
         the right-hand corner. Mirroring INSIDE the viewBox rather than with
         a CSS scaleX: a reflection about the element's own hinge (88% 4%,
         where the branch meets the frame) would walk the whole box most of
         its width to the right and off the panel. */
      const flip = o === 'bough' ? ' transform="translate(200,0) scale(-1,1)"' : '';
      /* the drift is HALF the travel in each direction — the scroll loop runs
         its progress -1…+1 — so the chandeliers are held short of the copy */
      art.insertAdjacentHTML('beforeend',
        `<svg class="ev-fg ev-fg--${o}" data-drift="${o === 'jhoomer' ? 10 : 20}" ` +
        `viewBox="0 0 200 200" aria-hidden="true"><use href="#orn-${o}"${flip}/></svg>`);
    }
    card.appendChild(art);

    if (ev.art && ev.art.particles) {
      const p = el('div', ev.art.particles === 'stars' ? 'ev-stars' : 'ev-motes');
      p.setAttribute('aria-hidden', 'true');
      const n = ev.art.particles === 'stars' ? 8 : 6;
      for (let i = 0; i < n; i++) p.appendChild(el('span'));
      card.appendChild(p);
    }

    /* ── the type ── */
    const c = el('div', 'ev-content');
    c.appendChild(el('p', 'ev-day', `${ev.day}<sup>${ev.suffix}</sup>`));
    c.appendChild(el('p', 'ev-month', ev.month));
    const h = el('h2', 'ev-title', ev.title);
    h.id = `evTitle-${ev.id}`;
    c.appendChild(h);
    if (ev.sub)   c.appendChild(el('p', 'ev-sub', ev.sub));
    if (ev.time)  c.appendChild(el('p', 'ev-time', ev.time));
    if (ev.venue) c.appendChild(el('p', 'ev-venue', ev.venue));
    if (ev.schedule) {
      const ul = el('ul', 'ev-schedule');
      ev.schedule.forEach(row => ul.appendChild(el('li', 'ev-sch-row', row)));
      c.appendChild(ul);
    }
    card.appendChild(c);

    host.appendChild(card);
  });
}

function renderBlessings() {
  const host = document.getElementById('blessings');
  if (!host) return;

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

  host.appendChild(page('groom', 'Groom’s Side', CONFIG.blessings.groom, CONFIG.blessings.note));
  host.appendChild(page('bride', 'Bride’s Side', CONFIG.blessings.bride, null));
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
      li.innerHTML =
        `<div class="rsvp-identity">
           <span class="rsvp-name">${p.name}</span>
           <span class="rsvp-num">${p.shown}</span>
         </div>
         <div class="rsvp-actions">
           <a href="tel:+${p.tel}" class="rsvp-action rsvp-action--phone" aria-label="Call ${p.name}">
             <svg aria-hidden="true"><use href="#ic-phone"/></svg>
           </a>
           <a href="https://wa.me/${p.tel}" class="rsvp-action rsvp-action--wa" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ${p.name}">
             <svg aria-hidden="true"><use href="#ic-wa"/></svg>
           </a>
         </div>`;
      ul.appendChild(li);
    });
    host.appendChild(ul);
  };

  /* the groom's side is read first, then the bride's */
  list('Groom’s Side', CONFIG.rsvp.groom);
  list('Bride’s Side', CONFIG.rsvp.bride);
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

function initLayerDrift() {
  if (CFG.reducedMotion) return;

  document.querySelectorAll('[data-drift]').forEach((node) => {
    const section = node.closest('section, article');
    if (!section) return;
    DRIFT_LAYERS.push({ el: node, section, amount: parseFloat(node.dataset.drift) || 18 });
  });
  if (!DRIFT_LAYERS.length) return;

  let raf = 0;
  const tick = () => {
    raf = 0;
    const vh = window.innerHeight || 1;
    DRIFT_LAYERS.forEach(({ el: node, section, amount }) => {
      const r = section.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;   /* far off screen */
      const p = 1 - 2 * ((r.top + r.height / 2) / vh);   /* -1 … 1 */
      node.style.setProperty('--drift-y', `${(p * amount).toFixed(2)}px`);
    });
  };
  const schedule = () => { if (!raf) raf = window.requestAnimationFrame(tick); };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();
}


/* ============================================================
   INVITATION — the card is revealed as one, the order carried by
   --inv-delay.
   ============================================================ */
function initInvite() {
  const section = document.getElementById('invite');
  if (!section) return;

  stagger(section.querySelectorAll('.inv-request span'), '--inv-delay', 130, 520);

  const names = section.querySelectorAll('.inv-name');
  if (names[0]) names[0].style.setProperty('--inv-delay', '1080ms');
  if (names[1]) names[1].style.setProperty('--inv-delay', '2320ms');

  const lineageStarts = [1720, 2960];
  section.querySelectorAll('.inv-lineage').forEach((block, i) => {
    stagger(block.querySelectorAll('span'), '--inv-delay', 140, lineageStarts[i] || 1720);
  });

  const amp = section.querySelector('.inv-amp');
  if (amp) amp.style.setProperty('--inv-delay', '2080ms');

  revealOnce(section, 'is-visible', { threshold: 0.22 });
}


/* ============================================================
   EVENTS — each card watches itself, so a card scrolled past
   quickly still plays its own arrival when it is reached.
   ============================================================ */
function initEvents() {
  document.querySelectorAll('.ev-card').forEach((card) => {
    const day = card.querySelector('.ev-day');
    const month = card.querySelector('.ev-month');
    if (day) day.style.setProperty('--ev-delay', '80ms');
    if (month) month.style.setProperty('--ev-delay', '240ms');

    stagger(card.querySelectorAll('.ev-sub, .ev-time, .ev-venue, .ev-sch-row'), '--ev-delay', 190, 1420);

    revealOnce(card, 'is-visible', { threshold: 0.25 });
  });
}

/* ============================================================
   WARDROBE PLANNER
   Tapping a name wheels that trolley in from the side the guest is
   travelling, and the function's name turns over with it.
   ============================================================ */
function initWardrobe() {
  const section = document.getElementById('wardrobe');
  const rail    = document.getElementById('wdRail');
  const stage   = document.getElementById('wdTrolleyVp');
  const caption = document.getElementById('wdCaption');
  const dress   = document.getElementById('wdDress');
  if (!section || !rail || !stage || !caption || !dress) return;

  const ITEMS = CONFIG.wardrobe;
  stagger(section.querySelectorAll('.wd-header, .wd-rail, .wd-stage'), '--wd-delay', 180, 60);

  const items = el('div', 'wd-rail-items');
  const buttons = ITEMS.map((ev, i) => {
    const btn = el('button', 'wd-btn' + (i === 0 ? ' is-active' : ''));
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', `${ev.label} — ${ev.dress}`);
    btn.dataset.event = ev.id;
    btn.innerHTML = '<span class="wd-btn-string" aria-hidden="true"></span>' +
                    `<span class="wd-btn-label">${ev.label}</span>`;
    btn.addEventListener('click', () => show(i));
    items.appendChild(btn);
    return btn;
  });
  rail.appendChild(items);

  const racks = ITEMS.map((ev, i) => {
    const img = new Image();
    img.src = ev.art;
    img.alt = '';
    img.draggable = false;
    img.decoding = 'async';
    if (i > 0) img.loading = 'lazy';
    img.className = 'wd-trolley' + (i === 0 ? ' is-active' : '');
    img.dataset.event = ev.id;
    img.addEventListener('error', () => { img.style.display = 'none'; }, { once: true });
    stage.appendChild(img);
    return img;
  });

  let current = 0;
  caption.textContent = ITEMS[0].label;
  dress.textContent   = ITEMS[0].dress;

  const ENTER_AT = CFG.reducedMotion ? 0 : 380;   /* the old rack is clear by here */
  const SWAP_AT  = CFG.reducedMotion ? 0 : 300;   /* the name turns over with it */
  let enterTimer = 0, swapTimer = 0, settleTimer = 0;

  const ALL = ['is-active', 'is-arriving', 'is-exiting-fwd', 'is-exiting-bwd', 'is-entering-fwd', 'is-entering-bwd'];

  /* Every tap is answered at once: a switch already in flight is cancelled
     rather than queued, so a guest running along the rail never waits out an
     animation they have already moved past. */
  function show(next) {
    if (next === current) return;
    clearTimeout(enterTimer); clearTimeout(swapTimer); clearTimeout(settleTimer);

    const prev = current;
    const forward = next > prev;
    current = next;

    buttons.forEach((btn, i) => {
      btn.classList.toggle('is-active', i === next);
      btn.setAttribute('aria-selected', i === next ? 'true' : 'false');
    });

    caption.classList.add('is-swapping');
    dress.classList.add('is-swapping');
    swapTimer = setTimeout(() => {
      caption.textContent = ITEMS[next].label;
      dress.textContent   = ITEMS[next].dress;
      caption.classList.remove('is-swapping');
      dress.classList.remove('is-swapping');
    }, SWAP_AT);

    /* anything left over from an interrupted switch is put away */
    racks.forEach((img, i) => { if (i !== prev && i !== next) img.classList.remove(...ALL); });

    const leaving = racks[prev], arriving = racks[next];

    /* park the new one off screen with no transition, commit it, and only
       then start it moving — otherwise it slides in from wherever it last was */
    arriving.classList.remove(...ALL);
    arriving.classList.add(forward ? 'is-entering-fwd' : 'is-entering-bwd');
    void arriving.offsetWidth;

    /* the entering classes have to go too: a rack turned round mid-arrival
       still carries them, and they hold transition:none — it would jump off
       screen instead of wheeling out */
    leaving.classList.remove('is-active', 'is-arriving', 'is-entering-fwd', 'is-entering-bwd');
    leaving.classList.add(forward ? 'is-exiting-fwd' : 'is-exiting-bwd');

    enterTimer = setTimeout(() => {
      arriving.classList.remove('is-entering-fwd', 'is-entering-bwd');
      arriving.classList.add('is-active', 'is-arriving');
      /* the settle is a one-shot: drop it, or it fights the next exit */
      settleTimer = setTimeout(() => arriving.classList.remove('is-arriving'), 2000);
    }, ENTER_AT);
  }

  revealOnce(section, 'is-visible', { threshold: 0.12 });
}


/* ============================================================
   BLESSINGS — every block is watched on its own, so a list this
   long arrives a group at a time, as it is read.
   ============================================================ */
function initBlessings() {
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

  section.querySelectorAll('.rsvp-rule, .rsvp-heading, .rsvp-sub-rule, .rsvp-note, .rsvp-side, .rsvp-row')
    .forEach((n, i) => n.style.setProperty('--rsvp-delay', `${i * 90}ms`));

  if (CFG.reducedMotion) { section.classList.add('is-visible'); return; }

  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    section.classList.add('is-visible');
    obs.disconnect();
  }, { threshold: 0.18, rootMargin: '0px 0px -12% 0px' }).observe(section);
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

  const M = CONFIG.dates.moment;
  const target = new Date(M.y, M.mo, M.d, M.h, M.min, 0).getTime();
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

/* Start the score and reveal the toggle. Idempotent. On rejection, arm
   one-shot listeners on the trailing gesture events so the SAME tap — or
   the next one — recovers. */
function startBgMusic() {
  if (!bgAudio || musicFailed || musicStarted) return;
  if (!bgAudio.paused) { musicStarted = true; return; }
  musicStarted = true;
  try { bgAudio.muted = false; bgAudio.volume = 1; bgAudio.currentTime = 0; } catch (_) {}
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

  const beginBtn = document.getElementById('beginButton');
  const dissolve = document.getElementById('ivoryDissolve');

  let begun = false, finished = false, touchHandled = false;
  lockScroll(true);

  const finish = () => {
    if (finished) return;
    finished = true;
    startBgMusic();
    screen.classList.add('is-fading');

    /* The veil must be shut BEFORE the hero is revealed and before the card
       starts fading off it, or the scene shows through the fade. Ask the
       hero whether the flight is armed rather than running it first: this
       is the one ordering that guarantees no glimpse. */
    const hero = document.getElementById('hero');
    const holding = !!(hero && hero.classList.contains('is-crest-flight'));

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
    if (beginBtn) beginBtn.classList.add('is-hidden');
    /* called synchronously inside the gesture handler so the activation
       token covers it; startBgMusic carries its own retry net if refused */
    startBgMusic();
    /* let the button clear before the hand-off starts */
    setTimeout(finish, 420);
  };

  /* pointerdown is the earliest possible start; touchend / click / keydown
     cover the activation-carrying paths. touchHandled stops the synthetic
     click from firing begin() a second time. */
  const gestureStart = () => { touchHandled = true; begin(); };
  screen.addEventListener('pointerdown', gestureStart, { passive: true });
  screen.addEventListener('touchend', gestureStart, { passive: true });
  screen.addEventListener('click', () => {
    if (touchHandled) { touchHandled = false; return; }
    begin();
  });
  screen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin(); }
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
const CREST_FLIGHT = { bloomAt: 500, shineAt: 1300, travelAt: 2400, travel: 1300 };
/* how long the veil takes to draw back once the crest is home — must match
   the .is-lifting transition, since it decides when the veil is torn down */
const VEIL_LIFT_MS = 1100;

/* Set by the intro: draws the held veil back and takes it down. Called by
   the crest's landing, so the scene arrives with the crest however the
   flight ended. Idempotent. */
let liftIvoryVeil = null;

function revealHero() {
  const hero = document.getElementById('hero');
  if (hero) {
    runCrestFlight(hero);
    hero.classList.add('is-animated');
  }
  /* with a flight the hero is still behind a shut veil, so the control waits
     for the landing and arrives with the scene */
  if (!(hero && hero.classList.contains('is-crest-flight'))) showMusicControl();
}

function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  initHeroParallax(hero);

  /* The flight is the hand-off from the opening card, so it is armed only
     when the gate is really there to hand off from. Armed BEFORE the reveal
     so the hero's own crest animation never gets a frame in. */
  if (document.getElementById('introScreen') && !CFG.reducedMotion) {
    hero.classList.add('is-crest-flight');
    prepareCrestFlight(hero);
  }

  if (document.getElementById('introScreen')) return;
  if (CFG.reducedMotion) { hero.classList.add('is-animated'); return; }
  requestAnimationFrame(() => setTimeout(() => hero.classList.add('is-animated'), 360));
}

/* Built during the intro, not at the hand-off: creating this element costs
   an image decode and the rasterising of a full-size mask, and doing that
   at the moment the card closes is what stalls the first paint of the
   reveal. Made here, it is warm by the time it is needed. */
let crestFlightEl = null;

function prepareCrestFlight(hero) {
  const art = hero.querySelector('.hero-crest img');
  if (!art) return;

  const fly = el('div', 'crest-flight');
  fly.setAttribute('aria-hidden', 'true');
  const flyArt = new Image();
  flyArt.alt = '';
  flyArt.draggable = false;
  flyArt.src = art.currentSrc || art.src;
  fly.appendChild(flyArt);

  /* off screen and invisible, but laid out and painted, so the decode and
     the mask raster are both done before the reveal asks for them */
  fly.style.cssText = 'left:0;top:0;width:1px;height:1px';
  document.body.appendChild(fly);
  if (flyArt.decode) flyArt.decode().catch(() => {});
  crestFlightEl = fly;
}

/* Fly the crest from the middle of the ivory light into its place in the
   hero. The copy is positioned ON the hero crest's own box and then pushed
   OUT to the opening pose, so "home" is simply transform:none — the landing
   is exact by construction, at any width. */
function runCrestFlight(hero) {
  if (!hero.classList.contains('is-crest-flight')) return;

  const crest = hero.querySelector('.hero-crest');
  const art = crest && crest.querySelector('img');
  const target = art && art.getBoundingClientRect();

  /* Artwork missing, still unsized, or the text fallback is showing. The
     veil was already shut on the promise of a flight and nothing will land
     to open it — draw it back now rather than leaving the guest on ivory. */
  if (!target || !target.width || !target.height || crest.classList.contains('is-fallback')) {
    hero.classList.remove('is-crest-flight');
    if (crestFlightEl && crestFlightEl.parentNode) crestFlightEl.remove();
    if (liftIvoryVeil) liftIvoryVeil();
    return;
  }

  const fly = crestFlightEl || el('div', 'crest-flight');
  if (!crestFlightEl) {
    fly.setAttribute('aria-hidden', 'true');
    const flyArt = new Image();
    flyArt.src = art.currentSrc || art.src;
    flyArt.alt = '';
    flyArt.draggable = false;
    fly.appendChild(flyArt);
  }

  let opened = '';
  const pin = () => {
    const box = art.getBoundingClientRect();
    const hb = hero.getBoundingClientRect();
    fly.style.left = `${box.left}px`;
    fly.style.top = `${box.top}px`;
    fly.style.width = `${box.width}px`;
    fly.style.height = `${box.height}px`;
    /* centred on the invite COLUMN, not the viewport — the desktop frame is
       a 480px column, and the viewport centre would miss it */
    const scale = Math.min(hb.width * 0.78, 340) / box.width;
    const dx = (hb.left + hb.width / 2) - (box.left + box.width / 2);
    const dy = (window.innerHeight * 0.46) - (box.top + box.height / 2);
    opened = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
  };
  pin();

  /* struck out of the light: smaller and soft, before it firms up */
  fly.style.transform = `${opened} scale(0.92)`;
  fly.style.filter = 'blur(14px)';
  if (!fly.parentNode) document.body.appendChild(fly);

  let landed = false;
  const land = () => {
    if (landed) return;
    landed = true;
    hero.classList.add('is-crest-landed');   /* real crest on, breath starts */
    if (liftIvoryVeil) liftIvoryVeil();      /* the scene arrives with the crest */
    showMusicControl();
    window.removeEventListener('resize', onResize);
    /* one frame later — never leave a gap where neither crest is painted */
    requestAnimationFrame(() => { if (fly.parentNode) fly.remove(); });
  };

  const timers = [
    setTimeout(() => {
      fly.classList.add('is-in');
      fly.style.transform = opened;
      fly.style.filter = '';               /* the class owns the glow now */
    }, CREST_FLIGHT.bloomAt),

    setTimeout(() => fly.classList.add('is-shining'), CREST_FLIGHT.shineAt),

    setTimeout(() => {
      /* The scroll lock is released partway through, which brings back the
         scrollbar and narrows the layout — so the crest's box is NOT where
         it was measured. Re-pin to the box as it is now, holding the copy
         visually still while we do it, or the landing misses by the width
         of the scrollbar. */
      fly.style.transition = 'none';
      pin();
      fly.style.transform = opened;
      void fly.offsetWidth;                /* commit before the travel starts */
      fly.style.transition = '';

      fly.classList.remove('is-in');
      fly.classList.add('is-home');
      fly.style.transform = 'translate3d(0, 0, 0) scale(1)';
    }, CREST_FLIGHT.travelAt),

    setTimeout(land, CREST_FLIGHT.travelAt + CREST_FLIGHT.travel),
  ];

  /* A rotation invalidates every measurement above, and a scroll moves the
     crest out from under the copy, which is fixed to the viewport. Either
     way: stop, and let the real crest take the frame. */
  function onResize() {
    timers.forEach(clearTimeout);
    land();
  }
  window.addEventListener('resize', onResize, { once: true });
  window.addEventListener('scroll', () => { if (window.scrollY > 4) onResize(); }, { passive: true });
}

function initHeroParallax(hero) {
  const fg = document.getElementById('heroFg');
  if (!fg || CFG.reducedMotion) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0, scrollP = 0, raf = 0;

  const onPointer = (e) => {
    const r = hero.getBoundingClientRect();
    if (!r.height) return;
    targetX = ((e.clientX - r.left) / r.width - 0.5) * 2;   /* -1 … 1 */
    targetY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    schedule();
  };
  const onLeave = () => { targetX = 0; targetY = 0; schedule(); };
  const onScroll = () => {
    const r = hero.getBoundingClientRect();
    scrollP = Math.min(1, Math.max(0, -r.top / (r.height || 1)));
    schedule();
  };
  const tick = () => {
    raf = 0;
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    /* small offsets only — the layers are registered artwork */
    const x = curX * 7;
    const y = curY * 5 + scrollP * 26;
    fg.style.transform = `scale(1.08) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    if (Math.abs(targetX - curX) > 0.002 || Math.abs(targetY - curY) > 0.002) schedule();
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(tick); };

  hero.addEventListener('pointermove', onPointer, { passive: true });
  hero.addEventListener('pointerleave', onLeave, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


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
  const frameEl  = document.querySelector('.scratch-frame-img');
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

  const foil = new Image();

  /* ── sand: warm grains that fly off the surface while scratching ── */
  let sand = [], sandRAF = null, sandAccum = 0;
  /* rose-gold fallback, replaced at runtime by colours sampled straight from
     the foil so the grains match the surface exactly */
  let SAND_COLORS = ['#e6c3bf', '#dcaaa6', '#cf9692', '#e9d2cd', '#d3a09c'];
  let paletteReady = false;

  function samplePalette(w, h, dpr) {
    if (paletteReady || !(foil.complete && foil.naturalWidth > 0)) return;
    try {
      const pts = [[.5,.5],[.4,.42],[.6,.45],[.45,.6],[.58,.62],[.5,.35],[.5,.68],[.36,.52],[.64,.52]];
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
    /* the oval, cut as a clip path rather than a CSS mask */
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();

    if (foil.complete && foil.naturalWidth > 0) {
      const sc = Math.max(w / foil.naturalWidth, h / foil.naturalHeight) * 1.02;
      const dw = foil.naturalWidth * sc, dh = foil.naturalHeight * sc;
      ctx.drawImage(foil, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      /* rose-gold gradient, so the card is never blank if the file is late */
      const g = ctx.createRadialGradient(w * 0.42, h * 0.35, 0, w / 2, h / 2, Math.max(w, h) * 0.72);
      g.addColorStop(0, '#f8dde0'); g.addColorStop(0.35, '#ebb4b9');
      g.addColorStop(0.75, '#cd8890'); g.addColorStop(1, '#b5727a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  foil.addEventListener('load', setup);
  foil.src = 'assets/scratch/foil.png';
  if (frameEl) requestAnimationFrame(setup);
  window.addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(setup)));
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (!revealed) setup(); }).observe(canvas);

  /* ── erase ── */
  const brushR = () => Math.max(18, Math.min(28, canvas.getBoundingClientRect().width * 0.10));

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

  /* only cells inside the oval can ever be cleared, so the fraction is taken
     against those rather than against the whole square */
  function getCoverage() {
    let inside = 0, done = 0;
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const nx = (gx + 0.5) / GRID * 2 - 1, ny = (gy + 0.5) / GRID * 2 - 1;
        if (nx * nx + ny * ny > 1) continue;
        inside++;
        if (coverage[gy * GRID + gx]) done++;
      }
    }
    return inside ? done / inside : 0;
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
