// TEST Short 3 (NOT for posting): What if you had a teaspoon of neutron star?
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage, Cam, Actor, Stars, Ball, Box, Cyl, Ring, Arrow, Lights, SciFonts, Captions, Title, Label, EndQ, Flash, Vignette, Mark, Shots,
  sstep, clamp, lineF, wordF, FPS, glide, med, push, DG, GROUP} from '../kit.jsx';
import {Lab} from '../sets.jsx';
import VO from './vo.json';
import SCH from '../schemes.json';

const S = SCH.ep3;
export const EP3_FRAMES = Math.round(VO.dur * FPS);
const L = (i) => lineF(VO, i);
const W = (i, p) => wordF(VO, i, p);
const pulse = (f) => 0.65 + 0.35 * Math.sin(f / 7);
const LabSet = ({children}) => (<><Lights sun={[4, 7, 6]} amb={1.0} keyI={1.3} /><Lab />{children}</>);
const Void = ({children}) => (<><Lights sun={[5, 6, 8]} /><Stars n={700} />{children}</>);
const Presenter = ({who, t, x = -0.95, ...p}) => <Actor who={who} vo={VO} t={t} pos={[x, 0.44, 3.5]} shadow={false} seed={who === 'PIP' ? 1 : who === 'BOLT' ? 2 : 3} {...p} />;
const ZHOOK = med(0, 0, 0.85, 2.0, 0.15);
const BOOM = W(8, 'explosion');

/** glowing neutron-star matter blob */
const Blob = ({pos, r = 0.08, f, s = 1}) => <Ball r={r} scale={s} pos={pos} color="#eaf6ff" emissive="#7fb8ff" glow="#8cc8ff" glowS={2.2} glowO={0.35 * pulse(f)} ink={1.06} />;
/** spoon prop lying flat (3D) */
const Spoon = ({pos, f}) => (<group position={pos}>
  <Box size={[0.5, 0.03, 0.06]} pos={[0.3, 0, 0]} color="#d7dde3" ink={0.012} />
  <Ball r={0.11} pos={[0, 0.02, 0]} color="#d7dde3" ink={1.08} />
  <Blob pos={[0, 0.1, 0]} r={0.06} f={f} />
</group>);

