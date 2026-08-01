/**
 * @fileoverview lerp — linear interpolation, shared by the rAF-driven motion
 * modules (magnetic button, hero/about parallax) for smooth easing toward a target.
 * @module utils/lerp
 */

/**
 * Linear interpolation between two values.
 * @param current - Current value
 * @param target - Target value
 * @param factor - Smoothing factor (0–1; lower = smoother)
 * @returns the interpolated value
 */
const lerp = (current: number, target: number, factor: number): number =>
  current + (target - current) * factor;

export { lerp };
