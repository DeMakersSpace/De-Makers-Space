/* ═══════════════════════════════════════════════
   PROCESS.JS — Wove arc scrollytelling
   A bezier arc sits on the left edge. Scrolling
   advances steps 01 → 07 one at a time.
   Each step owns ~100 vh of scroll space.
═══════════════════════════════════════════════ */

var STEPS = [
  { num: '01', sub: "Let's talk!",        title: 'Consultation & Discovery',  desc: 'We get to know your story, your business, and your goals \u2014 because nobody knows your brand better than you.' },
  { num: '02', sub: 'Designing it!',      title: 'Mockups & Prototyping',      desc: 'We translate your vision into visual mockups and interactive prototypes \u2014 with SEO foundations baked in from the start.' },
  { num: '03', sub: 'Show and tell!',     title: 'Design Presentation',        desc: 'We walk you through every design decision, making sure the direction feels right before moving forward.' },
  { num: '04', sub: 'Polish and perfect!',title: 'Feedback & Revisions',       desc: 'We implement every change and refine the details until your website is exactly how you envisioned it.' },
  { num: '05', sub: 'Getting it ready!',  title: 'Final Refinements',          desc: 'We polish every last detail and prepare your site for a smooth, confident launch.' },
  { num: '06', sub: 'Go live!',           title: 'Deployment & Launch',        desc: 'We connect your site to your domain, set up Google Search Console, and submit for indexing \u2014 discoverable from day one.' },
  { num: '07', sub: 'The Ally Add-on',    title: 'Post-Launch Maintenance',    desc: "Your partnership doesn\u2019t end at launch. We handle ongoing updates and brand refreshes \u2014 you focus on the business, we manage the rest." }
];

/* ─────────────────────────────────────────
   COSMIC BACKGROUND — star generation
   Spreads N white box-shadow "pixels" across
   a 2000 × 2000 field, then injects the same
   shadow on each layer's ::after clone so the
   cosmicStar animation loops seamlessly.
───────────────────────────────────────── */
function generateStarShadow(count) {
  var shadows = [];
  for (var i = 0; i < count; i++) {
    var x = Math.floor(Math.random() * 2000);
    var y = Math.floor(Math.random() * 2000);
    shadows.push(x + 'px ' + y + 'px #FFF');
  }
  return shadows.join(', ');
}

function initCosmicBg() {
  var sm = document.getElementById('proc-cosmic-sm');
  var md = document.getElementById('proc-cosmic-md');
  var lg = document.getElementById('proc-cosmic-lg');
  if (!sm || !md || !lg) return;

  var smShadow = generateStarShadow(700);
  var mdShadow = generateStarShadow(200);
  var lgShadow = generateStarShadow(100);

  /* Apply to parent elements */
  sm.style.boxShadow = smShadow;
  md.style.boxShadow = mdShadow;
  lg.style.boxShadow = lgShadow;

  /* Mirror the same shadow on ::after clones via injected <style>
     (pseudo-elements cannot be styled directly through JS)        */
  var tag = document.createElement('style');
  tag.textContent =
    '#proc-cosmic-sm::after { box-shadow: ' + smShadow + '; }' +
    '#proc-cosmic-md::after { box-shadow: ' + mdShadow + '; }' +
    '#proc-cosmic-lg::after { box-shadow: ' + lgShadow + '; }';
  document.head.appendChild(tag);
}

document.addEventListener('DOMContentLoaded', function () {
  initCosmicBg();

  if (window.innerWidth >= 768) {
    initWoveScroll();
  } else {
    initMobileReveal();
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && !window._woveInitialised) {
      initWoveScroll();
    }
  });
});