const shots = [
  // 0 ZIB holds up the glowing spoon (hook)
  {from: 0, render: (f, t) => { const c = glide(f, 0, L(1), ZHOOK, push(ZHOOK, 0.08));
    return <Cam {...c}><LabSet>
      <Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="happy" armR={120} armL={30} item="spoon" glow={pulse(f)} seed={3} />
      <Actor who="PIP" vo={VO} t={t} pos={[1.3, 0, -1.8]} expr="shock" look={-0.6} seed={1} />
    </LabSet></Cam>; }},
  // 1 PIP "Zib. Do not. Drop it."
  {from: L(1), render: (f, t) => { const A = med(0.3, -0.5, 1.5, 2.8, -0.2); const c = glide(f, L(1), L(2), A, push(A));
    return <Cam {...c}><LabSet>
      <Actor who="PIP" vo={VO} t={t} pos={[0.3, 0, -0.5]} expr="shock" armL={100} armR={100} look={-0.4} seed={1} />
    </LabSet></Cam>; }},
  // 2 BOLT: about a billion tons = a mountain (balance stays level)
  {from: L(2), render: (f, t) => { const c = glide(f, L(2), L(3), DG, push(DG, 0.1));
    const k = sstep((f - W(2, 'mountain') + 4) / 10);
    return <Cam {...c}><Void>
      <Cyl r={0.08} r2={0.22} h={0.9} pos={[0, 1.15, 0]} color="#8d97a3" />
      <Box size={[2.6, 0.09, 0.4]} pos={[0, 1.65, 0]} color="#f08a2c" />
      {k > 0.001 && <group position={[-0.85, 1.7, 0]} scale={[k * 0.8, k * 0.8, k * 0.8]}>
        <Cyl r={0.0001} r2={0.75} h={1.2} pos={[0, 0.6, 0]} color="#7a8a9a" seg={7} />
        <Cyl r={0.0001} r2={0.29} h={0.46} pos={[0, 0.97, 0]} color="#ffffff" seg={7} ink={0.02} />
      </group>}
      <group position={[0.75, 1.75, 0]} scale={[1.8, 1.8, 1.8]}><Spoon pos={[0, 0, 0]} f={f} /></group>
      <Presenter who="BOLT" t={t} x={0.95} expr="deadpan" look={-0.6} armL={100} />
    </Void></Cam>; }},
  // 3 PIP: a giant star collapses into a city-sized neutron star
  {from: L(3), render: (f, t) => { const c = glide(f, L(3), L(4), DG, push(DG, 0.12));
    const col = sstep((f - W(3, 'collapses') + 2) / 26);
    const r = 1.5 - 1.28 * col;
    return <Cam {...c}><Void>
      <Ball r={1} scale={r} pos={[0, 2.1, 0]} color={col < 0.85 ? '#ff9a3d' : '#dff0ff'} emissive={col < 0.85 ? '#c2410c' : '#6fa8ff'} glow={col < 0.85 ? '#ffb547' : '#8cc8ff'} glowS={1.5} glowO={0.35} />
      {col > 0.85 && <Ring pos={[0, 2.1, 0.1]} r={0.3 + (col - 0.85) * 8} color="#8cc8ff" opacity={Math.max(0, 1 - (col - 0.85) * 6.6)} />}
      <Presenter who="PIP" t={t} expr={col > 0.2 && col < 0.95 ? 'shock' : 'happy'} armR={100} look={0.8} />
    </Void></Cam>; }},
  // 4 ZIB "So it's heavy. I'm strong!"
  {from: L(4), render: (f, t) => { const A = med(0, 0, 0.85, 2.0, -0.15); const c = glide(f, L(4), L(5), A, push(A, 0.1));
    return <Cam {...c}><LabSet><Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="smug" armL={160} armR={160} item="spoon" glow={pulse(f)} seed={3} /></LabSet></Cam>; }},
  // 5 BOLT "Weight is not the problem."
  {from: L(5), render: (f, t) => { const A = med(-0.4, -0.6, 1.7, 2.8, 0.3); const c = glide(f, L(5), L(6), A, push(A, 0.1));
    return <Cam {...c}><LabSet><Actor who="BOLT" vo={VO} t={t} pos={[-0.4, 0, -0.6]} expr="deadpan" look={0.5} seed={2} /></LabSet></Cam>; }},
  // 6 PIP: gravity squeezes it out there; on Earth nothing holds it
  {from: L(6), render: (f, t) => { const c = glide(f, L(6), L(7), DG, push(DG, 0.1));
    const a1 = sstep((f - W(6, 'crushing')) / 8), a2 = sstep((f - W(6, 'nothing')) / 8);
    const ins = [0, 1, 2, 3, 4, 5].map((i) => [Math.cos(i * Math.PI / 3), Math.sin(i * Math.PI / 3)]);
    return <Cam {...c}><Void>
      <Ball r={0.35} pos={[0, 3.0, 0]} color="#dff0ff" emissive="#6fa8ff" glow="#8cc8ff" glowS={1.6} glowO={0.3} />
      {ins.map(([x, y], i) => <Arrow key={i} a={[x * 0.95, 3.0 + y * 0.95, 0]} b={[x * 0.48, 3.0 + y * 0.48, 0]} color="#ffb547" w={0.035} opacity={a1} />)}
      <Spoon pos={[0, 1.15, 0]} f={f} />
      {ins.map(([x, y], i) => <Arrow key={'o' + i} a={[x * 0.2, 1.27 + y * 0.2, 0]} b={[x * 0.62, 1.27 + y * 0.62, 0]} color="#ff8fb1" w={0.03} opacity={a2} />)}
      <Presenter who="PIP" t={t} expr={a2 > 0.5 ? 'worry' : 'happy'} armR={100} look={0.8} />
    </Void></Cam>; }},
  // 7 BOLT: like opening a shaken soda (cap pops, foam rises smoothly)
  {from: L(7), render: (f, t) => { const c = glide(f, L(7), L(8), DG, push(DG, 0.1));
    const op = (f - W(7, 'opening') - 4) / 30;
    return <Cam {...c}><Void>
      <Cyl r={0.42} h={1.3} pos={[0, 1.6, 0]} color="#e2453c" />
      <Cyl r={0.425} h={0.32} pos={[0, 1.6, 0]} color="#f4f3ef" ink={0} />
      <Cyl r={0.36} h={0.06} pos={[0, 2.29 + Math.max(0, op) * 2.2, 0]} rot={[0, 0, Math.max(0, op) * 1.2]} color="#c7d0d8" />
      {op > 0 && Array.from({length: 9}).map((_, i) => { const u = clamp(op * 1.4 - i * 0.07); return u <= 0 ? null : <Ball key={i} r={0.13 + 0.04 * (i % 3)} scale={sstep(u * 2)} pos={[Math.sin(i * 2.1) * 0.22 * u, 2.3 + u * (1.0 + (i % 4) * 0.25), 0.05]} color="#ffffff" ink={1.06} />; })}
      <Presenter who="BOLT" t={t} x={0.95} expr="deadpan" look={-0.6} armL={100} />
    </Void></Cam>; }},
  // 8 PIP: astronomers say it would explode (lab, blob expands -> white)
  {from: L(8), render: (f, t) => { const A = {pos: [1.4, 1.35, 3.9], look: [1.6, 0.95, -1.4], fov: 46}; const c = glide(f, L(8), L(9), A, push(A, 0.1));
    const ex = sstep((f - BOOM + 6) / 16); const giant = f > W(8, 'giant');
    return <Cam {...c}><LabSet>
      <Spoon pos={[2.2, 1.04, -2.0]} f={f} />
      {ex > 0 && ex < 0.999 && <Ball r={0.06} scale={1 + ex * 14} pos={[2.2, 1.14, -2.0]} color="#ffffff" emissive="#cfe6ff" glow="#bfe0ff" glowS={1.6} glowO={0.6 * (1 - ex)} ink={0} />}
      <Actor who="PIP" vo={VO} t={t} pos={[0.95, 0, -0.5]} expr={giant ? 'shock' : 'worry'} armL={giant ? 140 : 20} armR={giant ? 140 : 20} seed={1} />
    </LabSet></Cam>; }},
  // 9 ZIB: "can I keep it in space?"
  {from: L(9), render: (f, t) => { const A = med(0, 0, 0.85, 2.0, 0.15); const c = glide(f, L(9), L(10), A, push(A, 0.1));
    return <Cam {...c}><LabSet><Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="worry" armR={70} armL={20} item="spoon" glow={pulse(f)} seed={3} /></LabSet></Cam>; }},
  // 10 BOLT "Approved."
  {from: L(10), render: (f, t) => { const A = med(-0.4, -0.6, 1.7, 2.6, -0.3); const c = glide(f, L(10), L(11), A, push(A, 0.1));
    return <Cam {...c}><LabSet><Actor who="BOLT" vo={VO} t={t} pos={[-0.4, 0, -0.6]} expr="deadpan" look={0.2} armR={110} seed={2} /></LabSet></Cam>; }},
  // 11 PIP question: group in the lab
  {from: L(11), render: (f, t) => { const A = GROUP; const c = glide(f, L(11), L(12), A, push(A, 0.04));
    return <Cam {...c}><LabSet>
      <Actor who="PIP" vo={VO} t={t} pos={[-0.95, 0, 0.1]} expr="happy" armR={110} look={0.3} seed={1} />
      <Actor who="BOLT" vo={VO} t={t} pos={[0.95, 0, -0.4]} expr="deadpan" look={-0.4} seed={2} />
      <Actor who="ZIB" vo={VO} t={t} pos={[0.05, 0, 0.9]} expr="happy" armR={70} item="spoon" glow={pulse(f)} seed={3} />
    </LabSet></Cam>; }},
  // 12 ZIB: "I brought another one!" -> glides into the frame-0 framing (loop)
  {from: L(12), render: (f, t) => { const c = glide(f, L(12), EP3_FRAMES - 1, push(ZHOOK, 0.12), ZHOOK);
    return <Cam {...c}><LabSet>
      <Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="happy" armR={120} armL={30} item="spoon" glow={pulse(f)} seed={3} />
      <Actor who="PIP" vo={VO} t={t} pos={[1.3, 0, -1.8]} expr="shock" look={-0.6} seed={1} />
    </LabSet></Cam>; }},
];

