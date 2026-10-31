// LF01 "Vanished Without a Trace" - 1920x1080 @ 24 fps, one composition per chapter. Shot lists are data (A..B = voice line indices).
import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame, staticFile} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Glow, Clouds, FontFaces, Finish, Dip, Person, Birds, Fountain, softTexture, clamp01, easeOut, easeInOut} from '../../kit/index.js';
import {Sea, Whitecaps, Spray, Storm, Island, Ship, KEEPERS, LH, lhY, height} from '../flannan-isles/world.jsx';
import {Room, LanternRoom, WestLanding, LANDING_SET} from '../flannan-isles/sets.jsx';
import {FPS, FR, ChCtx, SeaShot, PropShot, MapShot, ArchShot, QuoteShot, CheckShot, TeaserShot, Sub, PAL, Pill, Big} from './shots.jsx';
import V_COLD from './vo_COLD.json'; import V_CH1 from './vo_CH1.json'; import V_CH2 from './vo_CH2.json'; import V_CH3 from './vo_CH3.json';
import V_CH4 from './vo_CH4.json'; import V_CH5 from './vo_CH5.json'; import V_CH6 from './vo_CH6.json'; import V_CH7 from './vo_CH7.json'; import V_OUTRO from './vo_OUTRO.json';
import {dirv} from './world.jsx';

const VOS = {COLD: V_COLD, CH1: V_CH1, CH2: V_CH2, CH3: V_CH3, CH4: V_CH4, CH5: V_CH5, CH6: V_CH6, CH7: V_CH7, OUTRO: V_OUTRO};
export const GAP = 0.6;
export const frames = (id) => FR(VOS[id].dur + GAP);
const NIGHT_TINT = '#8fa6f0', DAWN_TINT = '#eef0f5';
const PI = Math.PI;

// ------------------------------------------------------------------ CH4 (Flannan) shot components built from the Flannan Short's world
const IslandShot = ({pal = 'storm', startSec, endSec, tint = NIGHT_TINT, beam = 0, lantern = 0.03, lit = 0, cam, orbit, rain = 0.7, wind = 1, people = [], gateOpen = 0, big, pill, ship = null, birds = false, seaCol = '#2f5fb0', amp = 0.7, moon = false, stars = 0}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const keys = cam ? cam.map((k) => ({...k, f: Math.round(k.t * d)})) : null;
  const y = lhY();
  return <Stage palette={PAL[pal]} fog={[40, 200]} overlay={<>
    {(big || []).map((e, i) => { const s = FR(e.s0 ?? 0); return <Sequence key={'b' + i} from={s} durationInFrames={Math.max(1, FR(e.s1 ?? 99) - s)}><Big lines={e.lines} size={e.size} /></Sequence>; })}
    {(pill || []).map((e, i) => <Sequence key={'p' + i} from={FR(e.s0 ?? 0)}><Pill text={e.text} variant={e.v} /></Sequence>)}
  </>}>
    {keys ? <CameraRig keys={keys} /> : <CameraRig orbit={{...orbit, start: 0, end: d}} />}
    {stars > 0 && <Stars opacity={stars} count={140} />}
    {moon && <><Orb position={[-60, 55, -110]} radius={4} color="#fbf6dc" /><Glow position={[-60, 55, -109]} size={34} color="#9fc0ff" opacity={0.5} /></>}
    <Clouds frame={f} y={30} color={pal === 'storm' ? '#4a58b8' : '#c8d0e0'} opacity={0.95} speed={0.12} count={10} seed={3} />
    <Island frame={f} beam={beam} ang={f * 0.06} lantern={lantern} tint={tint} lit={lit} gateOpen={gateOpen} />
    <Sea frame={f + 300} color={seaCol} amp={amp} spec="#b8cce8" /><Whitecaps frame={f + 300} /><Spray frame={f + 300} />
    {rain > 0 && <Storm frame={f} center={[LH.x, y - 6, LH.z + 6]} area={44} rain={rain} wind={wind} />}
    {birds && <Birds center={[LH.x, 22, LH.z]} radius={14} frame={f} count={7} color="#2a3040" />}
    {ship && <Ship position={[ship.p[0] + ship.v * f, 0.6, ship.p[2]]} rotation={ship.r} frame={f} lit={ship.lit ?? 0} scale={ship.s ?? 1.3} hull="#3a3a46" band="#e0e0e0" funnel="#b8342c" />}
    {people.map((q, i) => { const k = clamp01(f / (d * 0.85)); const px = q.walk ? q.walk[0][0] + (q.walk[1][0] - q.walk[0][0]) * k : q.p[0] + (q.v?.[0] ?? 0) * f, pz = q.walk ? q.walk[0][1] + (q.walk[1][1] - q.walk[0][1]) * k : q.p[2] + (q.v?.[2] ?? 0) * f; const py = q.walk ? height(px, pz) + 0.05 : q.p[1]; const rr = q.walk ? Math.atan2(q.walk[1][0] - q.walk[0][0], q.walk[1][1] - q.walk[0][1]) : (q.r ?? 0); return <Person key={i} position={[px, py, pz]} rotation={rr} scale={0.62} pose={k >= 1 ? 'stand' : (q.pose ?? 'stand')} phase={f / (q.pose === 'walk' ? 4 : 9) + i} {...KEEPERS[q.who]} ghost={q.ghost} />; })}
  </Stage>;
};
const RoomShot = ({startSec, endSec, cam, big, pill, coat = true, door = 0.1, flashAt = []}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const keys = cam.map((k) => ({...k, f: Math.round(k.t * d)}));
  const fl = flashAt.reduce((a, x) => { const g = FR(x); return f >= g && f < g + 6 ? 1 - (f - g) / 6 : a; }, 0);
  return <Stage palette={PAL.room} fog={[30, 80]} background="radial-gradient(ellipse at 50% 40%, #6b5a48 0%, #2a2018 100%)" overlay={<>
    {(big || []).map((e, i) => { const s = FR(e.s0 ?? 0); return <Sequence key={'b' + i} from={s} durationInFrames={Math.max(1, FR(e.s1 ?? 99) - s)}><Big lines={e.lines} size={e.size} /></Sequence>; })}
    {(pill || []).map((e, i) => <Sequence key={'p' + i} from={FR(e.s0 ?? 0)}><Pill text={e.text} variant={e.v} /></Sequence>)}
    {fl > 0 && <AbsoluteFill style={{background: '#e8f0ff', opacity: fl * 0.35, mixBlendMode: 'screen'}} />}
  </>}>
    <CameraRig keys={keys} />
    <Room frame={f + 300} flash={fl} coatSway={Math.sin(f * 0.07) * 0.03} door={door} />
  </Stage>;
};
const LanternShot = ({startSec, endSec, big, pill}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec);
  return <Stage palette={PAL.room} fog={[20, 60]} background="radial-gradient(ellipse at 50% 55%, #f0a640 0%, #8a4a14 45%, #2a1606 100%)" overlay={<>
    {(big || []).map((e, i) => <Sequence key={i} from={FR(e.s0 ?? 0)}><Big lines={e.lines} size={e.size} /></Sequence>)}
    {(pill || []).map((e, i) => <Sequence key={'p' + i} from={FR(e.s0 ?? 0)}><Pill text={e.text} variant={e.v} /></Sequence>)}
  </>}>
    <CameraRig orbit={{center: [0, 2.6, 0], radius: 8, height: 0.6, from: -0.9, to: 0.4, start: 0, end: d, lookY: 0.2, fov: 50}} />
    <LanternRoom frame={f} glint={0.5 + 0.5 * Math.sin(f * 0.1)} />
    <Storm frame={f} center={[0, -4, 0]} area={26} rain={0.6} wind={0.6} count={140} />
  </Stage>;
};
const LandingShot = ({startSec, endSec, cam, big, pill, twist = 1, boxGone = 1, roller = 0, marker = 0}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const keys = cam.map((k) => ({...k, f: Math.round(k.t * d)}));
  const w = typeof roller === 'number' && roller > 0 ? easeInOut(clamp01(f / (d * 0.8))) : 0; const mk = marker ? clamp01(f / (d * 0.6)) : 0;
  const pts = [[0, 2], [2.5, 1.6], [5, 1.4], [7.5, 1.8], [-2.5, 2.2], [10, 2]];
  return <Stage palette={PAL.gale} fog={[30, 140]} overlay={<>
    {(big || []).map((e, i) => { const s = FR(e.s0 ?? 0); return <Sequence key={'b' + i} from={s} durationInFrames={Math.max(1, FR(e.s1 ?? 99) - s)}><Big lines={e.lines} size={e.size} /></Sequence>; })}
    {(pill || []).map((e, i) => <Sequence key={'p' + i} from={FR(e.s0 ?? 0)}><Pill text={e.text} variant={e.v} /></Sequence>)}
  </>}>
    <CameraRig keys={keys} shake={roller ? 0.4 : 0} shakeFrom={Math.round(d * 0.6)} shakeLen={30} />
    <Clouds frame={f} y={26} color="#8a98b8" opacity={0.95} speed={0.3} count={10} seed={14} z0={-20} />
    <WestLanding frame={f} twist={twist} boxGone={boxGone} marker={mk} tint="#e6ebf5" />
    <Sea frame={f * 1.3 + 1100} color="#3a6aa4" amp={0.9 + w} y={-0.2} size={160} seg={56} />
    <Whitecaps frame={f * 1.2} count={60} area={60} center={[0, 30]} seed={11} />
    <Spray frame={f} pts={pts} height={4 + w * 6} size={2.6 + w * 2} period={46} />
    {w > 0.5 && <Fountain position={[4.6, 1, -0.5]} t={clamp01((w - 0.5) * 2.2)} height={9} width={3.2} count={50} puff={0.17} frame={f} color="#d6ecfa" />}
    <Storm frame={f} center={[4, 0, 2]} area={26} rain={0.7} wind={1.3} slant={0.5} count={160} />
  </Stage>;
};

