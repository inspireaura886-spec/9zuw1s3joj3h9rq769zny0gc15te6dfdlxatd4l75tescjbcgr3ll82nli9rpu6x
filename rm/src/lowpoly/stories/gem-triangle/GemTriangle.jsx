// "2 Agents Saw a Black Triangle. It Made No Sound." (Western U.S., 2026)
// Anime-Noir look (Remotion SVG/DOM, remotion/src/animenoir), 19 scenes on cues.json cuts.
// Facts grounded strictly in primary docs: FBI-UAP-D043 (FD-302) and DOW-UAP-D176 (AARO MFR).
// Audio muxed later via GitHub Actions; sync visuals to vo.json word times.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, staticFile} from 'remotion';
import {WordCaption, Pill, Dip, EndCard, clamp01} from '../../kit/index.js';
import {
  AN, Cam, Layer, Svg, DuskSky, Ridge, Triangle, Agent, Figure,
  ObsPost, Shrub, Motes, Haze, AnimeFinish, RecTag, Slam, QuoteStrip, AnimeFonts,
  ease, easeOut, lerp, hash, blink
} from '../../../animenoir/AnimeNoirKit.jsx';
import VO from './vo.json';

const FPS = 30;
const at = (s) => Math.round(s * FPS);
export const GEMTRI_FRAMES = 1569; // 52.3 s * 30 fps exactly
const W = VO.words;

// Cut times from cues.json (19 scenes total)
const CS = [
  0.0, 2.34, 4.22, 5.91, 10.16, 12.48, 13.64, 15.69, 18.13,
  21.22, 23.86, 26.09, 29.54, 31.76, 34.2, 35.98, 37.77, 41.33, 47.45
];
const C = CS.map(at);
const dur = (i) => (C[i + 1] ?? GEMTRI_FRAMES) - C[i];
const loc = (s, i) => at(s) - C[i];

