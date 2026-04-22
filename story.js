// Tap-to-reveal team card overlays on touch devices
(function () {
  if (!window.matchMedia('(hover: none)').matches) return;

  const slides = document.querySelectorAll('.tc-slide');
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      const isActive = slide.classList.contains('tc-active');
      slides.forEach(s => s.classList.remove('tc-active'));
      if (!isActive) slide.classList.add('tc-active');
    });
  });
})();
