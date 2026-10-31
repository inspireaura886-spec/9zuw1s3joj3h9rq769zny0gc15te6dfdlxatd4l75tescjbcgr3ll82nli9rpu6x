// Kit showcase for the ANIMATION UPGRADE 2026-10-22 (not a story; no VO). 4 shots + a whip transition, ~8 s.
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {createContext, useContext} from 'react';
const Off = createContext(''); const useOff = () => useContext(Off).split(',');
import {Stage, Terrain, makeHeight, Building, Person, VILLAGER_LOOKS, Campfire, Tree, Rain, Glow, Orb, Stars,
  Post, OutlineScope, ToonMesh, Particles, Burst, Shockwave, LightCone, GodRays, FogLayer, ContactShadow, Ocean, BreakingWave, Rock, Cliff,
  ShotCam, Grade, Flash, WhipStreaks, MotionBlur, LightLeak, FontFaces, Headline, Pill, Finish, Dip, EndCard, mixPalette, PALETTES} from '../../kit/index.js';

export const KD = {A: 0, B: 66, W: 128, C: 138, D: 198, END: 246};

// ---------- Shot A: storm, stratified cliff, curling wave crashing, lighthouse beam (crane-up reveal) ----------
const storm = {...mixPalette('night', 'dusk', 0.25), fog: '#1d2b55'};
const ShotA = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 60], [0.25, 1.0], {extrapolateRight: 'clamp'});
  return <Stage palette={storm} fog={[25, 110]} overlay={<><Headline lines={[{text: 'STORM', color: 'white'}, {text: 'CLIFF', color: 'yellow'}]} delay={4} /><Grade look="night" /><Flash at={44} y="60%" max={0.55} /></>}>
    <ShotCam preset="crane" target={[-3, 3, 1]} angle={1.3} h0={2.5} h1={12} r0={20} r1={32} lookY0={3} lookY1={0.5} start={0} end={66} ease="inout" shake={0.35} shakeFrom={44} shakeLen={16} />
    <Ocean position={[0, 0, 10]} size={[110, 70]} seg={60} frame={f} amp={0.8} choppy={1.4} deep="#0b2233" face="#2f6f86" foamAt={0.86} />
    <Cliff footprint="wall" width={46} height={13} depth={14} layers={8} seed={7} position={[0, -1.5, -4]} cap="#4f7f3a" />
    <BreakingWave position={[-5, -0.4, 8]} rotation={[0, Math.PI, 0]} width={22} height={4.6} t={t} frame={f} travel={4} deep="#0d3b55" face="#3b9cb8" foam="#d9eef6" />
    <group position={[-8, 11.5, -8]}>
      <ToonMesh type="cyl" args={[0.7, 1.0, 5, 8]} color="#f4f1ea" position={[0, 2.5, 0]} outline={0.06} />
      <ToonMesh type="cyl" args={[0.75, 0.75, 0.9, 8]} color="#d6302a" position={[0, 5.4, 0]} outline={0.06} />
      <mesh position={[0, 6.2, 0]}><cylinderGeometry args={[0.55, 0.55, 0.7, 8]} /><meshBasicMaterial color="#fff1b0" toneMapped={false} /></mesh>
      <LightCone position={[0, 6.2, 0]} dir={[Math.sin(f * 0.05 + 1.2), -0.12, Math.cos(f * 0.05 + 1.2)]} length={34} radius={5} opacity={0.42} frame={f} />
    </group>
    <Rain center={[0, 0, 6]} area={40} height={24} count={260} frame={f} speed={1.1} opacity={0.4} />
    <Burst kind="splash" position={[-5, 1, -1]} start={42} frame={f} count={70} speed={0.45} up={0.9} spread={1.0} gravity={0.02} life={30} dir={[0, 1, 0.5]} />
    <Post bloom={1.0} threshold={0.62} vignette={0.5} />
  </Stage>;
};

