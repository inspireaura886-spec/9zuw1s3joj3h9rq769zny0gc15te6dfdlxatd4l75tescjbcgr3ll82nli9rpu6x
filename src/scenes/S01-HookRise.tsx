// src/scenes/S01-HookRise.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { easeOutCubic } from '../kit/math';

/**
 * Scene 01 (0.00s - 2.34s | Frames 0 - 69, duration 70 frames)
 * Script: "Two federal agents watched a black triangle rise over a ridge..."
 * ON-SCREEN TEXT (0.00s - 2.30s): "2 AGENTS. / ZERO SOUND." (rendered by GlobalFXAndTextLayer)
 * FRAME 0 RULE: The black triangle is ALREADY LARGE (scale 1.15) and rising over the ridge
 * with the two agent silhouettes in the foreground. No title card, no fade-in.
 */
export const S01HookRise: React.FC = () => {
  const frame = useCurrentFrame(); // 0..69
  const progress = easeOutCubic(frame / 69);

  // At frame === 0: triangleY = 690, triangleScale = 1.15, ridgeY = 1040, parallax = 0
  // Rises steadily from y=690 to y=565 over the 70 frames
  const triangleY = 690 - 125 * progress;
  const triangleScale = 1.15 + 0.08 * progress;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame} variant="dusk" cloudSpeed={1} horizonY={1220} />

      {/* Featureless matte-black triangle already large and rising over the ridge */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        <BlackTriangleCraft
          x={540}
          y={triangleY}
          scale={triangleScale}
          rotateDeg={0}
        />
      </svg>

      {/* Desert ridge and foreground ledge */}
      <DesertRidge
        frame={frame}
        ridgeY={1040}
        parallaxX={0}
        parallaxY={progress * 14}
        variant="ridge"
        windIntensity={1}
      />

      {/* Two federal agent silhouettes in foreground watching from behind */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <AgentSilhouettes
          frame={frame}
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
