import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTotalScore, calculateAccuracy } from '@/api/scoring.api';

describe('Scoring Utilities', () => {
  beforeEach(() => {
    // Setup if needed
  });

  describe('calculateTotalScore', () => {
    it('should return 0 for an empty array of shots', () => {
      expect(calculateTotalScore([])).toBe(0);
    });

    it('should return the correct sum of scores for a list of shots', () => {
      const shots = [
        { score: 10 },
        { score: 9 },
        { score: 8 },
        { score: 10 },
      ];
      expect(calculateTotalScore(shots)).toBe(37);
    });

    it('should handle decimal scores correctly', () => {
      const shots = [
        { score: 10.2 },
        { score: 9.5 },
        { score: 8.1 },
      ];
      expect(calculateTotalScore(shots)).toBeCloseTo(27.8, 5);
    });
  });

  describe('calculateAccuracy', () => {
    it('should return 0 when total is 0 (0 total -> 0%)', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
      expect(calculateAccuracy(5, 0)).toBe(0);
    });

    it('should return 100 when all shots are hits (all hits -> 100%)', () => {
      expect(calculateAccuracy(5, 5)).toBe(100);
      expect(calculateAccuracy(10, 10)).toBe(100);
    });

    it('should return correct rounded percentage for partial hits (partial -> correct percentage)', () => {
      // 3 hits out of 4 is 75%
      expect(calculateAccuracy(3, 4)).toBe(75);
      // 1 hit out of 3 is 33.333% -> 33%
      expect(calculateAccuracy(1, 3)).toBe(33);
      // 2 hits out of 3 is 66.666% -> 67%
      expect(calculateAccuracy(2, 3)).toBe(67);
    });
  });
});
