/**
 * Apply an exponential curve to a normalized value.
 * @param value The input value, normalized between 0 and 1.
 * @param exponent The exponent to use for the curve (default is 2).
 * @returns The output value, still between 0 and 1, but on an exponential curve.
 */
export function applyExponentialCurve(
  value: number,
  exponent: number = 2
): number {
  // Apply the exponential curve
  return Math.pow(value, exponent);
}

/**
 * Inverse of applyExponentialCurve. Converts a value from the exponential curve back to linear.
 * @param value The input value on the exponential curve, between 0 and 1.
 * @param exponent The exponent used for the curve (default is 2).
 * @returns The output value, linearized between 0 and 1.
 */
export function removeExponentialCurve(
  value: number,
  exponent: number = 2
): number {
  // Apply the inverse of the exponential curve
  return Math.pow(value, 1 / exponent);
}
