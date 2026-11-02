// TEST Short 1 (NOT for posting): What if the Moon vanished?  Cast: Zib deletes the Moon, Pip explains, Bolt deadpans.
import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage, Cam, Actor, Stars, Planet, Ball, Cyl, Ring, Arrow, Lights, SciFonts, Captions, Title, Label, EndQ, Flash, Vignette, Mark, Shots,
  keyed, sstep, lerp3, lineF, wordF, FPS, glide, med, push, DG} from '../kit.jsx';
import {Deck} from '../sets.jsx';
import VO from './vo.json';
import SCH from '../schemes.json';

const S = SCH.ep1; // caption scheme for this Short
export const EP1_FRAMES = Math.round(VO.dur * FPS);
const L = (i) => lineF(VO, i);
const W = (i, p) => wordF(VO, i, p);
const DEL = W(0, 'deleted') + 4; // Moon vanishes on "deleted"
const UNDO = W(14, 'button') + 2; // end: Zib presses again -> Moon pops back (loops to frame 0)
const MOONP = [4.5, 10, -36];
const EARTH = 'science/earth_toon.png', MOON = 'science/moon_toon.png';
const moonScale = (f) => (f < L(14) ? 1 - sstep((f - DEL) / 7) : sstep((f - UNDO) / 7));
const Space = ({children, moon = true, f, earth = {}}) => (<>
  <Lights sun={[8, 4, 6]} />
  <Stars />
  <Planet file={EARTH} r={9} pos={[-3, -6, -32]} rotY={2.4 + f * 0.0006} tilt={0.41} atmo="#7fc8ff" {...earth} />
  {moon && <Planet file={MOON} r={2.4} pos={MOONP} scale={moonScale(f)} />}
  {children}
</>);

