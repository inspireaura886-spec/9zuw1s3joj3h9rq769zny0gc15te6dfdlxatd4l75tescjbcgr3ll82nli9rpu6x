// src/scenes/S09-StoppedDeadHang.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';
import { clamp } from '../kit/math';

/**
 * Scene 09 (18.13s - 21.22s | Frames 544 - 636, duration 93 frames)
 * Script: "Then it stopped dead, and hung there for twenty seconds."
 * Visual: The black triangle locks into an eerie dead stop suspended high above the ridge.
 * While the craft hangs motionless like a hole cut in the sky, dusk clouds drift past,
 * the agents' coats flutter in the desert wind, and a 20-SECOND radial hover chronometer sweeps 00s -> 20s.
 */
export const S09StoppedDeadHang: React.FC = () => {
  const frame = useCurrentFrame(); // 0..92
  const p = clamp(frame / 86, 0, 1);

  const hoverSeconds = Math.min(20, Math.floor(p * 20));
  const ringRadius = 350;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - p);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Clouds continue drifting past while the triangle is frozen dead in space */}
      <DuskSky frame={frame + 544} variant="dusk" cloudSpeed={1.8} horizonY={1220} />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* 20-Second Radial Chronometer Ring Around the Frozen Triangle */}
        <g transform="translate(540, 560)">
          <circle
            cx="0"
            cy="0"
            r={ringRadius}
            fill="none"
            stroke="#2B1E52"
            strokeWidth="10"
          />
          <circle
            cx="0"
            cy="0"
            r={ringRadius}
            fill="none"
            stroke={THEME.colors.textAmber}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90)"
            strokeLinecap="round"
          />

          {/* 20 Tick Marks Around Ring */}
          {Array.from({ length: 20 }, (_, i) => {
            const ang = (i * 18 - 90) * (Math.PI / 180);
            const x1 = Math.cos(ang) * (ringRadius - 22);
            const y1 = Math.sin(ang) * (ringRadius - 22);
            const x2 = Math.cos(ang) * (ringRadius + 22);
            const y2 = Math.sin(ang) * (ringRadius + 22);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i <= hoverSeconds ? THEME.colors.textAmber : '#47347A'}
                strokeWidth="4"
              />
            );
          })}
        </g>

        {/* Dead-Stopped Featureless Matte-Black Triangle */}
        <BlackTriangleCraft x={540} y={560} scale={1.18} rotateDeg={0} />

        {/* Hover Timer Badge Above Craft */}
        <g transform="translate(540, 145)">
          <rect
            x="-280"
            y="-48"
            width="560"
            height="96"
            fill="rgba(6, 5, 14, 0.9)"
            stroke={THEME.colors.textAmber}
            strokeWidth="4"
          />
          <text
            x="0"
            y="16"
            textAnchor="middle"
            fill={THEME.colors.textWhite}
            fontFamily={THEME.fonts.display}
            fontSize="48"
            fontWeight="bold"
            letterSpacing="4"
          >
            STOPPED DEAD // {hoverSeconds.toString().padStart(2, '0')} / 20 SEC
          </text>
        </g>
      </svg>

      <DesertRidge
        frame={frame + 544}
        ridgeY={1060}
        parallaxX={0}
        parallaxY={0}
        variant="ridge"
        windIntensity={1.3}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <AgentSilhouettes
          frame={frame + 544}
          pose="ridge-watch"
          leftAgentX={330}
          rightAgentX={740}
          groundY={1385}
          scale={0.96}
        />
      </svg>
    </div>
  );
};
