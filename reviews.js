/* ═══════════════════════════════════════════════
   REVIEWS.JS — Notice board note reveal animation
   Effect: blur(6px) + translateY(-22px) + opacity:0
   → notes drop onto the board sequentially as the
     section enters the viewport.
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  initNotesReveal();
});

function initNotesReveal() {
  var notes = document.querySelectorAll('.rev-note');
  if (!notes.length) return;

  /* Store each note's natural rotation as a CSS variable so the
     reveal animation can return to it (not to 0deg). */
  var rotations = { 'rev-note--1': '-1.8deg', 'rev-note--2': '1.2deg', 'rev-note--3': '-0.6deg' };

  notes.forEach(function (note, i) {
    /* Find which rotation class it has */
    var rot = '0deg';
    Object.keys(rotations).forEach(function (cls) {
      if (note.classList.contains(cls)) rot = rotations[cls];
    });
    note.style.setProperty('--note-rot', rot);
    note.style.setProperty('--delay', (i * 0.14) + 's');
  });

  /* Enable CSS hidden state (graceful degradation: no JS = notes visible) */
  document.body.classList.add('rev-anim-ready');

  /* Reveal each note as it enters the viewport */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px',
  });

  notes.forEach(function (note) { observer.observe(note); });
}