function initWoveScroll() {
  window._woveInitialised = true;

  var outer       = document.getElementById('proc-scroll');
  var curve       = document.getElementById('proc-curve');
  var dotsGroup   = document.getElementById('proc-dots');
  var ghostAbove  = document.getElementById('proc-ghost-above');
  var ghostBelow  = document.getElementById('proc-ghost-below');
  var heroNum     = document.getElementById('proc-active-num');
  var textWrap    = document.getElementById('proc-active-text');
  var subEl       = document.getElementById('proc-active-sub');
  var titleEl     = document.getElementById('proc-active-title');
  var descEl      = document.getElementById('proc-active-desc');
  var stepNumEl   = document.getElementById('proc-step-num');

  if (!outer || !curve) return;

  var total        = STEPS.length;   // 7
  var currentIndex = 0;
  var transitioning = false;
  var svgDots      = [];

  /* ── Build dots along the bezier path ── */
  buildDots();

  /* ── Initial display ── */
  ghostAbove.textContent   = '';
  ghostAbove.style.opacity = '0';
  ghostBelow.textContent   = STEPS[1].num;
  ghostBelow.style.opacity = '1';
  updateDots(0);

  /* ── Scroll listener ── */
  window.addEventListener('scroll', onScroll, { passive: true });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth >= 768) {
        buildDots();
        updateDots(currentIndex);
      }
    }, 150);
  });

  onScroll();

  /* ─────────────────────────────────────────
     DOT RENDERING
  ───────────────────────────────────────── */
  function buildDots() {
    /* Clear previous dots */
    while (dotsGroup.firstChild) {
      dotsGroup.removeChild(dotsGroup.firstChild);
    }
    svgDots = [];

    var pathLen = curve.getTotalLength();
    var svgNS   = 'http://www.w3.org/2000/svg';

    for (var i = 0; i < total; i++) {
      var t  = i / (total - 1);
      var pt = curve.getPointAtLength(t * pathLen);

      var circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', String(pt.x));
      circle.setAttribute('cy', String(pt.y));
      circle.setAttribute('r',  '2.5');
      circle.setAttribute('class', i === 0 ? 'proc-path-dot is-active' : 'proc-path-dot');
      dotsGroup.appendChild(circle);
      svgDots.push(circle);
    }
  }

  function updateDots(idx) {
    svgDots.forEach(function (dot, i) {
      dot.setAttribute('r', i === idx ? '3.2' : '2.5');
      dot.classList.toggle('is-active', i === idx);
    });
  }

  /* ─────────────────────────────────────────
     CONTENT CROSS-FADE
  ───────────────────────────────────────── */
  function goToStep(idx) {
    if (idx === currentIndex || transitioning) return;
    transitioning = true;

    heroNum.classList.add('is-fading');
    textWrap.classList.add('is-fading');

    setTimeout(function () {
      var s = STEPS[idx];

      heroNum.textContent   = s.num;
      subEl.textContent     = s.sub;
      titleEl.textContent   = s.title;
      descEl.textContent    = s.desc;
      stepNumEl.textContent = String(idx + 1);

      /* Ghost above = previous step */
      if (idx > 0) {
        ghostAbove.textContent   = STEPS[idx - 1].num;
        ghostAbove.style.opacity = '1';
      } else {
        ghostAbove.textContent   = '';
        ghostAbove.style.opacity = '0';
      }

      /* Ghost below = next step */
      if (idx < total - 1) {
        ghostBelow.textContent   = STEPS[idx + 1].num;
        ghostBelow.style.opacity = '1';
      } else {
        ghostBelow.textContent   = '';
        ghostBelow.style.opacity = '0';
      }

      updateDots(idx);
      currentIndex = idx;

      heroNum.classList.remove('is-fading');
      textWrap.classList.remove('is-fading');
      transitioning = false;
    }, 230);
  }

  /* ─────────────────────────────────────────
     SCROLL → STEP MAPPING
     Each of the 7 steps owns an equal share
     of the outer container's scroll space.
     Round to nearest integer for a clean
     "one scroll = one step" snap.
  ───────────────────────────────────────── */
  function onScroll() {
    var rect      = outer.getBoundingClientRect();
    var outerH    = outer.offsetHeight;
    var vh        = window.innerHeight;
    var scrolled  = -rect.top;
    var maxScroll = outerH - vh;
    var progress  = Math.max(0, Math.min(1, scrolled / maxScroll));

    /* Snap: 0 → step 0, 1 → step 6 */
    var snapIdx = Math.min(Math.round(progress * (total - 1)), total - 1);
    goToStep(snapIdx);

    if (progress > 0.01) {
      outer.classList.add('is-started');
    } else {
      outer.classList.remove('is-started');
    }
  }
}

/* ─────────────────────────────────────────
   MOBILE SCROLL REVEAL
   Each step fades + slides up as it enters
   the viewport. IntersectionObserver fires
   on native touch scroll — no jank.
───────────────────────────────────────── */
function initMobileReveal() {
  var items = document.querySelectorAll('.proc-wove-list-item');
  if (!items.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var delay = parseInt(entry.target.dataset.revealDelay, 10) || 0;
      var el = entry.target;

      setTimeout(function () {
        el.classList.add('is-visible');
      }, delay);

      observer.unobserve(el);
    });
  }, {
    threshold: 0.15   /* trigger when 15 % of the item is visible */
  });

  items.forEach(function (item, i) {
    /* Items already in viewport on load get a short stagger;
       items scrolled to later appear immediately (no accumulated delay). */
    item.dataset.revealDelay = i * 70;
    observer.observe(item);
  });
}
