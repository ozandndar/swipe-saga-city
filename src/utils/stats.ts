export function clampStats(value: number): number {
  // Only clamp the maximum value at 100, allow negative values
  return Math.min(value, 100);
} 