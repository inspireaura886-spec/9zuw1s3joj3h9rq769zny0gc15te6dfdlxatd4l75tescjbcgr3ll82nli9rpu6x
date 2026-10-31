import React from 'react';
import {staticFile, AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {EffectComposer, Bloom, Vignette} from '@react-three/postprocessing';
import {Prop, Rigged, usePreload} from './glb.js';
import {CamPath} from './camPath.js';

// deterministic rng
const rng = (s) => () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) >>> 0) / 4294967296;
const G = (n) => `graveyard/${n}.glb`;
const stones = ['gravestone-round', 'gravestone-cross', 'gravestone-bevel', 'gravestone-broken', 'gravestone-decorative', 'gravestone-wide', 'cross-wood'];
const r = rng(7);
const graves = Array.from({length: 26}, (_, i) => {
  const row = Math.floor(i / 6), col = i % 6;
  return {n: stones[Math.floor(r() * stones.length)], x: -5 + col * 2 + (r() - 0.5) * 0.6, z: -3 - row * 2.2 + (r() - 0.5) * 0.5, ry: (r() - 0.5) * 0.5};
}).filter((g) => Math.abs(g.x) > 1.1);
const pines = Array.from({length: 10}, (_, i) => ({x: (i % 2 ? 1 : -1) * (7 + r() * 3), z: -2 - i * 1.6, s: 1.6 + r()}));

const ALL = [...new Set([...graves.map((g) => G(g.n)), G('pine'), G('pine-crooked'), G('crypt-large'), G('road'), G('iron-fence'), G('fire-basket'), G('pumpkin-carved'), 'blocky/character-j.glb', 'blocky/character-o.glb'])];
function World({frame, fps}) {
  const t = frame / fps;
  const flick = 1 + 0.15 * Math.sin(frame * 1.7) + 0.08 * Math.sin(frame * 4.3);
  // keeper walks toward the crypt along z, zombie rises/sprints from behind a stone then falls
  const keeperZ = interpolate(t, [0, 3.2], [3.5, -1.2], {extrapolateRight: 'clamp'});
  const zombieZ = interpolate(t, [1.6, 3.4], [-6, -2.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <color attach="background" args={['#0b1030']} />
      <fog attach="fog" args={['#18204a', 8, 26]} />
      <hemisphereLight args={['#6d7cff', '#1a1030', 0.55]} />
      <directionalLight position={[-6, 10, 4]} intensity={0.9} color="#a9b8ff" castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#2b3b2a" flatShading />
      </mesh>
      <mesh position={[-9, 11, -22]}><sphereGeometry args={[1.6, 12, 8]} /><meshBasicMaterial color="#fff6c8" /></mesh>
      <Prop path={G('crypt-large')} position={[0, 0, -9]} scale={1.6} />
            {graves.map((g, i) => <Prop key={i} path={G(g.n)} position={[g.x, 0, g.z]} rotation={[0, g.ry, 0]} />)}
      {pines.map((p, i) => <Prop key={'p' + i} path={G(i % 3 ? 'pine-crooked' : 'pine')} position={[p.x, 0, p.z]} scale={p.s} />)}
      {[-1, 1].map((s) => <Prop key={'f' + s} path={G('iron-fence')} position={[s * 3.2, 0, -12]} scale={1.2} />)}
      <Prop path={G('fire-basket')} position={[1.6, 0, -7]} />
      <pointLight position={[1.6, 1.2, -7]} color="#ff8a3a" intensity={6 * flick} distance={9} decay={1.6} />
      <Prop path={G('pumpkin-carved')} position={[-1.5, 0, 1.2]} rotation={[0, 0.6, 0]} />
      <pointLight position={[-1.5, 0.5, 1.2]} color="#ff9a2a" intensity={2.2 * flick} distance={4} />
      {/* keeper with lantern glow */}
      <Rigged path="blocky/character-j.glb" time={t} clips={[{name: 'walk', from: 0}, {name: 'emote-no', from: 3.2, loop: false}]}
        position={[0.3, 0, keeperZ]} rotation={[0, Math.PI, 0]} scale={0.42} />
      <pointLight position={[0.9, 1.6, keeperZ - 0.9]} color="#ffd27a" intensity={2.2 * flick} distance={5} />
      <Rigged path="blocky/character-o.glb" time={t} clips={[{name: 'idle', from: 0}, {name: 'sprint', from: 1.6}, {name: 'die', from: 3.4, loop: false}]}
        position={[-0.2, 0, zombieZ]} scale={0.42} />
    </>
  );
}

export const Graveyard = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ready = usePreload(ALL);
  // GitGems-lab hook: white flash slam f0-3, word punch-in spring, decaying shake
  const flash = interpolate(frame, [0, 4], [0.75, 0], {extrapolateRight: 'clamp'});
  const pop = spring({frame: frame - 2, fps, config: {damping: 11, mass: 0.6}});
  const shake = Math.max(0, 1 - frame / 14) * 14;
  const sx = Math.sin(frame * 2.1) * shake, sy = Math.cos(frame * 2.7) * shake;
  return (
    <AbsoluteFill style={{background: '#0b1030'}}>
      <style>{`@font-face{font-family:Anton;src:url(${staticFile('fonts/Anton.ttf')});}`}</style>
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
        {ready && <ThreeCanvas width={1080} height={1920} shadows camera={{fov: 40, position: [0, 3, 8]}}>
          <CamPath frame={frame} start={0} end={120}
            points={[[0, 9, 9], [2.5, 4, 6.5], [1.8, 1.6, 4.2], [0.9, 1.1, 1.8]]}
            looks={[[0, 0, -2], [0, 0.6, -2], [0, 0.8, -1.5], [0, 0.6, -2.6]]} fov={42} roll={0.05} />
          <World frame={frame} fps={fps} />
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.55} />
            <Vignette offset={0.3} darkness={0.75} />
          </EffectComposer>
        </ThreeCanvas>}
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 300}}>
        <div style={{fontFamily: 'Anton', fontSize: 128, color: 'transparent', WebkitTextStroke: '6px #fff',
          transform: `scale(${1.6 - 0.6 * pop})`, opacity: Math.min(1, pop * 1.4), letterSpacing: 4, whiteSpace: 'nowrap'}}>HE CAME BACK</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
