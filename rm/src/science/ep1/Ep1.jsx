// TEST Short 1 (NOT for posting): What if the Moon vanished?  Cast: Zib deletes the Moon, Pip explains, Bolt deadpans.
import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Stage, Cam, Actor, Stars, Planet, Ball, Cyl, Ring, Arrow, Lights, SciFonts, Captions, Title, Label, EndQ, Flash, Vignette, Mark, Shots,
  keyed, sstep, lerp3, lineF, wordF, FPS} from '../kit.jsx';
import {Deck} from '../sets.jsx';
import VO from './vo.json';
import SCH from '../schemes.json';

const S = SCH.ep1; // caption scheme for this Short
export const EP1_FRAMES = Math.round(VO.dur * FPS);
const L = (i) => lineF(VO, i);
const W = (i, p) => wordF(VO, i, p);
const DEL = W(0, 'deleted') + 4; // Moon vanishes on "deleted"
const UNDO = W(14, 'button') + 2; // end: Zib presses again -> Moon pops back (loops to frame 0)
const EARTH = 'science/earth_toon.png', MOON = 'science/moon_toon.png';
const moonScale = (f) => (f < L(14) ? 1 - sstep((f - DEL) / 7) : sstep((f - UNDO) / 7));
const glide = (f, a, b, A, B) => { const t = sstep((f - a) / Math.max(1, b - a)); return {pos: lerp3(A.pos, B.pos, t), look: lerp3(A.look, B.look, t), fov: A.fov + (B.fov - A.fov) * t}; };
const Space = ({children, moon = true, f, earth = {}}) => (<>
  <Lights sun={[8, 4, 6]} />
  <Stars />
  <Planet file={EARTH} r={9} pos={[-3, -6, -32]} rotY={2.4 + f * 0.0006} tilt={0.41} atmo="#7fc8ff" {...earth} />
  {moon && <Planet file={MOON} r={2.4} pos={[7, 9, -36]} scale={moonScale(f)} />}
  {children}
</>);

