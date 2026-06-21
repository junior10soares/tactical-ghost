import type { ChallengeScenario } from '@/types';

import francaRetranca from '@/data/challenges/franca-retranca.json';
import mexicoBlocoBaixo from '@/data/challenges/mexico-bloco-baixo.json';

export const CHALLENGES: ChallengeScenario[] = [
  francaRetranca as ChallengeScenario,
  mexicoBlocoBaixo as ChallengeScenario,
];

export function getChallenge(id: string): ChallengeScenario | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}

export function listChallenges(): ChallengeScenario[] {
  return CHALLENGES;
}