// ---------- Shot B: night village; runner with lantern, pointer, recoil; embers + fog + outlines (dolly zoom) ----------
const hB = makeHeight({seed: 31, amp: 1.0, freq: 0.06});
const ShotB = () => {
  const f = useCurrentFrame(); const off = useOff(); const g = (x, z) => hB(x, z);
  const rz = interpolate(f, [0, 40], [-9, -1.5], {extrapolateRight: 'clamp'}); const running = f < 40;
  return <Stage palette="night" fog={[18, 70]} overlay={<><Pill text="DOLLY ZOOM" y={250} variant="dark" /><Grade look="night" strength={0.25} /></>}>
    <ShotCam preset="dollyZoom" target={[0, 1.4, 0]} dir={[0.35, 0.3, 1]} d0={7.5} d1={19} fov0={58} start={8} end={62} ease="inout" />
    <Stars opacity={0.9} /><Orb position={[30, 40, -90]} radius={4} color="#f7f3dc" />
    <Terrain height={g} size={90} seg={50} />
    {[[-7, -9, 0.4], [6, -10, -0.3], [-12, -3, 0.9], [11, -2, -0.8]].map(([x, z, r], i) => <Building key={i} position={[x, g(x, z), z]} rotation={r} lit={1} />)}
    {[[-15, -14], [14, -15], [-4, -16], [17, 6]].map(([x, z], i) => <Tree key={i} position={[x, g(x, z), z]} kind="pine" s={1.6} seed={i} frame={f} />)}
    <Campfire position={[3, g(3, 2), 2]} frame={f} scale={1.3} />
    <Particles kind="embers" center={[3, g(3, 2) + 0.3, 2]} area={[1.6, 7, 1.6]} count={60} frame={f} speed={1.2} />
    <OutlineScope thickness={off.includes('outline') ? 0 : 0.03}>
      <Person position={[0, g(0, 0), 0]} pose="recoil" actT={interpolate(f, [26, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} phase={f / 4} shadow {...VILLAGER_LOOKS[0]} rotation={Math.PI} />
      <Person position={[-2.4, g(-2.4, rz), rz]} pose={running ? 'run' : 'point'} actT={interpolate(f, [40, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} phase={running ? f / 2.4 : f / 8} prop="lantern" shadow {...VILLAGER_LOOKS[2]} rotation={0} />
      <Person position={[2, g(2, -1.5), -1.5]} pose="cower" phase={f / 6} shadow {...VILLAGER_LOOKS[3]} rotation={-2.4} />
    </OutlineScope>
    {off.includes('fogB') && <FogLayer y={g(0, 0) + 0.2} size={70} layers={4} thickness={1.6} color="#3a4f9a" opacity={0.18} frame={f} />}
    {!off.includes('post') && <Post bloom={1.3} threshold={0.4} vignette={0.55} aa={off.includes('msaa') ? 'msaa' : off.includes('smaa') ? 'none' : 'fxaa'} />}
  </Stage>;
};

// ---------- Whip: village -> dig site (speed-ramped look swing, motion blur + streaks) ----------
const Whip = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill><MotionBlur samples={4} shutterAngle={220}>
    <Stage palette={mixPalette('night', 'dusk', 0.6)} fog={[18, 80]}>
      <ShotCam preset="whip" from={[0, 5, 14]} lookA={[-14, 2, 0]} lookB={[14, 2, -4]} w0={0} w1={10} ease="ramp" drift={0} />
      <Terrain height={hB} size={90} seg={40} />
      {[[-8, -4], [8, -6], [12, 2], [-12, 3]].map(([x, z], i) => <Building key={i} position={[x, hB(x, z), z]} lit={0.6} />)}
      <Post bloom={1.0} threshold={0.45} vignette={0.5} smaa={false} />
    </Stage></MotionBlur><WhipStreaks from={0} to={10} dir="h" /></AbsoluteFill>;
};

// ---------- Shot C: golden-hour dig; digger, god rays, dust, rocks; the find bursts out (orbit reveal) ----------
const hC = makeHeight({seed: 77, amp: 1.6, freq: 0.05, shape: (x, z, h) => h - 1.6 * Math.exp(-((x * x + z * z) / 6))});
const ShotC = () => {
  const f = useCurrentFrame(); const hit = 34;
  const rise = interpolate(f, [hit, hit + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <Stage palette="dusk" fog={[25, 110]} overlay={<><Headline lines={[{text: 'THE FIND', color: 'yellow'}]} delay={hit} /><Grade look="golden" /><Flash at={hit} y="58%" max={0.7} /><LightLeak from={0} len={45} /></>}>
    <ShotCam preset="orbit" target={[0, 0.8, 0]} a0={-0.9} a1={0.5} r0={13} r1={8.5} h0={7} h1={3.2} start={0} end={60} ease="out" shake={0.3} shakeFrom={hit} shakeLen={14} />
    <Terrain height={hC} size={80} seg={50} />
    {[[-3, 2, 1.1, 1], [3.5, 1, 0.8, 2], [-2, -3.4, 1.4, 3], [4, -3, 0.9, 4], [-5, -1, 0.7, 5], [1.5, 3.8, 0.6, 6]].map(([x, z, s, k]) => <Rock key={k} position={[x, hC(x, z), z]} size={s} seed={k} color="#8a6a4a" moss={k % 2 ? '#7a9a3a' : undefined} />)}
    <Person position={[-1.4, hC(-1.4, 1.2), 1.2]} pose={f < hit ? 'dig' : 'recoil'} actT={interpolate(f, [hit, hit + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} phase={f / 3} prop={f < hit ? 'shovel' : undefined} shadow rotation={2.3} {...VILLAGER_LOOKS[1]} />
    <Person position={[1.8, hC(1.8, 2.2), 2.2]} pose="crouch" phase={f / 7} shadow rotation={-2.6} {...VILLAGER_LOOKS[4]} />
    <group position={[0, hC(0, 0) - 0.6 + rise * 1.4, 0]} rotation={[0, f * 0.05, 0.3]}>
      <ToonMesh type="ico" args={[0.55, 0]} color="#7fe3ff" emissive="#2a8ab0" outline={0.04} />
      <Glow position={[0, 0, 0]} size={3.5 * rise + 0.01} color="#7fe3ff" opacity={0.8} />
    </group>
    <GodRays position={[-5, 10, -9]} dir={[0.3, -1, 0.55]} length={15} width={2.0} count={6} spread={0.3} frame={f} color="#ffd9a0" opacity={0.4} dust={40} />
    <Particles kind="dust" center={[0, hC(0, 0), 0]} area={[10, 3, 10]} count={60} frame={f} color="#ffe6b8" />
    <Burst kind="debris" position={[0, hC(0, 0) + 0.2, 0]} start={hit} frame={f} count={36} speed={0.32} up={0.8} spread={0.9} gravity={0.02} life={40} color="#7a5a3c" floorY={hC(0, 0)} />
    <Burst kind="sparks" position={[0, hC(0, 0) + 0.5, 0]} start={hit} frame={f} count={50} speed={0.4} spread={1.1} gravity={0.006} life={26} color="#bff4ff" />
    <Shockwave position={[0, hC(0, 0) + 0.15, 0]} start={hit} frame={f} radius={7} color="#bff4ff" />
    <Post bloom={1.3} threshold={0.45} vignette={0.45} />
  </Stage>;
};

// ---------- Shot D: snow peak; climber on a stratified island cliff, snow, slow push + end card ----------
const ShotD = () => {
  const f = useCurrentFrame();
  return <Stage palette={mixPalette('dawn', 'night', 0.35)} fog={[30, 120]} overlay={<><Headline lines={[{text: 'KIT v3', color: 'white'}, {text: 'SUPERB MODE', color: 'cyan'}]} delay={6} /><Grade look="cold" /><EndCard sources={['three.js', 'postprocessing', 'Remotion']} delay={20} /></>}>
    <ShotCam preset="push" from={[11, 10, 20]} to={[8, 9, 15]} target={[1.5, 6.5, 2]} fov0={50} fov1={44} start={0} end={48} />
    <Cliff footprint="island" radius={6} height={10} layers={7} seed={12} colors={['#7d7a86', '#9a97a6', '#6a6874', '#b3b0bd']} cap="#f4f7ff" capThickness={0.7} boulders={8} position={[0, -1, 0]} />
    <Terrain height={(x, z) => -1.2 + 0.6 * Math.sin(x * 0.2) * Math.cos(z * 0.25)} size={100} seg={30} colorFn={() => '#e8eef8'} />
    <Person position={[3.3, 6.2 + Math.sin(f / 5) * 0.05 + f * 0.012, 4.6]} pose="climb" phase={f / 5} rotation={Math.PI + 0.62} shadow={false} {...VILLAGER_LOOKS[5]} />
    <Particles kind="snow" center={[0, 0, 0]} area={[30, 22, 30]} count={260} frame={f} wind={[0.03, 0]} />
    <FogLayer y={0} size={90} layers={3} thickness={1.5} color="#eef3ff" opacity={0.3} frame={f} />
    <Post bloom={0.9} threshold={0.6} vignette={0.45} />
  </Stage>;
};

export const KitDemo = ({off = ''}) => <Off.Provider value={off}><AbsoluteFill style={{background: '#000'}}><FontFaces />
  <Sequence from={KD.A} durationInFrames={KD.B - KD.A}><ShotA /></Sequence>
  <Sequence from={KD.B} durationInFrames={KD.W - KD.B}><ShotB /></Sequence>
  <Sequence from={KD.W} durationInFrames={KD.C - KD.W}><Whip /></Sequence>
  <Sequence from={KD.C} durationInFrames={KD.D - KD.C}><ShotC /></Sequence>
  <Sequence from={KD.D} durationInFrames={KD.END - KD.D}><ShotD /></Sequence>
  <Finish vignette={0.25} grain={0.05} />
</AbsoluteFill></Off.Provider>;