const HOOK = {pos: [0, 0.55, 3.4], look: [0.2, 1.4, -6], fov: 50};
const DGP = push(DG, 0.1);
const Presenter = ({who, f, t, x = -0.95, ...p}) => <Actor who={who} vo={VO} t={t} pos={[x, 0.44, 3.5]} shadow={false} seed={who === 'PIP' ? 1 : who === 'BOLT' ? 2 : 3} {...p} />;
const shots = [
  // 0 ZIB deletes the Moon (hook: Moon on screen at frame 0, gone on "deleted")
  {from: 0, render: (f, t) => { const c = glide(f, 0, L(1), HOOK, push(HOOK, 0.08));
    const rk = (f - DEL) / 14;
    return <Cam {...c}><Space f={f}>
      <Deck />
      <Actor who="ZIB" vo={VO} t={t} pos={[-0.2, 0, 0.9]} expr={f < DEL ? 'smug' : 'shock'} armR={f < DEL - 6 ? 40 : 75} armL={20} item="remote" glow={f > DEL ? 1 : 0.5} seed={3} look={0.4} />
      <Actor who="PIP" vo={VO} t={t} pos={[0.85, 0, -1.2]} expr={f < DEL ? 'happy' : 'shock'} look={0.6} seed={1} />
      {rk > 0 && rk < 1 && <Ring pos={MOONP} r={3 + rk * 7} color="#ffffff" opacity={1 - rk} />}
    </Space></Cam>; }},
  // 1 PIP shocked (medium)
  {from: L(1), render: (f, t) => { const A = med(0.3, -0.6, 1.5, 3.0, -0.3); const c = glide(f, L(1), L(2), A, push(A));
    return <Cam {...c}><Space f={f} moon={false}>
      <Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[0.3, 0, -0.6]} expr="shock" armL={150} armR={150} seed={1} />
      <Actor who="ZIB" vo={VO} t={t} pos={[1.2, 0, -1.6]} expr="worry" armR={60} item="remote" seed={3} look={-0.5} />
    </Space></Cam>; }},
  // 2 BOLT "Correction. It did." empty sky ring where the Moon was
  {from: L(2), render: (f, t) => { const A = med(-0.3, -0.4, 1.7, 3.2, 0.4); const c = glide(f, L(2), L(3), A, push(A));
    return <Cam {...c}><Space f={f} moon={false}>
      <Deck />
      <Actor who="BOLT" vo={VO} t={t} pos={[-0.3, 0, -0.4]} expr="deadpan" look={-0.3} seed={2} />
    </Space></Cam>; }},
  // 3 PIP: tides = two bulges pulled toward the Moon (Moon ghost above, vertical layout)
  {from: L(3), render: (f, t) => { const c = glide(f, L(3), L(4), DG, DGP);
    const b = 1 + 0.2 * sstep((f - W(3, 'bulges') + 8) / 14);
    return <Cam {...c}><Lights sun={[8, 4, 6]} /><Stars />
      <Planet file={EARTH} r={1.3} pos={[0, 1.6, 0]} rotY={f * 0.004} tilt={0.2} atmo={null} />
      <mesh position={[0, 1.6, 0]} scale={[1.36, 1.36 * b, 1.36]}><sphereGeometry args={[1, 48, 32]} /><meshBasicMaterial color="#5fb8ff" transparent opacity={0.4} depthWrite={false} /></mesh>
      <Planet file={MOON} r={0.45} pos={[0, 3.9, -1]} />
      <Arrow a={[0, 3.3, -0.6]} b={[0, 3.05, -0.2]} color="#ffb547" w={0.05} opacity={sstep((f - W(3, 'gravity')) / 8)} />
      <Presenter who="PIP" f={f} t={t} expr="happy" armR={110} look={0.8} />
    </Cam>; }},
  // 4 BOLT: the Sun keeps smaller tides (bulge shrinks)
  {from: L(4), render: (f, t) => { const c = glide(f, L(4), L(5), DGP, DG);
    const b = 1.2 - 0.12 * sstep((f - W(4, 'less') + 6) / 14);
    return <Cam {...c}><Lights sun={[0, 8, 3]} color="#fff3d6" /><Stars />
      <Ball r={0.6} pos={[0, 4.0, -1.5]} color="#ffd25a" emissive="#ff9d2a" glow="#ffcf6a" glowS={1.6} glowO={0.35} />
      <Planet file={EARTH} r={1.3} pos={[0, 1.6, 0]} rotY={1 + f * 0.004} tilt={0.2} />
      <mesh position={[0, 1.6, 0]} scale={[1.36, 1.36 * b, 1.36]}><sphereGeometry args={[1, 48, 32]} /><meshBasicMaterial color="#5fb8ff" transparent opacity={0.4} depthWrite={false} /></mesh>
      <Presenter who="BOLT" f={f} t={t} x={0.95} expr="deadpan" look={-0.6} armL={110} />
    </Cam>; }},
  // 5 ZIB "Tiny waves! Cute!"
  {from: L(5), render: (f, t) => { const A = med(0, 0, 0.85, 2.0, 0.2); const c = glide(f, L(5), L(6), A, push(A, 0.1));
    return <Cam {...c}><Space f={f} moon={false}><Deck /><Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="happy" armL={150} armR={150} seed={3} /></Space></Cam>; }},
  // 6 PIP: coastal life + darker nights (lights dim)
  {from: L(6), render: (f, t) => { const A = med(0.2, -0.6, 1.5, 3.1, 0.3); const c = glide(f, L(6), L(7), A, push(A));
    const dim = sstep((f - W(6, 'darker') + 4) / 18);
    return <Cam {...c}><ambientLight intensity={0.9 - 0.5 * dim} /><directionalLight position={[8, 4, 6]} intensity={1.7 - 1.1 * dim} /><Stars />
      <Planet file={EARTH} r={9} pos={[-3, -6, -32]} rotY={2.4 + f * 0.0006} tilt={0.41} atmo="#7fc8ff" />
      <Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[0.2, 0, -0.6]} expr="worry" armR={30} seed={1} />
    </Cam>; }},
  // 7 BOLT: full Moon ~2,000x brighter than Venus
  {from: L(7), render: (f, t) => { const c = glide(f, L(7), L(8), DG, DGP);
    const k = sstep((f - L(7) - 4) / 12);
    return <Cam {...c}><ambientLight intensity={1.3} /><Stars />
      <Planet file={MOON} r={1.0} scale={k} pos={[-0.55, 2.3, 0]} emissive="#55524a" atmo="#fff6d8" />
      <Ball r={0.05} pos={[1.15, 2.3, 0]} color="#fffbe8" emissive="#fff3c8" glow="#fff3c8" glowS={3} glowO={0.5} ink={0} />
      <Presenter who="BOLT" f={f} t={t} x={0.95} expr="deadpan" look={-0.4} armL={95} />
    </Cam>; }},
  // 8 PIP: tilt 23.4 deg -> seasons
  {from: L(8), render: (f, t) => { const c = glide(f, L(8), L(9), DG, DGP);
    return <Cam {...c}><Lights sun={[8, 2, 6]} /><Stars />
      <Planet file={EARTH} r={1.3} pos={[0, 2.0, 0]} rotY={f * 0.006} tilt={0.41} atmo="#7fc8ff" />
      <Cyl r={0.035} h={3.6} pos={[0, 2.0, 0]} rot={[0, 0, 0.41]} color="#ffb547" emissive="#7a4a10" ink={0.02} seg={10} />
      <Presenter who="PIP" f={f} t={t} expr="happy" armR={100} look={0.7} />
    </Cam>; }},
  // 9 BOLT: today ~2.5 deg swing; without the Moon, far bigger swings
  {from: L(9), render: (f, t) => { const c = glide(f, L(9), L(10), DGP, DG);
    const big = sstep((f - W(9, 'without') + 4) / 24); const ph = (f - L(9)) / 45;
    const tilt = 0.41 + Math.sin(ph) * (0.021 + 0.5 * big);
    return <Cam {...c}><Lights sun={[8, 2, 6]} /><Stars />
      <Planet file={EARTH} r={1.3} pos={[0, 2.0, 0]} rotY={f * 0.006} tilt={tilt} atmo="#7fc8ff" />
      <Cyl r={0.035} h={3.6} pos={[0, 2.0, 0]} rot={[0, 0, tilt]} color="#ffb547" emissive="#7a4a10" ink={0.02} seg={10} />
      <Presenter who="BOLT" f={f} t={t} x={0.95} expr="deadpan" look={-0.7} armL={95} />
    </Cam>; }},
  // 10 PIP: wild seasons (Earth tipped far, hot then cold tint)
  {from: L(10), render: (f, t) => { const A = med(0.2, -0.6, 1.5, 3.4, -0.4); const c = glide(f, L(10), L(11), A, push(A));
    const hot = sstep((f - W(10, 'blazing')) / 10), cold = sstep((f - W(10, 'brutal')) / 10);
    return <Cam {...c}><Lights sun={[8, 4, 6]} color={cold > 0.5 ? '#d8ecff' : hot > 0.5 ? '#ffd9b0' : '#ffffff'} /><Stars />
      <Planet file={EARTH} r={5} pos={[2.5, 6, -24]} rotY={f * 0.002} tilt={1.1} atmo={cold > 0.5 ? '#cfefff' : hot > 0.5 ? '#ff9a5a' : '#7fc8ff'} />
      <Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[0.2, 0, -0.6]} expr={hot > 0.5 ? 'shock' : 'worry'} armL={hot > 0.5 ? 120 : 20} armR={hot > 0.5 ? 120 : 20} seed={1} />
    </Cam>; }},
  // 11 ZIB: "should I press undo?"
  {from: L(11), render: (f, t) => { const A = med(0, 0, 0.85, 2.0, -0.2); const c = glide(f, L(11), L(12), A, push(A, 0.1));
    return <Cam {...c}><Space f={f} moon={false}><Deck /><Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="worry" armR={70} armL={15} item="remote" seed={3} /></Space></Cam>; }},
  // 12 BOLT: "Recommended."
  {from: L(12), render: (f, t) => { const A = med(-0.3, -0.4, 1.7, 2.7, 0.3); const c = glide(f, L(12), L(13), A, push(A, 0.1));
    return <Cam {...c}><Space f={f} moon={false}><Deck /><Actor who="BOLT" vo={VO} t={t} pos={[-0.3, 0, -0.4]} expr="deadpan" look={0.4} seed={2} /></Space></Cam>; }},
  // 13 PIP question, group wide (end card)
  {from: L(13), render: (f, t) => { const A = {pos: [0, 1.6, 7.4], look: [0, 1.15, 0], fov: 38}; const c = glide(f, L(13), L(14), A, push(A, 0.06));
    return <Cam {...c}><Space f={f} moon={false}><Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[-0.95, 0, 0.1]} expr="happy" armR={110} look={0.3} seed={1} />
      <Actor who="BOLT" vo={VO} t={t} pos={[0.95, 0, -0.4]} expr="deadpan" look={-0.4} seed={2} />
      <Actor who="ZIB" vo={VO} t={t} pos={[0.05, 0, 0.9]} expr="happy" armR={60} item="remote" seed={3} />
    </Space></Cam>; }},
  // 14 ZIB presses again: Moon pops back -> glides back into the frame-0 framing (loop)
  {from: L(14), render: (f, t) => { const c = glide(f, L(14), EP1_FRAMES - 1, push(HOOK, 0.12), HOOK);
    const rk = (f - UNDO) / 14;
    return <Cam {...c}><Space f={f}>
      <Deck />
      <Actor who="ZIB" vo={VO} t={t} pos={[-0.2, 0, 0.9]} expr={f < UNDO ? 'worry' : 'smug'} armR={f < UNDO - 4 ? 75 : 40} armL={20} item="remote" glow={1} seed={3} look={0.4} />
      <Actor who="PIP" vo={VO} t={t} pos={[0.85, 0, -1.2]} expr="shock" look={0.6} seed={1} />
      {rk > 0 && rk < 1 && <Ring pos={MOONP} r={3 + rk * 7} color="#ffffff" opacity={1 - rk} />}
    </Space></Cam>; }},
];

