// dedup returns a unique set of arr.
export const dedup = (arr: string[]) => Array.from(new Set(arr))

// mustContain returns true if allowed contains all elements within candidates
export const mustContain = (allowed, candidates) =>
  candidates.every((v) => allowed.includes(v))
