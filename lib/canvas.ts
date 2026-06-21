import type { Position } from '@/types';

export const FIELD_WIDTH = 660;
export const FIELD_HEIGHT = 380;

export const POSITION_COLORS: Record<Position, string> = {
  gk: '#FF8C42',
  def: '#A0E0A0',
  mid: '#60AAFF',
  att: '#FFD700',
};

export function getPositionColor(position: Position): string {
  return POSITION_COLORS[position];
}

/**
 * Ordem de renderização das camadas do campo 2D — não alterar, ver CLAUDE.md.
 * Mantida como constante para ser verificável em teste e para guiar a
 * ordem real de desenho em Field2D.
 */
export const RENDER_LAYERS = [
  'grass',
  'lines',
  'ball-trail',
  'movement-arrows',
  'opponent-players',
  'team-players',
  'ball',
] as const;

export type RenderLayer = (typeof RENDER_LAYERS)[number];

/** Mapeia uma coordenada lógica do campo (660x380) para pixels de canvas, aplicando escala. */
export function toCanvasCoords(x: number, y: number, scale = 1): { cx: number; cy: number } {
  return { cx: x * scale, cy: y * scale };
}

export function drawGrass(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const stripeCount = 10;
  const stripeHeight = height / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1B6B3A' : '#1A6334';
    ctx.fillRect(0, i * stripeHeight, width, stripeHeight);
  }
}

export function drawFieldLines(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;

  ctx.strokeRect(10, 10, width - 20, height - 20);

  ctx.beginPath();
  ctx.moveTo(10, height / 2);
  ctx.lineTo(width - 10, height / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 40, 0, Math.PI * 2);
  ctx.stroke();

  const areaWidth = 160;
  const areaHeight = 60;
  ctx.strokeRect(width / 2 - areaWidth / 2, 10, areaWidth, areaHeight);
  ctx.strokeRect(width / 2 - areaWidth / 2, height - 10 - areaHeight, areaWidth, areaHeight);
}
