'use client';

import { useState } from 'react';
import Image from 'next/image';

import { getPositionColor } from '@/lib/canvas';
import type { FieldPlayer } from '@/types';

interface PlayerTokenProps {
  player: FieldPlayer;
  variant?: 'team' | 'opponent';
}

const TOKEN_SIZE = 34;

export default function PlayerToken({ player, variant = 'team' }: PlayerTokenProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const borderColor = variant === 'opponent' ? '#E63946' : getPositionColor(player.position);

  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-all duration-500"
      style={{ left: player.x, top: player.y }}
    >
      <div
        className="flex items-center justify-center overflow-hidden rounded-full bg-neutral-800"
        style={{ width: TOKEN_SIZE, height: TOKEN_SIZE, border: `2px solid ${borderColor}` }}
      >
        {photoFailed ? (
          <span className="text-xs font-bold text-white">{player.name.charAt(0)}</span>
        ) : (
          <Image
            src={player.photoUrl}
            alt={player.name}
            width={TOKEN_SIZE}
            height={TOKEN_SIZE}
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center 15%', transform: 'scale(1.8)', transformOrigin: 'center 15%' }}
            onError={() => setPhotoFailed(true)}
            unoptimized
          />
        )}
      </div>
      <span className="whitespace-nowrap rounded bg-black/60 px-1 text-[10px] leading-tight text-white">
        {player.name}
      </span>
    </div>
  );
}
