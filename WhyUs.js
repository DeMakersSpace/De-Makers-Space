/* ═══════════════════════════════════════════════
   WHYUS.JS — Bento card + MorphingCardStack
   initAccordion, easeOutCubic, initNumberCounters,
   initPriceCounters are defined in global.js.
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initAccordion('.faq-container', '.faq-q');
  initMorphingCardStack();
  initNumberCounters();
  initPriceCounters();
  initBentoCard();
});

/* ── Fixed left-side scroll progress orb ── */
function initPageOrb() {
  if (window.innerWidth < 768) return;

  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  if (!panels.length) return;

  const line = document.createElement('div');
  line.className = 'porb-line';

  const glow = document.createElement('div');
  glow.className = 'porb-glow';

  const orb = document.createElement('div');
  orb.className = 'porb-orb';

  document.body.appendChild(line);
  document.body.appendChild(glow);
  document.body.appendChild(orb);

  const LINE_X = 24; // px from left edge

  line.style.left = LINE_X + 'px';
  glow.style.left = LINE_X + 'px';
  orb.style.left  = LINE_X + 'px';

  document.body.classList.add('porb-active');

  function update() {
    const vh         = window.innerHeight;
    const viewCenter = vh * 0.45;
    const TOP_Y      = vh * 0.08;
    const BOT_Y      = vh * 0.92;
    const range      = BOT_Y - TOP_Y;
    const step       = panels.length > 1 ? range / (panels.length - 1) : 0;

    /* Viewport midpoints for each panel */
    const mids = panels.map(p => {
      const r = p.getBoundingClientRect();
      return r.top + r.height / 2;
    });

    /* Find the last panel whose midpoint is above the view centre */
    let activeIdx = 0;
    for (let i = 0; i < mids.length; i++) {
      if (mids[i] <= viewCenter) activeIdx = i;
    }

    /* Default orb position (no interpolation yet) */
    let orbY = TOP_Y + activeIdx * step;

    /* Smooth interpolation between adjacent panels */
    for (let i = 0; i < mids.length - 1; i++) {
      if (mids[i] <= viewCenter && mids[i + 1] > viewCenter) {
        const t = (viewCenter - mids[i]) / (mids[i + 1] - mids[i]);
        orbY = TOP_Y + (i + t) * step;
        activeIdx = t > 0.5 ? i + 1 : i;
        break;
      }
    }

    orb.style.top     = orbY + 'px';
    glow.style.top    = TOP_Y + 'px';
    glow.style.height = Math.max(0, orbY - TOP_Y) + 'px';

    /* Dim all panels except the active one */
    panels.forEach((p, i) => {
      p.classList.toggle('porb-panel-active', i === activeIdx);
    });
  }

  update();
  window.addEventListener('scroll', update, { passive: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
      line.style.display = 'none';
      glow.style.display = 'none';
      orb.style.display  = 'none';
      document.body.classList.remove('porb-active');
      panels.forEach(p => p.classList.remove('porb-panel-active'));
      return;
    }
    line.style.display = '';
    glow.style.display = '';
    orb.style.display  = '';
    document.body.classList.add('porb-active');
    update();
  });
}

/* ── Bento Card — animated tab switcher for Why section ── */
function initBentoCard() {
  const tabs    = Array.from(document.querySelectorAll('[data-bento-tab]'));
  const panels  = Array.from(document.querySelectorAll('[data-bento-panel]'));
  const pill    = document.getElementById('bentoPill');
  const titleEl = document.getElementById('bentoPanelTitle');
  const descEl  = document.getElementById('bentoPanelDesc');

  if (!tabs.length) return;

  const META = {
    story:   { title: 'STORY FIRST',    desc: 'Your story is our starting point — not an afterthought.' },
    present: { title: 'LONG-TERM ALLY', desc: 'We stay long after launch day.' },
    growth:  { title: 'GROWTH-FOCUSED', desc: 'Clear navigation and purposeful functionality — built so visitors convert.' },
    ranked:  { title: 'BUILT TO RANK',  desc: 'Discoverable from day one — clean code, smart structure.' },
  };

  function movePill(tab) {
    if (!pill || window.innerWidth <= 600) return;
    pill.style.top = (tab.offsetTop + Math.round(tab.offsetHeight / 2) - 8) + 'px';
  }

  function activate(id) {
    const tab = tabs.find(t => t.dataset.bentoTab === id);
    if (!tab) return;

    tabs.forEach(t   => t.classList.toggle('is-active', t.dataset.bentoTab    === id));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.bentoPanel  === id));

    movePill(tab);

    if (titleEl && META[id]) titleEl.textContent = META[id].title;
    if (descEl  && META[id]) descEl.textContent  = META[id].desc;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.dataset.bentoTab));
  });

  /* Set pill to first active tab after layout is ready */
  requestAnimationFrame(() => {
    const first = tabs.find(t => t.classList.contains('is-active')) || tabs[0];
    if (first) movePill(first);
  });
}

