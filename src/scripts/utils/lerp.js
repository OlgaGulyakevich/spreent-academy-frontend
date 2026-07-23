/**
 * @fileoverview lerp — linear interpolation, shared by the rAF-driven motion
 * modules (magnetic button, hero/about parallax) for smooth easing toward a target.
 * @module utils/lerp
 */

/**
 * Linear interpolation between two values.
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} factor - Smoothing factor (0–1; lower = smoother)
 * @returns {number}
 */
const lerp = (current, target, factor) => current + (target - current) * factor;

export { lerp };