const GY = height(LH.x + 1.6, LH.z + 4.4);
const T = {sea: SeaShot, prop: PropShot, map: MapShot, arch: ArchShot, quote: QuoteShot, check: CheckShot, teaser: TeaserShot, isl: IslandShot, room: RoomShot, lantern: LanternShot, landing: LandingShot};

// ------------------------------------------------------------------ shot lists
const ghostLine = (n) => [{k: 'brig', p: [-26, 0, -10], r: PI * 0.5, sp: {rough: 0.5, c: '#20262e'}}, {k: 'schooner', p: [0, 0, 0], r: PI * 0.5, sp: {rough: 0.5}}, {k: 'joyita', p: [24, 0, -6], r: PI * 0.5, sp: {rough: 0.5, sink: 0.3}}];
const CAM_EMPTY = [{t: 0, p: [-8, 4, 40], l: [0, 2, 0], fov: 46}];
const c = (t, p, l, fov = 46) => ({t, pos: p, look: l, fov});

export const SHOTS = {
  COLD: [
    {a: 0, b: 1, T: 'sea', pal: 'night', stars: 0.6, moon: true, amp: 0.55, sea: '#223f78', clouds: '#34428a', fog: [60, 320],
      objs: [{k: 'mariner', p: [-60, 15, -4], r: PI / 2, v: [0.4, 0, 0], s: 1.2, bank: 0.05}],
      cam: [c(0, [-14, 5, 30], [-30, 12, 0], 48), c(1, [14, 4, 30], [30, 13, 0], 48)],
      pill: [{l: 0, text: '5 DEC 1945 · NIGHT', v: 'yellow'}], big: [{l: 0, w: 'rescue', lines: [{text: 'ONE RESCUE PLANE', color: 'yellow'}], y: 130, size: 110}]},
    {a: 1, b: 2, T: 'sea', pal: 'night', stars: 0.6, moon: true, amp: 0.5, sea: '#16305e', clouds: '#34428a', fog: [40, 260],
      objs: [{k: 'mariner', p: [0, 13, -10], r: PI, v: [0, 0.03, -0.55], s: 1.2}],
      cam: [c(0, [0, 38, 52], [0, 12, -8], 48), c(1, [0, 3.2, 38], [0, 4, -30], 50)],
      big: [{l: 1, w: 'radioed', lines: [{text: 'RADIOED ONCE', color: 'white'}, {text: 'THEN SILENCE', color: 'red'}], y: 120}]},
    {a: 2, b: 3, T: 'arch', src: 'lf01/avengers.jpg', credit: 'Avenger torpedo bombers · U.S. Navy / NARA · public domain · illustrative, not Flight 19',
      big: [{l: 2, lines: [{text: '6 AIRCRAFT · 27 MEN', color: 'yellow'}], y: 125, size: 100}]},
    {a: 3, b: null, T: 'sea', pal: 'dusk', amp: 0.35, sea: '#3a3a6a', fog: [40, 200], mist: 0.25, clouds: '#c8788a',
      objs: [{k: 'brig', p: [-24, 0, -8], r: PI * 0.5, sp: {rough: 0.5, c: '#20262e'}, v: [0.012, 0, 0]}, {k: 'schooner', p: [0, 0, 0], r: PI * 0.5, sp: {rough: 0.4}, v: [0.012, 0, 0]}, {k: 'joyita', p: [24, 0, -4], r: PI * 0.5, sp: {rough: 0.4, sink: 0.25}, v: [0.012, 0, 0]}],
      cam: [c(0, [-6, 5, 46], [0, 4, 0], 46), c(1, [8, 4, 38], [0, 4, 0], 42)],
      big: [{l: 3, lines: [{text: 'ONE THING', color: 'white'}, {text: 'WAS MISSING', color: 'yellow'}], y: 100}]},
  ],
  CH1: [
    {a: 0, b: 1, T: 'map', id: 'CH1', route: ['FORT LAUDERDALE', [1010, 640], [1260, 520], [1500, 420]], show: ['FORT LAUDERDALE', 'BAHAMAS'], focus: [1060, 600], zoom: [1.0, 1.42], routeEnd: 0.75,
      pill: [{l: 0, text: '5 DEC 1945 · 2:10 PM', v: 'yellow'}], big: [{l: 0, w: 'five', lines: [{text: 'FLIGHT 19', color: 'yellow'}, {text: '5 TORPEDO BOMBERS', color: 'white', size: 78}], y: 130, align: 'left', size: 120}]},
    {a: 1, b: 2, T: 'sea', pal: 'day', amp: 0.45, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'squad', p: [16, 13, 0], r: -PI * 0.5 - 0.45, v: [-0.07, 0, 0.03], s: 1.5, gap: [5.5, 3.2]}],
      cam: [c(0, [-12, 5, 36], [6, 13, 0], 46), c(1, [-8, 9, 30], [4, 13, 0], 46)], pill: [{l: 1, text: 'LT. CHARLES TAYLOR · 14 MEN', v: 'yellow'}]},
    {a: 2, b: 3, T: 'sea', pal: 'day', amp: 0.5, sea: '#2f78b8', clouds: '#f4f4ff', objs: [{k: 'squad', p: [0, 10, 0], r: -PI * 0.5 - 0.5, v: [-0.08, 0, -0.04], s: 1.5, bank: 0.25}],
      cam: [c(0, [12, 30, 24], [-2, 8, 0], 50), c(1, [8, 22, 14], [-6, 9, -2], 50)],
      big: [{l: 2, w: 'something', lines: [{text: 'THEN SOMETHING', color: 'white'}, {text: 'WENT WRONG', color: 'red'}], y: 110}]},
    {a: 3, b: 4, T: 'prop', prop: 'compass', bg: 'cold', pal: 'cold', floor: '#14202e', light: '#bcd8ff', lightI: 16,
      cam: [c(0, [0, 6, 9], [0, 0.4, 0], 46), c(1, [-2, 8.5, 6.0], [0, 0.4, 0], 42)],
      big: [{l: 3, w: 'both', lines: [{text: '"BOTH COMPASSES', color: 'white'}, {text: 'ARE OUT"', color: 'yellow'}], y: 80}], pill: [{l: 3, text: 'TAYLOR · RADIO', v: 'red'}]},
    {a: 4, b: 5, T: 'map', id: 'CH1', route: ['FORT LAUDERDALE', [1010, 640], [1300, 500], [1560, 380]], show: ['FORT LAUDERDALE'], focus: [1000, 640], zoom: [1.0, 1.12],
      marks: [{at: 'FLORIDA KEYS', l: 4, w: 'sure', text: 'HE THOUGHT: FLORIDA KEYS', cross: true, r: 56, dy: 100, dx: 0, size: 34}, {at: 'BAHAMAS', l: 4, w: 'actually', text: 'REALLY: BAHAMAS', color: '#7fe3ff', r: 56, dy: 100, size: 38}],
      big: [{l: 4, w: 'farther', lines: [{text: 'FARTHER OUT TO SEA', color: 'yellow'}], y: 70, size: 100}]},
    {a: 5, b: 6, T: 'sea', pal: 'dusk', amp: 0.55, sea: '#2a3a78', clouds: '#c8788a', objs: [{k: 'squad', p: [0, 11, 8], r: PI, v: [0, 0, -0.07], s: 1.5}, {k: 'orb', p: [0, 18, -150], size: 9, color: '#ffb070'}],
      cam: [c(0, [0, 12, 40], [0, 11, -10], 46), c(1, [6, 14, 36], [0, 11, -12], 44)],
      big: [{l: 5, w: 'fly', lines: [{text: '"JUST FLY WEST"', color: 'yellow'}], y: 90}]},
    {a: 6, b: 7, T: 'sea', pal: 'dusk', amp: 0.55, sea: '#2a2a60', clouds: '#8a4a70', objs: [{k: 'squad', p: [-14, 12, -4], r: PI / 2, v: [0.06, 0, 0], s: 1.5}, {k: 'orb', p: [30, 4 - 1.5, -150], size: 14, color: '#ff9a50'}],
      cam: [c(0, [4, 3, 40], [10, 8, -20], 48), c(1, [4, 2, 40], [14, 3, -20], 48)],
      big: [{l: 6, w: 'sun', lines: [{text: 'THE SUN WENT DOWN', color: 'white'}], y: 100}]},
    {a: 7, b: 8, T: 'sea', pal: 'storm', stars: 0.2, amp: 0.95, sea: '#1a2e66', rain: 0.9, wind: 1.2, slant: 0.5, flash: [1.2, 4.6], clouds: '#2a3270', fog: [30, 160],
      objs: [{k: 'squad', p: [0, 10, 12], r: PI, v: [0, 0, -0.06], s: 1.5, lights: true, bank: 0.1}],
      cam: [c(0, [0, 11, 40], [0, 10, 0], 46), c(1, [3, 12, 34], [0, 10, -4], 44)], shake: 0.1,
      big: [{l: 7, w: 'when', lines: [{text: '"WHEN THE FIRST PLANE DROPS BELOW', color: 'white', size: 62}, {text: '10 GALLONS, WE ALL GO DOWN TOGETHER"', color: 'yellow', size: 62}], y: 80, size: 62}],
      pill: [{l: 7, text: 'TAYLOR · LAST MESSAGE', v: 'red'}]},
    {a: 8, b: 9, T: 'arch', src: 'lf01/mariner.jpg', credit: 'Martin PBM-3 Mariner · U.S. Navy / Library of Congress · public domain · illustrative',
      big: [{l: 8, w: 'thirteen', lines: [{text: 'THE RESCUE PLANE', color: 'white'}, {text: '13 MEN', color: 'yellow'}], y: 125, size: 90}]},
    {a: 9, b: 10, T: 'sea', pal: 'night', stars: 0.5, amp: 0.6, sea: '#10244c', clouds: '#2a3270', fog: [40, 240],
      objs: [{k: 'fire', p: [0, 0.2, -50], s: 14}, {k: 'glow', p: [0, 8, -50], size: 60, color: '#ff8a3a', op: 0.7}, {k: 'slick', p: [0, 0, -50], size: 22}, {k: 'liner', p: [-30, 0, 24], r: PI * 0.62, v: [0.05, 0, -0.02], s: 0.9, sp: {hullC: '#2a2a30', band: '#a8342c', funnelC: '#a8342c', lit: 1, len: 9}}],
      cam: [c(0, [-8, 5, 40], [0, 6, -50], 44), c(1, [-2, 4, 30], [0, 5, -50], 38)],
      big: [{l: 9, lines: [{text: 'FLAMES 100 FT HIGH', color: 'yellow'}], y: 100, size: 100}, {l: 9, w: 'oil', lines: [{text: 'THEN ONLY', color: 'white'}, {text: 'OIL ON THE WATER', color: 'red'}], y: 100}]},
    {a: 10, b: 11, T: 'quote', head: 'U.S. NAVY BOARD · 1946', lines: ['PILOT ERROR', '        ↓', 'CAUSE UNKNOWN'], hi: [2], stamp: 'CAUSE UNKNOWN', stampAt: {l: 10, w: 'later'}, size: 92, source: 'THE NAVY FIRST BLAMED TAYLOR · LATER CHANGED THE VERDICT',
      big: [{l: 10, lines: [{text: 'THE VERDICT', color: 'yellow'}], y: 70, size: 90}]},
    {a: 11, b: null, T: 'sea', pal: 'grey', amp: 0.7, sea: '#3a5e8a', clouds: '#aab4c4', fog: [40, 220], mist: 0.12, objs: [],
      cam: [c(0, [0, 3, 30], [0, 3, 0], 50), c(1, [0, 3.6, 8], [0, 3, -30], 50)],
      big: [{l: 11, lines: [{text: 'NEXT: A 465-FOOT LINER', color: 'yellow'}], y: 100, size: 100}]},
  ],
  CH2: [
    {a: 0, b: 1, T: 'map', id: 'CH2', route: ['DURBAN', [1250, 660], [900, 960], [560, 960], 'CAPE TOWN'], show: ['DURBAN', 'CAPE TOWN'], focus: [900, 580], zoom: [1.0, 1.12],
      pill: [{l: 0, text: 'JULY 1909', v: 'yellow'}], big: [{l: 0, w: 'brand', lines: [{text: 'SS WARATAH', color: 'yellow'}, {text: '211 PEOPLE ABOARD', color: 'white', size: 80}], y: 130, align: 'left', size: 120}]},
    {a: 1, b: 4, T: 'sea', pal: 'day', amp: 0.4, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'liner', p: [0, 0, 0], r: PI / 2, v: [0.04, 0, 0], s: 1.6, sp: {len: 12, funnels: 2, hullC: '#15151a', band: '#d8d0c0', funnelC: '#c9a85a'}}],
      cam: [c(0, [-28, 6, 26], [0, 5, 0], 46), c(1, [8, 5, 22], [8, 5, 0], 44)],
      big: [{l: 1, lines: [{text: '"PRACTICALLY IMMUNE', color: 'white', size: 80}, {text: 'FROM SINKING"', color: 'yellow', size: 100}], y: 90}, {l: 2, w: 'no', lines: [{text: 'NO RADIO', color: 'red'}], y: 100, size: 150}, {l: 3, lines: [{text: 'ONE PASSENGER', color: 'white'}, {text: 'GOT OFF', color: 'yellow'}], y: 100}],
      pill: [{l: 3, text: 'CLAUDE SAWYER · DURBAN', v: 'white'}, {l: 4, text: 'HE FEARED SHE ROLLED TOO MUCH', v: 'red'}]},
    {a: 4, b: 5, T: 'sea', pal: 'gale', amp: 1.0, sea: '#2c5d94', clouds: '#8a98b8', rain: 0.2, wind: 0.6, objs: [{k: 'liner', p: [0, 0, 0], r: PI / 2, s: 1.6, sp: {len: 12, funnels: 2, rough: 3.2}}],
      cam: [c(0, [-4, 4, 20], [0, 4, 0], 50), c(1, [6, 5, 16], [0, 4, 0], 46)], big: [{l: 4, w: 'frightening', lines: [{text: 'FRIGHTENING DREAMS', color: 'cyan'}], y: 90, size: 100}]},
    {a: 5, b: 6, T: 'prop', prop: 'lamp', bg: 'cold', pal: 'cold', floor: '#0e1620', light: '#ffe6a0', lightI: 6, orbit: {center: [0, 1.9, 0], radius: 6.5, height: 0.6, from: -0.7, to: 0.4, lookY: 0, fov: 46},
      big: [{l: 5, w: 'lamp', lines: [{text: 'LAMP SIGNALS', color: 'yellow'}], y: 80, size: 110}], pill: [{l: 5, text: 'CLAN MACINTYRE · LOGGED IT', v: 'white'}]},
    {a: 6, b: 7, T: 'sea', pal: 'dusk', amp: 0.7, sea: '#2a3a78', clouds: '#c8788a', mist: 0.2, objs: [{k: 'liner', p: [0, 0, -4], r: PI, v: [0, 0, -0.07], s: 1.6, sp: {len: 12, funnels: 2, lit: 1}}],
      cam: [c(0, [-6, 3.4, 30], [0, 5, -30], 46), c(1, [-3, 3.2, 30], [0, 3, -50], 42)], big: [{l: 6, lines: [{text: 'LAST CONFIRMED', color: 'white'}, {text: 'SIGHTING', color: 'yellow'}], y: 100}]},
    {a: 7, b: 8, T: 'sea', pal: 'storm', amp: 1.5, sea: '#1a2e66', rain: 1, wind: 1.6, slant: 0.6, flash: [0.8, 2.6, 4.1], clouds: '#2a3270', fog: [25, 130], objs: [{k: 'liner', p: [0, 0, -30], r: PI * 0.8, s: 1.6, sp: {len: 12, funnels: 2, rough: 3.0, lit: 1}, v: [0.02, 0, -0.02], hide: FR(4.2)}],
      cam: [c(0, [6, 5, 30], [0, 3, -20], 52), c(1, [2, 7, 24], [0, 2, -24], 52)], shake: 0.25, big: [{l: 7, lines: [{text: 'A VIOLENT STORM', color: 'red'}], y: 90, size: 110}]},
    {a: 8, b: 11, T: 'arch', src: 'lf01/waratah.jpg', credit: 'SS Waratah at Port Adelaide · History Trust of South Australia · CC0',
      big: [{l: 8, lines: [{text: 'SEARCH SHIPS: NOTHING', color: 'yellow'}], y: 125, size: 90}, {l: 9, lines: [{text: '1999 SONAR: WRONG SHIP', color: 'red'}], y: 125, size: 90}, {l: 10, lines: [{text: 'NEVER FOUND', color: 'white'}], y: 125, size: 100}]},
    {a: 11, b: null, T: 'sea', pal: 'dusk', amp: 0.5, sea: '#2a3a78', clouds: '#c8788a', mist: 0.25, objs: [{k: 'liner', p: [0, 0, -40], r: PI * 0.6, s: 2.0, v: [-0.02, 0, 0.0], sp: {len: 11, funnels: 1, hullC: '#2a2e36', band: '#555', funnelC: '#2a2a2a', rough: 0.6, smoke: true}}],
      cam: [c(0, [0, 3, 30], [0, 4, -40], 46), c(1, [10, 4, 22], [0, 4, -40], 44)], big: [{l: 11, lines: [{text: '9 YEARS LATER', color: 'white'}, {text: '306 ABOARD', color: 'yellow'}], y: 90}]},
  ],
  CH3: [
    {a: 0, b: 1, T: 'map', id: 'CH3', route: ['BARBADOS', [1000, 700], [820, 420], 'BALTIMORE'], show: ['BARBADOS', 'BALTIMORE'], focus: [960, 540], zoom: [1.0, 1.08],
      pill: [{l: 0, text: 'MARCH 1918', v: 'yellow'}], big: [{l: 0, w: 'uss', lines: [{text: 'USS CYCLOPS', color: 'yellow'}], y: 130, align: 'left', size: 120}]},
    {a: 1, b: 3, T: 'sea', pal: 'day', amp: 0.45, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'liner', p: [0, 0, 0], r: PI / 2, s: 1.9, sink: 0.55, sp: {len: 11, funnels: 1, hullC: '#2a2e36', band: '#555', funnelC: '#2a2a2a', rough: 0.5, sink: 0.55}}],
      cam: [c(0, [-18, 4, 26], [0, 3, 0], 46), c(1, [16, 4, 22], [0, 3, 0], 44)],
      big: [{l: 1, lines: [{text: 'CRACKED ENGINE', color: 'red'}, {text: '10,800 TONS OF ORE', color: 'white', size: 80}], y: 90}, {l: 2, lines: [{text: 'OVER THE LOAD LINE', color: 'yellow'}], y: 90, size: 104}]},
    {a: 3, b: 5, T: 'arch', src: 'lf01/cyclops.jpg', credit: 'USS Cyclops in the Hudson River, 1911 · U.S. Navy (NHHC) · public domain', lowres: false, w: 1100, h: 620,
      big: [{l: 3, lines: [{text: 'CAPTAIN GEORGE WORLEY', color: 'yellow', size: 84}], y: 125, size: 90}, {l: 4, w: 'cursed', lines: [{text: 'CURSED HIS MEN', color: 'red'}], y: 125, size: 100}]},
    {a: 5, b: 6, T: 'prop', prop: 'hat', bg: 'room', pal: 'room', floor: '#3a2a1c', light: '#ffd8a0', lightI: 12,
      cam: [c(0, [-1, 3.4, 11], [0, 1.6, 0], 46), c(1, [0.6, 2.3, 6.2], [0.1, 1.5, 0.05], 40)],
      big: [{l: 5, lines: [{text: 'LONG UNDERWEAR', color: 'white'}, {text: 'AND A DERBY HAT', color: 'yellow'}], y: 80, size: 100}]},
    {a: 6, b: 8, T: 'sea', pal: 'dusk', amp: 0.5, sea: '#2a3a78', clouds: '#c8788a', mist: 0.35, fog: [30, 150],
      objs: [{k: 'liner', p: [0, 0, 10], r: PI, v: [0, 0, -0.1], s: 1.9, sp: {len: 11, funnels: 1, hullC: '#2a2e36', band: '#555', funnelC: '#2a2a2a', rough: 0.6, sink: 0.4}, hide: FR(3.6)}],
      cam: [c(0, [-10, 4, 36], [0, 4, 0], 46), c(1, [-10, 3, 36], [0, 4, -30], 44)],
      big: [{l: 6, lines: [{text: 'SAILED NORTH', color: 'white'}, {text: 'NEVER SEEN AGAIN', color: 'yellow'}], y: 90}, {l: 7, lines: [{text: 'NO WRECKAGE', color: 'red'}, {text: 'NO BODIES', color: 'red'}], y: 90, size: 120}]},
    {a: 8, b: 9, T: 'quote', head: 'U.S. NAVY INVESTIGATION', lines: ['"Many theories have', 'been advanced, but', 'none that satisfactorily', 'accounts for her', 'disappearance."'], hi: [4], size: 54, source: 'ON THE LOSS OF THE USS CYCLOPS',
      big: [{l: 8, lines: [{text: 'THE OFFICIAL ANSWER', color: 'yellow'}], y: 60, size: 90}]},
    {a: 9, b: 10, T: 'sea', pal: 'grey', amp: 0.6, sea: '#3a5e8a', clouds: '#aab4c4', mist: 0.4, fog: [20, 120],
      objs: [{k: 'liner', p: [-14, 0, -6], r: PI / 2, s: 1.5, sp: {len: 10, funnels: 1, hullC: '#2a2e36', band: '#555', funnelC: '#2a2a2a', sink: 0.2}, v: [0.015, 0, 0]}, {k: 'liner', p: [14, 0, -22], r: PI / 2, s: 1.5, sp: {len: 10, funnels: 1, hullC: '#2a2e36', band: '#555', funnelC: '#2a2a2a'}, v: [0.015, 0, 0]}],
      cam: [c(0, [-4, 4, 36], [0, 3, -10], 46), c(1, [6, 5, 32], [0, 3, -10], 44)],
      pill: [{l: 9, w: 'proteus', text: 'PROTEUS', v: 'white', keep: true}, {l: 9, w: 'nereus', text: 'NEREUS', v: 'white', x: 400}], big: [{l: 9, lines: [{text: 'TWO SISTER SHIPS', color: 'white'}, {text: 'VANISHED TOO', color: 'red'}], y: 100}]},
    {a: 10, b: null, T: 'sea', pal: 'dusk', amp: 0.4, sea: '#2a3a78', clouds: '#c8788a', objs: [],
      cam: [c(0, [0, 3, 30], [0, 3, 0], 50), c(1, [0, 40, 40], [0, 6, -20], 54)],
      big: [{l: 10, w: 'strangest', lines: [{text: 'THE STRANGEST CASES', color: 'white', size: 90}, {text: 'LEFT SOMETHING BEHIND', color: 'yellow', size: 90}], y: 100}]},
  ],
  CH4: [
    {a: 0, b: 1, T: 'map', id: 'CH4', route: ['SCOTLAND', [1100, 440], 'FLANNAN ISLES'], show: ['FLANNAN ISLES'], focus: [900, 400], zoom: [1.0, 1.25],
      pill: [{l: 0, text: 'DECEMBER 1900', v: 'yellow'}], big: [{l: 0, lines: [{text: 'FLANNAN ISLES', color: 'yellow'}, {text: '3 KEEPERS', color: 'white', size: 80}], y: 650, align: 'left', size: 120}]},
    {a: 1, b: 3, T: 'isl', pal: 'storm', stars: 0.5, moon: true, tint: NIGHT_TINT, beam: 0, lantern: 0.03, lit: 0, ship: {p: [40, 0, 38], v: -0.16, r: -PI / 2 + 0.25, lit: 1},
      cam: [c(0, [22, 16, 52], [0, 9, 0], 46), c(1, [8, 15, 44], [1, 10, -2], 44)],
      pill: [{s0: 0.2, text: '15 DEC 1900 · MIDNIGHT', v: 'yellow'}], big: [{s0: 0.4, s1: 6.2, lines: [{text: 'THE LIGHT', color: 'white'}, {text: 'WENT DARK', color: 'yellow'}]}, {s0: 6.3, lines: [{text: 'STORMS: 11 DAYS', color: 'red'}]}]},
    {a: 3, b: 4, T: 'arch', src: 'lf01/flannan.jpg', credit: 'Flannan Isles lighthouse · photo: Chris Downer, CC BY-SA 2.0',
      big: [{l: 3, lines: [{text: 'NO FLAG · NO ANSWER', color: 'yellow'}], y: 125, size: 100}]},
    {a: 4, b: 5, T: 'isl', pal: 'grey', tint: DAWN_TINT, lantern: 0.05, rain: 0.2, wind: 0.5, birds: true, seaCol: '#4a7aac', amp: 0.5, gateOpen: 0,
      people: [{who: 'moore', walk: [[-1.4, 7.4], [1.9, 2.1]], pose: 'walk'}],
      cam: [c(0, [LH.x + 8.6, GY + 5, LH.z + 16.4], [LH.x + 1, GY + 1, LH.z + 4.4], 46), c(1, [LH.x + 5.1, GY + 2.6, LH.z + 10.4], [LH.x + 1.6, GY + 1, LH.z + 3.9], 44)],
      pill: [{s0: 0.2, text: '26 DEC 1900 · RELIEF DAY', v: 'yellow'}], big: [{s0: 0.3, lines: [{text: 'ASHORE ALONE', color: 'white'}]}]},
    {a: 5, b: 6, T: 'room', cam: [c(0, [2.5, 4.2, 9.5], [-3.5, 1.5, 1], 50), c(0.5, [0.5, 3.8, 6.5], [-3, 1.8, -1], 48), c(1, [-1.8, 3.6, 1.0], [-2.2, 3.5, -5], 42)],
      big: [{s0: 0.2, s1: 2.4, lines: [{text: 'THE GATE WAS SHUT', color: 'yellow'}], size: 100}, {s0: 2.5, s1: 4.6, lines: [{text: 'BEDS EMPTY', color: 'white'}, {text: 'FIRE COLD', color: 'cyan'}]}, {s0: 4.7, lines: [{text: 'THE CLOCK HAD STOPPED', color: 'red'}], size: 100}], flashAt: [1.2]},
    {a: 6, b: 8, T: 'lantern', big: [{s0: 0.1, s1: 1.4, lines: [{text: 'THE LAMP WAS CLEANED', color: 'yellow'}], size: 100}, {s0: 1.4, lines: [{text: '2 SETS OF GEAR GONE', color: 'red'}], size: 100}], pill: [{s0: 0, text: 'UPSTAIRS · THE LIGHT ROOM', v: 'white'}]},
    {a: 8, b: 9, T: 'room', cam: [c(0, [1.0, 3.2, 3.5], [5.6, 2.8, -5.3], 50), c(1, [4.6, 2.9, -1.2], [6.0, 2.6, -5.3], 40)],
      big: [{s0: 0.2, lines: [{text: "McARTHUR'S COAT", color: 'white'}, {text: 'WAS STILL HERE', color: 'yellow'}]}], pill: [{s0: 3, text: 'OUT IN HIS SHIRT SLEEVES', v: 'red'}]},
    {a: 9, b: 10, T: 'landing', twist: 1, boxGone: 1, marker: 1, cam: [c(0, [-2, 6, 20], [4, 6.5, -2], 50), c(0.5, [0, 8.5, 15], [4.5, 8, -2.5], 48), c(1, [9.5, 8.5, 6.5], [4.6, 6.6, -1.0], 44)],
      pill: [{s0: 0.3, text: 'WEST LANDING', v: 'white'}], big: [{s0: 0.3, s1: 4.2, lines: [{text: 'IRON RAILINGS', color: 'white', size: 100}, {text: 'TWISTED', color: 'red'}]}, {s0: 4.3, lines: [{text: 'BOX 110 FT UP', color: 'yellow'}, {text: 'TORN AWAY', color: 'red'}]}]},
    {a: 10, b: 11, T: 'landing', twist: 0, boxGone: 0, roller: 1, cam: [c(0, [14, 7, 18], [4, 7, -1], 52), c(1, [12, 9, 22], [4, 8, -1], 56)],
      big: [{s0: 0.3, lines: [{text: 'THE OFFICIAL THEORY:', color: 'white', size: 84}, {text: 'ONE HUGE WAVE', color: 'yellow'}]}]},
    {a: 11, b: 12, T: 'isl', pal: 'grey', tint: DAWN_TINT, lantern: 0.05, rain: 0, birds: true, seaCol: '#4a7aac', amp: 0.55,
      cam: [c(0, [-6, 2.5, 46], [-4, 1, 30], 46), c(1, [-14, 16, 62], [0.5, 8, -3], 46)],
      big: [{s0: 0.3, lines: [{text: 'NO BODIES FOUND', color: 'white'}]}, {s0: 3.0, lines: [{text: 'WHY NO COAT?', color: 'red'}], size: 140}]},
    {a: 12, b: null, T: 'sea', pal: 'dusk', amp: 0.45, sea: '#2a3a78', clouds: '#c8788a', mist: 0.3,
      objs: [{k: 'brig', p: [-22, 0, -8], r: PI * 0.5, sp: {rough: 0.5}}, {k: 'schooner', p: [0, 0, -18], r: PI * 0.5, sp: {rough: 0.4}}, {k: 'joyita', p: [22, 0, -28], r: PI * 0.5, sp: {rough: 0.4, sink: 0.3}}],
      cam: [c(0, [-6, 4, 40], [0, 4, -10], 48), c(1, [8, 5, 34], [0, 4, -14], 44)],
      big: [{l: 12, w: 'next', lines: [{text: 'NEXT: THREE GHOST SHIPS', color: 'yellow'}], y: 80, size: 100}]},
  ],
  CH5: [
    {a: 0, b: 1, T: 'map', id: 'CH5', route: ['NEW YORK', 'AZORES', 'GIBRALTAR', 'GENOA'], show: ['NEW YORK', 'AZORES', 'GIBRALTAR', 'GENOA'], focus: [960, 540], zoom: [1.0, 1.06], routeEnd: 0.95,
      pill: [{l: 0, text: 'NOVEMBER 1872', v: 'yellow'}], big: [{l: 0, w: 'captain', lines: [{text: 'MARY CELESTE', color: 'yellow'}], y: 640, align: 'left', size: 120}]},
    {a: 1, b: 2, T: 'sea', pal: 'day', amp: 0.4, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'brig', p: [0, 0, 0], r: PI / 2, v: [0.03, 0, 0], sp: {rough: 0.6}}],
      cam: [c(0, [-20, 6, 22], [0, 4, 0], 46), c(1, [10, 7, 18], [4, 4, 0], 44)], big: [{l: 1, w: 'captain', lines: [{text: '10 PEOPLE ABOARD', color: 'yellow'}], y: 90, size: 112}], pill: [{l: 1, text: 'INCLUDING 2-YEAR-OLD SOPHIA', v: 'white'}]},
    {a: 2, b: 3, T: 'sea', pal: 'grey', amp: 0.7, sea: '#3a5e8a', clouds: '#aab4c4', objs: [{k: 'brig', p: [10, 0, -14], r: PI * 0.8, v: [-0.02, 0, 0.015], sp: {rough: 1.0, set: [0.35, 0.7], tatter: true}}],
      cam: [c(0, [-18, 5, 24], [8, 4, -10], 46), c(1, [-6, 5, 14], [4, 4, -8], 44)], big: [{l: 2, lines: [{text: 'A MONTH LATER', color: 'white'}, {text: 'SAILING UNSTEADILY', color: 'yellow', size: 100}], y: 90}]},
    {a: 3, b: 4, T: 'sea', pal: 'grey', amp: 0.6, sea: '#3a5e8a', clouds: '#aab4c4', objs: [{k: 'brig', p: [8, 0, -16], r: PI * 0.8, sp: {rough: 0.8, set: [0.35, 0.7], tatter: true}}, {k: 'lifeboat', p: [-14, 0, 6], r: PI * 0.1, v: [0.04, 0, -0.03]}, {k: 'person', p: [-14.2, 0.35, 6.2], pose: 'sit', sp: {shirt: '#2d4f7a'}}],
      cam: [c(0, [-6, 4, 22], [-6, 1, 6], 44), c(1, [-4, 3.5, 16], [0, 2, -4], 44)], big: [{l: 3, w: 'found', lines: [{text: 'FOUND NO ONE', color: 'red'}], y: 90, size: 130}]},
    {a: 4, b: 6, T: 'arch', src: 'lf01/amazon.jpg', credit: 'The ship as "Amazon", 1861 painting · public domain',
      big: [{l: 4, lines: [{text: '1,701 BARRELS · INTACT', color: 'yellow'}], y: 125, size: 92}, {l: 5, lines: [{text: 'BELONGINGS UNTOUCHED', color: 'white'}], y: 125, size: 92}]},
    {a: 6, b: 7, T: 'sea', pal: 'grey', amp: 0.6, sea: '#3a5e8a', clouds: '#aab4c4', objs: [{k: 'brig', p: [0, 0, 0], r: PI * 0.5, sp: {rough: 0.8, set: [0.35, 0.7]}}],
      cam: [c(0, [-9, 2.5, -4], [0, 1.5, -3], 52), c(1, [-5, 2.5, -2], [0, 1.5, -3], 52)], big: [{l: 6, lines: [{text: 'THE ONLY LIFEBOAT', color: 'white'}, {text: 'WAS GONE', color: 'red'}], y: 90}]},
    {a: 7, b: 9, T: 'prop', prop: 'hatch', bg: 'warm', pal: 'room', floor: '#5a4630', orbit: {center: [0, 0.6, 0], radius: 7.5, height: 3.4, from: -0.8, to: 0.9, lookY: 0, fov: 48},
      big: [{l: 7, lines: [{text: 'LAST LOG ENTRY: 9 DAYS OLD', color: 'yellow', size: 80}, {text: '~400 NAUTICAL MILES AWAY', color: 'white', size: 70}], y: 60, size: 80}, {l: 8, lines: [{text: 'PAPERS + NAVIGATION', color: 'white', size: 90}, {text: 'INSTRUMENTS GONE', color: 'red', size: 100}], y: 60}]},
    {a: 9, b: 10, T: 'sea', pal: 'day', amp: 0.4, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'rock', p: [26, 0, -50], w: 22, h: 24}, {k: 'brig', p: [-10, 0, 0], r: PI * 0.3, v: [0.015, 0, 0.0], sp: {rough: 0.5}}],
      cam: [c(0, [-12, 5, 20], [8, 6, -20], 46), c(1, [-2, 6, 18], [10, 8, -26], 44)], pill: [{l: 9, text: 'GIBRALTAR', v: 'white'}], big: [{l: 9, w: 'murder', lines: [{text: 'MURDER?', color: 'red'}], y: 80, size: 130}, {l: 9, w: 'tests', lines: [{text: 'NOT BLOOD', color: 'yellow'}], y: 80, size: 130}]},
    {a: 10, b: 12, T: 'sea', pal: 'dusk', amp: 0.45, sea: '#2a3a78', clouds: '#c8788a', mist: 0.2, objs: [{k: 'brig', p: [0, 0, 0], r: PI * 0.5, v: [0.03, 0, 0], sp: {rough: 0.6}}, {k: 'barrels', p: [-1, 2.3, 0], n: 8}],
      cam: [c(0, [-6, 5, 16], [0, 3, 0], 44), c(1, [-20, 9, 30], [6, 3, 0], 48)], big: [{l: 10, lines: [{text: 'ALCOHOL FUMES?', color: 'yellow'}], y: 90, size: 110}, {l: 11, lines: [{text: 'ALL TEN', color: 'white'}, {text: 'NEVER SEEN AGAIN', color: 'red'}], y: 90}]},
    {a: 12, b: null, T: 'prop', prop: 'bracket', bg: 'cold', pal: 'cold', floor: '#14202e', light: '#bcd8ff', lightI: 14, cam: [c(0, [0, 6, 9], [0, 0.4, 0], 46), c(1, [0, 8.2, 6.6], [0, 0.4, 0], 40)],
      big: [{l: 12, w: 'now', lines: [{text: 'REMEMBER', color: 'white'}, {text: 'THE MISSING INSTRUMENTS', color: 'yellow', size: 96}], y: 70}]},
  ],
  CH6: [
    {a: 0, b: 1, T: 'map', id: 'CH6', route: ['RIO DE JANEIRO', 'BARBADOS', 'CAPE HATTERAS', 'NORFOLK'], show: ['RIO DE JANEIRO', 'BARBADOS', 'CAPE HATTERAS'], focus: [940, 540], zoom: [1.0, 1.08], routeEnd: 0.95,
      pill: [{l: 0, text: 'JANUARY 1921', v: 'yellow'}], big: [{l: 0, lines: [{text: 'CARROLL A. DEERING', color: 'yellow', size: 100}, {text: '5-MASTED SCHOONER', color: 'white', size: 70}], y: 640, align: 'left'}]},
    {a: 1, b: 3, T: 'arch', src: 'lf01/deering.jpg', credit: 'Launch of the Carroll A. Deering, Bath, Maine, 1919 · public domain', lowres: true,
      big: [{l: 1, w: "i'll", lines: [{text: '"I\'LL GET THE CAPTAIN"', color: 'red', size: 84}], y: 125, size: 84}, {l: 2, lines: [{text: 'THE CAPTAIN FORGAVE HIM', color: 'yellow', size: 84}], y: 125, size: 84}], pill: [{l: 1, text: 'BARBADOS · THE FIRST MATE', v: 'white'}]},
    {a: 3, b: 4, T: 'sea', pal: 'day', amp: 0.5, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'schooner', p: [-20, 0, -6], r: PI / 2, v: [0.05, 0, 0], sp: {rough: 0.7}}, {k: 'ship', p: [14, 0, 6], r: PI * 0.8, sp: {hull: '#b8342c', band: '#f0f0f0', funnel: '#f0f0f0', rough: 0.5, smoke: false}, s: 1.1}],
      cam: [c(0, [4, 5, 36], [-4, 4, 0], 46), c(1, [6, 6, 26], [-2, 4, 0], 44)], pill: [{l: 3, text: 'LIGHTSHIP · NORTH CAROLINA', v: 'white'}], big: [{l: 3, lines: [{text: 'THE DEERING', color: 'white'}, {text: 'PASSES BY', color: 'yellow'}], y: 90}]},
    {a: 4, b: 6, T: 'sea', pal: 'day', amp: 0.5, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'schooner', p: [0, 0, 0], r: PI / 2, v: [0.015, 0, 0], sp: {rough: 0.6}}, {k: 'person', p: [1.5, 1.6, -2.6], pose: 'point', sp: {hair: '#b3401c', shirt: '#7a5a3a'}, ph: 1}, {k: 'person', p: [-2.2, 1.6, -0.6], pose: 'stand', sp: {shirt: '#4a5a6a'}}, {k: 'person', p: [-1.0, 1.6, 1.8], pose: 'stand', ph: 3, sp: {shirt: '#6a4a3a'}}],
      cam: [c(0, [0, 3, 22], [0, 3, 0], 48), c(1, [12, 22, 18], [0, 5, 0], 50)],
      big: [{l: 4, w: 'red-haired', lines: [{text: 'A RED-HAIRED MAN', color: 'red', size: 100}, {text: 'WITH A MEGAPHONE', color: 'white', size: 80}], y: 70}, {l: 5, lines: [{text: 'NOT THE CAPTAIN', color: 'yellow'}], y: 80, size: 120}]},
    {a: 6, b: 7, T: 'sea', pal: 'grey', amp: 0.8, sea: '#3a5e8a', clouds: '#aab4c4', fog: [40, 200], objs: [{k: 'schooner', p: [0, 0, 0], r: PI * 0.5, v: [0.0, 0, 0.0], sp: {rough: 1.0}}, {k: 'shoal', p: [10, 0, -26]}],
      cam: [c(0, [-14, 5, 24], [0, 4, 0], 46), c(1, [-6, 6, 18], [2, 4, -2], 44)], big: [{l: 6, w: 'nobody', lines: [{text: 'NOBODY ON DECK', color: 'red'}], y: 90, size: 120}], pill: [{l: 6, text: 'HEADING FOR DIAMOND SHOALS', v: 'white'}]},
    {a: 7, b: 9, T: 'sea', pal: 'gale', amp: 1.0, sea: '#3a6aa4', clouds: '#8a98b8', rain: 0.2, wind: 0.6, objs: [{k: 'schooner', p: [0, 0, 0], r: PI * 0.5, sp: {rough: 0.3, tilt: 0.12, sink: 0.35}}, {k: 'shoal', p: [4, 0, 8]}],
      cam: [c(0, [-18, 6, 22], [0, 4, 0], 46), c(1, [10, 5, 18], [0, 4, 0], 46)], big: [{l: 7, lines: [{text: 'STUCK FAST', color: 'white'}, {text: 'ALL SAILS SET', color: 'yellow'}], y: 90}, {l: 8, lines: [{text: 'BOTH LIFEBOATS GONE', color: 'red', size: 90}, {text: 'STEERING SMASHED', color: 'white', size: 90}], y: 90, size: 90}]},
    {a: 9, b: 11, T: 'prop', prop: 'stove', bg: 'warm', pal: 'room', floor: '#4a3623', cam: [c(0, [-6, 6, 12], [0, 2, 0], 46), c(1, [5, 5, 10], [0, 2.4, 0.4], 44)],
      big: [{l: 9, lines: [{text: 'SOUP · SPARERIBS', color: 'yellow', size: 100}, {text: 'COFFEE', color: 'white'}], y: 50, size: 100}, {l: 10, lines: [{text: '3 HALF-STARVED CATS', color: 'red'}], y: 50, size: 100}]},
    {a: 11, b: 12, T: 'prop', prop: 'bracket', bg: 'cold', pal: 'cold', floor: '#14202e', light: '#bcd8ff', lightI: 14, cam: [c(0, [0, 6, 9], [0, 0.4, 0], 46), c(1, [0, 8.2, 6.6], [0, 0.4, 0], 40)],
      big: [{l: 11, lines: [{text: 'LOGBOOK · PAPERS', color: 'white', size: 100}, {text: 'INSTRUMENTS: GONE', color: 'red', size: 100}], y: 60}]},
    {a: 12, b: 13, T: 'quote', head: '5 GOVERNMENT DEPARTMENTS INVESTIGATED', lines: ['OFFICIAL ANSWER:', 'NONE'], hi: [1], stamp: 'NO ANSWER', stampAt: {l: 12, w: 'reached'}, size: 90, big: [{l: 12, lines: [{text: 'THE VERDICT', color: 'yellow'}], y: 60, size: 90}]},
    {a: 13, b: null, T: 'sea', pal: 'dusk', amp: 0.5, sea: '#2a3a78', clouds: '#c8788a', mist: 0.2, objs: [{k: 'joyita', p: [0, 0, -10], r: PI * 0.5, v: [0.01, 0, 0], sp: {sink: 0.2}}],
      cam: [c(0, [-12, 3, 22], [0, 2, -10], 46), c(1, [-8, 3, 16], [0, 2, -10], 44)], big: [{l: 13, w: 'last', lines: [{text: 'THE LAST SHIP', color: 'white'}, {text: "COULDN'T EVEN SINK", color: 'yellow'}], y: 80}]},
  ],
  CH7: [
    {a: 0, b: 1, T: 'map', id: 'CH7', route: ['APIA', [1060, 600], 'TOKELAU'], show: ['APIA', 'TOKELAU'], focus: [1060, 600], zoom: [1.0, 1.25],
      pill: [{l: 0, text: 'OCTOBER 1955', v: 'yellow'}], big: [{l: 0, lines: [{text: 'THE JOYITA', color: 'yellow'}, {text: 'A 2-DAY TRIP', color: 'white', size: 80}], y: 130, align: 'left', size: 120}]},
    {a: 1, b: 2, T: 'sea', pal: 'day', amp: 0.35, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'joyita', p: [0, 0, 0], r: PI / 2, v: [0.04, 0, 0]}],
      cam: [c(0, [-14, 4, 16], [0, 1.5, 0], 46), c(1, [6, 3.5, 14], [6, 1.5, 0], 44)], big: [{l: 1, lines: [{text: 'LINED WITH CORK', color: 'white'}, {text: 'ALMOST UNSINKABLE', color: 'yellow'}], y: 80}]},
    {a: 2, b: 4, T: 'sea', pal: 'day', amp: 0.4, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'joyita', p: [0, 0, 0], r: PI * 0.5, v: [0.03, 0, 0]}, {k: 'person', p: [0.4, 1.3, 0.2], pose: 'stand', sp: {shirt: '#e8e8e8'}}, {k: 'person', p: [-0.4, 1.0, 0.8], s: 0.4, pose: 'stand', ph: 2, sp: {shirt: '#d65a4a'}}],
      cam: [c(0, [-4, 4, 12], [0, 1.5, 0], 46), c(1, [-14, 14, 22], [4, 1, 0], 50)],
      big: [{l: 2, lines: [{text: '25 ABOARD', color: 'yellow'}, {text: 'ONE ENGINE BROKEN', color: 'white', size: 90}], y: 70}, {l: 3, lines: [{text: 'NO DISTRESS CALL', color: 'red'}], y: 70, size: 120}]},
    {a: 4, b: 5, T: 'sea', pal: 'day', amp: 0.45, sea: '#2f78b8', clouds: '#ffffff', objs: [{k: 'mariner', p: [-50, 14, -14], r: PI / 2, v: [0.35, 0, 0.02], s: 1.1}, {k: 'mariner', p: [-80, 18, 6], r: PI / 2, v: [0.33, 0, 0], s: 1.0}],
      cam: [c(0, [-10, 5, 32], [-14, 12, 0], 46), c(1, [14, 5, 32], [20, 12, 0], 46)], big: [{l: 4, lines: [{text: '100,000 SQ MILES', color: 'yellow'}, {text: 'SEARCHED', color: 'white'}], y: 80}]},
    {a: 5, b: 6, T: 'arch', src: 'lf01/joyita.jpg', credit: 'Joyita found adrift, Nov 1955 · public domain', lowres: true,
      big: [{l: 5, w: 'five', lines: [{text: 'FIVE WEEKS LATER', color: 'yellow', size: 84}], y: 125, size: 84}], pill: [{l: 5, w: 'more', text: '600+ MILES OFF ROUTE', v: 'red'}]},
    {a: 6, b: 7, T: 'prop', prop: 'radio', bg: 'room', pal: 'room', floor: '#3a2a1c', cam: [c(0, [-5, 4, 10], [0.4, 1.2, 0], 46), c(1, [3, 3.4, 7.6], [0.8, 1.0, 0.2], 42)],
      big: [{l: 6, lines: [{text: 'DISTRESS CHANNEL SET', color: 'white', size: 90}, {text: 'CABLE PAINTED OVER', color: 'red', size: 100}], y: 50, size: 90}], pill: [{l: 6, w: 'could', text: 'RANGE: ABOUT 2 MILES', v: 'yellow'}]},
    {a: 7, b: 8, T: 'prop', prop: 'clock', bg: 'cold', pal: 'cold', floor: '#14202e', light: '#ffe0a0', lightI: 10, cam: [c(0, [0, 3.2, 12], [0, 2.6, 0], 46), c(1, [0, 3.0, 6.4], [0, 2.6, 0], 40)],
      big: [{l: 7, lines: [{text: 'CLOCKS STOPPED: 10:25', color: 'yellow', size: 100}], y: 40}, {l: 7, w: 'lights', lines: [{text: 'LIGHTS STILL ON', color: 'white', size: 100}], y: 40}]},
    {a: 8, b: 9, T: 'prop', prop: 'bag', bg: 'cold', pal: 'cold', floor: '#2a2018', light: '#ffd8b0', lightI: 12, cam: [c(0, [-6, 8, 9], [-0.5, 0.4, 0.6], 46), c(1, [3, 5.5, 7], [-0.5, 0.2, 0.6], 40)],
      big: [{l: 8, lines: [{text: "A DOCTOR'S BAG", color: 'white'}, {text: '4 BLOODY BANDAGES', color: 'red'}], y: 40, size: 100}]},
    {a: 9, b: 10, T: 'check', title: 'NAVIGATION INSTRUMENTS', rows: [{name: 'MARY CELESTE', what: 'papers · instruments', l: 9, w: 'mary'}, {name: 'CARROLL A. DEERING', what: 'logbook · papers · instruments', l: 9, w: 'deering'}, {name: 'JOYITA', what: 'sextant · chronometer · logbook', l: 9, w: 'her'}]},
    {a: 10, b: 11, T: 'quote', head: 'OFFICIAL INQUIRY · THE FATE OF THE 25', lines: ['"INEXPLICABLE"'], hi: [0], stamp: 'UNSOLVED', stampAt: {l: 10, w: 'inexplicable'}, size: 110},
    {a: 11, b: null, T: 'sea', pal: 'dusk', amp: 0.4, sea: '#2a3a78', clouds: '#c8788a', mist: 0.35, objs: [{k: 'joyita', p: [0, 0, -14], r: PI * 0.5, v: [0.012, 0, 0], sp: {sink: 0.45, tilt: 0.1}}],
      cam: [c(0, [-14, 3.4, 20], [0, 1.5, -14], 46), c(1, [-6, 12, 30], [0, 1.5, -14], 50)], big: [{l: 11, lines: [{text: 'NO TRACE OF THE 25', color: 'yellow'}], y: 90, size: 110}]},
  ],
  OUTRO: [
    {a: 0, b: 1, T: 'sea', pal: 'dusk', amp: 0.4, sea: '#2a3a78', clouds: '#c8788a', mist: 0.2,
      objs: [{k: 'brig', p: [-22, 0, -4], r: PI * 0.5, sp: {rough: 0.4}}, {k: 'schooner', p: [0, 0, -4], r: PI * 0.5, sp: {rough: 0.4}}, {k: 'joyita', p: [22, 0, -4], r: PI * 0.5, sp: {rough: 0.4, sink: 0.25}}],
      cam: [c(0, [0, 5, 52], [0, 3, 0], 46), c(1, [0, 4, 40], [0, 3, 0], 44)],
      big: [{l: 0, w: 'ghost', lines: [{text: '3 GHOST SHIPS', color: 'white'}], y: 70, size: 100}, {l: 0, w: 'tools', lines: [{text: 'THE TOOLS TO FIND THEIR WAY', color: 'yellow'}, {text: 'WERE GONE', color: 'red'}], y: 70, size: 96}]},
    {a: 1, b: 3, T: 'sea', pal: 'night', stars: 0.7, moon: true, amp: 0.3, sea: '#10244c', clouds: '#2a3270', mist: 0.3, objs: [],
      cam: [c(0, [0, 3, 40], [0, 3, 0], 50), c(1, [0, 3.4, 30], [0, 3, -20], 50)],
      big: [{l: 1, lines: [{text: 'MAYBE THEY MEANT', color: 'white'}, {text: 'TO COME BACK', color: 'yellow'}], y: 100}, {l: 2, lines: [{text: 'THEY NEVER DID', color: 'red'}], y: 100, size: 130}]},
    {a: 3, b: null, T: 'teaser', number: 1746, label: 'PEOPLE KILLED IN ONE NIGHT', sub: 'Mass deaths science still can\'t explain · starting with Lake Nyos', subscribeAt: {l: 4}},
  ],
};

