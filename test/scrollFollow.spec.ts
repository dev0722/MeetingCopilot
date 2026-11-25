import { describe, expect, it } from 'vitest';
import { isNearScrollBottom } from '../shared/scrollFollow';

describe('live transcript scroll following', () => {
  it('keeps following near the bottom', () => {
    expect(isNearScrollBottom(1000, 510, 480)).toBe(true);
    expect(isNearScrollBottom(1000, 470, 480)).toBe(false);
  });

  it('handles content shorter than the viewport', () => {
    expect(isNearScrollBottom(300, 0, 400)).toBe(true);
  });
});
