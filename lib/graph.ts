import { Annotation, END, START, StateGraph } from '@langchain/langgraph';

import { savePlay } from './db';
import { analyzePlay } from './llm';
import type { AnalyzeResponse, ChallengeScenario, FieldPlayer, FormationName } from '@/types';

/**
 * Estado compartilhado do pipeline de uma jogada. Os nós `transcribe` e
 * `narrate` são adicionados nas fases seguintes do projeto; por ora o
 * grafo tem `analyze` -> `persist`.
 */
export const PlayState = Annotation.Root({
  playText: Annotation<string>(),
  team: Annotation<string>(),
  formation: Annotation<FormationName>(),
  currentPlayers: Annotation<FieldPlayer[]>(),
  challenge: Annotation<ChallengeScenario | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  analysis: Annotation<AnalyzeResponse | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
  playId: Annotation<number | undefined>({
    reducer: (_prev, next) => next,
    default: () => undefined,
  }),
});

export type PlayStateType = typeof PlayState.State;

const graph = new StateGraph(PlayState)
  .addNode('analyze', async (state) => {
    const analysis = await analyzePlay(state.playText, state.formation, state.currentPlayers, state.challenge);
    return { analysis };
  })
  .addNode('persist', async (state) => {
    if (!state.analysis) return {};
    try {
      const playId = await savePlay({
        team: state.team,
        formation: state.formation,
        inputText: state.playText,
        analysis: state.analysis,
      });
      return { playId };
    } catch (error) {
      // Falha ao persistir não deve impedir a jogada já analisada de chegar ao usuário.
      console.error('Falha ao persistir jogada:', error);
      return {};
    }
  })
  .addEdge(START, 'analyze')
  .addEdge('analyze', 'persist')
  .addEdge('persist', END);

export const playGraph = graph.compile();
