// Scoring helper utilities - not direct API calls but derived data

/**
 * Calculate total score from shots array
 */
export function calculateTotalScore(shots: Array<{ score: number }>): number {
  return shots.reduce((sum, shot) => sum + shot.score, 0);
}

/**
 * Separate shots by type (generic - preserves full shot shape)
 */
export function separateShotsByType<T extends { shot_type: string }>(shots: T[]): { test: T[]; main: T[] } {
  return {
    test: shots.filter((s) => s.shot_type === 'TEST'),
    main: shots.filter((s) => s.shot_type === 'MAIN'),
  };
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(hitCount: number, totalShots: number): number {
  if (totalShots === 0) return 0;
  return Math.round((hitCount / totalShots) * 100);
}
