// src/scenes/S05-ThirdAgentScopeCall.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { DesertRidge } from '../kit/DesertRidge';
import { AgentSilhouettes } from '../kit/AgentSilhouettes';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { THEME } from '../theme';
import { easeOutCubic } from '../kit/math';

/**
 * Scene 05 (10.16s - 12.48s | Frames 305 - 373, duration 69 frames)
 * Script: "A third agent's thermal scope called it in."
 * Rule: 5.91 to 13.64 includes a green thermal-scope view.
 * Visual: Anime-noir split composition:
 * - Upper panel (y: 120..820): Live Green Thermal Scope feed locking onto the rising black triangle.
 * - Lower panel (y: 840..1420): Third agent silhouette on the hilltop post holding the glowing green thermal
 *   monocular and transmitting concentric radio call-in waves.
 */
export const S05ThirdAgentScopeCall: React.FC = () => {
  const frame = useCurrentFrame(); // 0..68
  const p = easeOutCubic(frame / 68);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 305} variant="dusk" cloudSpeed={1.2} horizonY={1260} />

      <DesertRidge
        frame={frame + 305}
        ridgeY={1140}
        parallaxX={-18 * p}
        parallaxY={0}
        variant="ridge"
        windIntensity={1.3}
      />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Upper Green Thermal Scope Picture-in-Picture Feed (y: 120..810) */}
        <g transform="translate(80, 120)">
          <rect
            x="0"
            y="0"
            width="920"
            height="680"
            fill={THEME.colors.thermalBgDark}
            stroke={THEME.colors.thermalBright}
            strokeWidth="6"
          />
          {/* Thermal Grid inside Viewport */}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 100}
              x2="920"
              y2={i * 100}
              stroke={THEME.colors.thermalGrid}
              strokeWidth="1.5"
              opacity="0.45"
            />
          ))}

          {/* Thermal Ridge inside Scope */}
          <polygon
            points="0,520 240,450 560,480 920,430 920,680 0,680"
            fill="#0A381C"
            stroke={THEME.colors.thermalBright}
            strokeWidth="3"
          />

          {/* Black Triangle Target Rising inside Thermal Scope */}
          <BlackTriangleCraft
            x={460}
            y={340 - 45 * p}
            scale={0.92 + 0.1 * p}
            variant="thermal"
          />

          {/* Green Reticle Box Locking Onto Craft */}
          <rect
            x="140"
            y={170 - 45 * p}
            width="640"
            height="310"
            fill="none"
            stroke={THEME.colors.thermalWhiteHot}
            strokeWidth="3.5"
            strokeDasharray="22 10"
          />
          <text
            x="30"
            y="52"
            fill={THEME.colors.thermalWhiteHot}
            fontFamily={THEME.fonts.mono}
            fontSize="28"
            fontWeight="bold"
            letterSpacing="3"
          >
            AGENT 03 // THERMAL OPTIC FEED
          </text>
          <text
            x="890"
            y="52"
            textAnchor="end"
            fill={THEME.colors.thermalBright}
            fontFamily={THEME.fonts.mono}
            fontSize="28"
            fontWeight="bold"
          >
            [RADIO TX ACTIVE]
          </text>
        </g>

        {/* Diagonal Anime Slash Divider */}
        <line
          x1="40"
          y1="825"
          x2="1040"
          y2="805"
            stroke={THEME.colors.thermalBright}
          strokeWidth="6"
        />

        {/* Lower Frame: Third Agent Silhouette with Thermal Scope & Radio Transmission Waves */}
        <AgentSilhouettes
          frame={frame + 305}
          pose="third-agent-scope"
          leftAgentX={340}
          groundY={1410}
          scale={1.32}
        />

        {/* Concentric Radio Call-In Pulse Waves Emitting from Agent's Comms */}
        {[0, 1, 2].map((ringIdx) => {
          const rProg = ((frame * 2.2 + ringIdx * 24) % 72) / 72;
          const radius = 40 + rProg * 260;
          const op = (1 - rProg) * 0.85;
          return (
            <circle
              key={ringIdx}
              cx={540}
              cy={1020}
              r={radius}
              fill="none"
              stroke={THEME.colors.thermalBright}
              strokeWidth="4"
              strokeDasharray="16 12"
              opacity={op}
            />
          );
        })}

        {/* Audio Call-In Waveform Badge */}
        <g transform="translate(560, 1080)">
          <rect
            x="0"
            y="0"
            width="420"
            height="96"
            fill="rgba(6, 5, 14, 0.9)"
            stroke={THEME.colors.thermalBright}
            strokeWidth="3.5"
          />
          <text
            x="24"
            y="38"
            fill={THEME.colors.thermalWhiteHot}
            fontFamily={THEME.fonts.mono}
            fontSize="24"
            fontWeight="bold"
            letterSpacing="2"
          >
            COMMS CH-1 // CALLING IN
          </text>
          {/* Animated Voice Bars */}
          {Array.from({ length: 16 }, (_, b) => {
            const bh = 10 + Math.abs(Math.sin(frame * 0.35 + b * 0.7)) * 28;
            return (
              <rect
                key={b}
                x={28 + b * 23}
                y={78 - bh}
                width="14"
                height={bh}
                fill={THEME.colors.thermalBright}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};
