import { describe, expect, it } from 'vitest';

import { FIELD_HEIGHT, FIELD_WIDTH, getPositionColor, RENDER_LAYERS, toCanvasCoords } from './canvas';

describe('toCanvasCoords', () => {
  it('maps logical field coordinates 1:1 when scale is 1', () => {
    expect(toCanvasCoords(330, 190)).toEqual({ cx: 330, cy: 190 });
  });

  it('applies the given scale factor', () => {
    expect(toCanvasCoords(330, 190, 2)).toEqual({ cx: 660, cy: 380 });
  });
});

describe('getPositionColor', () => {
  it('returns the documented color for each position', () => {
    expect(getPositionColor('gk')).toBe('#FF8C42');
    expect(getPositionColor('def')).toBe('#A0E0A0');
    expect(getPositionColor('mid')).toBe('#60AAFF');
    expect(getPositionColor('att')).toBe('#FFD700');
  });
});

describe('RENDER_LAYERS', () => {
  it('keeps the fixed render order documented in CLAUDE.md', () => {
    expect(RENDER_LAYERS).toEqual([
      'grass',
      'lines',
      'ball-trail',
      'movement-arrows',
      'opponent-players',
      'team-players',
      'ball',
    ]);
  });

  it('always renders the ball as the last layer', () => {
    expect(RENDER_LAYERS[RENDER_LAYERS.length - 1]).toBe('ball');
  });
});

describe('field dimensions', () => {
  it('matches the fixed logical field size from CLAUDE.md', () => {
    expect(FIELD_WIDTH).toBe(660);
    expect(FIELD_HEIGHT).toBe(380);
  });
});
