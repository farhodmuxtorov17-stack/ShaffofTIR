import { describe, it, expect } from 'vitest';
import { resolveImageUrl } from '@/api/imageUrl';

describe('resolveImageUrl', () => {
  it('should return empty string for null', () => {
    expect(resolveImageUrl(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(resolveImageUrl(undefined)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(resolveImageUrl('')).toBe('');
  });

  it('should return as-is for already-full http URLs', () => {
    expect(resolveImageUrl('http://example.com/img.jpg')).toBe(
      'http://example.com/img.jpg'
    );
  });

  it('should return as-is for already-full https URLs', () => {
    expect(resolveImageUrl('https://example.com/img.jpg')).toBe(
      'https://example.com/img.jpg'
    );
  });

  it('should prefix relative paths with the API base URL', () => {
    const result = resolveImageUrl('/static/results/img.jpg');
    expect(result).toMatch(/^https?:\/\/.+\/static\/results\/img\.jpg$/);
  });

  it('should handle paths without leading slash', () => {
    const result = resolveImageUrl('static/results/img.jpg');
    expect(result).toMatch(/^https?:\/\/.+\/static\/results\/img\.jpg$/);
  });
});
