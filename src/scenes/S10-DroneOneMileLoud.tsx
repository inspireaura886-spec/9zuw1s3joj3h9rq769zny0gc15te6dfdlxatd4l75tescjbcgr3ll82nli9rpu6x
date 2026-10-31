// src/scenes/S10-DroneOneMileLoud.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { THEME } from '../theme';

/**
 * Scene 10 (21.22s - 23.86s | Frames 637 - 715, duration 79 frames)
 * HIT at 21.22s (Frame 637).
 * ON-SCREEN TEXT (21.22s - 23.80s): "A DRONE 1 MILE AWAY / WOULD BE LOUD." (rendered by GlobalFXAndTextLayer at y=240)
 * Script: "But on that hilltop, they said, even a small drone a mile away would be loud."
 * Visual: Long-range canyon diagram showing a small quadcopter drone 1.0 MILE away on the right
 * with spinning rotors and loud crimson-amber concentric acoustic shockwaves echoing all the way
 * to the two agents on the hilltop post on the left.
 */
export const S10DroneOneMileLoud: React.FC = () => {
  const frame = useCurrentFrame(); // 0..78
  const droneHoverY = 740 + Math.sin(frame * 0.25) * 14;
  const rotorSpin = Math.sin(frame * 1.4) * 32;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 637} variant="dusk" cloudSpeed={1.2} horizonY={1220} />

      <DesertRidge
        frame={frame + 637}
        ridgeY={1080}
        parallaxX={-20}
        parallaxY={0}
        variant="ridge"
        windIntensity={1.1}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* 1.0 MILE Distance Rangefinder Line Across the Desert Canyon */}
        <g transform="translate(0, 960)">
          <line
            x1="210"
            y1="0"
            x2="860"
            y2="-210"
            stroke={THEME.colors.hudCyan}
            strokeWidth="4"
            strokeDasharray="18 10"
          />
          <rect
            x="380"
            y="-165"
            width="320"
            height="68"
            fill="rgba(6, 5, 14, 0.9)"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3"
          />
          <text
            x="540"
            y="-120"
            textAnchor="middle"
            fill={THEME.colors.hudCyan}
            fontFamily={THEME.fonts.mono}
            fontSize="30"
            fontWeight="bold"
            letterSpacing="3"
          >
            &lt;--- 1.0 MILE ---&gt;
          </text>
        </g>

        {/* Loud Pulsing Acoustic Sound Waves Radiating From the Distant Drone */}
        {[0, 1, 2, 3].map((wIdx) => {
          const prog = ((frame * 2.4 + wIdx * 25) % 100) / 100;
          const r = 45 + prog * 540;
          const op = (1 - prog) * 0.85;
          return (
            <circle
              key={wIdx}
              cx={860}
              cy={droneHoverY}
              r={r}
              fill="none"
              stroke={wIdx % 2 === 0 ? THEME.colors.textCrimson : THEME.colors.textAmber}
              strokeWidth="5"
              strokeDasharray="24 14"
              opacity={op}
            />
          );
        })}

        {/* Small Quadcopter Drone Silhouette + Callout Circle at (860, droneHoverY) */}
        <g transform={`translate(860, ${droneHoverY})`}>
          <circle
            cx="0"
            cy="0"
            r="96"
            fill="rgba(255, 59, 78, 0.14)"
            stroke={THEME.colors.textCrimson}
            strokeWidth="4"
          />
          {/* Drone Frame & Spinning Rotors */}
          <line x1="-54" y1="-16" x2="54" y2="-16" stroke={THEME.colors.textWhite} strokeWidth="6" />
          <polygon points="-24,-16 24,-16 16,12 -16,12" fill={THEME.colors.silhouetteBlack} stroke={THEME.colors.textWhite} strokeWidth="3" />
          {/* Left & Right Spinning Rotor Blur */}
          <ellipse cx="-54" cy="-24" rx={Math.abs(rotorSpin) + 12} ry="6" fill={THEME.colors.textAmber} />
          <ellipse cx="54" cy="-24" rx={Math.abs(rotorSpin) + 12} ry="6" fill={THEME.colors.textAmber} />

          <text
            x="0"
            y="138"
            textAnchor="middle"
            fill={THEME.colors.textCrimson}
            fontFamily={THEME.fonts.mono}
            fontSize="26"
            fontWeight="bold"
          >
            SMALL DRONE: 78 dB [LOUD]
          </text>
        </g>

        {/* Two Agents on Hilltop Post on Left */}
        <AgentSilhouettes
          frame={frame + 637}
          pose="ridge-watch"
          leftAgentX={180}
          rightAgentX={330}
          groundY={1380}
          scale={0.78}
        />
      </svg>
    </div>
  );
};
