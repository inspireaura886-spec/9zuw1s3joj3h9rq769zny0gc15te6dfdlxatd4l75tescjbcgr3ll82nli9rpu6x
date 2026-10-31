// src/kit/BlackTriangleCraft.tsx
import React from 'react';
import { THEME } from '../theme';

export interface BlackTriangleCraftProps {
  x?: number;
  y?: number;
  scale?: number;
  rotateDeg?: number;
  bankSkewX?: number;
  variant?: 'default' | 'thermal' | 'blueprint';
  showAfterimage?: boolean;
  afterimageOffset?: { dx: number; dy: number };
}

/**
 * The craft: a featureless matte-black triangle, NO lights on it.
 * Rendered as an ultra-clean monolithic matte-black delta/equilateral wedge
 * that drinks in all light against the dusk sky, with zero running lights,
 * zero windows, and zero thrusters.
 */
export const BlackTriangleCraft: React.FC<BlackTriangleCraftProps> = ({
  x = 540,
  y = 560,
  scale = 1,
  rotateDeg = 0,
  bankSkewX = 0,
  variant = 'default',
  showAfterimage = false,
  afterimageOffset = { dx: -90, dy: 0 },
}) => {
  // Base triangle geometry centered at (0, 0)
  // Wide menacing delta-triangle silhouette (width 620, height 310 at scale 1)
  const pts = '0,-165 320,135 0,92 -320,135';
  const underBevelPts = '0,92 320,135 0,148 -320,135';

  const isThermal = variant === 'thermal';
  const isBlueprint = variant === 'blueprint';

  const fillMain = isThermal
    ? THEME.colors.thermalColdTriangle
    : isBlueprint
    ? '#06050D'
    : THEME.colors.triangleMatte;

  const strokeColor = isThermal
    ? THEME.colors.thermalBright
    : isBlueprint
    ? THEME.colors.hudCyan
    : '#1C1538';

  const strokeW = isThermal ? 3.5 : isBlueprint ? 3 : 2;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotateDeg}) scale(${scale}) skewX(${bankSkewX})`}
    >
      {/* Optional high-speed motion afterimage (for sideways jet shot & canyon dive) */}
      {showAfterimage && (
        <>
          <polygon
            points={pts}
            transform={`translate(${afterimageOffset.dx * 1.7}, ${afterimageOffset.dy * 1.7}) scale(0.94)`}
            fill={isThermal ? THEME.colors.thermalBright : THEME.colors.celRimPurple}
            opacity="0.18"
          />
          <polygon
            points={pts}
            transform={`translate(${afterimageOffset.dx}, ${afterimageOffset.dy}) scale(0.97)`}
            fill={fillMain}
            stroke={strokeColor}
            strokeWidth={strokeW}
            opacity="0.45"
          />
        </>
      )}

      {/* Subtle atmospheric distortion halo behind the craft (NOT a light on the craft, just sky contrast) */}
      {!isThermal && (
        <polygon
          points="0,-172 332,140 0,154 -332,140"
          fill="#000000"
          opacity="0.28"
        />
      )}

      {/* Main Featureless Matte-Black Hull (Strictly NO lights, NO seams, NO glow on body) */}
      <polygon
        points={pts}
        fill={fillMain}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinejoin="miter"
      />

      {/* Minimalist solid underside thickness plane in pure shadow */}
      <polygon
        points={underBevelPts}
        fill={isThermal ? '#000000' : '#010103'}
      />
    </g>
  );
};
