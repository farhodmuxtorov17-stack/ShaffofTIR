import type { ShotResponse, OverlapGroup } from '@/types';

/**
 * Groups shots that overlap or are very close together.
 * Shots within `threshold` pixels of each other are considered overlapping.
 * Does NOT modify backend shot data - purely a frontend display concern.
 */
export function groupOverlappingShots(
  shots: ShotResponse[],
  threshold = 12
): { groups: OverlapGroup[]; singleShots: ShotResponse[] } {
  const visited = new Set<number>();
  const groups: OverlapGroup[] = [];
  const singleShots: ShotResponse[] = [];

  for (let i = 0; i < shots.length; i++) {
    if (visited.has(i)) continue;

    const cluster: ShotResponse[] = [shots[i]];
    visited.add(i);

    // Find all shots close to this one (and transitively close)
    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < shots.length; j++) {
        if (visited.has(j)) continue;
        const isClose = cluster.some(
          (s) => Math.hypot(s.x - shots[j].x, s.y - shots[j].y) < threshold
        );
        if (isClose) {
          cluster.push(shots[j]);
          visited.add(j);
          changed = true;
        }
      }
    }

    if (cluster.length === 1) {
      singleShots.push(cluster[0]);
    } else {
      const centerX = cluster.reduce((sum, s) => sum + s.x, 0) / cluster.length;
      const centerY = cluster.reduce((sum, s) => sum + s.y, 0) / cluster.length;
      const count = cluster.length;
      const badge: OverlapGroup['badge'] =
        count >= 4 ? '×4+' : count === 3 ? '×3' : '×2';
      groups.push({ shots: cluster, count, badge, centerX, centerY });
    }
  }

  return { groups, singleShots };
}
