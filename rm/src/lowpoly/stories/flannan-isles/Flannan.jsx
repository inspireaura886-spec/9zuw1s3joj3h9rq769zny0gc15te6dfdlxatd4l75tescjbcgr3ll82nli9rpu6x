import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Headline, Pill, WordCaption, FontFaces, Finish, Dip, EndCard, Person, Birds, Clouds, Glow,
  clamp01, easeOut, easeInOut, rng, COLORS, Fountain, Fireflies, softTexture} from '../../kit/index.js';
import {Island, Sea, Whitecaps, Spray, Storm, Ship, KEEPERS, LH, lhY, height, LANDING, trackPts, Lighthouse, islandR} from './world.jsx';
import {Room, LanternRoom, WestLanding, LANDING_SET, Coat} from './sets.jsx';
import VO from './vo.json';

const FPS = 30;
const LS = VO.line_starts.map((s) => Math.round(s * FPS));
export const FLANNAN_FRAMES = Math.round((VO.dur + 1.6) * FPS);
const W = VO.words;
const wordAt = (txt, fromLine = 0) => { const st = VO.line_starts[fromLine]; const w = W.find((x) => x[1] >= st - 0.05 && x[0].toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(txt)); return w ? Math.round(w[1] * FPS) : 0; };
const lerpCol = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp01(t)).getHexString();

// story palettes: night storm (vivid blue/violet), grey dawn, lantern gold
const STORM = {top: '#16205a', mid: '#2f4c9a', hor: '#7d7fd0', fog: '#3a4c8e', amb: 0.95, hemiSky: '#a9c0ff', hemiGround: '#2a3060', hemiI: 1.4, sun: '#c0d4ff', sunI: 2.4, sunPos: [-25, 40, 25], rim: '#8fe6ff', rimI: 2.4, rimPos: [25, 18, -45], glow: 1};
const GREY = {top: '#4d6488', mid: '#8fa3c0', hor: '#f0c9a0', fog: '#a9b6c8', amb: 1.15, hemiSky: '#e6eeff', hemiGround: '#55606a', hemiI: 1.4, sun: '#ffe0c0', sunI: 2.6, sunPos: [30, 25, 30], rim: '#ffc0a0', rimI: 1.4, rimPos: [-30, 15, -40], glow: 0};
const GALE = {top: '#2a3a66', mid: '#56709e', hor: '#c7b7c9', fog: '#7c8aa8', amb: 1.05, hemiSky: '#cfdcff', hemiGround: '#3a4250', hemiI: 1.4, sun: '#e8eeff', sunI: 2.4, sunPos: [-30, 30, 20], rim: '#9fe0ff', rimI: 1.8, rimPos: [30, 15, -40], glow: 0.3};
const GOLD = {top: '#2a1606', mid: '#6b3a10', hor: '#e09a3a', fog: '#5a3410', amb: 1.2, hemiSky: '#ffd890', hemiGround: '#4a2a10', hemiI: 1.5, sun: '#ffd28a', sunI: 2.6, sunPos: [10, 20, 15], rim: '#ffb060', rimI: 1.8, rimPos: [-15, 10, -20], glow: 1};
const ROOM = {...GREY, amb: 1.25, fog: '#3a3020', sunPos: [8, 12, 18], sunI: 2.2, sun: '#fff0d8', hemiGround: '#6a5030'};
const NIGHT_TINT = '#8fa6f0', DAWN_TINT = '#eef0f5';
const Moon = () => <><Orb position={[-60, 55, -110]} radius={4} color="#fbf6dc" /><Glow position={[-60, 55, -109]} size={34} color="#9fc0ff" opacity={0.5} /></>;
const Flash = ({at = [], len = 7, k = 0.55}) => { const f = useCurrentFrame(); let o = 0; for (const a of at) if (f >= a && f < a + len) o = Math.max(o, k * (1 - (f - a) / len) * (Math.sin((f - a) * 2.2) > -0.3 ? 1 : 0.3)); return o > 0 ? <AbsoluteFill style={{background: '#e8f0ff', opacity: o, mixBlendMode: 'screen'}} /> : null; };
const flashAt = (f, at, len = 7) => { let o = 0; for (const a of at) if (f >= a && f < a + len) o = Math.max(o, 1 - (f - a) / len); return o; };
const beamAng = (f, speed = 0.045, ph = 0) => ph + f * speed;