// ---------- Thermal Scope View (FLIR Monocular HUD) ----------
const ThermalScopeView = ({
  f,
  d,
  targetX = 540,
  targetY = 960,
  targetW = 340,
  locked = true,
  trackingLost = false,
  alertText = 'TRACKING LOST · FOV EXCEEDED',
  statusLabel = 'LOCK: AUTO [IR-TRK]'
}) => {
  const warnBlink = trackingLost && Math.floor(f / 4) % 2 === 0;
  const col = trackingLost ? '#ff4a3a' : '#3aff9a';
  const hudCol = trackingLost ? '#ff8a7a' : '#9affd0';
  const boxW = targetW * 0.65;
  const boxH = targetW * 0.45;

  return (
    <AbsoluteFill style={{background: '#07140e', overflow: 'hidden'}}>
      {/* Thermal sky scanlines & vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(12,36,24,0.4) 0%, rgba(4,14,8,0.92) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Crosshairs & Tactical Reticle */}
      <Svg style={{pointerEvents: 'none'}}>
        {/* Subtle range rings */}
        <circle cx={540} cy={960} r={480} fill="none" stroke="#1c4830" strokeWidth={1.5} strokeDasharray="8 16" />
        <circle cx={540} cy={960} r={280} fill="none" stroke="#1c4830" strokeWidth={1.5} strokeDasharray="6 12" />

        {/* Outer corner framing ticks */}
        <path d="M 120 320 L 120 280 L 160 280" fill="none" stroke={col} strokeWidth={3} />
        <path d="M 960 320 L 960 280 L 920 280" fill="none" stroke={col} strokeWidth={3} />
        <path d="M 120 1600 L 120 1640 L 160 1640" fill="none" stroke={col} strokeWidth={3} />
        <path d="M 960 1600 L 960 1640 L 920 1640" fill="none" stroke={col} strokeWidth={3} />

        {/* Center crosshairs with center clearance */}
        <line x1={540} y1={520} x2={540} y2={860} stroke={col} strokeWidth={2} />
        <line x1={540} y1={1060} x2={540} y2={1400} stroke={col} strokeWidth={2} />
        <line x1={180} y1={960} x2={440} y2={960} stroke={col} strokeWidth={2} />
        <line x1={640} y1={960} x2={900} y2={960} stroke={col} strokeWidth={2} />

        {/* Mil-dot ticks along reticle */}
        {[-300, -200, -100, 100, 200, 300].map((offset, idx) => (
          <React.Fragment key={idx}>
            <line x1={532} y1={960 + offset} x2={548} y2={960 + offset} stroke={col} strokeWidth={1.5} />
            <line x1={540 + offset} y1={952} x2={540 + offset} y2={968} stroke={col} strokeWidth={1.5} />
          </React.Fragment>
        ))}

        {/* Hot Thermal Target Silhouette */}
        {targetX < 1300 && targetX > -200 && (
          <g transform={`translate(${targetX},${targetY})`}>
            {/* White-hot thermal halo */}
            <polygon
              points={`0,${-boxH * 0.65} ${boxW * 0.75},${boxH * 0.55} ${-boxW * 0.75},${boxH * 0.55}`}
              fill="rgba(255,255,255,0.22)"
              filter="blur(8px)"
            />
            {/* White-hot core */}
            <polygon
              points={`0,${-boxH * 0.55} ${boxW * 0.65},${boxH * 0.45} ${-boxW * 0.65},${boxH * 0.45}`}
              fill="#ffffff"
            />
            {/* Shaded facet in emerald glow */}
            <polygon
              points={`0,${-boxH * 0.55} ${boxW * 0.65 - 2},${boxH * 0.45 - 2} 0,${boxH * 0.45 - 2}`}
              fill="#c6ffeb"
            />
          </g>
        )}

        {/* Target Bounding Box */}
        {locked && (
          <g transform={`translate(${targetX},${targetY})`}>
            <path
              d={`M ${-boxW * 0.6} ${-boxH * 0.4} L ${-boxW * 0.6} ${-boxH * 0.6} L ${-boxW * 0.4} ${-boxH * 0.6}`}
              fill="none" stroke={col} strokeWidth={3}
            />
            <path
              d={`M ${boxW * 0.4} ${-boxH * 0.6} L ${boxW * 0.6} ${-boxH * 0.6} L ${boxW * 0.6} ${-boxH * 0.4}`}
              fill="none" stroke={col} strokeWidth={3}
            />
            <path
              d={`M ${-boxW * 0.6} ${boxH * 0.4} L ${-boxW * 0.6} ${boxH * 0.6} L ${-boxW * 0.4} ${boxH * 0.6}`}
              fill="none" stroke={col} strokeWidth={3}
            />
            <path
              d={`M ${boxW * 0.4} ${boxH * 0.6} L ${boxW * 0.6} ${boxH * 0.6} L ${boxW * 0.6} ${boxH * 0.4}`}
              fill="none" stroke={col} strokeWidth={3}
            />
            {!trackingLost && (
              <text x={0} y={-boxH * 0.72} fill={col} fontSize={22} fontFamily="Special Elite" textAnchor="middle">
                TARGET: UNIFORM HOT · 0 EXHAUST
              </text>
            )}
          </g>
        )}
      </Svg>

      {/* Status Warning if tracking lost */}
      {trackingLost && (
        <div
          style={{
            position: 'absolute',
            top: 760,
            left: 90,
            width: 900,
            textAlign: 'center',
            background: warnBlink ? 'rgba(224,69,58,0.92)' : 'rgba(20,8,12,0.85)',
            border: '4px solid #ff4a3a',
            padding: '16px 20px',
            boxSizing: 'border-box',
            boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
            transform: `scale(${1 + (warnBlink ? 0.04 : 0)})`
          }}
        >
          <div style={{fontFamily: 'Lilita One', fontSize: 48, color: warnBlink ? '#fff' : '#ff4a3a', letterSpacing: 3}}>
            {alertText}
          </div>
          <div style={{fontFamily: 'Special Elite', fontSize: 26, color: warnBlink ? '#fff' : '#ffa090', marginTop: 6}}>
            ANGULAR VELOCITY &gt; 120°/SEC · SLEW RATE MAXED
          </div>
        </div>
      )}

      {/* Tactical Readout Overlays (Top / Bottom) */}
      <div style={{position: 'absolute', top: 290, left: 130, right: 130, display: 'flex', justifyContent: 'space-between'}}>
        <div style={{fontFamily: 'Special Elite', fontSize: 26, color: hudCol, letterSpacing: 2}}>
          FLIR AN/PAS-26 · WHITE-HOT
        </div>
        <div style={{fontFamily: 'Special Elite', fontSize: 26, color: hudCol, letterSpacing: 2}}>
          AZ: 284.4° · EL: +14.2°
        </div>
      </div>

      <div style={{position: 'absolute', bottom: 380, left: 130, right: 130, display: 'flex', justifyContent: 'space-between'}}>
        <div style={{fontFamily: 'Special Elite', fontSize: 26, color: hudCol, letterSpacing: 2}}>
          FOV: 4.8° NARROW · SENS: HIGH
        </div>
        <div style={{fontFamily: 'Special Elite', fontSize: 26, color: col, letterSpacing: 2}}>
          {statusLabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Stopwatch / Hover Timer Widget ----------
const HoverTimer = ({f, d}) => {
  const sec = Math.min(20, (f / d) * 20);
  const secInt = Math.floor(sec);
  const secDec = Math.floor((sec - secInt) * 100);
  const timerStr = `00:${secInt < 10 ? '0' : ''}${secInt}.${secDec < 10 ? '0' : ''}${secDec}`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 430,
        right: 90,
        width: 360,
        background: 'rgba(10,12,24,0.88)',
        border: '4px solid #ffd93b',
        borderRadius: 10,
        padding: '14px 18px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        boxSizing: 'border-box'
      }}
    >
      <div style={{fontFamily: 'Special Elite', fontSize: 22, color: '#ffd93b', letterSpacing: 2, marginBottom: 4}}>
        AARO REPORTED HOVER
      </div>
      <div style={{fontFamily: 'Lilita One', fontSize: 62, color: '#ffffff', letterSpacing: 3, lineHeight: 1.1}}>
        {timerStr}
      </div>
      <div style={{fontFamily: 'Fredoka', fontSize: 20, color: '#a0b0d0', marginTop: 4, letterSpacing: 1}}>
        STABLE · ZERO TILT · NO SOUND
      </div>
    </div>
  );
};

