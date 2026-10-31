// src/kit/ThermalScopeOverlay.tsx
import React from 'react';
import { THEME } from '../theme';

export interface ThermalScopeOverlayProps {
  frame: number;
  timecodeText?: string;
  statusText?: string;
  zoomText?: string;
  targetLocked?: boolean;
  targetLost?: boolean;
  reticleX?: number;
  reticleY?: number;
  children?: React.ReactNode;
}

/**
 * Green FLIR / Thermal-Scope viewport & HUD used from 5.91s to 13.64s (S04, S05, S06)
 * and when the craft leaves the thermal scope's view at 31.76s to 34.20s (S14).
 * Kept strictly above y = 1440 for all important HUD indicators so bottom 25% stays clear.
 */
export const ThermalScopeOverlay: React.FC<ThermalScopeOverlayProps> = ({
  frame,
  timecodeText = '2026 // 20:23:14 PM',
  statusText = 'FLIR-IR // HILLTOP POST 03',
  zoomText = 'OPTIC 4.0X // THERM-GRN',
  targetLocked = false,
  targetLost = false,
  reticleX = 540,
  reticleY = 640,
  children,
}) => {
  const scanlineY = (frame * 18) % 1440;
  const blink = Math.floor(frame / 6) % 2 === 0;
  const primaryColor = targetLost ? THEME.colors.textCrimson : THEME.colors.thermalBright;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: THEME.colors.thermalBgDark,
        overflow: 'hidden',
      }}
    >
      {/* Thermal Green Radial Field Background */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <radialGradient id="thermal-vignette" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#0F4724" />
            <stop offset="68%" stopColor="#062411" />
            <stop offset="100%" stopColor="#020B05" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#thermal-vignette)" />

        {/* Subtle Thermal Sensor Grid */}
        {Array.from({ length: 14 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 110}
            x2="1080"
            y2={i * 110}
            stroke={THEME.colors.thermalGrid}
            strokeWidth="1"
            opacity="0.32"
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 120}
            y1="0"
            x2={i * 120}
            y2="1440"
            stroke={THEME.colors.thermalGrid}
            strokeWidth="1"
            opacity="0.32"
          />
        ))}
      </svg>

      {/* Scene Content Rendered Inside Thermal View */}
      {children}

      {/* Thermal Scope Reticle, Scanlines, and HUD (Strictly above y=1440) */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {/* Rolling Scanline Bar */}
        <rect
          x="0"
          y={scanlineY}
          width="1080"
          height="16"
          fill={THEME.colors.thermalBright}
          opacity="0.09"
        />

        {/* Circular Scope Vignette Mask Framing (centered at 540, 680) */}
        <circle
          cx="540"
          cy="680"
          r="470"
          fill="none"
          stroke={primaryColor}
          strokeWidth="4"
          strokeDasharray="18 8"
          opacity="0.75"
        />
        <circle
          cx="540"
          cy="680"
          r="495"
          fill="none"
          stroke={THEME.colors.thermalGrid}
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Dynamic Tracking Crosshair Reticle */}
        <g transform={`translate(${reticleX}, ${reticleY})`}>
          {/* Outer Corner Brackets */}
          <path
            d="M-110,-70 L-110,-110 L-70,-110 M70,-110 L110,-110 L110,-70 M110,70 L110,110 L70,110 M-70,110 L-110,110 L-110,70"
            fill="none"
            stroke={primaryColor}
            strokeWidth="5"
          />
          {/* Center Crosshair Ticks */}
          <line x1="-150" y1="0" x2="-40" y2="0" stroke={primaryColor} strokeWidth="2.5" />
          <line x1="40" y1="0" x2="150" y2="0" stroke={primaryColor} strokeWidth="2.5" />
          <line x1="0" y1="-150" x2="0" y2="-40" stroke={primaryColor} strokeWidth="2.5" />
          <line x1="0" y1="40" x2="0" y2="150" stroke={primaryColor} strokeWidth="2.5" />

          {targetLocked && (
            <text
              x="0"
              y="148"
              textAnchor="middle"
              fill={THEME.colors.thermalWhiteHot}
              fontFamily={THEME.fonts.mono}
              fontSize="26"
              fontWeight="bold"
              letterSpacing="3"
            >
              [ COLD SIGNATURE LOCK // ΔT -14.2°C ]
            </text>
          )}

          {targetLost && blink && (
            <g>
              <rect
                x="-250"
                y="-45"
                width="500"
                height="90"
                fill="rgba(255, 59, 78, 0.18)"
                stroke={THEME.colors.textCrimson}
                strokeWidth="4"
              />
              <text
                x="0"
                y="12"
                textAnchor="middle"
                fill={THEME.colors.textCrimson}
                fontFamily={THEME.fonts.mono}
                fontSize="38"
                fontWeight="bold"
                letterSpacing="4"
              >
                FOV EXCEEDED // LOST
              </text>
            </g>
          )}
        </g>

        {/* Top HUD Header Bar */}
        <g transform="translate(80, 110)">
          <rect
            x="0"
            y="0"
            width="920"
            height="105"
            fill="rgba(3, 20, 10, 0.78)"
            stroke={primaryColor}
            strokeWidth="3"
          />
          <circle
            cx="42"
            cy="52"
            r="12"
            fill={blink ? primaryColor : 'transparent'}
            stroke={primaryColor}
            strokeWidth="3"
          />
          <text
            x="74"
            y="46"
            fill={THEME.colors.thermalWhiteHot}
            fontFamily={THEME.fonts.mono}
            fontSize="30"
            fontWeight="bold"
            letterSpacing="2"
          >
            {statusText}
          </text>
          <text
            x="74"
            y="84"
            fill={primaryColor}
            fontFamily={THEME.fonts.mono}
            fontSize="26"
            fontWeight="bold"
            letterSpacing="2"
          >
            {timecodeText}
          </text>
          <text
            x="890"
            y="66"
            textAnchor="end"
            fill={primaryColor}
            fontFamily={THEME.fonts.mono}
            fontSize="26"
            fontWeight="bold"
          >
            {zoomText}
          </text>
        </g>

        {/* Lower Scope Telemetry Bar (Placed at y=1260, well above y=1440 caption area) */}
        <g transform="translate(120, 1260)">
          <rect
            x="0"
            y="0"
            width="840"
            height="74"
            fill="rgba(3, 20, 10, 0.78)"
            stroke={primaryColor}
            strokeWidth="2.5"
          />
          <text
            x="30"
            y="46"
            fill={primaryColor}
            fontFamily={THEME.fonts.mono}
            fontSize="26"
            fontWeight="bold"
            letterSpacing="2"
          >
            AZIMUTH: {((284 + Math.floor(frame * 0.4)) % 360).toString().padStart(3, '0')}° NW
          </text>
          <text
            x="810"
            y="46"
            textAnchor="end"
            fill={THEME.colors.thermalWhiteHot}
            fontFamily={THEME.fonts.mono}
            fontSize="26"
            fontWeight="bold"
            letterSpacing="2"
          >
            AUDIO: 0.0 dB [SILENT]
          </text>
        </g>
      </svg>
    </div>
  );
};
