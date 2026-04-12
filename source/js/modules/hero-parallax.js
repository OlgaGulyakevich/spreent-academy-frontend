/**
 * Hero Parallax — depth effect on hero photos via two additive layers.
 * Scroll (all devices): photos shift vertically at different speeds.
 * Mouse (desktop only): photos respond to cursor position over hero.
 * Uses CSS `translate` (not `transform`) to avoid conflicts with CSS positioning.
 * @module hero-parallax
 */

const PHOTO_SELECTORS = [
  { selector: '.hero__photo--artur', scrollSpeed: 0.06, mouseSpeed: 0.025 },
  { selector: '.hero__photo--sergey', scrollSpeed: 0.03, mouseSpeed: 0.015 },
  { selector: '.hero__photo--misha', scrollSpeed: 0.08, mouseSpeed: 0.035 },
];

const SECTION_SELECTOR = '.hero';
const MOBILE_BREAKPOINT = 1024;
const LERP_FACTOR = 0.08;

/**
 * Linear interpolation — smooths movement between current and target.
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} factor - Smoothing factor (0–1, lower = smoother)
 * @returns {number}
 */
const lerp = (current, target, factor) => current + (target - current) * factor;

/**
 * Initializes hero parallax effect.
 */
const initHeroParallax = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return;
  }

  const section = document.querySelector(SECTION_SELECTOR);

  if (!section) {
    return;
  }

  const photos = PHOTO_SELECTORS.map(({ selector, scrollSpeed, mouseSpeed }) => {
    const el = document.querySelector(selector);

    return el ? {
      el,
      scrollSpeed,
      mouseSpeed,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      scrollY: 0,
      mouseX: 0,
      mouseY: 0,
    } : null;
  }).filter(Boolean);

  if (!photos.length) {
    return;
  }

  let ticking = false;

  const animate = () => {
    let needsUpdate = false;

    photos.forEach((photo) => {
      photo.targetX = photo.mouseX;
      photo.targetY = photo.scrollY + photo.mouseY;

      photo.currentX = lerp(photo.currentX, photo.targetX, LERP_FACTOR);
      photo.currentY = lerp(photo.currentY, photo.targetY, LERP_FACTOR);

      const dx = Math.abs(photo.currentX - photo.targetX);
      const dy = Math.abs(photo.currentY - photo.targetY);

      if (dx > 0.1 || dy > 0.1) {
        needsUpdate = true;
      }

      photo.el.style.translate = `${photo.currentX}px ${photo.currentY}px`;
    });

    if (needsUpdate) {
      requestAnimationFrame(animate);
    } else {
      ticking = false;
    }
  };

  const startAnimation = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  };

  const handleScroll = () => {
    const rect = section.getBoundingClientRect();
    const scrollProgress = -rect.top;

    photos.forEach((photo) => {
      photo.scrollY = scrollProgress * photo.scrollSpeed;
    });

    startAnimation();
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    photos.forEach((photo) => {
      photo.mouseX = (e.clientX - centerX) * photo.mouseSpeed;
      photo.mouseY = (e.clientY - centerY) * photo.mouseSpeed;
    });

    startAnimation();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  section.addEventListener('mousemove', handleMouseMove, { passive: true });
};

export { initHeroParallax };
