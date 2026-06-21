import { describe, expect, it } from 'vitest';

import { FORMATIONS, placePlayers } from './formations';
import type { TeamRoster } from '@/types';

describe('FORMATIONS', () => {
  it('defines exactly 11 slots for every formation', () => {
    for (const slots of Object.values(FORMATIONS)) {
      expect(slots).toHaveLength(11);
    }
  });

  it('has exactly one goalkeeper slot per formation', () => {
    for (const slots of Object.values(FORMATIONS)) {
      expect(slots.filter((slot) => slot.position === 'gk')).toHaveLength(1);
    }
  });
});

function buildRoster(formation: TeamRoster['formation']): TeamRoster {
  return {
    team: 'teste',
    formation,
    color: '#000000',
    players: [
      { name: 'Goleiro', fullName: 'Goleiro Teste', number: 1, position: 'gk', photoUrl: 'https://example.com/1.jpg', label: 'GK' },
      { name: 'Zagueiro', fullName: 'Zagueiro Teste', number: 2, position: 'def', photoUrl: 'https://example.com/2.jpg', label: 'D1' },
      { name: 'Meia', fullName: 'Meia Teste', number: 3, position: 'mid', photoUrl: 'https://example.com/3.jpg', label: 'M1' },
      { name: 'Atacante', fullName: 'Atacante Teste', number: 4, position: 'att', photoUrl: 'https://example.com/4.jpg', label: 'A1' },
    ],
  };
}

describe('placePlayers', () => {
  it('assigns field coordinates matching the formation slot for each position', () => {
    const roster = buildRoster('4-3-3');
    const placed = placePlayers(roster);

    expect(placed).toHaveLength(4);

    const gk = placed.find((p) => p.position === 'gk')!;
    expect(gk.x).toBe(330);
    expect(gk.y).toBe(340);
  });

  it('keeps players within the logical field bounds (660x380)', () => {
    const roster = buildRoster('4-2-3-1');
    const placed = placePlayers(roster);

    for (const player of placed) {
      expect(player.x).toBeGreaterThanOrEqual(0);
      expect(player.x).toBeLessThanOrEqual(660);
      expect(player.y).toBeGreaterThanOrEqual(0);
      expect(player.y).toBeLessThanOrEqual(380);
    }
  });

  it('drops players beyond the available slots for their position instead of crashing', () => {
    const roster = buildRoster('4-3-3');
    // 4-3-3 só tem 1 slot de "gk" — um segundo goleiro excede a capacidade do grupo.
    roster.players.push({
      name: 'Goleiro Reserva',
      fullName: 'Goleiro Reserva Teste',
      number: 12,
      position: 'gk',
      photoUrl: 'https://example.com/5.jpg',
      label: 'GK2',
    });

    const placed = placePlayers(roster);
    expect(placed.find((p) => p.photoUrl === 'https://example.com/5.jpg')).toBeUndefined();
  });
});
