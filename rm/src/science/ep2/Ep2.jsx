// TEST Short 2 (NOT for posting): What if you fell through a hole through the Earth?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage, Cam, Actor, Stars, Planet, Ball, Ring, Arrow, Lights, SciFonts, Captions, Title, Label, EndQ, Flash, Vignette, Mark, Shots,
  sstep, clamp, lineF, wordF, FPS, glide, med, push, DG, GROUP} from '../kit.jsx';
import {EarthCut} from '../sets.jsx';
import VO from './vo.json';
import SCH from '../schemes.json';

const S = SCH.ep2;
export const EP2_FRAMES = Math.round(VO.dur * FPS);
const L = (i) => lineF(VO, i);
const W = (i, p) => wordF(VO, i, p);
const EARTH = 'science/earth_toon.png';
const PR = 3; // tiny-planet radius, north pole at y = 0

/** tiny Earth with a hole at the north pole (top at y = 0) */
const TinyEarth = ({f, flip = false}) => (
  <group rotation={[0, 0, flip ? Math.PI : 0]} position={[0, flip ? -2 * PR : 0, 0]}>
    <Planet file={EARTH} r={PR} pos={[0, -PR, 0]} rotY={0.35} tilt={Math.PI / 2} atmo="#7fc8ff" ink={1.012} />
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.36, 40]} /><meshBasicMaterial color="#120a16" /></mesh>
    <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.36, 0.44, 40]} /><meshBasicMaterial color="#8a5a3c" /></mesh>
    {[[-0.55, 0.05, -0.2], [0.5, 0.05, 0.25], [0.2, 0.04, -0.45]].map((p, i) => <Ball key={i} r={0.07 + i * 0.02} pos={p} color="#8a5a3c" ink={1.1} />)}
  </group>
);
const World = ({children, f}) => (<><Lights sun={[6, 6, 8]} /><Stars />{children}</>);
const HOOK = {pos: [0.1, 1.0, 4.3], look: [0, 0.5, 0], fov: 46};
/** Zib inside the cut-away diagram: u in [-1, 1] = position along the tunnel (1 = top surface) */
const CUT = {y: 2.0, R: 1.6};
const ZibIn = ({f, t, u, expr = 'happy', arms = 150}) => <Actor who="ZIB" vo={VO} t={t} pos={[0, CUT.y + u * CUT.R - 0.25, 0.05]} h={0.5} expr={expr} armL={arms} armR={arms} shadow={false} seed={3} />;
const Streaks = ({u, dir = 1, k = 1}) => k <= 0.02 ? null : (<>{[-0.12, 0.12].map((x, i) => (
  <mesh key={i} position={[x, CUT.y + u * CUT.R + dir * (0.35 + i * 0.05), 0.04]}><planeGeometry args={[0.025, 0.5 * k]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.7 * k} /></mesh>))}</>);
const Presenter = ({who, t, x = -0.95, ...p}) => <Actor who={who} vo={VO} t={t} pos={[x, 0.44, 3.5]} shadow={false} seed={who === 'PIP' ? 1 : who === 'BOLT' ? 2 : 3} {...p} />;

const JUMP0 = W(1, 'wheee'), JUMPE = JUMP0 + 16; // Zib leaps into the hole
const JUMP2 = W(12, 'wheee') - 6; // end: leaps again (loop)
const leap = (f, f0, from = [0.5, -0.06, 0.4]) => { const u = clamp((f - f0) / 20); if (u <= 0) return from; const k = sstep(u / 0.7);
  const y = u < 0.45 ? from[1] + 0.8 * Math.sin(Math.PI / 2 * u / 0.45) : from[1] + 0.8 - 2.2 * sstep((u - 0.45) / 0.55);
  return [from[0] * (1 - k), y, from[2] * (1 - k)]; };

