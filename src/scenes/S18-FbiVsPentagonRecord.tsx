// src/scenes/S18-FbiVsPentagonRecord.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DuskSky } from '../kit/DuskSky';
import { BlackTriangleCraft } from '../kit/BlackTriangleCraft';
import { THEME } from '../theme';
import { easeOutCubic } from '../kit/math';

/**
 * Scene 18 (41.33s - 47.45s | Frames 1240 - 1423, duration 184 frames)
 * Script: "And the agents' own FBI statement says it lasted three seconds.
 *          The Pentagon's record: over thirty. So who's right..."
 * HIT at 44.09s (Global Frame 1323 -> local frame 83).
 * ON-SCREEN TEXT (44.09s - 47.40s): "FBI: 3 SEC / PENTAGON: 30+ SEC" (rendered by GlobalFXAndTextLayer at y=240).
 * Visual: Anime-noir split classified dossier comparison below the top text area:
 * - Left Card (appears at f=0): FBI STATEMENT // "3 SECONDS"
 * - Right Card (slams in at f=83 on the 44.09s HIT): PENTAGON RECORD // "30+ SECONDS" with pentagon emblem.
 */
export const S18FbiVsPentagonRecord: React.FC = () => {
  const frame = useCurrentFrame(); // 0..183
  const leftScale = easeOutCubic(Math.min(1, frame / 14));
  const showPentagon = frame >= 78; // Slams on the 44.09s HIT
  const rightScale = showPentagon
    ? easeOutCubic(Math.min(1, (frame - 78) / 12))
    : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <DuskSky frame={frame + 1240} variant="eclipse" cloudSpeed={1.4} horizonY={1260} />

      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Subtle Rotating Radar / Pentagon Grid in Background */}
        <g transform={`translate(540, 880) rotate(${frame * 0.25})`} opacity="0.22">
          <polygon
            points="0,-420 399,-130 247,340 -247,340 -399,-130"
            fill="none"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="4"
          />
          <polygon
            points="0,-280 266,-86 165,226 -165,226 -266,-86"
            fill="none"
            stroke={THEME.colors.hudCyan}
            strokeWidth="3"
          />
        </g>

        {/* Looming Matte-Black Triangle Behind the Two Dossiers */}
        <BlackTriangleCraft
          x={540}
          y={610 + Math.sin(frame * 0.08) * 12}
          scale={1.32}
          rotateDeg={0}
        />

        {/* LEFT DOSSIER CARD: AGENTS' FBI STATEMENT (3 SEC) */}
        <g
          transform={`translate(290, 980) scale(${leftScale})`}
        >
          <rect
            x="-220"
            y="-250"
            width="440"
            height="500"
            fill="rgba(8, 7, 20, 0.94)"
            stroke={THEME.colors.hudCyan}
            strokeWidth="5"
          />
          {/* Dossier Header */}
          <rect x="-190" y="-215" width="380" height="58" fill="#18264A" />
          <text
            x="0"
            y="-176"
            textAnchor="middle"
            fill={THEME.colors.hudCyan}
            fontFamily={THEME.fonts.mono}
            fontSize="28"
            fontWeight="bold"
            letterSpacing="2"
          >
            FBI STATEMENT
          </text>
          {/* Redacted Lines */}
          <rect x="-180" y="-125" width="320" height="16" fill="#2A234D" />
          <rect x="-180" y="-92" width="260" height="16" fill="#2A234D" />
          <rect x="-180" y="-59" width="350" height="16" fill="#2A234D" />

          {/* Big "3 SEC" Stamp */}
          <text
            x="0"
            y="75"
            textAnchor="middle"
            fill={THEME.colors.textWhite}
            fontFamily={THEME.fonts.display}
            fontSize="112"
            fontWeight="bold"
          >
            3 SEC
          </text>
          <text
            x="0"
            y="145"
            textAnchor="middle"
            fill={THEME.colors.hudCyan}
            fontFamily={THEME.fonts.mono}
            fontSize="26"
            fontWeight="bold"
          >
            DURATION: 00:03
          </text>
          {/* Progress Bar (Short 3s bar) */}
          <rect x="-180" y="185" width="360" height="24" fill="#1B1636" />
          <rect x="-180" y="185" width="36" height="24" fill={THEME.colors.hudCyan} />
        </g>

        {/* RIGHT DOSSIER CARD: PENTAGON RECORD (30+ SEC) */}
        {showPentagon && (
          <g transform={`translate(790, 980) scale(${rightScale})`}>
            <rect
              x="-220"
              y="-250"
              width="440"
              height="500"
              fill="rgba(16, 6, 22, 0.95)"
              stroke={THEME.colors.textCrimson}
              strokeWidth="5"
            />
            <rect x="-190" y="-215" width="380" height="58" fill="#4A1222" />
            <text
              x="0"
              y="-176"
              textAnchor="middle"
              fill={THEME.colors.textAmber}
              fontFamily={THEME.fonts.mono}
              fontSize="28"
              fontWeight="bold"
              letterSpacing="2"
            >
              PENTAGON RECORD
            </text>
            {/* Pentagon Vector Emblem */}
            <polygon
              points="0,-135 48,-100 30,-44 -30,-44 -48,-100"
              fill="none"
              stroke={THEME.colors.textCrimson}
              strokeWidth="4"
            />

            {/* Big "30+ SEC" Stamp */}
            <text
              x="0"
              y="75"
              textAnchor="middle"
              fill={THEME.colors.textCrimson}
              fontFamily={THEME.fonts.display}
              fontSize="102"
              fontWeight="bold"
            >
              30+ SEC
            </text>
            <text
              x="0"
              y="145"
              textAnchor="middle"
              fill={THEME.colors.textAmber}
              fontFamily={THEME.fonts.mono}
              fontSize="26"
              fontWeight="bold"
            >
              DURATION: 00:30+
            </text>
            {/* Full 30+s Bar */}
            <rect x="-180" y="185" width="360" height="24" fill="#1B1636" />
            <rect x="-180" y="185" width="360" height="24" fill={THEME.colors.textCrimson} />
          </g>
        )}

        {/* Question Prompt Banner at y=1325 ("SO WHO'S RIGHT?") */}
        {frame >= 135 && (
          <g transform="translate(540, 1335)">
            <rect
              x="-340"
              y="-46"
              width="680"
              height="92"
              fill="rgba(6, 5, 14, 0.94)"
              stroke={THEME.colors.textAmber}
              strokeWidth="4"
            />
            <text
              x="0"
              y="16"
              textAnchor="middle"
              fill={THEME.colors.textAmber}
              fontFamily={THEME.fonts.display}
              fontSize="52"
              fontWeight="bold"
              letterSpacing="5"
            >
              SO WHO IS RIGHT?
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
