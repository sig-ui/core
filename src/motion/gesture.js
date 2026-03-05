// @ts-check

/**
 * SigUI core motion module for gesture.
 * @module
 */
/**
 * computeVelocity.
 * @param {readonly VelocitySample[]} samples
 * @param {number} now
 * @param {number} windowMs
 * @returns {Point}
 */
export function computeVelocity(samples, now, windowMs = 100) {
  const recent = samples.filter((s) => now - s.time <= windowMs);
  if (recent.length < 2) {
    return { x: 0, y: 0 };
  }
  const first = recent[0];
  const last = recent[recent.length - 1];
  const dt = (last.time - first.time) / 1000;
  if (dt <= 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: (last.point.x - first.point.x) / dt,
    y: (last.point.y - first.point.y) / dt
  };
}
/**
 * detectSwipe.
 * @param {Point} velocity
 * @param {Point} displacement
 * @param {SwipeDetectionOptions} options
 * @returns {SwipeDirection | null}
 */
export function detectSwipe(velocity, displacement, options) {
  const velThreshold = options?.velocityThreshold ?? 300;
  const dispThreshold = options?.displacementThreshold ?? 20;
  const absVx = Math.abs(velocity.x);
  const absVy = Math.abs(velocity.y);
  const absDx = Math.abs(displacement.x);
  const absDy = Math.abs(displacement.y);
  if (absVx > absVy) {
    if (absVx >= velThreshold && absDx >= dispThreshold) {
      return velocity.x < 0 ? "left" : "right";
    }
  } else {
    if (absVy >= velThreshold && absDy >= dispThreshold) {
      return velocity.y < 0 ? "up" : "down";
    }
  }
  return null;
}
/**
 * applyDragConstraint.
 * @param {Point} point
 * @param {DragConstraint} constraint
 * @returns {Point}
 */
export function applyDragConstraint(point, constraint) {
  let { x, y } = point;
  if (constraint.axis === "x") {
    y = 0;
  } else if (constraint.axis === "y") {
    x = 0;
  }
  if (constraint.min) {
    x = Math.max(x, constraint.min.x);
    y = Math.max(y, constraint.min.y);
  }
  if (constraint.max) {
    x = Math.min(x, constraint.max.x);
    y = Math.min(y, constraint.max.y);
  }
  return { x, y };
}
/**
 * elasticDisplacement.
 * @param {number} displacement
 * @param {number} maxDrag
 * @returns {number}
 */
export function elasticDisplacement(displacement, maxDrag = 100) {
  if (maxDrag <= 0)
    return 0;
  const sign = displacement < 0 ? -1 : 1;
  const abs = Math.abs(displacement);
  return sign * maxDrag * (1 - Math.exp(-abs / maxDrag));
}