const shots = [
  // 0 PIP with shovel next to the hole on a tiny Earth (hook)
  {from: 0, render: (f, t) => { const c = glide(f, 0, L(1), HOOK, push(HOOK, 0.08));
    return <Cam {...c}><World f={f}><TinyEarth f={f} />
      <Actor who="PIP" vo={VO} t={t} pos={[-0.45, -0.04, 0]} expr="happy" armR={40} item="shovel" look={0.5} seed={1} />
      <Actor who="ZIB" vo={VO} t={t} pos={[0.5, -0.06, 0.4]} expr="smug" armR={25} armL={25} look={-0.6} seed={3} />
    </World></Cam>; }},
  // 1 ZIB "Dibs! Wheee!" leaps in
  {from: L(1), render: (f, t) => { const A = {pos: [0.2, 1.0, 3.2], look: [0.1, 0.35, 0], fov: 44}; const c = glide(f, L(1), L(2), A, push(A, 0.1));
    const p = leap(f, JUMP0 - 4); const gone = p[1] < -0.95;
    return <Cam {...c}><World f={f}><TinyEarth f={f} />
      <Actor who="PIP" vo={VO} t={t} pos={[-0.45, -0.04, 0]} expr="shock" armL={140} armR={40} item="shovel" look={0.6} seed={1} />
      {!gone && <Actor who="ZIB" vo={VO} t={t} pos={p} expr="happy" armL={160} armR={160} seed={3} shadow={f < JUMP0 - 4 || p[1] < -10} />}
    </World></Cam>; }},
  // 2 BOLT: assumptions
  {from: L(2), render: (f, t) => { const A = med(0.75, 0.1, 1.7, 3.2, 0.3); const c = glide(f, L(2), L(3), A, push(A));
    return <Cam {...c}><World f={f}><TinyEarth f={f} />
      <Actor who="BOLT" vo={VO} t={t} pos={[0.75, -0.1, 0.1]} expr="deadpan" look={-0.4} armL={40} seed={2} />
    </World></Cam>; }},
  // 3 PIP: falling faster every second (cut-away, top -> 0.35R)
  {from: L(3), render: (f, t, lf, p) => { const c = glide(f, L(3), L(4), DG, push(DG, 0.1));
    const u = Math.cos(Math.PI / 2 * 0.62 * sstep(p * 1.1));
    return <Cam {...c}><World f={f}>
      <group position={[0, CUT.y, 0]} rotation={[0, 0.5, 0]} scale={[CUT.R / 3, CUT.R / 3, CUT.R / 3]}><EarthCut R={3} /></group>
      <ZibIn f={f} t={t} u={u} /><Streaks u={u} k={sstep(p * 2)} />
      <Presenter who="PIP" t={t} expr="happy" armR={100} look={0.8} />
    </World></Cam>; }},
  // 4 BOLT: ~8 km/s near the centre
  {from: L(4), render: (f, t, lf, p) => { const c = glide(f, L(4), L(5), push(DG, 0.1), push(DG, 0.2));
    const u = Math.cos(Math.PI / 2 * (0.62 + 0.38 * sstep(p)));
    return <Cam {...c}><World f={f}>
      <group position={[0, CUT.y, 0]} rotation={[0, 0.5, 0]} scale={[CUT.R / 3, CUT.R / 3, CUT.R / 3]}><EarthCut R={3} /></group>
      <ZibIn f={f} t={t} u={u} /><Streaks u={u} k={1} />
      <Presenter who="BOLT" t={t} x={0.95} expr="deadpan" look={-0.6} armL={100} />
    </World></Cam>; }},
  // 5 ZIB "I'm a comet!" (close in the tunnel at the core)
  {from: L(5), render: (f, t, lf, p) => { const A = {pos: [0, CUT.y, 1.6], look: [0, CUT.y, 0], fov: 40}; const c = glide(f, L(5), L(6), A, push(A, 0.1));
    const u = -0.08 * sstep(p);
    return <Cam {...c}><World f={f}>
      <group position={[0, CUT.y, 0]} rotation={[0, 0.5, 0]} scale={[CUT.R / 3, CUT.R / 3, CUT.R / 3]}><EarthCut R={3} glowCore={0.6} /></group>
      <Actor who="ZIB" vo={VO} t={t} pos={[0, CUT.y + u * CUT.R - 0.3, 0.06]} h={0.6} expr="happy" armL={160} armR={160} shadow={false} seed={3} />
      <Streaks u={u + 0.15} k={1} />
    </World></Cam>; }},
  // 6 PIP: past the centre gravity pulls back -> slows to the far surface
  {from: L(6), render: (f, t, lf, p) => { const c = glide(f, L(6), L(7), DG, push(DG, 0.1));
    const u = -Math.sin(Math.PI / 2 * sstep(p * 1.05));
    const zy = CUT.y + u * CUT.R;
    return <Cam {...c}><World f={f}>
      <group position={[0, CUT.y, 0]} rotation={[0, 0.5, 0]} scale={[CUT.R / 3, CUT.R / 3, CUT.R / 3]}><EarthCut R={3} /></group>
      <ZibIn f={f} t={t} u={u} expr={p > 0.6 ? 'worry' : 'happy'} /><Streaks u={u} dir={1} k={1 - sstep(p * 1.1)} />
      <Arrow a={[0.32, zy - 0.05, 0.06]} b={[0.32, zy + Math.min(0.5, -u * CUT.R * 0.6) + 0.05, 0.06]} color="#ffb547" w={0.035} opacity={sstep((f - W(6, 'gravity')) / 8) * (u < -0.15 ? 1 : 0)} />
      <Presenter who="PIP" t={t} expr="happy" armR={100} look={0.8} />
    </World></Cam>; }},
  // 7 BOLT: 38 minutes (PREM / seismic data)
  {from: L(7), render: (f, t, lf, p) => { const c = glide(f, L(7), L(8), push(DG, 0.1), DG);
    return <Cam {...c}><World f={f}>
      <group position={[0, CUT.y, 0]} rotation={[0, 0.5, 0]} scale={[CUT.R / 3, CUT.R / 3, CUT.R / 3]}><EarthCut R={3} /></group>
      <ZibIn f={f} t={t} u={-0.98} expr="worry" arms={20} />
      <Presenter who="BOLT" t={t} x={0.95} expr="deadpan" look={-0.6} armL={100} />
    </World></Cam>; }},
  // 8 PIP: textbooks 42 -> heavy core makes it 38
  {from: L(8), render: (f, t, lf, p) => { const c = glide(f, L(8), L(9), DG, push(DG, 0.12));
    const g = sstep((f - W(8, 'heavy') + 2) / 10) * (0.6 + 0.4 * Math.sin((f - L(8)) / 9));
    return <Cam {...c}><World f={f}>
      <group position={[0, CUT.y, 0]} rotation={[0, 0.5, 0]} scale={[CUT.R / 3, CUT.R / 3, CUT.R / 3]}><EarthCut R={3} glowCore={g} /></group>
      <ZibIn f={f} t={t} u={-0.98} expr="worry" arms={20} />
      <Presenter who="PIP" t={t} expr="happy" armR={100} look={0.8} />
    </World></Cam>; }},
  // 9 ZIB pops out of the far side (planet flipped), then sinks back
  {from: L(9), render: (f, t, lf, p) => { const A = {pos: [0.1, 0.8, 2.6], look: [0, 0.35, 0], fov: 44}; const c = glide(f, L(9), L(10), A, push(A, 0.1));
    const up = sstep((f - L(9) + 2) / 10), down = sstep((f - W(9, 'down') + 2) / 12);
    const y = -0.85 + 0.85 * up - 0.95 * down;
    return <Cam {...c}><World f={f}><TinyEarth f={f} flip />
      {y > -0.84 && <Actor who="ZIB" vo={VO} t={t} pos={[0, y, 0]} expr={down > 0.01 || f > W(9, 'wait') ? 'shock' : 'happy'} armL={150} armR={f > W(9, 'wait') ? 150 : 40} seed={3} shadow={false} />}
      <mesh position={[0, 0.03, 0.22]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.0, 0.45]} /><meshBasicMaterial color="#0b0b22" transparent opacity={0} /></mesh>
    </World></Cam>; }},
  // 10 BOLT: back and forth forever (SHM)
  {from: L(10), render: (f, t, lf, p) => { const c = glide(f, L(10), L(11), DG, push(DG, 0.1));
    const u = -Math.cos(Math.PI * (f - L(10)) / 45);
    return <Cam {...c}><World f={f}>
      <group position={[0, CUT.y, 0]} rotation={[0, 0.5, 0]} scale={[CUT.R / 3, CUT.R / 3, CUT.R / 3]}><EarthCut R={3} /></group>
      <ZibIn f={f} t={t} u={u} /><Streaks u={u} dir={Math.sin(Math.PI * (f - L(10)) / 45) > 0 ? -1 : 1} k={Math.abs(Math.sin(Math.PI * (f - L(10)) / 45))} />
      <Presenter who="BOLT" t={t} x={0.95} expr="deadpan" look={-0.6} armL={100} />
    </World></Cam>; }},
  // 11 PIP question: group on the tiny Earth
  {from: L(11), render: (f, t) => { const A = {pos: [0, 1.25, 6.2], look: [0, 0.45, 0], fov: 36}; const c = glide(f, L(11), L(12), A, push(A, 0.04));
    return <Cam {...c}><World f={f}><TinyEarth f={f} />
      <Actor who="PIP" vo={VO} t={t} pos={[-0.7, -0.08, 0]} expr="happy" armR={110} item="shovel" look={0.4} seed={1} />
      <Actor who="BOLT" vo={VO} t={t} pos={[0.8, -0.11, -0.2]} expr="deadpan" look={-0.4} seed={2} />
      <Actor who="ZIB" vo={VO} t={t} pos={[0.05, -0.02, 0.9]} expr="smug" armR={30} seed={3} look={-0.5} />
    </World></Cam>; }},
  // 12 ZIB leaps again -> glides into the frame-0 framing (loop)
  {from: L(12), render: (f, t) => { const c = glide(f, L(12), EP2_FRAMES - 1, push(HOOK, 0.12), HOOK);
    const p = leap(f, JUMP2, [0.5, -0.06, 0.45]); const gone = p[1] < -0.95;
    return <Cam {...c}><World f={f}><TinyEarth f={f} />
      <Actor who="PIP" vo={VO} t={t} pos={[-0.45, -0.04, 0]} expr="shock" armR={40} item="shovel" look={0.5} seed={1} />
      {!gone && <Actor who="ZIB" vo={VO} t={t} pos={p} expr="happy" armL={160} armR={160} seed={3} shadow={f < JUMP2} />}
    </World></Cam>; }},
];

