import { describe, expect, it } from 'vitest';

import { CHALLENGES, getChallenge, listChallenges } from './challenges';

describe('CHALLENGES data', () => {
  it('has at least one predefined scenario', () => {
    expect(CHALLENGES.length).toBeGreaterThan(0);
  });

  it('keeps every defender within the logical field bounds (660x380)', () => {
    for (const challenge of CHALLENGES) {
      for (const defender of challenge.defenders) {
        expect(defender.x).toBeGreaterThanOrEqual(0);
        expect(defender.x).toBeLessThanOrEqual(660);
        expect(defender.y).toBeGreaterThanOrEqual(0);
        expect(defender.y).toBeLessThanOrEqual(380);
      }
    }
  });
});

describe('getChallenge', () => {
  it('finds a challenge by id', () => {
    const challenge = getChallenge('franca-retranca');
    expect(challenge?.title).toBe('Retranca da França');
  });

  it('returns undefined for an unknown id', () => {
    expect(getChallenge('inexistente')).toBeUndefined();
  });
});

describe('listChallenges', () => {
  it('returns the same scenarios as CHALLENGES', () => {
    expect(listChallenges()).toEqual(CHALLENGES);
  });
});
