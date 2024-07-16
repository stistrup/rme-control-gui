/**
 * Convert a linear value to a logarithmic scale.
 * @param value The current value in the linear scale.
 * @param min The minimum value of the range.
 * @param max The maximum value of the range.
 * @returns The converted value in logarithmic scale.
 */
export function linearToLogarithmic(
  value: number,
  min: number,
  max: number
): number {
  // Ensure the value is within the range
  const clampedValue = Math.max(min, Math.min(max, value));

  // Normalize the value to a 0-1 range
  const normalizedValue = (clampedValue - min) / (max - min);

  // Convert to logarithmic scale
  // We add a small number (1e-6) to avoid taking log of 0
  const logValue = Math.log(normalizedValue + 1e-6);
  const minLog = Math.log(1e-6);
  const maxLog = Math.log(1 + 1e-6);

  // Normalize the logarithmic value back to the original range
  return min + ((max - min) * (logValue - minLog)) / (maxLog - minLog);
}

/**
 * Convert a logarithmic value back to a linear scale.
 * @param value The current value in the logarithmic scale.
 * @param min The minimum value of the range.
 * @param max The maximum value of the range.
 * @returns The converted value in linear scale.
 */
export function logarithmicToLinear(
  value: number,
  min: number,
  max: number
): number {
  // Normalize the value to a 0-1 range
  const normalizedValue = (value - min) / (max - min);

  // Convert from logarithmic scale
  const minLog = Math.log(1e-6);
  const maxLog = Math.log(1 + 1e-6);
  const expValue =
    Math.exp(minLog + normalizedValue * (maxLog - minLog)) - 1e-6;

  // Denormalize back to the original range
  return min + expValue * (max - min);
}
