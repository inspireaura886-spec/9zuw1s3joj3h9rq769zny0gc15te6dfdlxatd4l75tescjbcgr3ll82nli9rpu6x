import {useCurrentFrame} from 'remotion';
import {EffectComposer, Bloom, Vignette, Noise, DepthOfField, ChromaticAberration, ToneMapping, SMAA} from '@react-three/postprocessing';
import {Outlines, Sparkles, Cloud, Clouds as DClouds, Instances, Instance} from '@react-three/drei';
import * as THREE from 'three';
import {Stage, CameraRig, Terrain, makeHeight, Building, Person, Water, Campfire, Tree, Glow, VILLAGER_LOOKS, rng} from '../kit/index.js';

const h = makeHeight({seed: 7, amp: 2.2, freq: 0.05});
const World = ({f, outline, toon}) => (<>
  <Terrain height={h} size={120} seg={60} />
  <Water position={[0, 0.3, 18]} radius={14} frame={f} />
  {[[-6, -4], [5, -6], [-2, -12], [9, 2]].map(([x, z], i) => <Building key={i} position={[x, h(x, z), z]} lit={0.8} />)}
  {[[-12, 2], [12, -10], [-9, -14], [3, 8]].map(([x, z], i) => <Tree key={i} position={[x, h(x, z), z]} />)}
  <Campfire position={[0, h(0, 0), 0]} frame={f} scale={1.4} />
  {[0, 1, 2, 3].map((i) => { const a = i * 1.57 + 0.4; const x = Math.cos(a) * 2.6, z = Math.sin(a) * 2.6; return <Person key={i} position={[x, h(x, z), z]} rotation={-a - Math.PI / 2} phase={f / 10} {...VILLAGER_LOOKS[i]} />; })}
  {outline && <mesh position={[3, h(3, 3) + 1.2, 3]}><icosahedronGeometry args={[1.2, 0]} /><meshToonMaterial color="#ff5a4e" /><Outlines thickness={0.05} color="#141414" /></mesh>}
</>);

export const FxTest = ({variant = 'base'}) => {
  const f = useCurrentFrame();
  const V = new Set(variant.split('+'));
  return <Stage palette="dusk" fog={[30, 120]}>
    <CameraRig keys={[{f: 0, pos: [18, 12, 24], look: [0, 1, 0]}, {f: 90, pos: [10, 8, 16], look: [0, 1, 0]}]} />
    <World f={f} outline={V.has('outline')} />
    {V.has('sparkles') && <Sparkles count={80} scale={[14, 6, 14]} position={[0, 3, 0]} size={6} speed={0} noise={0} color="#ffb060" />}
    {V.has('post') && <EffectComposer multisampling={0} disableNormalPass>
      <Bloom intensity={1.4} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>}
    {V.has('dof') && <EffectComposer multisampling={0}>
      <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
      <Bloom intensity={0.9} luminanceThreshold={0.7} mipmapBlur />
    </EffectComposer>}
    {V.has('bloomlite') && <EffectComposer multisampling={0} disableNormalPass resolutionScale={0.5}>
      <Bloom intensity={1.4} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur levels={5} resolutionScale={0.5} />
    </EffectComposer>}
    {V.has('toon') && <mesh position={[-3, h(-3, 3) + 1.4, 3]}><icosahedronGeometry args={[1.2, 1]} /><meshToonMaterial color="#7fe3ff" /></mesh>}
    {V.has('ca') && <EffectComposer multisampling={0}><Bloom intensity={0.9} luminanceThreshold={0.7} mipmapBlur /><ChromaticAberration offset={[0.002, 0.002]} /><Vignette darkness={0.6} /></EffectComposer>}
  </Stage>;
};
