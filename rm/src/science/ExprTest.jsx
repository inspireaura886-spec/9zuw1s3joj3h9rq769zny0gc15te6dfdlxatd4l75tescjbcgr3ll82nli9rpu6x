// 3.5 s expression test (crew v2): Bolt's eyes narrow (0-1.2 s), Zib squish (1.2-2.3 s), Pip shrug (2.3-3.5 s).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage, Cam, Char, Stars, Planet, Lights, SciFonts, Vignette, keyed} from './kit.jsx';
import {Deck} from './sets.jsx';
export const EXPR_FRAMES = 105;
export const ExprTest = () => {
  const f = useCurrentFrame();
  const narrow = keyed([{f: 6, v: 0}, {f: 26, v: 1}, {f: 92, v: 1}, {f: 104, v: 0.4}], f);
  const boltLook = keyed([{f: 0, v: 0}, {f: 14, v: -0.7}], f);
  const sq = f < 36 ? 0 : f < 46 ? keyed([{f: 36, v: 0}, {f: 42, v: 1}, {f: 46, v: 0.9}], f) : keyed([{f: 46, v: 0.9}, {f: 54, v: -0.55}, {f: 60, v: 0.25}, {f: 66, v: -0.08}, {f: 70, v: 0}], f);
  const zibExpr = f >= 44 && f < 70 ? 'shock' : 'happy';
  const shrug = keyed([{f: 70, v: 0}, {f: 82, v: 1}, {f: 100, v: 1}], f);
  const label = f < 36 ? 'BOLT · eyes narrow' : f < 70 ? 'ZIB · squish' : 'PIP · shrug';
  return (
    <AbsoluteFill style={{background: '#0b0b22'}}>
      <SciFonts />
      <Stage overlay={<>
        <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 70, color: '#fff'}}>EXPRESSION TEST</div>
        <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 40, color: '#ffb547'}}>{label}</div>
        <Vignette /></>}>
        <Cam pos={[0, 1.0, 5.9]} look={[0, 1.02, 0]} fov={34}>
          <Lights />
          <Stars />
          <Planet file="science/earth_toon.png" r={7} pos={[2, 4, -40]} rotY={2.2} tilt={0.4} atmo="#7fc8ff" />
          <Deck />
          <Char who="PIP" pos={[-0.5, 0.045, 0.05]} shrug={shrug} expr="happy" headTilt={-3 - 3 * shrug} blink={f > 94 && f < 99 ? 1 : 0} />
          <Char who="BOLT" pos={[0.62, 0.045, -0.45]} narrow={narrow} look={boltLook} />
          <Char who="ZIB" pos={[0.04, 0.045, 0.3]} h={1.19} squish={sq} expr={zibExpr} armR={40} armL={18} item="remote" glow={f >= 38 && f < 50 ? 1 : 0.5} />
        </Cam>
      </Stage>
    </AbsoluteFill>
  );
};
