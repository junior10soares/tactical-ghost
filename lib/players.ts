import type { TeamRoster } from '@/types';

import brazil from '@/data/players/brazil.json';

export const ROSTERS: Record<string, TeamRoster> = {
  brasil: brazil as TeamRoster,
};

export function getRoster(team: string): TeamRoster | undefined {
  return ROSTERS[team];
}