// ---------- Audio Flatline Monitor ----------
const AudioFlatline = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 460,
      left: 90,
      width: 900,
      background: 'rgba(12,10,20,0.88)',
      border: '3px solid #e0453a',
      borderRadius: 10,
      padding: '16px 24px',
      boxSizing: 'border-box',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
    }}
  >
    <div style={{fontFamily: 'Special Elite', fontSize: 22, color: '#e0453a', letterSpacing: 2}}>
      ACOUSTIC SENSOR SPECTRUM · OBSERVATION POST 6
    </div>
    <div style={{margin: '10px 0', borderBottom: '3px dashed #e0453a', opacity: 0.8}} />
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 28, color: '#ffffff', letterSpacing: 1.5}}>
        LEVEL: 0.0 dB · COMPLETE SILENCE
      </div>
      <div style={{fontFamily: 'Special Elite', fontSize: 20, color: '#ffd93b', letterSpacing: 1}}>
        DRONE AT 1.4 MI WOULD BE AUDIBLE
      </div>
    </div>
  </div>
);

// ---------- Document Conflict Dossier (Scene 17) ----------
const DocumentConflict = () => (
  <div style={{position: 'absolute', top: 580, left: 90, width: 900, display: 'flex', flexDirection: 'column', gap: 16}}>
    {/* FBI Card */}
    <div
      style={{
        background: '#efe6d2',
        border: '4px solid #0b0a14',
        borderRadius: 8,
        padding: '18px 24px',
        boxShadow: '8px 10px 0 rgba(0,0,0,0.65)',
        boxSizing: 'border-box'
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: 'Special Elite', fontSize: 26, color: '#0b0a14', letterSpacing: 2}}>
          FBI SPECIAL AGENTS FD-302
        </div>
        <div style={{background: '#e0453a', color: '#fff', fontFamily: 'Lilita One', fontSize: 22, padding: '2px 10px', borderRadius: 4}}>
          EYEWITNESS REPORT
        </div>
      </div>
      <div style={{fontFamily: 'Lilita One', fontSize: 50, color: '#e0453a', marginTop: 6, letterSpacing: 2}}>
        TOTAL DURATION: ~3 SECONDS
      </div>
      <div style={{fontFamily: 'Special Elite', fontSize: 22, color: '#443830', marginTop: 4}}>
        “a substantial, nonreflective, dark black triangular object”
      </div>
    </div>

    {/* Pentagon AARO Card */}
    <div
      style={{
        background: '#182032',
        border: '4px solid #ffd93b',
        borderRadius: 8,
        padding: '18px 24px',
        boxShadow: '8px 10px 0 rgba(0,0,0,0.65)',
        boxSizing: 'border-box'
      }}
    >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontFamily: 'Special Elite', fontSize: 26, color: '#ffd93b', letterSpacing: 2}}>
          DEFENSE DEPT · AARO MFR (DOW-UAP-D176)
        </div>
        <div style={{background: '#ffd93b', color: '#0b0a14', fontFamily: 'Lilita One', fontSize: 22, padding: '2px 10px', borderRadius: 4}}>
          PENTAGON RECORD
        </div>
      </div>
      <div style={{fontFamily: 'Lilita One', fontSize: 50, color: '#ffd93b', marginTop: 6, letterSpacing: 2}}>
        TOTAL DURATION: OVER 30 SECONDS
      </div>
      <div style={{fontFamily: 'Special Elite', fontSize: 22, color: '#a0b0d0', marginTop: 4}}>
        10s vertical ascent + 20s stable hover + 2-3s high-speed canyon descent
      </div>
    </div>
  </div>
);

// ================================================================
// SCENE DEFINITIONS (S[0] through S[18])
// ================================================================
const S = [];

