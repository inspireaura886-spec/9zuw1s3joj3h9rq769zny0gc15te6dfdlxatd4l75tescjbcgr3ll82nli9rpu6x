// Character sheet v2 (crew overhaul 2026-11-02): new Pip / Bolt / Zib + Pip hair-colour strip (hairColor prop).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage, Cam, Char, Stars, Planet, Lights, SciFonts, Vignette} from './kit.jsx';
import {Deck} from './sets.jsx';
import {DRAW, CARD, PIP_HAIR} from './cast.js';
const ROWS = [
  ['Pip', 'Lovable slacker genius. Explains wild science like it\'s no big deal.', '#ff9a4d'],
  ['Bolt', 'Exhausted android. Smartest in the room, and she knows it.', '#6fe5ff'],
  ['Zib', 'Adorable chaos. Presses the button that starts every what-if.', '#9be36a'],
];
const HAIR = [['ginger (default)', PIP_HAIR.ginger], ['teal + pink', [PIP_HAIR.teal, PIP_HAIR.pink]], ['violet', PIP_HAIR.violet]];
/** Pip head crop drawn straight to a canvas (design-space x 150..450, y 0..380) */
const PipHead = ({hair, k = 0.5}) => {
  const R = 2;
  return <div style={{width: 300 * k, height: 352 * k, overflow: 'hidden', position: 'relative'}}>
    <canvas width={CARD.W * R} height={CARD.H * R} style={{position: 'absolute', left: -300 * k, top: 0, width: CARD.W * k, height: CARD.H * k}}
      ref={(c) => { if (!c) return; const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.scale(R, R); g.translate(CARD.PAD, 0); DRAW.PIP(g, {hairColor: hair, expr: 'happy', headTilt: 0}); }} />
  </div>;
};
export const SheetV2 = () => (
  <AbsoluteFill style={{background: '#0b0b22'}}>
    <SciFonts />
    <Stage overlay={<>
      <div style={{position: 'absolute', top: 70, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 92, color: '#fff', letterSpacing: 3, textShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>THE WHAT-IF CREW</div>
      <div style={{position: 'absolute', top: 178, width: '100%', textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 32, color: '#ffb547', letterSpacing: 2}}>IA SCIENCE · CHARACTER SHEET v2 (TEST)</div>
      <div style={{position: 'absolute', top: 1104, left: 70, right: 70, height: 226, borderRadius: 22, background: 'rgba(10,8,30,0.72)', border: '4px solid rgba(255,154,77,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 20px'}}>
        <div style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 26, color: '#ffcf9e', width: 150, lineHeight: 1.2}}>PIP'S HAIR<br/><span style={{fontWeight: 600, fontSize: 21, color: '#e9e4ff'}}>any colour, swappable</span></div>
        {HAIR.map(([n, h]) => <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <PipHead hair={h} k={0.5} />
          <div style={{fontFamily: 'Montserrat', fontWeight: 700, fontSize: 21, color: '#f2f0ff', marginTop: 2}}>{n}</div></div>)}
      </div>
      <div style={{position: 'absolute', top: 1350, left: 70, right: 70}}>
        {ROWS.map(([n, d, c]) => <div key={n} style={{margin: '0 0 20px', padding: '14px 26px 16px', borderRadius: 22, background: 'rgba(10,8,30,0.82)', border: `5px solid ${c}`}}>
          <div style={{fontFamily: 'Lilita One', fontSize: 52, color: c, lineHeight: 1.05}}>{n}</div>
          <div style={{fontFamily: 'Montserrat', fontWeight: 700, fontSize: 31, color: '#f2f0ff', lineHeight: 1.25}}>{d}</div></div>)}
      </div>
      <Vignette /></>}>
      <Cam pos={[0, 1.1, 7.8]} look={[0, 0.36, 0]} fov={34}>
        <Lights />
        <Stars />
        <Planet file="science/earth_toon.png" r={7} pos={[2, 4, -40]} rotY={2.2} tilt={0.4} atmo="#7fc8ff" />
        <Planet file="science/moon_toon.png" r={1.7} pos={[8.3, 16.2, -42]} />
        <Deck />
        <Char who="PIP" pos={[-0.88, 0.045, 0.1]} expr="happy" armR={24} foreR={96} armL={6} foreL={16} headTilt={-4} />
        <Char who="BOLT" pos={[0.9, 0.045, -0.45]} narrow={0.35} look={-0.6} />
        <Char who="ZIB" pos={[0.2, 0.045, -0.1]} h={1.19} expr="happy" armR={45} armL={18} item="remote" />
      </Cam>
    </Stage>
  </AbsoluteFill>
);
