/** Score thresholds for each verdict. Adjust here to tune difficulty. */
export const VERDICT_THRESHOLDS = {
  COLLAPSE: 0,
  WEAK: 20,
  DECENT: 40,
  STRONG: 60,
  EXCELLENT: 80,
  ELITE: 100,
} as const;
