// src/scenes/S19-LoopPullbackToFrameZero.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';
import { easeInOutCubic, lerp } from '../kit/math';

/**
 * Scene 19 (47.45s - 51.00s | Frames 1424 - 1529, duration 106 frames)
 * Script: "...the Pentagon, or the two federal agents?"
 * ENDING RULE (47.45 to 51.0): Pull back to EXACLY the frame-0 framing so the video loops
 * seamlessly into its start.
 *
 * Exact Frame-0 Target State (from S01HookRise at frame === 0):
 * - DuskSky with frame === 0 (cloud drift & dust motes converge to frame 0 positions)
 * - BlackTriangleCraft at x=540, y=690, scale=1.15, rotateDeg=0
 * - DesertRidge at ridgeY=1040, parallaxX=0, parallaxY=0, variant='ridge', windIntensity=1 (with frame === 0)
 * - AgentSilhouettes with frame === 0, pose='ridge-watch', leftAgentX=330, rightAgentX=740, groundY=1380, scale=1
 * - Camera pullback scale from 1.48x (tight on the triangle & Pentagon question) smoothly down to 1.00x at the final frame.
 */
export const S19LoopPullbackToFrameZero: React.FC = () => {
  const frame = useCurrentFrame(); // 0..105 (106 frames total)
  const p = easeInOutCubic(frame / 105);

  // Pull back camera from close-in (scale 1.46, y-offset +190) to exact 1.00, 0, 0 at p === 1
  const pullbackScale = lerp(1.46, 1.0, p);
  const pullbackY = lerp(190, 0, p);

  // Craft settles smoothly into exact Frame-0 position (y = 690, scale = 1.15)
  const triangleY = lerp(550, 690, p);
  const triangleScale = lerp(1.28, 1.15, p);

  // Synthetic frame counter that smoothly winds to 0 at the end of Scene 19 so wind sway & clouds match Frame 0
  const loopSyncFrame = (1 - p) * 40;

  // Fade out the "PENTAGON OR THE 2 AGENTS?" graphic before the final 18 frames so Frame 1529 == Frame 0
  const hudOpacity = frame < 70 ? 1 - frame / 70 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        transformOrigin: '540px 620px',
        transform: `translate(0px, ${pullbackY.toFixed(2)}px) scale(${pullbackScale.toFixed(4)})`,
      }}
    >
      <DuskSky frame={loopSyncFrame} variant="dusk" cloudSpeed={1} horizonY={1220} />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Fading Pentagon Geometric Outline in Upper Sky during early pullback */}
        {hudOpacity > 0.01 && (
          <g transform="translate(540, 310)" opacity={hudOpacity * 0.65}>
            <polygon
              points="0,-110 105,-34 65,89 -65,89 -105,-34"
              fill="none"
              stroke={THEME.colors.textCrimson}
              strokeWidth="4"
            />
            <text
              x="0"
              y="145"
              textAnchor="middle"
              fill={THEME.colors.textWhite}
              fontFamily={THEME.fonts.mono}
              fontSize="28"
              fontWeight="bold"
              letterSpacing="3"
            >
              PENTAGON vs. 2 FEDERAL AGENTS
            </text>
          </g>
        )}

        {/* Featureless Matte-Black Triangle converging to exact Frame-0 coordinates (x=540, y=690, scale=1.15) */}
        <BlackTriangleCraft
          x={540}
          y={triangleY}
          scale={triangleScale}
          rotateDeg={0}
        />
      </svg>

      {/* Desert Ridge converging to exact Frame-0 coordinates */}
      <DesertRidge
        frame={loopSyncFrame}
        ridgeY={1040}
        parallaxX={0}
        parallaxY={0}
        variant="ridge"
        windIntensity={1}
      />

      {/* Two Federal Agent Silhouettes converging to exact Frame-0 pose */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <AgentSilhouettes
          frame={loopSyncFrame}
          pose="ridge-watch"
          leftAgentX={330}
          rightAgentX={740}
          groundY={1380}
          scale={1}
        />
      </svg>
    </div>
  );
};