// ------------------------------------------------------------------ composition
const Chapter = ({id}) => {
  const VO = VOS[id]; const total = frames(id); const list = SHOTS[id];
  const ctx = {VO};
  return <ChCtx.Provider value={ctx}>
    <AbsoluteFill style={{background: '#000'}}>
      <FontFaces /><style>{`@font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}`}</style>
      {list.map((s, i) => {
        const a = VO.line_starts[s.a]; const b = s.b == null ? VO.dur + GAP : VO.line_starts[s.b];
        const from = FR(a); const to = s.b == null ? total : FR(b); const Comp = T[s.T];
        return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><Comp {...s} startSec={a} endSec={s.b == null ? VO.dur + GAP : b} />{i > 0 && <Dip inFrames={4} color="#05070f" />}</Sequence>;
      })}
      <Finish vignette={0.4} grain={0.05} />
      <Sub />
    </AbsoluteFill>
  </ChCtx.Provider>;
};
export const Lf = (id) => () => <Chapter id={id} />;
export const IDS = Object.keys(VOS);

// Keep already-rendered chunks identical: COLD, CH2 and CH1 shots after the first use the pre-16:15 pill style.
for (const ch of ['COLD', 'CH1', 'CH2']) (SHOTS[ch] || []).forEach((sh, i) => { if (ch === 'CH1' && i === 0) return; (sh.pill || []).forEach((e) => { e.legacy = true; }); });
