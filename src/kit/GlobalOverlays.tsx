// src/kit/GlobalOverlays.tsx
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { HIT_FRAMES, ON_SCREEN_TEXTS } from '../timing';
import { THEME } from '../theme';
import { easeOutCubic, hash01 } from './math';

/**
 * Global Camera Drift + Hit Shake wrapper:
 * - Subtle camera drift in EVERY shot, engineered so that at frame === 0 and frame === 1530
 *   all drift offsets evaluate to 0.0 (preserving 100% seamless loop between Frame 1529 and Frame 0).
 * - Hard flash + shake on all 7 HITS: 13.64s, 17.37s, 21.22s, 27.34s, 31.14s, 37.77s, 44.09s.
 */
export const CameraAndHitWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const globalFrame = useCurrentFrame();

  // Exact full-cycle harmonic frequencies so f=0 and f=1530 have identical phase = 0
  // 2 * PI * k / 1530
  const omega1 = (2 * Math.PI * 9) / 1530; // ~5.6s period
  const omega2 = (2 * Math.PI * 15) / 1530; // ~3.4s period

  // Subtle camera drift in every shot (0 at frame 0 and frame 1530)
  let dx = Math.sin(globalFrame * omega1) * 11;
  let dy = Math.sin(globalFrame * omega2) * 8;
  let rot = Math.sin(globalFrame * omega1) * 0.42;
  let scale = 1.035 + (1 - Math.cos(globalFrame * omega1)) * 0.012;

  // Check if within a HIT impact window (12 frames duration)
  for (const hitFrame of HIT_FRAMES) {
    const df = globalFrame - hitFrame;
    if (df >= 0 && df <= 12) {
      const decay = Math.exp(-df / 3.5);
      const sx = (Math.sin(df * 3.1) + Math.cos(df * 5.7)) * 22 * decay;
      const sy = (Math.cos(df * 2.9) - Math.sin(df * 4.9)) * 18 * decay;
      const srot = Math.sin(df * 4.2) * 2.1 * decay;
      dx += sx;
      dy += sy;
      rot += srot;
      scale += 0.045 * decay;
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: 1080,
        height: 1920,
        transformOrigin: '540px 960px',
        transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${scale.toFixed(4)}) rotate(${rot.toFixed(3)}deg)`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Film Grain + Hit Flash + On-Screen Text Layer:
 * - Animated anime-noir film grain scratches/specks across the entire frame.
 * - High-impact white/purple-amber anime impact flash + shockwave frame on HITS.
 * - Big, bold, high-contrast ON-SCREEN TEXT at top/upper-middle of frame for the 3 specified windows.
 */
export const GlobalFXAndTextLayer: React.FC = () => {
  const globalFrame = useCurrentFrame();

  // Compute Hit Flash intensity
  let flashOpacity = 0;
  let impactProgress = -1;
  for (const hitFrame of HIT_FRAMES) {
    const df = globalFrame - hitFrame;
    if (df >= 0 && df <= 10) {
      const op = df <= 2 ? 0.82 * ((df + 1) / 3) : 0.82 * (1 - (df - 2) / 8);
      if (op > flashOpacity) {
        flashOpacity = op;
        impactProgress = df / 10;
      }
    }
  }

  // Deterministic animated film grain specks & vertical noir scratches
  const grainSeed = globalFrame % 97;
  const specks = Array.from({ length: 34 }, (_, i) => {
    const x = hash01(grainSeed * 37 + i * 13) * 1080;
    const y = hash01(grainSeed * 53 + i * 29) * 1920;
    const r = 1 + hash01(grainSeed * 19 + i * 7) * 2.2;
    const isDark = i % 2 === 0;
    return { x, y, r, isDark };
  });

  const scratchX1 = hash01(Math.floor(globalFrame / 2) * 17) * 1080;
  const scratchX2 = hash01(Math.floor(globalFrame / 3) * 31 + 9) * 1080;

  // Active On-Screen Text (if any)
  const activeText = ON_SCREEN_TEXTS.find(
    (t) => globalFrame >= t.startFrame && globalFrame <= t.endFrame
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 90,
      }}
    >
      {/* Film Grain & Noir Vignette SVG */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <radialGradient id="noir-vignette" cx="50%" cy="48%" r="65%">
            <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#04020A" stopOpacity="0.58" />
          </radialGradient>
        </defs>

        {/* Subtle Noir Edge Vignette */}
        <rect width="1080" height="1920" fill="url(#noir-vignette)" />

        {/* Vertical Anime-Noir Film Scratches */}
        <line
          x1={scratchX1}
          y1="0"
          x2={scratchX1}
          y2="1920"
          stroke="#F8F6FF"
          strokeWidth="1.2"
          opacity="0.08"
        />
        <line
          x1={scratchX2}
          y1="0"
          x2={scratchX2}
          y2="1920"
          stroke="#000000"
          strokeWidth="1.5"
          opacity="0.14"
        />

        {/* Animated Film Grain Specks */}
        {specks.map((s, idx) => (
          <circle
            key={idx}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={s.isDark ? '#05030A' : '#F2E8FF'}
            opacity={s.isDark ? 0.22 : 0.14}
          />
        ))}

        {/* Hit Impact Flash & Anime Impact Spikes */}
        {flashOpacity > 0 && (
          <g>
            <rect
              width="1080"
              height="1920"
              fill="#F8F4FF"
              opacity={flashOpacity * 0.72}
            />
            <rect
              x="28"
              y="28"
              width="1024"
              height="1864"
              fill="none"
              stroke={THEME.colors.celRimAmber}
              strokeWidth={18 * (1 - impactProgress)}
              opacity={flashOpacity}
            />
          </g>
        )}
      </svg>

      {/* Big, Bold, High-Contrast On-Screen Text (Top / Upper-Middle of Frame) */}
      {activeText && (() => {
        const localF = globalFrame - activeText.startFrame;
        const slamScale =
          localF <= 5
            ? 1.32 - 0.32 * easeOutCubic(localF / 5)
            : 1.0;

        return (
          <div
            style={{
              position: 'absolute',
              top: activeText.yPos,
              left: 60,
              right: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `scale(${slamScale.toFixed(3)})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(6, 5, 14, 0.92)',
                border: `5px solid ${activeText.accentColor || THEME.colors.textAmber}`,
                boxShadow: '12px 12px 0px #1D143D',
                padding: '24px 44px',
                textAlign: 'center',
                maxWidth: 960,
              }}
            >
              <div
                style={{
                  fontFamily: THEME.fonts.display,
                  fontSize: 78,
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: 3,
                  color: THEME.colors.textWhite,
                  textTransform: 'uppercase',
                  textShadow: '4px 4px 0px #2D1D54',
                }}
              >
                {activeText.line1}
              </div>
              <div
                style={{
                  fontFamily: THEME.fonts.display,
                  fontSize: 82,
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: 3,
                  color: activeText.accentColor || THEME.colors.textAmber,
                  textTransform: 'uppercase',
                  marginTop: 6,
                  textShadow: '4px 4px 0px #120B29',
                }}
              >
                {activeText.line2}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
