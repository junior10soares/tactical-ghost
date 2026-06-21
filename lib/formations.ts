import type { FieldPlayer, FormationName, Player, Position, TeamRoster } from '@/types';

export interface FormationSlot {
  position: Position;
  x: number;
  y: number;
}

/**
 * Coordenadas fixas por formação, no plano lógico do campo (660x380).
 * Goleiro em y=340, ataque em y≈50-80 (gol adversário no topo, y=20).
 * A ordem dos slots de cada posição deve casar com a ordem dos jogadores
 * daquela posição no JSON do elenco (data/players/*.json).
 */
export const FORMATIONS: Record<FormationName, FormationSlot[]> = {
  '4-3-3': [
    { position: 'gk', x: 330, y: 340 },
    { position: 'def', x: 130, y: 290 },
    { position: 'def', x: 280, y: 290 },
    { position: 'def', x: 380, y: 290 },
    { position: 'def', x: 530, y: 290 },
    { position: 'mid', x: 230, y: 190 },
    { position: 'mid', x: 330, y: 190 },
    { position: 'mid', x: 430, y: 190 },
    { position: 'att', x: 180, y: 70 },
    { position: 'att', x: 330, y: 70 },
    { position: 'att', x: 480, y: 70 },
  ],
  '4-4-2': [
    { position: 'gk', x: 330, y: 340 },
    { position: 'def', x: 130, y: 290 },
    { position: 'def', x: 280, y: 290 },
    { position: 'def', x: 380, y: 290 },
    { position: 'def', x: 530, y: 290 },
    { position: 'mid', x: 110, y: 190 },
    { position: 'mid', x: 260, y: 190 },
    { position: 'mid', x: 400, y: 190 },
    { position: 'mid', x: 550, y: 190 },
    { position: 'att', x: 260, y: 70 },
    { position: 'att', x: 400, y: 70 },
  ],
  '3-5-2': [
    { position: 'gk', x: 330, y: 340 },
    { position: 'def', x: 200, y: 290 },
    { position: 'def', x: 330, y: 290 },
    { position: 'def', x: 460, y: 290 },
    { position: 'mid', x: 100, y: 190 },
    { position: 'mid', x: 220, y: 190 },
    { position: 'mid', x: 330, y: 190 },
    { position: 'mid', x: 440, y: 190 },
    { position: 'mid', x: 560, y: 190 },
    { position: 'att', x: 260, y: 70 },
    { position: 'att', x: 400, y: 70 },
  ],
  '4-2-3-1': [
    { position: 'gk', x: 330, y: 340 },
    { position: 'def', x: 130, y: 290 },
    { position: 'def', x: 280, y: 290 },
    { position: 'def', x: 380, y: 290 },
    { position: 'def', x: 530, y: 290 },
    { position: 'mid', x: 260, y: 230 },
    { position: 'mid', x: 400, y: 230 },
    { position: 'mid', x: 180, y: 150 },
    { position: 'mid', x: 330, y: 150 },
    { position: 'mid', x: 480, y: 150 },
    { position: 'att', x: 330, y: 70 },
  ],
};

/**
 * Posiciona o elenco de um time no campo, casando cada jogador (na ordem
 * em que aparece no JSON, agrupado por posição) com o slot correspondente
 * da formação.
 */
export function placePlayers(roster: TeamRoster): FieldPlayer[] {
  const slots = FORMATIONS[roster.formation];
  const groupedSlots: Record<Position, FormationSlot[]> = { gk: [], def: [], mid: [], att: [] };
  for (const slot of slots) {
    groupedSlots[slot.position].push(slot);
  }

  const slotIndexByPosition: Record<Position, number> = { gk: 0, def: 0, mid: 0, att: 0 };

  return roster.players.reduce<FieldPlayer[]>((placed, player: Player) => {
    const positionSlots = groupedSlots[player.position];
    const index = slotIndexByPosition[player.position]++;
    const slot = positionSlots[index];
    if (!slot) return placed;
    placed.push({ ...player, x: slot.x, y: slot.y });
    return placed;
  }, []);
}