export const Ep2 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b0b22'}}>
      <SciFonts />
      <Stage overlay={<>
        <Vignette />
        <Title lines={['WHAT IF YOU FELL', 'THROUGH EARTH?']} scheme={S} out={70} y={250} />
        <Label text="NO AIR · NO HEAT" sub="thought experiment" at={W(2, 'air')} to={L(3) - 4} scheme={S} />
        <Label text="FASTER EVERY SECOND" at={W(3, 'faster')} to={L(4) - 4} scheme={S} size={70} />
        <Label text="≈ 8 km/s" sub="at the centre (simple model)" at={W(4, 'eight')} to={L(5) - 4} scheme={S} />
        <Label text="GRAVITY PULLS BACK" sub="he slows down" at={W(6, 'gravity')} to={L(7) - 4} scheme={S} size={72} />
        <Label text="38 MINUTES" sub="real Earth, seismic data (Klotz 2015)" at={W(7, 'thirty')} to={L(8) - 4} scheme={S} />
        <Label text="42 → 38 MIN" sub="dense core = faster fall" at={W(8, 'forty')} to={L(9) - 4} scheme={S} />
        <Label text="BACK & FORTH" sub="forever (no air)" at={W(10, 'back')} to={L(11) - 4} scheme={S} />
        <EndQ text="Would you jump in? YES or NO?" at={L(11)} to={EP2_FRAMES} scheme={S} />
        <Captions vo={VO} scheme={S} />
        <Mark />
      </>}>
        <Shots shots={shots} f={f} />
      </Stage>
    </AbsoluteFill>
  );
};