export const Ep3 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b0b22'}}>
      <SciFonts />
      <Stage bg="radial-gradient(120% 80% at 50% 30%, #3a2f6b 0%, #1a1440 55%, #0b0a20 100%)" overlay={<>
        <Vignette />
        <Title lines={['A SPOON OF', 'NEUTRON STAR?']} scheme={S} out={60} y={250} />
        <Label text="≈ 1 BILLION TONS" sub="as heavy as a mountain (NASA)" at={W(2, 'billion')} to={L(3) - 4} scheme={S} size={76} />
        <Label text="MORE MASS THAN THE SUN" at={W(3, 'mass')} to={W(3, 'twenty') - 2} scheme={S} size={60} />
        <Label text="~20 km WIDE" sub="about the size of a city" at={W(3, 'twenty')} to={L(4) - 4} scheme={S} />
        <Label text="GRAVITY HOLDS IT" sub="…on the star" at={W(6, 'crushing')} to={W(6, 'nothing') - 2} scheme={S} size={72} />
        <Label text="ON EARTH: NOTHING" sub="it springs apart" at={W(6, 'nothing')} to={L(7) - 4} scheme={S} size={72} />
        <Label text="BOOM" sub="a giant explosion (in theory)" at={BOOM} to={L(9) - 4} scheme={S} size={110} />
        <EndQ text="Would you dare to touch the spoon? YES or NO?" at={L(11)} to={EP3_FRAMES} scheme={S} />
        <Captions vo={VO} scheme={S} />
        <Flash at={BOOM + 2} len={14} peak={0.85} />
        <Mark />
      </>}>
        <Shots shots={shots} f={f} />
      </Stage>
    </AbsoluteFill>
  );
};
