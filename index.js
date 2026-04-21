/* ═══════════════════════════════════════════════
   INDEX.JS — Particle Hero + Digital Serenity + Testimonials
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initLearnMoreToggle();
  initTestimonials();

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  if (prefersReduced) {
    /* Skip particle animation entirely — respect user preference.
       Collapse the hero immediately so content is accessible. */
    const sxr        = document.getElementById('sxr');
    const siteContent = document.getElementById('main-content');
    document.body.classList.remove('sxr-locked');
    if (sxr) sxr.style.opacity = '0';
    if (siteContent) siteContent.style.opacity = '1';
  } else if (isMobile) {
    /* Mobile: defer particle init until idle to unblock LCP rendering */
    const launch = () => initParticleHero();
    if ('requestIdleCallback' in window) {
      requestIdleCallback(launch, { timeout: 500 });
    } else {
      setTimeout(launch, 200);
    }
  } else {
    /* Desktop: init immediately — canvas is the hero experience */
    initParticleHero();
  }

  initDigitalSerenity();
});

function initLearnMoreToggle() {
  const toggle = document.getElementById('learnMoreToggle');
  if (!toggle) return;
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      // Let pencil swing right, then spring back left, then navigate
      setTimeout(() => {
        toggle.checked = false;           // spring back to left
        setTimeout(() => {
          window.location.href = 'story.html';
        }, 460);                          // wait for return swing, then navigate
      }, 460);                            // wait for rightward swing to complete
    }
  });
}

function initTestimonials() {
  const avatars  = document.querySelectorAll('.testimonials-avatar');
  const quotes   = document.querySelectorAll('.testimonials-quote');
  const authors  = document.querySelectorAll('.testimonials-author');

  avatars.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      avatars.forEach((a, i)  => a.classList.toggle('is-active',  i === idx));
      quotes.forEach((q, i)   => q.classList.toggle('is-active',  i === idx));
      authors.forEach((a, i)  => a.classList.toggle('is-active',  i === idx));
    });
  });

  /* Float-in the active quote when the testimonials section scrolls into view */
  const testimonialsBlock = document.querySelector('.testimonials');
  if (testimonialsBlock) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeQuote = document.querySelector('.testimonials-quote.is-active');
          if (activeQuote) {
            activeQuote.classList.add('quote-float-in');
          }
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(testimonialsBlock);
  }
}

