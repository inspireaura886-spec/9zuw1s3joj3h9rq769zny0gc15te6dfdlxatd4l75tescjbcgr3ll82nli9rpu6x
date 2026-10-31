// src/kit/AgentSilhouettes.tsx
import React from 'react';
import { THEME } from '../theme';
import { loopWaveSin } from './math';

export interface AgentSilhouettesProps {
  frame: number;
  pose?: 'ridge-watch' | 'close-shoulder' | 'canyon-walk' | 'third-agent-scope';
  leftAgentX?: number;
  rightAgentX?: number;
  groundY?: number;
  scale?: number;
}

/**
 * Two federal agents seen mostly from behind or as silhouettes,
 * with anime-noir cel-shaded hard purple-blue shadow planes and fluttering coats/ties
 * so something moves on screen at all times.
 * Note: At frame === 0, loopWaveSin(0) === 0, so Frame 0 and Loop End match 100%.
 */
export const AgentSilhouettes: React.FC<AgentSilhouettesProps> = ({
  frame,
  pose = 'ridge-watch',
  leftAgentX = 330,
  rightAgentX = 740,
  groundY = 1380,
  scale = 1,
}) => {
  const coatFlutter = loopWaveSin(frame, 0.18) * 12;
  const coatFlutter2 = loopWaveSin(frame, 0.15) * -10;
  const headTilt = loopWaveSin(frame, 0.09) * 2.5;
  const breathY = loopWaveSin(frame, 0.12) * 3;

  if (pose === 'third-agent-scope') {
    // Third agent on guarded hilltop post holding thermal monocular up to eye
    return (
      <g transform={`translate(${leftAgentX}, ${groundY}) scale(${scale})`}>
        {/* Trenchcoat / Jacket Silhouette from behind-side */}
        <polygon
          points={`-75,0 -58,-210 -32,-265 36,-265 68,-205 92 + ${coatFlutter},0`}
          fill={THEME.colors.silhouetteBlack}
        />
        {/* Hard purple-blue cel-shaded shoulder & back shadow block */}
        <polygon
          points="-58,-210 -10,-260 12,-90 -64,-40"
          fill={THEME.colors.celShadowMid}
        />
        {/* Purple-blue rim line on shoulder */}
        <polyline
          points="-72,-20 -58,-210 -32,-265 36,-265"
          fill="none"
          stroke={THEME.colors.celRimPurple}
          strokeWidth="4"
        />
        {/* Head & Cap in Silhouette */}
        <g transform={`translate(0, ${breathY}) rotate(${headTilt})`}>
          <polygon
            points="-26,-265 -28,-325 22,-328 38,-312 24,-265"
            fill={THEME.colors.silhouetteBlack}
          />
          {/* Raised Right Arm holding Thermal Scope */}
          <polygon
            points="32,-245 105,-285 118,-260 48,-205"
            fill={THEME.colors.silhouetteBlack}
            stroke={THEME.colors.celRimBlue}
            strokeWidth="3"
          />
          {/* Thermal Scope Barrel with subtle green eyepiece reflection */}
          <rect
            x="92"
            y="-310"
            width="74"
            height="34"
            rx="6"
            transform="rotate(-12 92 -310)"
            fill="#0A0E17"
            stroke={THEME.colors.thermalBright}
            strokeWidth="3"
          />
          <circle cx="88" cy="-292" r="9" fill={THEME.colors.thermalBright} opacity="0.85" />
        </g>
      </g>
    );
  }

  if (pose === 'close-shoulder') {
    // Close over-the-shoulder shot of the two agents looking up in stunned silence
    return (
      <g>
        {/* Left Agent Close Back/Shoulder */}
        <g transform={`translate(240, 1430) scale(${scale * 1.35})`}>
          <polygon
            points={`-150,0 -115,-220 -50,-275 75,-270 125,-205 ${145 + coatFlutter},0`}
            fill={THEME.colors.silhouetteBlack}
          />
          <polygon
            points="-115,-220 -50,-275 -10,-272 -45,-60 -130,-20"
            fill={THEME.colors.celShadowMid}
          />
          <polyline
            points="-115,-220 -50,-275 75,-270 125,-205"
            fill="none"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="4.5"
          />
          {/* Head & Ears from behind */}
          <g transform={`translate(8, ${breathY}) rotate(${headTilt - 4})`}>
            <polygon
              points="-38,-270 -42,-355 34,-355 38,-270"
              fill={THEME.colors.silhouetteBlack}
            />
            <polygon
              points="-42,-355 -10,-362 -14,-270 -38,-270"
              fill={THEME.colors.celShadowMid}
            />
            <polyline
              points="-42,-355 34,-355 38,-270"
              fill="none"
              stroke={THEME.colors.celRimAmber}
              strokeWidth="3"
              opacity="0.8"
            />
          </g>
        </g>

        {/* Right Agent Close Back/Shoulder */}
        <g transform={`translate(830, 1430) scale(${scale * 1.28})`}>
          <polygon
            points={`${-140 + coatFlutter2},0 -110,-210 -55,-265 65,-265 115,-200 140,0`}
            fill={THEME.colors.silhouetteBlack}
          />
          <polygon
            points="15,-265 65,-265 115,-200 125,-30 45,-60"
            fill={THEME.colors.celShadowMid}
          />
          <polyline
            points="-110,-210 -55,-265 65,-265 115,-200"
            fill="none"
            stroke={THEME.colors.celRimBlue}
            strokeWidth="4"
          />
          <g transform={`translate(-6, ${-breathY}) rotate(${-headTilt - 5})`}>
            <polygon
              points="-36,-265 -38,-346 36,-346 34,-265"
              fill={THEME.colors.silhouetteBlack}
            />
            <polyline
              points="-38,-346 36,-346"
              fill="none"
              stroke={THEME.colors.celRimPurple}
              strokeWidth="3.5"
            />
          </g>
        </g>
      </g>
    );
  }

  if (pose === 'canyon-walk') {
    // Two agents walking/searching the canyon floor in the morning
    const stride = Math.sin(frame * 0.22) * 18;
    return (
      <g>
        {/* Agent 1 inspecting canyon ground */}
        <g transform={`translate(${leftAgentX + frame * 1.2}, ${groundY}) scale(${scale * 0.88})`}>
          {/* Legs striding */}
          <polygon
            points={`-22,-110 -8,-110 ${-18 + stride},0 ${-34 + stride},0`}
            fill={THEME.colors.silhouetteBlack}
          />
          <polygon
            points={`8,-110 24,-110 ${26 - stride},0 ${10 - stride},0`}
            fill="#120E29"
          />
          {/* Coat & Torso */}
          <polygon
            points={`-48,-105 -38,-250 32,-250 ${54 + coatFlutter * 0.7},-100`}
            fill={THEME.colors.silhouetteBlack}
            stroke={THEME.colors.celRimAmber}
            strokeWidth="3"
          />
          <polygon
            points="-38,-250 -6,-250 -12,-105 -48,-105"
            fill={THEME.colors.celShadowMid}
          />
          {/* Head angled down toward ground */}
          <polygon
            points="-18,-250 -14,-296 24,-292 18,-250"
            fill={THEME.colors.silhouetteBlack}
          />
        </g>

        {/* Agent 2 scanning canyon walls */}
        <g transform={`translate(${rightAgentX - frame * 0.8}, ${groundY + 25}) scale(${scale * 0.94})`}>
          <polygon
            points={`-20,-110 -6,-110 ${-14 - stride},0 ${-30 - stride},0`}
            fill={THEME.colors.silhouetteBlack}
          />
          <polygon
            points={`8,-110 22,-110 ${22 + stride},0 ${8 + stride},0`}
            fill="#120E29"
          />
          <polygon
            points={`${-52 + coatFlutter2 * 0.7},-102 -36,-255 36,-255 48,-105`}
            fill={THEME.colors.silhouetteBlack}
            stroke={THEME.colors.celRimPurple}
            strokeWidth="3"
          />
          <polygon
            points="6,-255 36,-255 48,-105 14,-105"
            fill={THEME.colors.celShadowMid}
          />
          <polygon
            points="-20,-255 -22,-302 18,-302 16,-255"
            fill={THEME.colors.silhouetteBlack}
          />
        </g>
      </g>
    );
  }

  // Default 'ridge-watch' pose (Frame 0, S01, S03, S09, S11, S15, S19 Loop End)
  // Two federal agents standing on the foreground ridge seen from behind, coats fluttering in the dusk wind.
  return (
    <g>
      {/* Left Agent Silhouette (Seen from behind, trenchcoat hem & lapel in wind) */}
      <g transform={`translate(${leftAgentX}, ${groundY}) scale(${scale})`}>
        {/* Legs */}
        <polygon points="-34,0 -28,-115 -8,-115 -12,0" fill={THEME.colors.silhouetteBlack} />
        <polygon points="8,0 12,-115 32,-115 28,0" fill={THEME.colors.silhouetteBlack} />
        {/* Flowing Coat Tail with deterministic wind flutter (0 at frame 0) */}
        <polygon
          points={`-58,-95 -46,-265 44,-265 ${68 + coatFlutter},-90 ${48 + coatFlutter * 1.2},-55 -48,-65`}
          fill={THEME.colors.silhouetteBlack}
        />
        {/* Hard Purple-Blue Cel-Shaded Left Shoulder/Back Facet */}
        <polygon
          points="-46,-265 -8,-265 -16,-85 -56,-95"
          fill={THEME.colors.celShadowMid}
        />
        {/* Crisp Cel Rim Highlight on Left Agent */}
        <polyline
          points={`-58,-95 -46,-265 44,-265 ${68 + coatFlutter},-90`}
          fill="none"
          stroke={THEME.colors.celRimPurple}
          strokeWidth="3.5"
        />
        {/* Head tilted up toward the rising black triangle */}
        <g transform={`translate(0, ${breathY}) rotate(${headTilt})`}>
          <polygon
            points="-22,-265 -24,-322 22,-322 20,-265"
            fill={THEME.colors.silhouetteBlack}
          />
          <polyline
            points="-24,-322 22,-322 20,-265"
            fill="none"
            stroke={THEME.colors.celRimAmber}
            strokeWidth="2.5"
            opacity="0.85"
          />
        </g>
      </g>

      {/* Right Agent Silhouette (Seen from behind, slightly taller, radio antenna on belt) */}
      <g transform={`translate(${rightAgentX}, ${groundY + 12}) scale(${scale * 1.04})`}>
        {/* Legs */}
        <polygon points="-32,0 -26,-120 -6,-120 -10,0" fill={THEME.colors.silhouetteBlack} />
        <polygon points="10,0 14,-120 34,-120 30,0" fill={THEME.colors.silhouetteBlack} />
        {/* Jacket / Coat with wind flutter */}
        <polygon
          points={`${-64 + coatFlutter2},-92 -48,-272 46,-272 60,-95 44,-65 ${-52 + coatFlutter2},-60`}
          fill={THEME.colors.silhouetteBlack}
        />
        {/* Hard Purple-Blue Cel-Shaded Right Shoulder Facet */}
        <polygon
          points="8,-272 46,-272 58,-95 16,-90"
          fill={THEME.colors.celShadowMid}
        />
        {/* Crisp Cel Rim Highlight on Right Agent */}
        <polyline
          points={`${-64 + coatFlutter2},-92 -48,-272 46,-272 60,-95`}
          fill="none"
          stroke={THEME.colors.celRimBlue}
          strokeWidth="3.5"
        />
        {/* Head looking up at the triangle */}
        <g transform={`translate(0, ${-breathY}) rotate(${-headTilt})`}>
          <polygon
            points="-22,-272 -24,-330 22,-330 20,-272"
            fill={THEME.colors.silhouetteBlack}
          />
          <polyline
            points="-24,-330 22,-330"
            fill="none"
            stroke={THEME.colors.celRimPurple}
            strokeWidth="2.5"
          />
        </g>
      </g>
    </g>
  );
};
