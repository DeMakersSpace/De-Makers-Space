/* ═══════════════════════════════════════════════
   PRICING.JS — FAQ v2 accordion + price count-up
   initAccordion, easeOutCubic, initPriceCounters
   are defined in global.js.
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initAccordion('.faq-container', '.faq-q');
  initFaqV2();
  initPriceCounters();
});

/* ── FAQ v2 — Card accordion with mouse glow ── */
function initFaqV2() {
  const items = document.querySelectorAll('.faq-v2-item');
  if (!items.length) return;

  /* Mouse-tracking radial glow on each card */
  items.forEach(item => {
    const glow = item.querySelector('.faq-v2-glow');
    if (!glow) return;

    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.background =
        `radial-gradient(240px circle at ${x}px ${y}px, rgba(255,255,255,0.07), transparent 70%)`;
    });

    item.addEventListener('mouseleave', () => {
      glow.style.background = '';
    });
  });

  /* Accordion toggle */
  items.forEach(item => {
    const btn = item.querySelector('.faq-v2-q');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      /* Close all siblings */
      items.forEach(other => {
        if (other === item) return;
        other.classList.remove('is-open');
        const otherBtn = other.querySelector('.faq-v2-q');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      /* Toggle this card */
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* Intro badge reveal — one rAF to allow CSS transition to fire */
  const badge = document.getElementById('faqV2Badge');
  if (badge) {
    requestAnimationFrame(() => badge.classList.add('is-active'));
  }

  /* Scroll-triggered entrance for the card list */
  const list = document.querySelector('.faq-v2-list');
  if (!list) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    list.style.cssText = 'opacity:1;transform:none;filter:none';
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      list.classList.add('is-entered');
      io.unobserve(list);
    });
  }, { threshold: 0.08 });

  io.observe(list);
}

/* easeOutCubic, initPriceCounters — defined in global.js */