// ----------------------------------------------------------------
// Scene 00: Hook (f 0..70, dur 70)
// "Two federal agents watched a black triangle"
// ----------------------------------------------------------------
S[0] = () => {
  const f = useCurrentFrame();
  const d = dur(0);
  return (
    <Cam from={{s: 1.0, x: 0, y: 0}} to={{s: 1.15, x: 0, y: -25}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1200} glowX={380} warmth={1.1} stars={30} /></Layer>
      <Layer depth={0.15}><Ridge seed={3} base={1240} amp={180} fill={AN.ridgeFar} rimO={0.9} /></Layer>
      {/* Triangle just emerging over the far ridge */}
      <Layer depth={0.25}>
        <Svg><Triangle x={540} y={1160 - f * 0.4} w={380} tilt={0} edge={0.4} /></Svg>
      </Layer>
      <Layer depth={0.4}><Ridge seed={7} base={1380} amp={220} fill={AN.ridgeMid} rimO={0.8} hatch={true} /></Layer>
      <Layer depth={0.7}><Ridge seed={11} base={1560} amp={260} fill={AN.ridgeNear} rimO={0.7} /></Layer>
      <Layer depth={1.0}>
        <Svg>
          {/* Agent 1 (spike hair, binos raising) */}
          <Agent x={360} y={1480} scale={1.45} hair="spike" binos={0.9} tilt={-14} widen={0.7} seed={1} />
          {/* Agent 2 (crop hair, looking across horizon) */}
          <Agent x={740} y={1520} scale={1.4} flip={true} hair="crop" tilt={-10} look={0.4} widen={0.5} seed={2} />
        </Svg>
      </Layer>
      <RecTag text="RECREATION" />
      <Slam
        lines={[{text: '2 AGENTS.', red: false}, {text: 'ZERO SOUND.', red: true}]}
        at={0}
        y={320}
        size={106}
        out={d - 2}
      />
      <Motes n={32} seed={1} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 01: Ridge Ascent (f 70..127, dur 57)
// "rise over a ridge,"
// ----------------------------------------------------------------
S[1] = () => {
  const f = useCurrentFrame();
  const d = dur(1);
  return (
    <Cam from={{s: 1.05, y: 40}} to={{s: 1.25, y: -70}} d={d} mode="inout">
      <Layer depth={0}><DuskSky horizon={1300} glowX={480} warmth={1.2} stars={26} /></Layer>
      <Layer depth={0.2}><Ridge seed={5} base={1400} amp={240} fill={AN.ridgeFar} rim={AN.rimHot} rimO={1.0} /></Layer>
      <Layer depth={0.35}>
        <Svg><Triangle x={540} y={1180 - f * 4.8} w={560} tilt={0} edge={0.5} /></Svg>
      </Layer>
      <Layer depth={0.6}><Ridge seed={9} base={1580} amp={280} fill={AN.ridgeMid} rimO={0.7} hatch={true} /></Layer>
      <Haze y={1350} h={400} o={0.4} />
      <Pill text="WESTERN RIDGE" y={236} variant="yellow" delay={2} size={48} />
      <Motes n={28} seed={4} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 02: Total Silence Reaction (f 127..177, dur 50)
// "and it made no sound at all."
// ----------------------------------------------------------------
S[2] = () => {
  const f = useCurrentFrame();
  const d = dur(2);
  return (
    <Cam from={{s: 1.0, x: 0, y: 0}} to={{s: 1.1, x: 0, y: -12}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1450} glowX={280} stars={45} /></Layer>
      <Layer depth={0.2}><Ridge seed={14} base={1520} amp={160} fill={AN.ridgeFar} rimO={0.6} /></Layer>
      <Layer depth={1.0}>
        <Svg>
          <Agent x={540} y={1180} scale={2.5} hair="spike" tilt={-16} widen={1} look={-0.2} earpiece={true} rimO={0.9} seed={2} />
        </Svg>
      </Layer>
      <Pill text="TOTAL SILENCE" y={236} variant="red" delay={2} size={52} />
      <QuoteStrip
        text="neither [REDACTED] nor I detected any auditory output"
        source="FBI FD-302 REPORT"
        at={4}
        y={860}
        out={d - 2}
      />
      <Motes n={20} seed={7} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 03: Hilltop Post Wide & Sprint (f 177..305, dur 128)
// "Twenty twenty-six. A guarded hilltop post, eight twenty-three"
// ----------------------------------------------------------------
S[3] = () => {
  const f = useCurrentFrame();
  const d = dur(3);
  return (
    <Cam from={{s: 1.0, x: -90, y: 15}} to={{s: 1.22, x: 70, y: -25}} d={d} mode="inout">
      <Layer depth={0}><DuskSky horizon={1120} glowX={600} warmth={0.9} stars={55} /></Layer>
      <Layer depth={0.15}><Ridge seed={18} base={1160} amp={200} fill={AN.ridgeFar} rimO={0.8} /></Layer>
      <Layer depth={0.4}><Ridge seed={22} base={1320} amp={240} fill={AN.ridgeMid} rimO={0.7} /></Layer>
      <Layer depth={0.8}><ObsPost x={540} y={1540} scale={1.1} rimO={0.8} /></Layer>
      <Layer depth={1.0}>
        <Svg>
          {/* Running agents across the peak */}
          <Figure x={280 + f * 4.2} y={1480} h={240} dir={1} pose="run" phase={f * 0.35} coat={AN.jacket} hat={true} />
          <Figure x={140 + f * 4.0} y={1500} h={250} dir={1} pose="run" phase={f * 0.35 + 1.2} coat={AN.jacket} />
        </Svg>
      </Layer>
      <Pill text="GUARDED U.S. SITE" y={236} variant="dark" delay={8} size={46} />
      <Pill text="20:23 LOCAL DUSK" y={316} variant="yellow" delay={26} size={46} />
      <Pill text="OBSERVATION POST 6" y={396} variant="red" delay={52} size={46} />
      <Motes n={36} speed={1.2} seed={9} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 04: Source 3 Thermal Spotter (f 305..374, dur 69)
// "p.m. A third agent's thermal scope"
// ----------------------------------------------------------------
S[4] = () => {
  const f = useCurrentFrame();
  const d = dur(4);
  return (
    <Cam from={{s: 1.0, x: -15, y: 0}} to={{s: 1.12, x: 20, y: -10}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1250} glowX={300} stars={50} /></Layer>
      <Layer depth={0.2}><Ridge seed={26} base={1300} amp={220} fill={AN.ridgeFar} rimO={0.7} /></Layer>
      <Layer depth={0.6}><ObsPost x={760} y={1520} scale={0.9} tripodDir={-1} rimO={0.75} /></Layer>
      <Layer depth={1.0}>
        <Svg>
          <Agent x={440} y={1220} scale={2.2} hair="cap" radio={1} talk={true} earpiece={true} tilt={-6} look={0.5} seed={5} />
        </Svg>
      </Layer>
      <Pill text="SOURCE 3 · THERMAL SPOTTER" y={236} variant="dark" delay={6} size={46} />
      <Pill text="RADIO CALLOUT" y={316} variant="yellow" delay={22} size={44} />
      <Motes n={24} seed={12} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 05: Thermal Scope POV Lock (f 374..409, dur 35)
// "called it in. It"
// ----------------------------------------------------------------
S[5] = () => {
  const f = useCurrentFrame();
  const d = dur(5);
  return (
    <Cam from={{s: 1.0, x: 8, y: -6}} to={{s: 1.08, x: -5, y: 4}} d={d} mode="out" shake={2.5}>
      <ThermalScopeView
        f={f}
        d={d}
        targetX={540 + Math.sin(f * 0.15) * 6}
        targetY={960 + Math.cos(f * 0.12) * 5}
        targetW={380}
        locked={true}
        trackingLost={false}
        statusLabel="LOCK: ACQUIRED · IR-HOT"
      />
      <Pill text="FLIR THERMAL POV" y={236} variant="dark" delay={2} size={44} />
      <Pill text="UNIFORM HEAT · NO EXHAUST" y={316} variant="red" delay={10} size={42} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 06: Vertical Climb (f 409..471, dur 62)
// "It climbed straight up for ten seconds."
// ----------------------------------------------------------------
S[6] = () => {
  const f = useCurrentFrame();
  const d = dur(6);
  return (
    <Cam from={{s: 1.0, y: 60}} to={{s: 1.25, y: -110}} d={d} mode="lin">
      <Layer depth={0}><DuskSky horizon={1450} glowX={420} stars={40} /></Layer>
      <Layer depth={0.15}><Ridge seed={31} base={1500} amp={220} fill={AN.ridgeFar} rimO={0.8} /></Layer>
      <Layer depth={0.3}>
        <Svg><Triangle x={540} y={1300 - f * 7.5} w={520} tilt={0} bank={0} edge={0.5} /></Svg>
      </Layer>
      <Layer depth={0.7}><Ridge seed={35} base={1680} amp={220} fill={AN.ridgeMid} rimO={0.7} /></Layer>
      <Pill text="PERFECT VERTICAL ASCENT" y={236} variant="yellow" delay={loc(13.9, 6)} size={48} />
      <Pill text="ALTITUDE: +300 FT" y={316} variant="red" delay={loc(14.8, 6)} size={44} />
      <Motes n={30} seed={16} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 07: Featureless Surface / No Tilt / No Lights (f 471..544, dur 73)
// "No tilt. No wobble. No lights."
// ----------------------------------------------------------------
S[7] = () => {
  const f = useCurrentFrame();
  const d = dur(7);
  return (
    <Cam from={{s: 1.0, x: -40, y: 15}} to={{s: 1.2, x: 40, y: -15}} d={d} mode="inout">
      <Layer depth={0}><DuskSky horizon={1600} glowX={500} stars={60} /></Layer>
      <Layer depth={0.2}>
        <Svg><Triangle x={540} y={980} w={880} tilt={0} bank={0.15} edge={0.6} /></Svg>
      </Layer>
      <Pill text="NO TILT" y={236} variant="red" delay={loc(15.95, 7)} size={52} />
      <Pill text="NO WOBBLE" y={316} variant="yellow" delay={loc(16.7, 7)} size={52} />
      <Pill text="NO LIGHTS" y={396} variant="white" delay={loc(17.5, 7)} size={52} />
      <Motes n={22} seed={19} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 08: Dead Stop Hover (f 544..637, dur 93)
// "Then it stopped dead, and hung there for twenty seconds."
// ----------------------------------------------------------------
S[8] = () => {
  const f = useCurrentFrame();
  const d = dur(8);
  return (
    <Cam from={{s: 1.0, y: 0}} to={{s: 1.22, y: -25}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1250} glowX={350} stars={65} /></Layer>
      <Layer depth={0.15}><Ridge seed={39} base={1300} amp={180} fill={AN.ridgeFar} rimO={0.8} /></Layer>
      <Layer depth={0.35}>
        <Svg><Triangle x={540} y={840} w={500} tilt={0} bank={0} edge={0.45} /></Svg>
      </Layer>
      <Layer depth={0.7}><Ridge seed={43} base={1500} amp={240} fill={AN.ridgeMid} rimO={0.7} /></Layer>
      <Pill text="STOPPED DEAD IN AIR" y={236} variant="dark" delay={6} size={48} />
      <Pill text="STABLE HOVER: 20 SECONDS" y={316} variant="yellow" delay={loc(19.8, 8)} size={46} />
      <HoverTimer f={f} d={d} />
      <Motes n={30} seed={21} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 09: Hilltop Drone Twist (f 637..716, dur 79)
// "But on that hilltop, they said, even a small"
// ----------------------------------------------------------------
S[9] = () => {
  const f = useCurrentFrame();
  const d = dur(9);
  return (
    <Cam from={{s: 1.0, x: -15, y: 10}} to={{s: 1.15, x: 20, y: -10}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1200} glowX={400} stars={45} /></Layer>
      <Layer depth={0.2}><Ridge seed={47} base={1320} amp={200} fill={AN.ridgeFar} rimO={0.75} /></Layer>
      <Layer depth={0.7}>
        <Svg>
          <Agent x={380} y={1320} scale={1.8} hair="spike" tilt={-18} widen={0.9} look={-0.3} seed={24} />
          <Agent x={700} y={1360} scale={1.75} flip={true} hair="crop" tilt={-14} widen={0.8} look={0.4} seed={25} />
        </Svg>
      </Layer>
      <Slam
        lines={[{text: 'A DRONE 1 MILE AWAY', red: false}, {text: 'WOULD BE LOUD.', red: true}]}
        at={0}
        y={320}
        size={92}
        out={d - 2}
      />
      <Motes n={35} speed={1.5} seed={26} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 10: Acoustic Flatline & Agent Close-up (f 716..783, dur 67)
// "drone a mile away would be loud."
// ----------------------------------------------------------------
S[10] = () => {
  const f = useCurrentFrame();
  const d = dur(10);
  return (
    <Cam from={{s: 1.0, x: 0, y: 0}} to={{s: 1.1, x: 0, y: -8}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1400} glowX={300} stars={50} /></Layer>
      <Layer depth={1.0}>
        <Svg>
          <Agent x={540} y={1160} scale={2.6} flip={true} hair="crop" tilt={-12} widen={1} sweat={0.85} seed={28} />
        </Svg>
      </Layer>
      <AudioFlatline />
      <QuoteStrip
        text="EVEN AT 1.4 MILES A SMALL DRONE WOULD BE CLEARLY AUDIBLE"
        source="AARO INVESTIGATION INTERVIEW"
        at={4}
        y={860}
        out={d - 2}
      />
      <Motes n={22} seed={30} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 11: Fighter Jet Acceleration (f 783..886, dur 103)
// "From a dead stop, it shot sideways, fast as a fighter jet,"
// ----------------------------------------------------------------
S[11] = () => {
  const f = useCurrentFrame();
  const d = dur(11);
  const prog = Math.pow(f / d, 1.8);
  const craftX = 80 + prog * 1700;
  const craftY = 720 + Math.sin(f * 0.1) * 30;

  return (
    <Cam from={{s: 1.0, x: -140, y: 0}} to={{s: 1.35, x: 180, y: -25}} d={d} mode="out" shake={5.5}>
      <Layer depth={0}><DuskSky horizon={1150} glowX={500} stars={35} /></Layer>
      <Layer depth={0.15}><Ridge seed={51} base={1220} amp={220} fill={AN.ridgeFar} rimO={0.8} /></Layer>
      <Layer depth={0.35}>
        <Svg>
          <Triangle
            x={craftX}
            y={craftY}
            w={560}
            tilt={8}
            bank={0.3}
            trail={Math.min(1, f / 18)}
            dir={1}
            edge={0.6}
          />
        </Svg>
      </Layer>
      <Pill text="INSTANT ACCELERATION" y={236} variant="red" delay={loc(26.8, 11)} size={50} />
      <Pill text="FAST AS A FIGHTER JET" y={316} variant="yellow" delay={loc(28.5, 11)} size={48} />
      <Motes n={45} speed={3.0} seed={33} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 12: 60° Bank & Canyon Dive (f 886..953, dur 67)
// "banked, and dove into a canyon."
// ----------------------------------------------------------------
S[12] = () => {
  const f = useCurrentFrame();
  const d = dur(12);
  const diveProg = f / d;
  const craftX = 640 - diveProg * 220;
  const craftY = 440 + diveProg * 780;

  return (
    <Cam from={{s: 1.1, x: 30, y: -40, r: 5}} to={{s: 1.35, x: -30, y: 70, r: -7}} d={d} mode="inout" shake={4.5}>
      <Layer depth={0}><DuskSky horizon={1000} glowX={600} stars={30} /></Layer>
      <Layer depth={0.2}><Ridge seed={56} base={1080} amp={220} fill={AN.ridgeFar} rimO={0.75} /></Layer>
      <Layer depth={0.35}>
        <Svg>
          <Triangle
            x={craftX}
            y={craftY}
            w={500}
            tilt={-54}
            bank={0.68}
            trail={0.7}
            dir={-1}
            edge={0.55}
          />
        </Svg>
      </Layer>
      <Layer depth={0.8}><Ridge seed={60} base={1300} amp={420} fill={AN.ridgeNear} rimO={0.7} /></Layer>
      <Pill text="60° BANK ANGLE" y={236} variant="yellow" delay={loc(29.8, 12)} size={46} />
      <Pill text="TERRAIN-HUGGING CANYON DIVE" y={316} variant="red" delay={loc(30.6, 12)} size={44} />
      <Motes n={38} speed={2.5} seed={36} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 13: Thermal Scope Lost Lock (f 953..1026, dur 73)
// "So fast it left the thermal scope's view."
// ----------------------------------------------------------------
S[13] = () => {
  const f = useCurrentFrame();
  const d = dur(73);
  const outProg = Math.pow(f / 28, 2.2);
  const targetX = 540 + outProg * 650;
  const targetY = 960 - outProg * 320;

  return (
    <Cam from={{s: 1.0, x: -60, y: 30}} to={{s: 1.12, x: 80, y: -40}} d={d} mode="lin" shake={6.0}>
      <ThermalScopeView
        f={f}
        d={d}
        targetX={targetX}
        targetY={targetY}
        targetW={340}
        locked={f < 20}
        trackingLost={f >= 20}
        alertText="TRACKING LOST · FOV EXCEEDED"
        statusLabel={f < 20 ? 'LOCK: AUTO [IR-TRK]' : 'TRACK LOST · SLEW MAX'}
      />
      <Pill text="OUTRAN THERMAL SCOPE" y={236} variant="red" delay={4} size={50} />
      <Pill text="ACCELERATION EXCEEDS SENSOR FOV" y={316} variant="yellow" delay={24} size={44} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 14: Canyon Stillness (f 1026..1079, dur 53)
// "Still, total silence."
// ----------------------------------------------------------------
S[14] = () => {
  const f = useCurrentFrame();
  const d = dur(14);
  return (
    <Cam from={{s: 1.0, y: 0}} to={{s: 1.1, y: -15}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1200} glowX={200} warmth={0.7} stars={60} /></Layer>
      <Layer depth={0.2}><Ridge seed={65} base={1240} amp={220} fill={AN.ridgeFar} rimO={0.7} /></Layer>
      <Layer depth={0.5}><Ridge seed={69} base={1440} amp={260} fill={AN.ridgeMid} rimO={0.65} /></Layer>
      <Layer depth={0.8}>
        <Svg>
          <Shrub x={320} y={1500} s={1.1} sway={f * 0.05} />
          <Shrub x={740} y={1540} s={0.9} sway={f * 0.05 + 1} />
        </Svg>
      </Layer>
      <Pill text="NO IMPACT SIGNATURE" y={236} variant="dark" delay={loc(34.4, 14)} size={48} />
      <Pill text="TOTAL SILENCE" y={316} variant="red" delay={loc(35.0, 14)} size={52} />
      <Motes n={20} speed={0.4} seed={40} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 15: Morning Canyon Ground Search (f 1079..1133, dur 54)
// "Next morning, they searched the canyon."
// ----------------------------------------------------------------
S[15] = () => {
  const f = useCurrentFrame();
  const d = dur(15);
  return (
    <Cam from={{s: 1.0, x: -40, y: 0}} to={{s: 1.15, x: 30, y: -15}} d={d} mode="inout">
      <Layer depth={0}><DuskSky horizon={1100} morning={true} warmth={1.0} /></Layer>
      <Layer depth={0.2}><Ridge seed={74} base={1150} amp={220} fill="#6a7d9b" rim="#ffe2b8" rimO={1.0} /></Layer>
      <Layer depth={0.5}><Ridge seed={78} base={1340} amp={250} fill="#465872" rim="#ffd098" rimO={0.9} /></Layer>
      <Layer depth={0.8}>
        <Svg>
          <Figure x={340 + f * 2.2} y={1500} h={260} dir={1} pose="walk" phase={f * 0.28} coat="#3c4a60" hat={true} skin="#e2a989" />
          <Figure x={200 + f * 2.0} y={1520} h={270} dir={1} pose="walk" phase={f * 0.28 + 0.8} coat="#3c4a60" skin="#e2a989" />
        </Svg>
      </Layer>
      <Layer depth={1.1}>
        <Svg><Shrub x={780} y={1620} s={1.2} col="#6e8a56" sway={f * 0.08} /></Svg>
      </Layer>
      <Pill text="NEXT MORNING" y={236} variant="yellow" delay={loc(36.1, 15)} size={50} />
      <Pill text="GROUND SEARCH TEAM" y={316} variant="dark" delay={loc(36.9, 15)} size={44} />
      <Motes n={25} color="#fff4d0" o={0.4} seed={43} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 16: Zero Scarring / Pristine Plants (f 1133..1240, dur 107)
// "No wreckage. No scarred ground. Not one damaged plant."
// ----------------------------------------------------------------
S[16] = () => {
  const f = useCurrentFrame();
  const d = dur(16);
  return (
    <Cam from={{s: 1.0, x: -20, y: 15}} to={{s: 1.2, x: 30, y: -15}} d={d} mode="inout">
      <Layer depth={0}><DuskSky horizon={1200} morning={true} warmth={0.85} /></Layer>
      <Layer depth={0.3}><Ridge seed={83} base={1300} amp={200} fill="#546680" rim="#ffdcb0" rimO={0.85} /></Layer>
      <Layer depth={0.9}>
        <Svg>
          <Shrub x={320} y={1200} s={1.4} col="#75945c" sway={f * 0.06} />
          <Shrub x={720} y={1260} s={1.2} col="#65844c" sway={f * 0.06 + 1.2} />
        </Svg>
      </Layer>
      <Pill text="NO WRECKAGE" y={236} variant="yellow" delay={loc(38.0, 16)} size={52} />
      <Pill text="NO SCARRED GROUND" y={316} variant="yellow" delay={loc(38.8, 16)} size={52} />
      <Pill text="NOT ONE DAMAGED PLANT" y={396} variant="red" delay={loc(40.0, 16)} size={52} />
      <Motes n={22} color="#fff2cc" o={0.4} seed={46} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 17: Document Contradiction Dossier (f 1240..1424, dur 184)
// "And the agents' own FBI statement says it lasted three seconds. The Pentagon's record: over thirty."
// ----------------------------------------------------------------
S[17] = () => {
  const f = useCurrentFrame();
  const d = dur(17);
  return (
    <Cam from={{s: 1.0, x: 0, y: 0}} to={{s: 1.18, x: 0, y: -18}} d={d} mode="out">
      <Layer depth={0}><DuskSky horizon={1300} glowX={350} stars={50} /></Layer>
      <Layer depth={0.3}><Ridge seed={88} base={1360} amp={220} fill={AN.ridgeFar} rimO={0.7} /></Layer>
      <DocumentConflict />
      <Layer depth={1.0}>
        <Svg>
          <Agent x={620} y={1260} scale={2.0} hair="spike" tilt={-6} widen={0.7} look={0.2} seed={49} />
        </Svg>
      </Layer>
      <QuoteStrip
        text="a substantial, nonreflective, dark black triangular object"
        source="FBI SPECIAL AGENT REPORT"
        at={loc(42.0, 17)}
        y={880}
        out={loc(44.0, 17)}
      />
      <Slam
        lines={[{text: 'FBI: 3 SEC', red: false}, {text: 'PENTAGON: 30+ SEC', red: true}]}
        at={loc(44.09, 17)}
        y={320}
        size={96}
        out={d - 2}
      />
      <Motes n={28} seed={50} />
    </Cam>
  );
};

// ----------------------------------------------------------------
// Scene 18: Loop Ending (f 1424..1569, dur 145)
// "So who's right, the Pentagon, or the two federal agents?"
// Visual: Same dusk ridge + 2 agents framing as frame 0, camera pulls back to frame-0 framing while the triangle re-emerges
// ----------------------------------------------------------------
S[18] = () => {
  const f = useCurrentFrame();
  const d = dur(18);
  return (
    <Cam from={{s: 1.25, x: 0, y: -25}} to={{s: 1.0, x: 0, y: 0}} d={d} mode="inout">
      <Layer depth={0}><DuskSky horizon={1200} glowX={380} warmth={1.1} stars={30} /></Layer>
      <Layer depth={0.15}><Ridge seed={3} base={1240} amp={180} fill={AN.ridgeFar} rimO={0.9} /></Layer>
      {/* Re-emerging triangle matching Scene 0 */}
      <Layer depth={0.25}>
        <Svg><Triangle x={540} y={1200 - f * 0.4} w={380} tilt={0} edge={0.4} /></Svg>
      </Layer>
      <Layer depth={0.4}><Ridge seed={7} base={1380} amp={220} fill={AN.ridgeMid} rimO={0.8} hatch={true} /></Layer>
      <Layer depth={0.7}><Ridge seed={11} base={1560} amp={260} fill={AN.ridgeNear} rimO={0.7} /></Layer>
      <Layer depth={1.0}>
        <Svg>
          {/* Exactly matching Scene 0 framing */}
          <Agent x={360} y={1480} scale={1.45} hair="spike" binos={0.9} tilt={-14} widen={0.7} seed={1} />
          <Agent x={740} y={1520} scale={1.4} flip={true} hair="crop" tilt={-10} look={0.4} widen={0.5} seed={2} />
        </Svg>
      </Layer>
      <Slam
        lines={[{text: 'THE PENTAGON?', red: false}, {text: 'OR THE 2 AGENTS?', red: true}]}
        at={0}
        y={320}
        size={98}
        out={d - 6}
      />
      <Pill text="FBI-UAP-D043 (FD-302)" y={1160} variant="dark" delay={loc(48.8, 18)} size={42} />
      <Pill text="DOW-UAP-D176 (AARO MFR)" y={1230} variant="dark" delay={loc(49.8, 18)} size={42} />
      <EndCard
        sources={['WAR.GOV: PURSUE RELEASE 07', 'FBI FD-302', 'AARO MFR']}
        delay={loc(50.5, 18)}
      />
      <Motes n={32} seed={52} />
    </Cam>
  );
};

// ================================================================
// ROOT COMPONENT
// ================================================================
export const GemTriangle = () => {
  return (
    <AbsoluteFill style={{background: '#07070e'}}>
      <AnimeFonts />
      {S.map((Cmp, i) => {
        const from = C[i];
        const to = i === S.length - 1 ? GEMTRI_FRAMES : C[i + 1];
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <Cmp />
            {i > 0 && <Dip inFrames={3} color="#07070e" />}
          </Sequence>
        );
      })}
      <AnimeFinish leaks={C} vignette={0.52} grainO={0.2} />
      <WordCaption words={W} y={1310} />
    </AbsoluteFill>
  );
};
