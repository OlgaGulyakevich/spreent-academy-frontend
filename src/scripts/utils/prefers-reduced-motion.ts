/**
 * @fileoverview prefersReducedMotion — single source for the reduced-motion
 * check used as an early-return guard across the motion modules.
 * @module utils/prefers-reduced-motion
 */

/**
 * Whether the user has requested reduced motion.
 * @returns true if the user prefers reduced motion
 */
const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { prefersReducedMotion };
