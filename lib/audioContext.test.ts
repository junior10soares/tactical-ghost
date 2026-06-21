import { describe, expect, it } from 'vitest';

import { computeStepOffsets, DEFAULT_STEP_DURATION_MS } from './audioContext';

describe('computeStepOffsets', () => {
  it('returns one offset per step, starting at zero', () => {
    expect(computeStepOffsets(3, 1000)).toEqual([0, 1000, 2000]);
  });

  it('uses the default step duration when none is given', () => {
    expect(computeStepOffsets(2)).toEqual([0, DEFAULT_STEP_DURATION_MS]);
  });

  it('returns an empty array for zero steps', () => {
    expect(computeStepOffsets(0)).toEqual([]);
  });
});
