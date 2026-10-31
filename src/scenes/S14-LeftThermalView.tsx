// src/scenes/S14-LeftThermalView.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ThermalScopeOverlay } from '../kit/ThermalScopeOverlay';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { SpeedLines } from '../kit/SpeedLines';
import { THEME } from '../theme';
import { easeOutCubic } from '../kit/math';

/**
 * Scene 14 (31.76s - 34.20s | Frames 953 - 1025, duration 73 frames)
 * Script: "So fast it left the thermal scope's view."
 * Visual: Green thermal-scope view desperately panning to keep up as the pitch-black triangle
 * streaks right out of the circular optic boundary before frame 28, triggering flashing red
 * "FOV EXCEEDED // LOST" alerts inside the thermal scope.
 */
export const S14LeftThermalView: React.FC = () => {
  const frame = useCurrentFrame(); // 0..72
  const exitProgress = easeOutCubic(Math.min(1, frame / 26));

  // Triangle streaks from center (540, 620) completely out of frame (1380, 980) by frame 26
  const craftX = 520 + exitProgress * 860;
  const craftY = 600 + exitProgress * 360;
  const targetLost = frame >= 24;

  // Scope reticle lags behind the hyper-fast target
  const reticleX = Math.min(780, 520 + easeOutCubic(frame / 50) * 280);
  const reticleY = Math.min(820, 600 + easeOutCubic(frame / 50) * 200);

  return (
    <ThermalScopeOverlay
      frame={frame + 953}
      timecodeText="YEAR: 2026 // 20:23:39 PM"
      statusText={targetLost ? 'TRACKING FAILURE // TARGET LOST' : 'SLEW RATE EXCEEDED'}
      zoomText="FLIR 4.0X SLEW"
      targetLocked={!targetLost}
      targetLost={targetLost}
      reticleX={reticleX}
      reticleY={reticleY}
    >
      <SpeedLines
        frame={frame * 2}
        direction="horizontal"
        intensity={targetLost ? 0.45 : 1.1}
        color={THEME.colors.thermalBright}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Thermal Canyon Rim in Background */}
        <polygon
          points="-120,980 280,860 640,940 1080,820 1080,1440 -120,1440"
          fill="#072814"
          stroke={THEME.colors.thermalBright}
          strokeWidth="3"
        />

        {/* Pitch-Black Triangle Blurring Out of the Scope FOV */}
        <BlackTriangleCraft
          x={craftX}
          y={craftY}
          scale={1.08}
          rotateDeg={22}
          bankSkewX={-18}
          variant="thermal"
          showAfterimage={true}
          afterimageOffset={{ dx: -160, dy: -65 }}
        />
      </svg>
    </ThermalScopeOverlay>
  );
};
