import { describe, it, expect, beforeEach } from 'vitest';
import { groupOverlappingShots } from '@/utils/overlap';
import type { ShotResponse } from '@/types';

describe('groupOverlappingShots', () => {
  beforeEach(() => {
    // Setup if needed
  });

  it('should return all single shots when there are no overlapping shots', () => {
    const shots: ShotResponse[] = [
      { id: 1, shot_type: 'MAIN', x: 10, y: 10, score: 10, soldier_id: 1 },
      { id: 2, shot_type: 'MAIN', x: 50, y: 50, score: 9, soldier_id: 1 },
      { id: 3, shot_type: 'MAIN', x: 100, y: 100, score: 8, soldier_id: 1 },
    ];

    // default threshold is 12. Let's use 12.
    const result = groupOverlappingShots(shots, 12);

    expect(result.groups).toHaveLength(0);
    expect(result.singleShots).toHaveLength(3);
    expect(result.singleShots).toEqual(shots);
  });

  it('should group two shots within threshold into a x2 group', () => {
    const shots: ShotResponse[] = [
      { id: 1, shot_type: 'MAIN', x: 10, y: 10, score: 10, soldier_id: 1 },
      { id: 2, shot_type: 'MAIN', x: 15, y: 15, score: 9, soldier_id: 1 }, // distance is ~7.07 < 12
    ];

    const result = groupOverlappingShots(shots, 12);

    expect(result.groups).toHaveLength(1);
    expect(result.singleShots).toHaveLength(0);

    const group = result.groups[0];
    expect(group.count).toBe(2);
    expect(group.badge).toBe('×2');
    expect(group.shots).toHaveLength(2);
    expect(group.shots).toContainEqual(shots[0]);
    expect(group.shots).toContainEqual(shots[1]);
  });

  it('should group three shots close together into a x3 group', () => {
    const shots: ShotResponse[] = [
      { id: 1, shot_type: 'MAIN', x: 10, y: 10, score: 10, soldier_id: 1 },
      { id: 2, shot_type: 'MAIN', x: 15, y: 12, score: 9, soldier_id: 1 }, // dist to 1: ~5.38
      { id: 3, shot_type: 'MAIN', x: 18, y: 15, score: 8, soldier_id: 1 }, // dist to 2: ~4.24 (transitive cluster)
    ];

    const result = groupOverlappingShots(shots, 12);

    expect(result.groups).toHaveLength(1);
    expect(result.singleShots).toHaveLength(0);

    const group = result.groups[0];
    expect(group.count).toBe(3);
    expect(group.badge).toBe('×3');
    expect(group.shots).toHaveLength(3);
  });

  it('should group four or more close shots into a x4+ group', () => {
    const shots: ShotResponse[] = [
      { id: 1, shot_type: 'MAIN', x: 10, y: 10, score: 10, soldier_id: 1 },
      { id: 2, shot_type: 'MAIN', x: 12, y: 11, score: 9, soldier_id: 1 },
      { id: 3, shot_type: 'MAIN', x: 11, y: 12, score: 8, soldier_id: 1 },
      { id: 4, shot_type: 'MAIN', x: 13, y: 13, score: 7, soldier_id: 1 },
      { id: 5, shot_type: 'MAIN', x: 14, y: 14, score: 6, soldier_id: 1 },
    ];

    const result = groupOverlappingShots(shots, 12);

    expect(result.groups).toHaveLength(1);
    expect(result.singleShots).toHaveLength(0);

    const group = result.groups[0];
    expect(group.count).toBe(5);
    expect(group.badge).toBe('×4+');
    expect(group.shots).toHaveLength(5);
  });

  it('should handle mixed overlapping and single shots', () => {
    const shots: ShotResponse[] = [
      { id: 1, shot_type: 'MAIN', x: 10, y: 10, score: 10, soldier_id: 1 },
      { id: 2, shot_type: 'MAIN', x: 12, y: 11, score: 9, soldier_id: 1 }, // overlapping with 1
      { id: 3, shot_type: 'MAIN', x: 100, y: 100, score: 8, soldier_id: 1 }, // single
      { id: 4, shot_type: 'MAIN', x: 200, y: 200, score: 7, soldier_id: 1 }, // overlapping with 5
      { id: 5, shot_type: 'MAIN', x: 205, y: 205, score: 6, soldier_id: 1 },
    ];

    const result = groupOverlappingShots(shots, 12);

    expect(result.groups).toHaveLength(2);
    expect(result.singleShots).toHaveLength(1);

    expect(result.singleShots[0].id).toBe(3);

    const group1 = result.groups.find(g => g.shots.some(s => s.id === 1));
    const group2 = result.groups.find(g => g.shots.some(s => s.id === 4));

    expect(group1?.count).toBe(2);
    expect(group1?.badge).toBe('×2');

    expect(group2?.count).toBe(2);
    expect(group2?.badge).toBe('×2');
  });

  it('should verify correct centroid calculation', () => {
    const shots: ShotResponse[] = [
      { id: 1, shot_type: 'MAIN', x: 10, y: 20, score: 10, soldier_id: 1 },
      { id: 2, shot_type: 'MAIN', x: 20, y: 40, score: 9, soldier_id: 1 },
      { id: 3, shot_type: 'MAIN', x: 30, y: 60, score: 8, soldier_id: 1 },
    ];

    // Use a large threshold so all are grouped
    const result = groupOverlappingShots(shots, 50);

    expect(result.groups).toHaveLength(1);
    const group = result.groups[0];

    // centerX: (10 + 20 + 30) / 3 = 20
    // centerY: (20 + 40 + 60) / 3 = 40
    expect(group.centerX).toBe(20);
    expect(group.centerY).toBe(40);
  });
});