export const Ep1 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b0b22'}}>
      <SciFonts />
      <Stage overlay={<>
        <Vignette />
        <Title lines={['WHAT IF THE', 'MOON VANISHED?']} scheme={S} out={72} y={250} />
        <Label text="TIDES < HALF" sub="the Sun still pulls" at={W(4, 'less')} to={L(5) - 4} scheme={S} />
        <Label text="2,000×" sub="full Moon vs Venus" at={W(7, 'thousand')} to={L(8) - 4} scheme={S} />
        <Label text="23.4° TILT" sub="= our seasons" at={W(8, 'tilt')} to={L(9) - 4} scheme={S} />
        <Label text="TODAY: ~2.5°" sub="swing, held by the Moon" at={W(9, 'two')} to={W(9, 'without') - 2} scheme={S} />
        <Label text="NO MOON: WILD TILT" sub="over millions of years" at={W(9, 'without')} to={L(10) - 4} scheme={S} />
        <EndQ text="Tides or dark nights: which would you miss first?" at={L(13)} to={EP1_FRAMES} scheme={S} />
        <Captions vo={VO} scheme={S} />
        <Flash at={DEL - 3} len={9} peak={0.55} />
        <Flash at={UNDO - 3} len={9} peak={0.55} />
        <Mark />
      </>}>
        <Shots shots={shots} f={f} />
      </Stage>
    </AbsoluteFill>
  );
};
