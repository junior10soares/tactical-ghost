export type Position = 'gk' | 'def' | 'mid' | 'att';

export type FormationName = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1';

export type PlayType =
  | 'contra-ataque'
  | 'escanteio'
  | 'triangulação'
  | 'pressão-alta'
  | 'cruzamento'
  | 'jogada-ensaiada'
  | 'falta'
  | 'tiro-livre';

export type SfxType =
  | 'corrida_acelerada'
  | 'chute_seco'
  | 'passe_rasteiro'
  | 'cruzamento'
  | 'defesa_goleiro'
  | 'gol_torcida'
  | 'apito_juiz'
  | null;

export interface Player {
  name: string;
  fullName: string;
  number: number;
  position: Position;
  photoUrl: string;
  label: string;
}

export interface TeamRoster {
  team: string;
  formation: FormationName;
  color: string;
  players: Player[];
}

/** Jogador posicionado no campo (jogador do elenco + coordenadas da formação). */
export interface FieldPlayer extends Player {
  x: number;
  y: number;
}

export interface PlayerMove {
  role: Position;
  label: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface BallMove {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface Step {
  label: string;
  descricao: string;
  playerMove: PlayerMove;
  ballMove: BallMove;
  sfx: SfxType;
}

export interface AnalyzeResponse {
  resumo: string;
  tipo: PlayType;
  eficacia: number;
  desafioSuperado: boolean | null;
  steps: Step[];
  analise: string;
}

export interface Defender {
  label: string;
  x: number;
  y: number;
}

export interface ChallengeScenario {
  id: string;
  title: string;
  description: string;
  adversary: string;
  defenders: Defender[];
}