// ---------- photo + document cards (real archival proof) ----------
const PhotoCard = ({src, credit, tag, delay = 0, zoom = [1.04, 1.16], pan = [0, -30], dur = 120, rot = -2}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14, stiffness: 160}}); const t = clamp01(f / dur);
  const z = zoom[0] + (zoom[1] - zoom[0]) * t;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'rgba(5,10,30,0.45)', opacity: s}} />
    <div style={{position: 'absolute', left: 120, top: 400, width: 840, height: 1040, background: '#f4efe4', padding: 18, paddingBottom: 70, boxSizing: 'border-box', borderRadius: 8,
      transform: `translateY(${(1 - s) * 140}px) rotate(${rot * s}deg) scale(${0.9 + 0.1 * s})`, opacity: s, boxShadow: '0 30px 60px rgba(0,0,0,0.55)'}}>
      <div style={{width: '100%', height: '100%', overflow: 'hidden', borderRadius: 4}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z}) translateY(${pan[0] + (pan[1] - pan[0]) * t}px)`, filter: 'contrast(1.08) saturate(1.1)'}} />
      </div>
      <div style={{position: 'absolute', bottom: 16, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 25, color: '#3a3a3a'}}>{credit}</div>
    </div>
    {tag && <Pill text={tag} y={300} variant="yellow" delay={delay + 4} size={40} />}
  </AbsoluteFill>;
};
const DocCard = ({lines, source, delay = 0, top = 560, width = 900, size = 44, highlight = []}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 15, stiffness: 150}});
  const shown = Math.floor(clamp01(f / 26) * lines.join(' ').length); let used = 0;
  return <div style={{position: 'absolute', left: (1080 - width) / 2, top, width, background: 'linear-gradient(180deg,#f3ead2,#e6d9b6)', borderRadius: 6, padding: '34px 40px 26px', boxSizing: 'border-box',
    transform: `rotate(${1.5 * s}deg) translateY(${(1 - s) * 80}px)`, opacity: s, boxShadow: '0 24px 50px rgba(0,0,0,0.6)', border: '2px solid #b9a678'}}>
    {lines.map((l, i) => { const vis = l.slice(0, Math.max(0, shown - used)); used += l.length + 1;
      return <div key={i} style={{fontFamily: 'Special Elite', fontSize: size, lineHeight: 1.25, color: highlight.includes(i) ? '#9a1d14' : '#2a2116', minHeight: size * 1.25}}>{vis}</div>; })}
    <div style={{marginTop: 14, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#5a4a30', letterSpacing: 1}}>{source}</div>
  </div>;
};
const Fonts2 = () => <style>{`@font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}`}</style>;

const Day = ({n, y = 560, x = 390}) => <div style={{position: 'absolute', top: y, left: x, width: 300, height: 250, background: '#f7f2e8', borderRadius: 16, border: '6px solid #141414', boxShadow: '0 10px 0 rgba(0,0,0,0.35)', overflow: 'hidden', textAlign: 'center'}}>
  <div style={{background: '#d6302a', color: '#fff', fontFamily: 'Lilita One', fontSize: 46, padding: '6px 0', letterSpacing: 3}}>DEC 1900</div>
  <div style={{fontFamily: 'Lilita One', fontSize: 140, color: '#141414', lineHeight: 1.15}}>{n}</div>
</div>;

// ---------- S1: hook. beam sweeping, then the light dies; three keepers vanish ----------
const S1 = () => {
  const f = useCurrentFrame(); const tDark = wordAt('dark'), tVan = wordAt('vanished');
  const beam = f < tDark ? 1 : f < tDark + 10 ? (Math.sin(f * 2.1) > 0 ? 0.8 : 0.1) : 0;
  const lantern = f < tDark ? 1 : f < tDark + 10 ? beam : 0.05;
  const van = clamp01((f - tVan) / 14); const y = lhY();
  return <Stage palette={STORM} fog={[40, 190]} overlay={<>
    <Pill text="OUTER HEBRIDES · 1900" y={236} variant="yellow" delay={-20} />
    <Headline y={318} lines={[{text: 'THE LIGHTHOUSE', color: 'white'}, {text: 'THAT WENT DARK', color: 'yellow', size: 104}]} delay={-20} />
    {f >= tVan && <Pill text="3 KEEPERS · GONE" y={1080} variant="red" delay={tVan} size={50} />}
    <Flash at={[tDark + 2, 70]} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [10, y + 4, 24], look: [LH.x, y + 4.5, LH.z], fov: 46}, {f: LS[1], pos: [5, y + 3, 15], look: [LH.x, y + 4.2, LH.z], fov: 44}]} />
    <Stars opacity={0.5} count={140} /><Moon /><Clouds frame={f} y={30} color="#4a58b8" opacity={0.95} speed={0.12} count={10} seed={3} />
    <Island frame={f} beam={beam} ang={beamAng(f, 0.06, 2.2)} lantern={lantern} tint={NIGHT_TINT} lit={f < tDark ? 0.8 : 0.0} />
    <Sea frame={f} color="#2f5fb0" amp={0.7} /><Whitecaps frame={f} /><Spray frame={f} />
    <Storm frame={f} center={[LH.x, y - 6, LH.z + 6]} area={40} />
    {['ducat', 'marshall', 'mcarthur'].map((k, i) => <Person key={k} position={[LH.x + 2 + i * 1.1, height(LH.x + 2 + i * 1.1, LH.z + 5) + van * 0.8, LH.z + 5]} rotation={0.3} scale={0.62}
      pose="stand" phase={f / 9 + i} {...KEEPERS[k]} opacity={1 - van} ghost={van > 0} />)}
  </Stage>;
};

// ---------- S2: Flannan Isles, real photo, then a passing ship sees no light ----------
const S2 = () => {
  const f = useCurrentFrame(); const base = LS[1]; const tShip = wordAt('a', 1) - base; const d = LS[2] - base; const y = lhY();
  const sz = 70 - f * 0.22;
  return <Stage palette={STORM} fog={[40, 200]} overlay={<>
    {f < tShip && <PhotoCard src="flannan/IMG1.jpg" credit="Flannan Isles lighthouse · photo: Chris Downer, CC BY-SA 2.0" tag="FLANNAN ISLES · SCOTLAND" dur={tShip} zoom={[1.02, 1.14]} pan={[10, -20]} />}
    {f >= tShip && <><Pill text="15 DEC 1900 · MIDNIGHT" y={236} variant="yellow" delay={tShip} />
      <Headline y={318} lines={[{text: 'A PASSING SHIP', color: 'white'}, {text: 'SAW NO LIGHT', color: 'yellow', size: 104}]} delay={tShip + 2} /></>}
  </>}>
    <CameraRig keys={[{f: 0, pos: [-38, 20, 40], look: [0, 6, 0], fov: 46}, {f: tShip, pos: [-30, 16, 44], look: [0, 6, 4], fov: 46}, {f: tShip + 1, pos: [36, 8, 64], look: [12, 3, 36], fov: 44}, {f: d, pos: [30, 7.5, 62], look: [9, 3.5, 34], fov: 42}]} />
    <Stars opacity={0.4} count={120} /><Moon /><Clouds frame={f + 200} y={30} color="#4a58b8" opacity={0.95} speed={0.12} count={10} seed={5} />
    <Island frame={f} beam={0} lantern={0.03} tint={NIGHT_TINT} lit={0} />
    <Sea frame={f + 127} color="#2f5fb0" amp={0.75} /><Whitecaps frame={f + 127} seed={4} /><Spray frame={f + 127} />
    <Ship position={[40 - f * 0.2, 0.6, 38]} rotation={-Math.PI / 2 + 0.25} frame={f} hull="#3a3a46" band="#e0e0e0" funnel="#b8342c" lit={1} scale={1.25} />
    <Storm frame={f} center={[10, 0, 40]} area={44} rain={0.8} />
  </Stage>;
};

// ---------- S3: storms keep the relief ship away 11 days (day counter) ----------
const S3 = () => {
  const f = useCurrentFrame(); const base = LS[2]; const d = LS[3] - base;
  const day = 15 + Math.min(11, Math.floor(clamp01((f - 10) / (d - 22)) * 11));
  return <Stage palette={GALE} fog={[30, 160]} overlay={<>
    <Pill text="RELIEF SHIP HESPERUS" y={236} variant="white" delay={2} />
    <Headline y={318} lines={[{text: 'STORMS', color: 'white'}, {text: '11 DAYS', color: 'yellow', size: 110}]} delay={3} />
    <Day n={day} y={560} x={70} />
    <Flash at={[40]} k={0.35} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [13, 7, 16], look: [0, 2.2, 0], fov: 50}, {f: d, pos: [9, 6, 12], look: [0, 2.6, 0], fov: 50}]} shake={0.25} shakeFrom={0} shakeLen={d} />
    <Clouds frame={f} y={22} color="#5a6a90" opacity={0.95} speed={0.25} count={12} seed={9} />
    <Sea frame={f * 1.6} color="#2c5d94" amp={0.95} /><Whitecaps frame={f * 1.5} count={90} area={80} opacity={0.85} center={[0, 30]} seed={6} />
    <Ship position={[0, 0.9, 0]} rotation={0.4} frame={f * 1.4} rough={1.8} lit={0.6} />
    <Storm frame={f} center={[0, 0, 0]} area={36} rain={1} wind={1.3} slant={0.5} />
  </Stage>;
};

// ---------- S4a: relief keeper lands; the gate is shut ----------
const S4a = () => {
  const f = useCurrentFrame(); const base = LS[3]; const d = wordAt('beds', 3) - base; const tGate = wordAt('gate', 3) - base;
  const gx = LH.x + 1.6, gz = LH.z + 4.4; const t = clamp01(f / (tGate + 6));
  const px = gx - 3.5 + 3.3 * t, pz = gz + 6 - 5.3 * t;
  return <Stage palette={GREY} fog={[40, 200]} overlay={<>
    <Pill text="26 DEC 1900 · RELIEF DAY" y={236} variant="yellow" delay={2} />
    {f < tGate ? <Headline key="a" y={318} lines={[{text: 'NO FLAG.', color: 'white'}, {text: 'NO ANSWER.', color: 'yellow', size: 100}]} delay={3} />
      : <Headline key="b" y={318} lines={[{text: 'THE GATE', color: 'white'}, {text: 'WAS SHUT', color: 'red', size: 110}]} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [gx + 7, height(gx, gz) + 5, gz + 12], look: [gx - 1, height(gx, gz) + 1, gz], fov: 46}, {f: d, pos: [gx + 3.5, height(gx, gz) + 2.6, gz + 6], look: [gx, height(gx, gz) + 1, gz - 0.5], fov: 44}]} />
    <Clouds frame={f} y={26} color="#d6dbe6" opacity={0.95} speed={0.15} count={10} seed={2} /><Birds center={[LH.x, 22, LH.z]} radius={14} frame={f} count={7} color="#2a3040" />
    <Island frame={f} beam={0} lantern={0.05} tint={DAWN_TINT} lit={0} gateOpen={0} />
    <Sea frame={f + 400} color="#4a7aac" amp={0.5} spec="#c0d0e0" /><Whitecaps frame={f + 400} seed={8} /><Spray frame={f + 400} />
    <Ship position={[38, 0, 30]} rotation={-1.2} frame={f} lit={0} scale={1.4} rough={0.8} />
    <Person position={[px, height(px, pz) + 0.05, pz]} rotation={Math.atan2(gx - px, gz - 0.6 - pz)} scale={0.62} pose={t < 1 ? 'walk' : 'stand'} phase={t < 1 ? f / 4 : f / 9} {...KEEPERS.moore} />
    <Storm frame={f} center={[gx, height(gx, gz), gz]} area={30} rain={0.25} wind={0.8} />
  </Stage>;
};

// ---------- S4b: inside: empty beds, cold fire, clock stopped ----------
const S4b = () => {
  const f = useCurrentFrame(); const base = wordAt('beds', 3); const d = LS[4] - base; const tClock = wordAt('clock', 3) - base;
  return <Stage palette={ROOM} fog={[30, 80]} background="radial-gradient(ellipse at 50% 40%, #6b5a48 0%, #2a2018 100%)" overlay={<>
    {f < tClock ? <Headline key="a" y={300} lines={[{text: 'BEDS EMPTY', color: 'white'}, {text: 'FIRE COLD', color: 'cyan', size: 100}]} delay={2} />
      : <Headline key="b" y={300} lines={[{text: 'THE CLOCK', color: 'white'}, {text: 'HAD STOPPED', color: 'yellow', size: 104}]} />}
    <Flash at={[30]} k={0.3} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [2.5, 4.2, 9.5], look: [-3.5, 1.5, 1], fov: 50}, {f: tClock - 4, pos: [0.5, 3.8, 6.5], look: [-3, 1.8, -1], fov: 48}, {f: tClock + 8, pos: [-1.6, 3.6, 1.2], look: [-2.2, 3.4, -5], fov: 44}, {f: d, pos: [-1.9, 3.6, -1.0], look: [-2.2, 3.5, -5], fov: 42}]} />
    <Room frame={f} flash={flashAt(f, [30])} />
  </Stage>;
};

// ---------- S5: lantern room: lamp cleaned, fountain full ----------
const S5 = () => {
  const f = useCurrentFrame(); const d = LS[5] - LS[4];
  return <Stage palette={GOLD} fog={[20, 60]} background="radial-gradient(ellipse at 50% 55%, #f0a640 0%, #8a4a14 45%, #2a1606 100%)" overlay={<>
    <Pill text="UPSTAIRS · THE LIGHT ROOM" y={236} variant="white" delay={2} />
    <DocCard top={330} size={50} width={900} lines={['"The lamp was cleaned.', 'The fountain full."']} source="JOSEPH MOORE, RELIEF KEEPER · LETTER, 28 DEC 1900" delay={4} />
  </>}>
    <CameraRig orbit={{center: [0, 2.6, 0], radius: 7.5, height: 0.6, from: -0.9, to: 0.4, start: 0, end: d, lookY: 0.2, fov: 54}} />
    <LanternRoom frame={f} glint={0.5 + 0.5 * Math.sin(f * 0.1)} />
    <Storm frame={f} center={[0, -4, 0]} area={26} rain={0.6} wind={0.6} count={140} />
  </Stage>;
};

// ---------- S6a: KEY REVEAL: McArthur's coat still on its peg ----------
const S6a = () => {
  const f = useCurrentFrame(); const base = LS[5]; const d = wordAt("he'd", 5) - base;
  return <Stage palette={ROOM} fog={[30, 80]} background="radial-gradient(ellipse at 50% 40%, #6b5a48 0%, #2a2018 100%)" overlay={<>
    <Headline y={290} lines={[{text: "ONE KEEPER'S COAT", color: 'white', size: 80}, {text: 'WAS STILL HERE', color: 'yellow', size: 100}]} delay={3} stagger={8} />
    {f > 14 && <Pill text="DONALD McARTHUR" y={1090} x="34%" variant="dark" delay={14} size={40} />}
    {f > 30 && <Pill text="2 PEGS EMPTY" y={1170} x="70%" variant="red" delay={30} size={40} />}
    <Flash at={[52]} k={0.3} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [1.0, 3.2, 3.5], look: [5.6, 2.8, -5.3], fov: 50}, {f: d, pos: [4.6, 2.9, -1.2], look: [6.0, 2.6, -5.3], fov: 40}]} />
    <Room frame={f + 300} flash={flashAt(f, [52])} coatSway={Math.sin(f * 0.07) * 0.03} door={0.15} />
  </Stage>;
};

// ---------- S6b: he went out in shirt sleeves, leaving the light alone ----------
const S6b = () => {
  const f = useCurrentFrame(); const base = wordAt("he'd", 5); const d = LS[6] - base; const tRule = wordAt('against', 5) - base; const tLeave = wordAt('leaving', 5) - base;
  const hx = LH.x + 1.6, hz = LH.z + 4.6; const k = clamp01(f / d);
  const i0 = Math.floor(k * 10); const P = trackPts[Math.min(trackPts.length - 2, i0 + 2)], Q = trackPts[Math.min(trackPts.length - 1, i0 + 3)];
  const fr = k * 10 - i0; const px = P[0] + (Q[0] - P[0]) * fr, pz = P[2] + (Q[2] - P[2]) * fr;
  const y = lhY();
  return <Stage palette={GALE} fog={[35, 180]} overlay={<>
    {f < tLeave ? <DocCard top={330} size={40} width={940} lines={['"Donald McArthur has his', 'wearing coat left behind him...', 'he went out in shirt sleeves."']} highlight={[2]} source="JOSEPH MOORE · LETTER, 28 DEC 1900 (NLB ARCHIVE)" delay={2} />
      : <Headline key="b" y={318} lines={[{text: 'THE LIGHT', color: 'white'}, {text: 'LEFT ALONE', color: 'yellow', size: 104}]} delay={tLeave} />}
    {f >= tRule && <Pill text="AGAINST THE RULES" y={1080} variant="red" delay={tRule} size={52} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [px + 6, height(px, pz) + 3.2, pz + 7], look: [px, height(px, pz) + 1, pz], fov: 46}, {f: tLeave, pos: [px + 5, height(px, pz) + 3.6, pz + 9], look: [px, height(px, pz) + 1, pz], fov: 46}, {f: d, pos: [LH.x + 9, y + 3, LH.z + 13], look: [LH.x, y + 4, LH.z], fov: 48}]} />
    <Clouds frame={f} y={24} color="#8a98b8" opacity={0.95} speed={0.25} count={12} seed={7} />
    <Island frame={f} beam={0} lantern={0.05} tint="#d8e0f0" lit={0} gateOpen={0.6} />
    <Sea frame={f + 700} color="#3a6aa4" amp={0.9} /><Whitecaps frame={f + 700} count={90} seed={2} /><Spray frame={f + 700} height={5} />
    <Person position={[px, height(px, pz) + 0.05, pz]} rotation={Math.atan2(Q[0] - P[0], Q[2] - P[2])} scale={0.62} pose="walk" phase={f / 3.2} {...KEEPERS.mcarthur} />
    <Storm frame={f} center={[px, height(px, pz) - 4, pz]} area={34} rain={0.9} wind={1.4} slant={0.55} />
  </Stage>;
};

// ---------- S7a: LOOP3: the captain blamed a gale off the cliffs ----------
const S7a = () => {
  const f = useCurrentFrame(); const base = LS[6]; const d = wordAt('but', 6) - base;
  const ex = Math.sin(-0.4) * 15.5, ez = Math.cos(-0.4) * 15.5;
  return <Stage palette={GALE} fog={[30, 170]} overlay={<>
    <Pill text="THE CAPTAIN'S TELEGRAM" y={236} variant="white" delay={1} />
    <Headline y={318} lines={[{text: 'BLOWN OFF', color: 'white'}, {text: 'THE CLIFFS?', color: 'yellow', size: 110}]} delay={2} />
    <Pill text="THEORY" y={1080} variant="red" delay={8} size={46} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [ex - 7, 13, ez + 14], look: [ex + 0.8, 9.2, ez - 3.6], fov: 48}, {f: d, pos: [ex - 4, 11.5, ez + 10], look: [ex + 0.8, 9.4, ez - 3.6], fov: 46}]} shake={0.12} shakeFrom={0} shakeLen={d} />
    <Clouds frame={f} y={24} color="#7a88aa" opacity={0.95} speed={0.35} count={12} seed={12} />
    <Island frame={f} beam={0} lantern={0.05} tint="#d8e0f0" />
    <Sea frame={f * 1.5 + 900} color="#3a6aa4" amp={1.0} /><Whitecaps frame={f * 1.4} count={90} seed={9} /><Spray frame={f * 1.3 + 50} height={6} />
    {[0, 1, 2].map((i) => <Person key={i} position={[ex - 0.3 + i * 1.1, height(ex - 0.3 + i * 1.1, ez - 3.6) + 0.05, ez - 3.6]} rotation={Math.PI + 0.3} scale={0.62} pose="stand" phase={f / 3 + i}
      {...KEEPERS[['ducat', 'marshall', 'mcarthur'][i]]} />)}
    <Storm frame={f * 1.5} center={[ex, 2, ez]} area={30} rain={0.7} wind={2} slant={0.7} />
  </Stage>;
};

// ---------- S7b: but the west landing told another story (real photo, fast punch-ins) ----------
const S7b = () => {
  const f = useCurrentFrame(); const base = wordAt('but', 6); const tL = wordAt('landing', 6) - base, tS = wordAt('story', 6) - base;
  const punch = f >= tS ? 1.12 : f >= tL ? 1.06 : 1.0;
  return <AbsoluteFill style={{background: '#1a2238'}}>
    <AbsoluteFill style={{transform: `scale(${punch + f * 0.002})`}}>
      <Img src={staticFile('flannan/IMG3.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) saturate(1.15) brightness(1.02)', transform: `translateX(${-40 + f * 0.6}px)`}} />
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,16,40,0.55) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(10,16,40,0.5) 100%)'}} />
    <Pill text="THE REAL TRACK DOWN TO THE LANDINGS" y={236} variant="yellow" delay={0} size={36} />
    <Headline y={318} lines={[{text: 'THE WEST LANDING', color: 'white', size: 90}, {text: 'ANOTHER STORY', color: 'red', size: 100}]} delay={tL - 4} />
    <div style={{position: 'absolute', top: 1500, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 26, color: '#fff', WebkitTextStroke: '5px #111', paintOrder: 'stroke fill'}}>photo: Chris Downer, CC BY-SA 2.0</div>
  </AbsoluteFill>;
};

// ---------- S8: the west landing: box 110 ft up torn away, railings twisted ----------
const S8 = () => {
  const f = useCurrentFrame(); const base = LS[7]; const d = LS[8] - base;
  const tH = wordAt('hundred', 7) - base, tTorn = wordAt('torn', 7) - base, tIron = wordAt('iron', 7) - base;
  const boxGone = clamp01((f - tTorn + 4) / 22); const twist = easeOut(clamp01((f - tIron) / 18)); const marker = clamp01((f - tH + 6) / 20);
  const BX = LANDING_SET.box;
  return <Stage palette={GALE} fog={[30, 140]} overlay={<>
    <Pill text="WEST LANDING · AFTER THE STORM" y={236} variant="white" delay={2} />
    {f < tIron ? <Headline key="a" y={318} lines={[{text: 'ROPE BOX', color: 'white'}, {text: 'TORN AWAY', color: 'yellow', size: 104}]} delay={3} />
      : <Headline key="b" y={318} lines={[{text: 'IRON RAILINGS', color: 'white', size: 90}, {text: 'TWISTED', color: 'red', size: 110}]} />}
    {f >= tH && f < tIron + 30 && <Pill text="110 FT ABOVE THE SEA" y={1080} variant="yellow" delay={tH} size={48} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [-2, 6, 20], look: [4, 6.5, -2], fov: 50}, {f: tTorn, pos: [0, 8.5, 15], look: [4.5, 8, -2.5], fov: 48}, {f: tIron, pos: [8, 9, 10], look: [4.5, 6.6, -1.2], fov: 46}, {f: d, pos: [9.5, 8.5, 6.5], look: [4.6, 6.6, -1.0], fov: 44}]} />
    <Clouds frame={f} y={26} color="#8a98b8" opacity={0.95} speed={0.3} count={10} seed={14} z0={-20} />
    <WestLanding frame={f} twist={twist} boxGone={boxGone} marker={marker} tint="#e6ebf5" />
    <Sea frame={f * 1.3 + 1100} color="#3a6aa4" amp={0.9} y={-0.2} size={160} seg={56} />
    <Whitecaps frame={f * 1.2} count={60} area={60} center={[0, 30]} seed={11} />
    <Spray frame={f} pts={[[0, 2], [2.5, 1.6], [5, 1.4], [7.5, 1.8], [-2.5, 2.2], [10, 2]]} height={4} size={2.6} period={50} />
    <Storm frame={f} center={[4, 0, 2]} area={26} rain={0.6} wind={1.2} slant={0.5} count={160} />
  </Stage>;
};

// ---------- S9: the official theory: one giant wave (Muirhead report) ----------
const S9 = () => {
  const f = useCurrentFrame(); const base = LS[8]; const d = LS[9] - base; const tW = wordAt('one', 8) - base; const tSw = wordAt('swept', 8) - base;
  const w = easeInOut(clamp01((f - tW) / (tSw - tW + 18)));
  const BX = LANDING_SET.box;
  return <Stage palette={GALE} fog={[30, 140]} overlay={<>
    <DocCard top={250} size={38} width={960} lines={['"...an unexpectedly large roller', 'had come up on the Island..."']} source="SUPT. ROBERT MUIRHEAD · OFFICIAL REPORT, 8 JAN 1901" delay={2} />
    <Pill text="OFFICIAL THEORY · NOT PROVEN" y={1080} variant="red" delay={tW} size={42} />
    <Flash at={[tSw]} k={0.4} len={9} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [14, 7, 18], look: [4, 7, -1], fov: 52}, {f: d, pos: [12, 9, 22], look: [4, 8, -1], fov: 56}]} shake={0.5} shakeFrom={tSw} shakeLen={30} />
    <Clouds frame={f} y={26} color="#7a88aa" opacity={0.95} speed={0.35} count={10} seed={15} z0={-20} />
    <WestLanding frame={f} twist={0} boxGone={0} tint="#dfe6f2" />
    <Sea frame={f * 1.5} color="#3a6aa4" amp={1.0 + w} y={-0.2} size={160} seg={56} />
    {['ducat', 'marshall'].map((k, i) => <Person key={k} position={[BX[0] - 0.4 + i * 0.9, BX[1] - 0.3, BX[2] + 0.9]} rotation={Math.PI * 0.85} scale={0.6} pose="stand" phase={f / 5 + i} {...KEEPERS[k]} opacity={1 - clamp01((w - 0.75) * 4)} />)}
    <Person position={[BX[0] + 2.2, BX[1] + 1.4 - clamp01(f / 40) * 1.2, BX[2] - 0.6 + clamp01(f / 40) * 1.0]} rotation={Math.PI * 0.8} scale={0.6} pose="walk" phase={f / 3} {...KEEPERS.mcarthur} opacity={1 - clamp01((w - 0.8) * 4)} />
    {/* the giant roller: a curling translucent wall surging up the cliff + foam column */}
    <group position={[4, -1 + w * 2, 8 - w * 9]} scale={[1, 0.2 + w * 1.0, 1]}>
      <mesh rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[6, 6, 22, 14, 1, true, 0, Math.PI * 0.75]} /><meshPhongMaterial color="#2f78c8" transparent opacity={0.92} flatShading side={THREE.DoubleSide} shininess={80} specular="#cfe6ff" /></mesh>
    </group>
    {/* foam crest riding the top of the roller */}
    {Array.from({length: 14}, (_, i) => <sprite key={'fc' + i} position={[-6 + i * 1.6, -1 + w * 2 + (0.2 + w * 1.0) * 6 * 0.92 + Math.sin(f * 0.3 + i) * 0.3, 8 - w * 9 + 1.2]} scale={[2.6, 1.4, 1]}>
      <spriteMaterial map={softTexture()} color="#ffffff" transparent opacity={0.85 * clamp01(w * 3)} depthWrite={false} /></sprite>)}
    {w > 0.55 && <Fountain position={[4.6, 1, -0.5]} t={clamp01((w - 0.55) * 2.2)} height={9} width={3.2} count={50} puff={0.17} frame={f} color="#d6ecfa" />}
    <Spray frame={f * 1.5} pts={[[0, 2], [2.5, 1.6], [5, 1.4], [7.5, 1.8], [-2.5, 2.2], [10, 2]]} height={4 + w * 6} size={2.8 + w * 2} period={40} />
    <Storm frame={f * 1.4} center={[4, 0, 2]} area={26} rain={0.8} wind={1.6} slant={0.6} count={160} />
  </Stage>;
};

// ---------- S10: no bodies were found; why leave the coat? ----------
const S10 = () => {
  const f = useCurrentFrame(); const base = LS[9]; const d = LS[10] - base; const tCoat = wordAt('why', 9) - base; const y = lhY();
  return <Stage palette={GREY} fog={[40, 220]} overlay={<>
    <Headline y={300} lines={[{text: 'NO BODIES', color: 'white'}, {text: 'EVER FOUND', color: 'yellow', size: 108}]} delay={3} />
    {f >= tCoat && <Pill text="AND WHY NO COAT?" y={1080} variant="red" delay={tCoat} size={50} />}
  </>}>
    <CameraRig keys={[{f: 0, pos: [-6, 2.5, 46], look: [-4, 1, 30], fov: 46}, {f: d, pos: [-14, 16, 62], look: [LH.x, y + 2, LH.z], fov: 46}]} />
    <Clouds frame={f} y={26} color="#d6dbe6" opacity={0.95} speed={0.12} count={10} seed={21} />
    <Birds center={[2, 14, 6]} radius={12} frame={f} count={8} color="#2a3040" speed={0.02} size={0.3} />
    <Island frame={f} beam={0} lantern={0.05} tint={DAWN_TINT} />
    <Sea frame={f + 1500} color="#4a7aac" amp={0.6} spec="#c0d0e0" /><Whitecaps frame={f + 1500} seed={13} /><Spray frame={f + 1500} />
    <Ship position={[-26, 0, 22]} rotation={0.9} frame={f} scale={1.2} rough={0.8} smoke />
    {/* searchers' small boat */}
    <group position={[-8 + f * 0.02, Math.sin(f * 0.1) * 0.25, 33]} rotation={[0, 0.6, Math.sin(f * 0.08) * 0.1]}>
      <mesh position={[0, 0.25, 0]}><boxGeometry args={[1.0, 0.5, 2.6]} /><meshLambertMaterial color="#8a4a2a" flatShading /></mesh>
      {[0, 1].map((i) => <Person key={i} position={[0, 0.3, -0.5 + i * 1.0]} scale={0.5} pose="sit" phase={f / 6 + i} {...[KEEPERS.moore, KEEPERS.ducat][i]} shirt={i ? '#4a5a3a' : KEEPERS.moore.shirt} />)}
    </group>
  </Stage>;
};

// ---------- S11: end: the light turns again; the question ----------
const S11 = () => {
  const f = useCurrentFrame(); const d = FLANNAN_FRAMES - LS[10]; const y = lhY();
  return <Stage palette={STORM} fog={[40, 190]} overlay={<>
    <Headline y={290} lines={[{text: 'ONE GIANT WAVE?', color: 'white', size: 86}, {text: 'OR A GALE OFF', color: 'yellow', size: 86}, {text: 'THE CLIFFS?', color: 'yellow', size: 86}]} delay={3} stagger={8} />
    <Pill text="TELL ME IN THE COMMENTS" y={640} variant="red" delay={30} size={44} />
    <EndCard delay={24} sources={['NORTHERN LIGHTHOUSE BOARD', 'MOORE LETTER 1900', 'MUIRHEAD REPORT 1901', 'WIKIPEDIA']} />
  </>}>
    <CameraRig keys={[{f: 0, pos: [-8, y + 2, 26], look: [LH.x, y + 4, LH.z], fov: 46}, {f: d, pos: [6, y + 3.5, 22], look: [LH.x, y + 4.5, LH.z], fov: 46}]} />
    <Stars opacity={0.5} count={140} /><Moon /><Clouds frame={f + 500} y={30} color="#4a58b8" opacity={0.95} speed={0.12} count={10} seed={3} />
    <Island frame={f} beam={clamp01(f / 20)} ang={beamAng(f, 0.06, 1.0)} lantern={clamp01(f / 20)} tint={NIGHT_TINT} lit={0.8} />
    <Sea frame={f + 1700} color="#2f5fb0" amp={0.7} /><Whitecaps frame={f + 1700} /><Spray frame={f + 1700} />
    <Storm frame={f} center={[LH.x, y - 6, LH.z + 6]} area={40} rain={0.7} />
  </Stage>;
};

const cut = (w, line) => wordAt(w, line);
const SCENES = () => [
  [S1, 0, LS[1]], [S2, LS[1], LS[2]], [S3, LS[2], LS[3]], [S4a, LS[3], cut('beds', 3)], [S4b, cut('beds', 3), LS[4]], [S5, LS[4], LS[5]],
  [S6a, LS[5], cut("he'd", 5)], [S6b, cut("he'd", 5), LS[6]], [S7a, LS[6], cut('but', 6)], [S7b, cut('but', 6), LS[7]], [S8, LS[7], LS[8]], [S9, LS[8], LS[9]],
  [S10, LS[9], LS[10]], [S11, LS[10], FLANNAN_FRAMES],
];

export const Flannan = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <FontFaces /><Fonts2 />
    {SCENES().map(([C, from, to], i) => <Sequence key={i} from={from} durationInFrames={to - from}><C />{i > 0 && <Dip inFrames={5} color="#0a0f22" />}</Sequence>)}
    <Finish vignette={0.45} grain={0.05} />
    <WordCaption words={W} y={1310} />
  </AbsoluteFill>
);
