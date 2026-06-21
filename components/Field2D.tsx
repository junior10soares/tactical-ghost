'use client';

import { useEffect, useRef } from 'react';

import { drawFieldLines, drawGrass, FIELD_HEIGHT, FIELD_WIDTH } from '@/lib/canvas';
import { placePlayers } from '@/lib/formations';
import type { Defender, Step, TeamRoster } from '@/types';

import PlayerToken from './PlayerToken';

interface Field2DProps {
  roster: TeamRoster;
  /** Passo atual da jogada analisada pela IA (se houver uma jogada em andamento). */
  activeStep?: Step;
  /** Defensores adversários do Modo Desafio (renderizados em vermelho, abaixo do time). */
  opponents?: Defender[];
}

export default function Field2D({ roster, activeStep, opponents }: Field2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const players = placePlayers(roster).map((player) =>
    activeStep && player.label === activeStep.playerMove.label
      ? { ...player, x: activeStep.playerMove.toX, y: activeStep.playerMove.toY }
      : player,
  );

  const ballPosition = activeStep
    ? { x: activeStep.ballMove.toX, y: activeStep.ballMove.toY }
    : { x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2 };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    drawGrass(ctx, FIELD_WIDTH, FIELD_HEIGHT);
    drawFieldLines(ctx, FIELD_WIDTH, FIELD_HEIGHT);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg"
      style={{ width: FIELD_WIDTH, height: FIELD_HEIGHT }}
    >
      <canvas ref={canvasRef} width={FIELD_WIDTH} height={FIELD_HEIGHT} className="absolute inset-0" />

      {opponents?.map((defender) => (
        <div
          key={defender.label}
          className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-red-600 bg-neutral-900 text-[10px] font-bold text-red-400"
          style={{ left: defender.x, top: defender.y }}
        >
          {defender.label}
        </div>
      ))}

      {players.map((player) => (
        <PlayerToken key={player.number} player={player} variant="team" />
      ))}

      <div
        className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-500"
        style={{ left: ballPosition.x, top: ballPosition.y }}
      />
    </div>
  );
}
