import { describe, expect, it } from 'vitest';
import { latestNewTurnId, scrollTopForTurn } from '../shared/answerScroll';

describe('answer session scrolling', () => {
  it('selects only a turn that appeared after the known snapshot', () => {
    const turns = [{ id: 'old' }, { id: 'new-1' }, { id: 'new-2' }];
    expect(latestNewTurnId(turns, new Set(['old']))).toBe('new-2');
    expect(latestNewTurnId(turns, new Set(['old', 'new-1', 'new-2']))).toBeUndefined();
  });

  it('targets the turn top rather than the container bottom', () => {
    expect(scrollTopForTurn(120, 40, 260)).toBe(340);
    expect(scrollTopForTurn(0, 40, 10)).toBe(0);
  });
});
