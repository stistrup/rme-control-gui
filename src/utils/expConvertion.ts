/**
 * Apply an exponential curve to a value.
 * @param value The input value, which can be any number within the range [min, max].
 * @param min The minimum value of the input range.
 * @param max The maximum value of the input range.
 * @param exponent The exponent to use for the curve (default is 2).
 * @returns The output value, transformed by the exponential curve but still within the original range.
 */
export function applyExponentialCurve(
  value: number,
  min: number,
  max: number,
  exponent: number = 2
): number {
  // Normalize the value to [0, 1]
  const normalizedValue = (value - min) / (max - min);
  
  // Apply the exponential curve
  const curvedValue = Math.pow(normalizedValue, exponent);
  
  // Denormalize back to the original range
  return curvedValue * (max - min) + min;
}

/**
 * Inverse of applyExponentialCurve. Converts a value from the exponential curve back to linear.
 * @param value The input value on the exponential curve, within the range [min, max].
 * @param min The minimum value of the input range.
 * @param max The maximum value of the input range.
 * @param exponent The exponent used for the curve (default is 2).
 * @returns The output value, linearized within the original range.
 */
export function removeExponentialCurve(
  value: number,
  min: number,
  max: number,
  exponent: number = 2
): number {
  // Normalize the value to [0, 1]
  const normalizedValue = (value - min) / (max - min);
  
  // Apply the inverse of the exponential curve
  const linearValue = Math.pow(normalizedValue, 1 / exponent);
  
  // Denormalize back to the original range
  return linearValue * (max - min) + min;
}