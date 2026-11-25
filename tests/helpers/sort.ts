export function isSortedAsc<T extends string | number>(values: T[]): boolean {
  return values.every((v, i) => i === 0 || values[i - 1] <= v);
}