/* ── Particle Hero ── */
function initParticleHero() {
  const sxr        = document.getElementById('sxr');
  const card       = document.getElementById('sxrCard');
  const titleLeft  = document.getElementById('titleLeft');
  const titleMid   = document.getElementById('titleMiddle');
  const titleRight = document.getElementById('titleRight');
  const labels     = document.getElementById('sxrLabels');
  const labelL     = document.querySelector('.sxr-label-l');
  const labelR     = document.querySelector('.sxr-label-r');
  const scrollDown = document.getElementById('scrollDown');
  const goldToggle  = document.getElementById('goldToggle');
  const canvas      = document.getElementById('particleCanvas');
  const siteContent = document.getElementById('main-content');

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let progress        = 0;
  let fullyCollapsed  = false;
  let touchStartY     = 0;
  let particles       = [];
  let animFrame;
  let goldMode        = false;

  const isMobile = () => window.innerWidth < 768;

  function getCardDims() {
    return {
      w: Math.min(300, window.innerWidth - 40),
      h: Math.min(420, window.innerHeight * 0.75),
    };
  }

  /* Particle pool */
  function createParticle() {
    return {
      x:         Math.random() * canvas.width,
      y:         Math.random() * canvas.height,
      speed:     Math.random() / 5 + 0.1,
      opacity:   1,
      fadeStart: Date.now() + Math.random() * 600 + 100,
      fadingOut: false,
      v:         180 + Math.floor(Math.random() * 75),
      rectH:     Math.random() * 2 + 1,
    };
  }

  function resetParticle(p) {
    Object.assign(p, createParticle());
  }

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width  = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    particles = Array.from({ length: count }, createParticle);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y -= p.speed;
      if (p.y < 0) { resetParticle(p); return; }
      if (!p.fadingOut && Date.now() > p.fadeStart) p.fadingOut = true;
      if (p.fadingOut) {
        p.opacity -= 0.008;
        if (p.opacity <= 0) { resetParticle(p); return; }
      }
      ctx.fillStyle = `rgba(${p.v},${p.v},${p.v},${p.opacity})`;
      ctx.fillRect(p.x, p.y, 0.4, p.rectH);
    });
    animFrame = requestAnimationFrame(animate);
  }

  function updateUI() {
    const p  = progress;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { w: CARD_W, h: CARD_H } = getCardDims();
    const cardW = vw - p * (vw - CARD_W);
    const cardH = vh - p * (vh - CARD_H);

    if (card) {
      card.style.width        = cardW + 'px';
      card.style.height       = cardH + 'px';
      card.style.borderRadius = p * 16 + 'px';
      card.style.boxShadow    = p > 0 ? `0 0 ${p * 60}px rgba(0,0,0,${p * 0.7})` : 'none';
    }

    const textX = p * (isMobile() ? 120 : 150);
    const textY = p * (isMobile() ? 120 : 150);
    if (titleLeft)  titleLeft.style.transform  = `translateX(-${textX}vw)`;
    if (titleMid)   titleMid.style.transform   = `translateY(${textY}vh)`;
    if (titleRight) titleRight.style.transform = `translateX(${textX}vw)`;

    const labelsOpacity = Math.max(0, (p - 0.5) * 2);
    if (labels) {
      labels.style.top     = `calc(50% + ${CARD_H / 2 + 15}px)`;
      labels.style.opacity = labelsOpacity.toString();
      const labelX = (1 - p) * 60;
      if (labelL) labelL.style.transform = `translateX(-${labelX}vw)`;
      if (labelR) labelR.style.transform = `translateX(${labelX}vw)`;
    }

    if (scrollDown) {
      scrollDown.style.opacity = Math.max(0, 1 - p * 8).toString();
    }

    if (siteContent) {
      siteContent.style.opacity = p >= 0.75 ? ((p - 0.75) / 0.25).toString() : '0';
    }
  }

  function setProgress(newP) {
    progress = Math.min(Math.max(newP, 0), 1);
    updateUI();
    if (progress >= 1 && !fullyCollapsed) {
      fullyCollapsed = true;
      document.body.classList.remove('sxr-locked');
    }
  }

  /* Init */
  resizeCanvas();
  animate();
  updateUI();
  document.body.classList.add('sxr-locked');

  /* Pause spotlight CSS animations and canvas loop when hero leaves viewport */
  const spotlightBeams = document.querySelectorAll('.spotlight-beam');
  if (sxr && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const state = entry.isIntersecting ? 'running' : 'paused';
        spotlightBeams.forEach((beam) => { beam.style.animationPlayState = state; });
        if (entry.isIntersecting) {
          if (!animFrame) animFrame = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(animFrame);
          animFrame = null;
        }
      });
    }, { threshold: 0.01 }).observe(sxr);
  }

  /* Gold toggle */
  if (goldToggle) {
    goldToggle.addEventListener('click', () => {
      goldMode = !goldMode;
      sxr.classList.toggle('gold-mode', goldMode);
      goldToggle.setAttribute('aria-pressed', goldMode.toString());
    });
    goldToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goldToggle.click();
      }
    });
  }

  /* Wheel */
  window.addEventListener('wheel', (e) => {
    if (fullyCollapsed) {
      if (e.deltaY < 0 && window.scrollY <= 5) {
        fullyCollapsed = false;
        document.body.classList.add('sxr-locked');
        if (sxr) sxr.style.opacity = '1';
        window.scrollTo(0, 0);
        e.preventDefault();
      }
      return;
    }
    e.preventDefault();
    setProgress(progress + e.deltaY * 0.0009);
  }, { passive: false });

  /* Touch */
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!touchStartY) return;
    const deltaY = touchStartY - e.touches[0].clientY;
    if (fullyCollapsed) {
      if (deltaY < -20 && window.scrollY <= 5) {
        fullyCollapsed = false;
        document.body.classList.add('sxr-locked');
        if (sxr) sxr.style.opacity = '1';
        e.preventDefault();
      }
      return;
    }
    e.preventDefault();
    const factor = deltaY < 0 ? 0.008 : 0.005;
    setProgress(progress + deltaY * factor);
    touchStartY = e.touches[0].clientY;
  }, { passive: false });

  window.addEventListener('touchend', () => { touchStartY = 0; });

  /* Scroll fade for sxr */
  window.addEventListener('scroll', () => {
    if (!fullyCollapsed) { window.scrollTo(0, 0); return; }
    const fadeOut = Math.min(window.scrollY / 150, 1);
    if (sxr) sxr.style.opacity = (1 - fadeOut).toString();
  });

  /* Resize — debounced to avoid rebuilding the particle array on every tick */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      if (progress > 0) updateUI();
    }, 150);
  });
}

/* ── Digital Serenity effects ── */
function initDigitalSerenity() {
  const mouseGrad    = document.getElementById('dsMouseGradient');
  const rippleCont   = document.getElementById('dsRippleContainer');
  const floatEls     = document.querySelectorAll('.ds-float');
  let floatsStarted  = false;

  /* Word animation — fired once when site-content becomes visible.
     We hook into the existing hero-collapse flow by watching opacity. */
  const siteContent = document.getElementById('main-content');
  let wordsAnimated = false;

  function animateWords() {
    if (wordsAnimated) return;
    wordsAnimated = true;
    document.querySelectorAll('.word-animate').forEach((el) => {
      const delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
      setTimeout(() => {
        el.style.animation = 'ds-word-appear 0.8s ease-out forwards';
      }, delay);
    });
  }

  /* Watch for the site-content opacity to reach 1 (set by hero JS) */
  const contentObserver = new MutationObserver(() => {
    if (siteContent && parseFloat(siteContent.style.opacity) >= 0.9) {
      animateWords();
      contentObserver.disconnect();
    }
  });
  if (siteContent) {
    contentObserver.observe(siteContent, { attributes: true, attributeFilter: ['style'] });
  }

  /* Mouse-follow gradient — drives position via transform to stay on the compositor thread */
  if (mouseGrad) {
    document.addEventListener('mousemove', (e) => {
      mouseGrad.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      mouseGrad.style.opacity   = '1';
    });
    document.addEventListener('mouseleave', () => {
      mouseGrad.style.opacity = '0';
    });
  }

  /* Click ripples */
  if (rippleCont) {
    document.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      ripple.className    = 'ds-ripple';
      ripple.style.left   = e.clientX + 'px';
      ripple.style.top    = e.clientY + 'px';
      rippleCont.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    });
  }

  /* Start floating particles on first scroll */
  function startFloats() {
    if (floatsStarted) return;
    floatsStarted = true;
    floatEls.forEach((el) => {
      el.style.animationPlayState = 'running';
    });
    window.removeEventListener('scroll', startFloats);
  }
  window.addEventListener('scroll', startFloats, { passive: true });
}