/* ── MorphingCardStack — vanilla translation of 21st.dev component ── */
function initMorphingCardStack() {
  const wrapper   = document.getElementById('mcsWrapper');
  const cardsEl   = document.getElementById('mcsCards');
  if (!wrapper || !cardsEl) return;

  const cards      = Array.from(cardsEl.querySelectorAll('.mcs-card'));
  const toggleBtns = Array.from(wrapper.querySelectorAll('.mcs-toggle-btn'));
  const dots       = Array.from(wrapper.querySelectorAll('.mcs-dot'));
  const dotsEl     = wrapper.querySelector('.mcs-dots');
  const n          = cards.length;

  let layout      = 'grid';
  let activeIndex = 0;

  /* ── Stack position for card at originalIndex ── */
  function stackPos(i) { return (i - activeIndex + n) % n; }

  /* ── Apply transforms for stack mode ── */
  function applyStack(animated) {
    cards.forEach((card, i) => {
      const sp    = stackPos(i);
      const isTop = sp === 0;
      const tx    = sp * 8;
      const ty    = sp * 8;
      const rot   = (sp - 1) * 2;   /* top = -2deg, +2deg per step */

      card.style.zIndex  = n - sp;
      card.style.transition = animated
        ? 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease'
        : 'none';
      card.style.transform  = `translate(${tx}px,${ty}px) rotate(${rot}deg)`;
      card.style.opacity    = '1';
      card.classList.toggle('mcs-card--top', isTop);
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
  }

  /* ── Switch layout ── */
  function setLayout(mode) {
    layout = mode;
    cardsEl.dataset.layout = mode;

    toggleBtns.forEach(btn => {
      const active = btn.dataset.layout === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    if (mode === 'stack') {
      /* Fade all in from new positions */
      cards.forEach(c => { c.style.transition = 'none'; c.style.opacity = '0'; });
      requestAnimationFrame(() => {
        applyStack(false);
        requestAnimationFrame(() => applyStack(true));
      });
      if (dotsEl) dotsEl.style.display = 'flex';
    } else {
      cards.forEach(card => {
        card.style.transform  = '';
        card.style.zIndex     = '';
        card.style.transition = '';
        card.style.opacity    = '';
        card.classList.remove('mcs-card--top', 'mcs-card--dragging');
      });
      if (dotsEl) dotsEl.style.display = 'none';
    }
  }

  /* ── Drag / swipe (stack mode, top card only) ── */
  let pid        = null;   /* active pointer id */
  let startX     = 0;
  let currentX   = 0;
  let didDrag    = false;

  cardsEl.addEventListener('pointerdown', e => {
    if (layout !== 'stack') return;
    const top = cards.find(c => c.classList.contains('mcs-card--top'));
    if (!top || !top.contains(e.target)) return;
    pid      = e.pointerId;
    startX   = currentX = e.clientX;
    didDrag  = false;
    top.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  cardsEl.addEventListener('pointermove', e => {
    if (e.pointerId !== pid) return;
    currentX = e.clientX;
    const dx = currentX - startX;
    if (Math.abs(dx) > 6) didDrag = true;
    if (!didDrag) return;

    const top = cards.find(c => c.classList.contains('mcs-card--top'));
    if (!top) return;
    top.classList.add('mcs-card--dragging');
    top.style.transition = 'none';
    top.style.transform  = `translate(${dx}px,0px) rotate(${-2 + dx * 0.06}deg)`;
  });

  cardsEl.addEventListener('pointerup', e => {
    if (e.pointerId !== pid) return;
    pid = null;

    const top = cards.find(c => c.classList.contains('mcs-card--top'));
    if (top) top.classList.remove('mcs-card--dragging');

    if (didDrag) {
      const dx = currentX - startX;
      if      (dx < -50) activeIndex = (activeIndex + 1) % n;
      else if (dx >  50) activeIndex = (activeIndex - 1 + n) % n;
    }
    didDrag = false;
    applyStack(true);
  });

  /* ── Toggle buttons ── */
  toggleBtns.forEach(btn => btn.addEventListener('click', () => setLayout(btn.dataset.layout)));

  /* ── Dot navigation ── */
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    if (layout !== 'stack') return;
    activeIndex = i;
    applyStack(true);
  }));

  /* ── Init ── */
  setLayout('grid');
}

/* ── Section horizontal scroller — scroll-driven navigation ── */
function initHorizontalScroller() {
  const scroller  = document.getElementById('svcHScroller');
  const track     = document.getElementById('svcHTrack');
  const fadeLeft  = document.getElementById('svcHFadeLeft');
  const fadeRight = document.getElementById('svcHFadeRight');
  const curEl     = document.getElementById('svcHCounterCur');
  const totEl     = document.getElementById('svcHCounterTotal');

  if (!track || !scroller) return;
  if (window.innerWidth < 768) return;

  const slides      = Array.from(track.querySelectorAll('.svc-hslide'));
  const totalSlides = slides.length;
  let currentIndex  = 0;
  let isAnimating   = false; /* debounce: one scroll = one slide change */

  if (totEl) totEl.textContent = String(totalSlides).padStart(2, '0');

  /* ── Navigate to slide index ── */
  function goTo(index) {
    const target = Math.max(0, Math.min(totalSlides - 1, index));
    if (target === currentIndex && index === currentIndex) return;
    currentIndex = target;
    isAnimating  = true;

    track.style.scrollBehavior = 'smooth';
    track.scrollLeft = currentIndex * track.clientWidth;

    /* Release debounce after animation (~600 ms) */
    setTimeout(() => { isAnimating = false; }, 650);
    updateUI();
  }

  /* ── Sync edge fades and counter ── */
  function updateUI() {
    const atStart = currentIndex === 0;
    const atEnd   = currentIndex === totalSlides - 1;

    if (fadeLeft)  { fadeLeft.classList.toggle('is-visible', !atStart); fadeLeft.classList.toggle('is-hidden', atStart); }
    if (fadeRight) { fadeRight.classList.toggle('is-visible', !atEnd);  fadeRight.classList.toggle('is-hidden', atEnd); }
    if (curEl)     curEl.textContent = String(currentIndex + 1).padStart(2, '0');
  }

  /* ── Wheel: hijack vertical scroll to drive horizontal navigation ──
     While the cursor is over the scroller, each scroll tick = one slide.
     When at the last slide, wheel-down lets the page scroll past to the CTA. */
  scroller.addEventListener('wheel', (e) => {
    const atEnd  = currentIndex === totalSlides - 1;
    const atStart = currentIndex === 0;

    /* Let page scroll when going backward from slide 0
       or going forward past the last slide */
    if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;

    e.preventDefault();
    if (isAnimating) return;

    if (e.deltaY > 0) goTo(currentIndex + 1);
    else              goTo(currentIndex - 1);
  }, { passive: false });

  /* ── Keyboard: arrow keys ── */
  document.addEventListener('keydown', (e) => {
    if (window.innerWidth < 768) return;
    /* Only intercept when scroller is in view */
    const rect = scroller.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentIndex < totalSlides - 1) { e.preventDefault(); goTo(currentIndex + 1); }
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentIndex > 0) { e.preventDefault(); goTo(currentIndex - 1); }
    }
  });

  /* ── Touch swipe support ── */
  let touchStartX = 0;
  scroller.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  scroller.addEventListener('touchend',   (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) goTo(currentIndex + (dx > 0 ? 1 : -1));
  }, { passive: true });

  /* ── Re-sync index if user manually scrolls the track ── */
  track.addEventListener('scroll', () => {
    if (isAnimating) return;
    currentIndex = Math.round(track.scrollLeft / track.clientWidth);
    updateUI();
  }, { passive: true });

  /* Initial state */
  updateUI();
}

/* initAccordion, easeOutCubic, initNumberCounters, initPriceCounters — defined in global.js */

