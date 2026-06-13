// Pure helper deciding how many characters each selected anime contributes.
//
// Each anime offers its top-15% (`fifteen`) of favorites-ranked characters. If
// the selection's combined 15% can't fill a board, every anime instead
// contributes its most-favorited `floor` (25). Used by both the selection
// screen (to show exact counts) and the store (to build the pool), so they
// always agree.

export interface RankedCount {
  /** Characters in this anime's top 15%. */
  fifteen: number;
  /** Characters actually available (favorites-ranked, capped). */
  available: number;
}

export interface ContributionResult {
  useFifteen: boolean;
  /** How many characters each anime contributes, in input order. */
  contributions: number[];
  /** Total characters across the selection. */
  total: number;
}

export function decideContributions(
  items: RankedCount[],
  boardSize: number,
  floor: number
): ContributionResult {
  const fifteenSum = items.reduce((sum, i) => sum + i.fifteen, 0);
  const useFifteen = fifteenSum >= boardSize;
  const contributions = items.map((i) =>
    useFifteen ? i.fifteen : Math.min(floor, i.available)
  );
  const total = contributions.reduce((sum, n) => sum + n, 0);
  return { useFifteen, contributions, total };
}
