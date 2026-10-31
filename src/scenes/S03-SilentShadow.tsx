// src/scenes/S03-SilentShadow.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';
import { easeInOutCubic } from '../kit/math';

/**
 * Scene 03 (4.22s - 5.91s | Frames 127 - 176, duration 50 frames)
 * Atmospheric tension beat between Hook line and 5.91s hilltop post line:
 * Low-angle shot as the giant matte-black triangle casts a hard purple-blue shadow cone
 * downward across the desert ridge and over the two motionless agents.
 */
export const S03SilentShadow: React.FC = () => {
  const frame = useCurrentFrame(); // 0..49
  const p = easeInOutCubic(frame / 49);

  const triangleY = 500 - 55 * p;
  const triangleScale = 1.38 + 0.1 * p;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 127} variant="eclipse" cloudSpeed={1.2} horizonY={1240} />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Hard purple-blue shadow curtain cast downward by the craft */}
        <polygon
          points={`100,${triangleY + 140} 980,${triangleY + 140} 1080,1920 0,1920`}
          fill="#090617"
          opacity={0.42 + 0.18 * p}
        />

        {/* Monolithic Matte-Black Triangle */}
        <BlackTriangleCraft
          x={540}
          y={triangleY}
          scale={triangleScale}
          rotateDeg={0}
        />

        {/* Subtle geometric shadow lines framing the void */}
        <line
          x1={540 - 320 * triangleScale}
          y1={triangleY + 135 * triangleScale}
          x2={40}
          y2={1420}
          stroke={THEME.colors.celRimPurple}
          strokeWidth="2.5"
          strokeDasharray="12 10"
          opacity="0.55"
        />
        <line
          x1={540 + 320 * triangleScale}
          y1={triangleY + 135 * triangleScale}
          x2={1040}
          y2={1420}
          stroke={THEME.colors.celRimPurple}
          strokeWidth="2.5"
          strokeDasharray="12 10"
          opacity="0.55"
        />
      </svg>

      <DesertRidge
        frame={frame + 127}
        ridgeY={1100}
        parallaxX={0}
        parallaxY={18 * p}
        variant="ridge"
        windIntensity={1.4}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <AgentSilhouettes
          frame={frame + 127}
          pose="ridge-watch"
          leftAgentX={310}
          rightAgentX={760}
          groundY={1395}
          scale={0.92}
        />
      </svg>
    </div>
  );
};