const shots = [
  // 0 ZIB deletes the Moon (hook: Moon on screen at frame 0, gone at "deleted")
  {from: 0, render: (f, t) => { const c = glide(f, 0, L(1), {pos: [0.6, 1.3, 5.4], look: [0.6, 1.9, -6], fov: 44}, {pos: [0.4, 1.2, 4.6], look: [0.8, 2.2, -6], fov: 42});
    const ms = moonScale(f), rk = (f - DEL) / 14;
    return <Cam {...c}><Space f={f}>
      <Deck />
      <Actor who="ZIB" vo={VO} t={t} pos={[-0.3, 0, 2.2]} expr={f < DEL ? 'smug' : 'shock'} armR={f < DEL - 6 ? 40 : 75} armL={20} item="remote" glow={f > DEL ? 1 : 0.5} seed={3} />
      <Actor who="PIP" vo={VO} t={t} pos={[1.9, 0, -0.6]} expr="happy" look={0.6} seed={1} />
      {rk > 0 && rk < 1 && <Ring pos={[7, 9, -35]} r={3 + rk * 7} color="#ffffff" opacity={1 - rk} />}
    </Space></Cam>; }},
  // 1 PIP shocked (medium)
  {from: L(1), render: (f, t, lf) => { const c = glide(f, L(1), L(2), {pos: [1.3, 1.25, 3.4], look: [1.5, 1.0, -0.6], fov: 40}, {pos: [1.25, 1.2, 2.9], look: [1.5, 1.0, -0.6], fov: 38});
    return <Cam {...c}><Space f={f} moon={false}>
      <Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[1.6, 0, -0.6]} expr="shock" armL={150} armR={150} seed={1} />
      <Actor who="ZIB" vo={VO} t={t} pos={[0.5, 0, -1.4]} expr="worry" armR={60} item="remote" seed={3} />
    </Space></Cam>; }},
  // 2 BOLT "Correction. It did." with the empty sky behind
  {from: L(2), render: (f, t) => { const c = glide(f, L(2), L(3), {pos: [-1.4, 1.5, 3.2], look: [-1.0, 1.4, -2], fov: 40}, {pos: [-1.35, 1.5, 2.8], look: [-1.0, 1.5, -2], fov: 38});
    return <Cam {...c}><Space f={f} moon={false}>
      <Deck />
      <Actor who="BOLT" vo={VO} t={t} pos={[-0.9, 0, -0.4]} expr="deadpan" look={-0.3} seed={2} />
      <Ring pos={[7, 9, -36]} r={2.6} color="#6fe5ff" opacity={0.35} />
    </Space></Cam>; }},
  // 3 PIP: tides = two bulges toward the (ghost) Moon
  {from: L(3), render: (f, t) => { const c = glide(f, L(3), L(4), {pos: [0, 0.3, 12], look: [0.6, 0.2, 0], fov: 42}, {pos: [0.2, 0.4, 10.5], look: [0.6, 0.3, 0], fov: 40});
    const b = 1 + 0.17 * sstep((f - W(3, 'bulges') + 10) / 14);
    return <Cam {...c}><Lights sun={[8, 4, 6]} /><Stars />
      <Planet file={EARTH} r={2.4} pos={[0, 0.5, 0]} rotY={f * 0.004} tilt={0.41} atmo="#7fc8ff" />
      <mesh position={[0, 0.5, 0]} scale={[2.48 * b, 2.48, 2.48]}><sphereGeometry args={[1, 48, 32]} /><meshBasicMaterial color="#5fb8ff" transparent opacity={0.35} depthWrite={false} /></mesh>
      <Ring pos={[6.5, 0.5, -2]} r={0.9} color="#ffffff" opacity={0.5} />
      <Arrow a={[4.4, 0.5, -1]} b={[2.9, 0.5, 0]} color="#ffb547" w={0.07} opacity={sstep((f - W(3, 'gravity')) / 8)} />
      <Actor who="PIP" vo={VO} t={t} pos={[-1.6, -3.1, 2.5]} expr="happy" armR={85} look={0.8} seed={1} />
    </Cam>; }},
  // 4 BOLT: the Sun keeps smaller tides (bulge shrinks)
  {from: L(4), render: (f, t) => { const c = glide(f, L(4), L(5), {pos: [-1.5, 0.6, 11], look: [-0.8, 0.4, 0], fov: 42}, {pos: [-1.2, 0.5, 10.2], look: [-0.6, 0.4, 0], fov: 41});
    const b = 1.17 - 0.1 * sstep((f - W(4, 'less') + 6) / 14);
    return <Cam {...c}><Lights sun={[-8, 3, 5]} color="#fff3d6" /><Stars />
      <Ball r={1.6} pos={[-6.5, 2.5, -5]} color="#ffd25a" emissive="#ff9d2a" glow="#ffcf6a" glowS={1.5} glowO={0.35} />
      <Planet file={EARTH} r={2.4} pos={[0.6, 0.3, 0]} rotY={1 + f * 0.004} tilt={0.41} atmo="#7fc8ff" />
      <mesh position={[0.6, 0.3, 0]} scale={[2.48 * b, 2.48, 2.48]}><sphereGeometry args={[1, 48, 32]} /><meshBasicMaterial color="#5fb8ff" transparent opacity={0.35} depthWrite={false} /></mesh>
      <Actor who="BOLT" vo={VO} t={t} pos={[2.0, -3.4, 2.4]} expr="deadpan" look={-0.6} armL={70} seed={2} />
    </Cam>; }},
  // 5 ZIB "Tiny waves! Cute!"
  {from: L(5), render: (f, t) => { const c = glide(f, L(5), L(6), {pos: [0.1, 0.75, 2.4], look: [0, 0.55, 0], fov: 40}, {pos: [0.1, 0.72, 2.05], look: [0, 0.55, 0], fov: 38});
    return <Cam {...c}><Space f={f} moon={false}><Deck /><Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="happy" armL={150} armR={150} seed={3} /></Space></Cam>; }},
  // 6 PIP: coastal life + darker nights (lights dim)
  {from: L(6), render: (f, t) => { const c = glide(f, L(6), L(7), {pos: [0.9, 1.3, 3.6], look: [0.6, 1.0, -1], fov: 40}, {pos: [0.8, 1.25, 3.1], look: [0.6, 1.0, -1], fov: 38});
    const dim = sstep((f - W(6, 'darker') + 4) / 18);
    return <Cam {...c}><ambientLight intensity={0.9 - 0.55 * dim} /><directionalLight position={[8, 4, 6]} intensity={1.7 - 1.2 * dim} /><Stars />
      <Planet file={EARTH} r={9} pos={[-3, -6, -32]} rotY={2.4 + f * 0.0006} tilt={0.41} atmo="#7fc8ff" />
      <Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[0.6, 0, -0.8]} expr="worry" armR={30} seed={1} />
    </Cam>; }},
  // 7 BOLT: full Moon ~2,000x brighter than Venus
  {from: L(7), render: (f, t) => { const c = glide(f, L(7), L(8), {pos: [0, 0, 12], look: [0, 0.6, 0], fov: 40}, {pos: [0, 0, 11], look: [0, 0.6, 0], fov: 39});
    const k = sstep((f - L(7) - 6) / 12);
    return <Cam {...c}><ambientLight intensity={1.2} /><Stars />
      <Ball r={2.0 * k} pos={[-1.1, 2.2, 0]} color="#f4f1e6" emissive="#b8b2a0" glow="#fff6d8" glowS={1.6} glowO={0.4} ink={1.04} />
      <Ball r={0.07} pos={[2.2, 2.2, 0]} color="#fffbe8" emissive="#fff3c8" glow="#fff3c8" glowS={2.5} glowO={0.5} ink={0} />
      <Actor who="BOLT" vo={VO} t={t} pos={[0.9, -3.2, 3]} expr="deadpan" look={0.3} armR={60} seed={2} />
    </Cam>; }},
  // 8 PIP: tilt 23.4 deg -> seasons
  {from: L(8), render: (f, t) => { const c = glide(f, L(8), L(9), {pos: [0, 0.5, 11], look: [0, 0.6, 0], fov: 40}, {pos: [0.4, 0.6, 10], look: [0, 0.6, 0], fov: 39});
    const tilt = 0.41;
    return <Cam {...c}><Lights sun={[8, 2, 6]} /><Stars />
      <Planet file={EARTH} r={2.3} pos={[0, 1.0, 0]} rotY={f * 0.006} tilt={tilt} atmo="#7fc8ff" />
      <Cyl r={0.05} h={6.4} pos={[0, 1.0, 0]} rot={[0, 0, tilt]} color="#ffb547" emissive="#7a4a10" ink={0.02} seg={10} />
      <Actor who="PIP" vo={VO} t={t} pos={[-1.5, -3.0, 2.6]} expr="happy" armR={70} look={0.7} seed={1} />
    </Cam>; }},
  // 9 BOLT: today ~2.5 deg swing; without the Moon, far bigger swings
  {from: L(9), render: (f, t) => { const c = glide(f, L(9), L(10), {pos: [0.4, 0.6, 10], look: [0, 0.6, 0], fov: 39}, {pos: [0.2, 0.7, 11.5], look: [0, 0.7, 0], fov: 41});
    const big = sstep((f - W(9, 'without') + 4) / 24); const ph = (f - L(9)) / 50;
    const tilt = 0.41 + Math.sin(ph) * (0.021 + 0.55 * big);
    return <Cam {...c}><Lights sun={[8, 2, 6]} /><Stars />
      <Planet file={EARTH} r={2.3} pos={[0, 1.0, 0]} rotY={f * 0.006} tilt={tilt} atmo="#7fc8ff" />
      <Cyl r={0.05} h={6.4} pos={[0, 1.0, 0]} rot={[0, 0, tilt]} color="#ffb547" emissive="#7a4a10" ink={0.02} seg={10} />
      <Actor who="BOLT" vo={VO} t={t} pos={[1.6, -3.2, 2.6]} expr="deadpan" look={-0.7} armL={65} seed={2} />
    </Cam>; }},
  // 10 PIP: wild seasons (Earth tipped far, hot/cold tint)
  {from: L(10), render: (f, t) => { const c = glide(f, L(10), L(11), {pos: [1.2, 1.3, 3.8], look: [0.5, 1.4, -3], fov: 42}, {pos: [1.0, 1.25, 3.2], look: [0.5, 1.5, -3], fov: 40});
    const hot = sstep((f - W(10, 'blazing')) / 10), cold = sstep((f - W(10, 'brutal')) / 10);
    return <Cam {...c}><Lights sun={[8, 4, 6]} color={cold > 0.5 ? '#d8ecff' : hot > 0.5 ? '#ffd9b0' : '#ffffff'} /><Stars />
      <Planet file={EARTH} r={7} pos={[-2, 3, -24]} rotY={f * 0.002} tilt={1.1} atmo={cold > 0.5 ? '#cfefff' : hot > 0.5 ? '#ff9a5a' : '#7fc8ff'} />
      <Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[0.6, 0, -0.6]} expr={hot > 0.5 ? 'shock' : 'worry'} armL={hot > 0.5 ? 120 : 20} armR={hot > 0.5 ? 120 : 20} seed={1} />
    </Cam>; }},
  // 11 ZIB: "should I press undo?"
  {from: L(11), render: (f, t) => { const c = glide(f, L(11), L(12), {pos: [0.0, 0.8, 2.5], look: [0, 0.55, 0], fov: 40}, {pos: [0.05, 0.78, 2.15], look: [0, 0.55, 0], fov: 38});
    return <Cam {...c}><Space f={f} moon={false}><Deck /><Actor who="ZIB" vo={VO} t={t} pos={[0, 0, 0]} expr="worry" armR={70} armL={15} item="remote" seed={3} /></Space></Cam>; }},
  // 12 BOLT: "Recommended."
  {from: L(12), render: (f, t) => { const c = glide(f, L(12), L(13), {pos: [-0.9, 1.55, 2.6], look: [-0.9, 1.35, -0.4], fov: 38}, {pos: [-0.9, 1.55, 2.3], look: [-0.9, 1.4, -0.4], fov: 36});
    return <Cam {...c}><Space f={f} moon={false}><Deck /><Actor who="BOLT" vo={VO} t={t} pos={[-0.9, 0, -0.4]} expr="deadpan" look={0.4} seed={2} /></Space></Cam>; }},
  // 13 PIP question, group wide (end card)
  {from: L(13), render: (f, t) => { const c = glide(f, L(13), L(14), {pos: [0, 2.0, 8.4], look: [0, 0.9, 0], fov: 38}, {pos: [0, 1.8, 7.6], look: [0, 0.9, 0], fov: 37});
    return <Cam {...c}><Space f={f} moon={false}><Deck />
      <Actor who="PIP" vo={VO} t={t} pos={[-0.95, 0, 0.1]} expr="happy" armR={110} look={0.3} seed={1} />
      <Actor who="BOLT" vo={VO} t={t} pos={[0.95, 0, -0.4]} expr="deadpan" look={-0.4} seed={2} />
      <Actor who="ZIB" vo={VO} t={t} pos={[0.05, 0, 0.9]} expr="happy" armR={60} item="remote" seed={3} />
    </Space></Cam>; }},
  // 14 ZIB presses again: Moon pops back -> loops into frame 0
  {from: L(14), render: (f, t) => { const c = glide(f, L(14), EP1_FRAMES, {pos: [0.4, 1.2, 4.8], look: [0.8, 2.1, -6], fov: 42}, {pos: [0.6, 1.3, 5.4], look: [0.6, 1.9, -6], fov: 44});
    const rk = (f - UNDO) / 14;
    return <Cam {...c}><Space f={f}>
      <Deck />
      <Actor who="ZIB" vo={VO} t={t} pos={[-0.3, 0, 2.2]} expr={f < UNDO ? 'worry' : 'smug'} armR={f < UNDO - 4 ? 75 : 40} item="remote" glow={1} seed={3} />
      <Actor who="PIP" vo={VO} t={t} pos={[1.9, 0, -0.6]} expr="shock" look={0.6} seed={1} />
      {rk > 0 && rk < 1 && <Ring pos={[7, 9, -35]} r={3 + rk * 7} color="#ffffff" opacity={1 - rk} />}
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
