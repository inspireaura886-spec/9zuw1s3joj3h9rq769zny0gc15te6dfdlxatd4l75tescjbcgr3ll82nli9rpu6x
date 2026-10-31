import * as THREE from 'three';
import {useMemo} from 'react';
import {rng, fbm, clamp01} from './noise.js';
import {softTexture} from './Sky.jsx';
import {Particles} from './Particles.jsx';

/**
 * ANIMATION UPGRADE 2026-10-22. Fake-volumetric light that costs almost nothing under swangle:
 * additive meshes whose alpha fades with view angle (fresnel) and along the beam, so edges are soft (no hard cut-outs).
 */
const coneVS = `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const coneFS = `uniform vec3 uColor; uniform float uOpacity; uniform float uSoft; uniform float uNoise; uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
void main(){ float edge = pow(abs(dot(vN, vV)), uSoft); float along = pow(vUv.y, 1.3);
  float streak = 1.0 - uNoise * (0.5 + 0.5 * sin(vUv.x * 40.0 + uTime * 0.05) * sin(vUv.x * 17.0 - uTime * 0.03));
  float a = uOpacity * edge * along * streak; gl_FragColor = vec4(uColor * a, a); }`;
const coneMat = (color, opacity, soft, noise, time) => new THREE.ShaderMaterial({vertexShader: coneVS, fragmentShader: coneFS, transparent: true, depthWrite: false,
  blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: {uColor: {value: new THREE.Color(color)}, uOpacity: {value: opacity}, uSoft: {value: soft}, uNoise: {value: noise}, uTime: {value: time}}});
const aimQuat = (dir) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...dir).normalize());

/**
 * Volumetric light cone (lighthouse beam, torch, UFO, streetlamp, searchlight). position = apex; dir = aim; length; radius = far radius.
 * <LightCone position={[0, 10, 0]} dir={[1, -0.15, 0]} length={30} radius={4} color="#fff1b0" opacity={0.5} frame={f} />
 */
export const LightCone = ({position = [0, 0, 0], dir = [0, -1, 0], length = 10, radius = 3, apexRadius = 0.15, color = '#fff1b0', opacity = 0.45, soft = 1.6, noise = 0.25, frame = 0, glow = true}) => {
  const geo = useMemo(() => { const g = new THREE.CylinderGeometry(apexRadius, radius, length, 28, 1, true); g.translate(0, -length / 2, 0);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i)); return g; }, [length, radius, apexRadius]);
  const mat = useMemo(() => coneMat(color, opacity, soft, noise, frame), [color, opacity, soft, noise]);
  mat.uniforms.uTime.value = frame; mat.uniforms.uOpacity.value = opacity;
  const q = useMemo(() => aimQuat(dir), [dir[0], dir[1], dir[2]]);
  return <group position={position}>
    <mesh geometry={geo} material={mat} quaternion={q} frustumCulled={false} />
    {glow && <sprite scale={[radius * 0.9, radius * 0.9, 1]}><spriteMaterial map={softTexture()} color={color} transparent opacity={Math.min(1, opacity * 1.6)} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></sprite>}
  </group>;
};

const beamVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const beamFS = `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
void main(){ float x = sin(3.14159 * vUv.x); float a = uOpacity * x * x * pow(vUv.y, 1.6) * smoothstep(0.0, 0.08, vUv.y); gl_FragColor = vec4(uColor * a, a); }`;
/**
 * God rays: 5-7 soft beams fanned out from an origin (sun gap in clouds, high window, cave mouth), each breathing a little, a soft core
 * at the root, and dust motes drifting up inside the light. dir = main beam direction. Beams are crossed quads (look volumetric from any angle).
 * <GodRays position={[-6, 18, -10]} dir={[0.3, -1, 0.4]} length={24} width={2.2} count={6} spread={0.35} frame={f} color="#ffe6a8" />
 */
export const GodRays = ({position = [0, 10, 0], dir = [0, -1, 0], count = 6, spread = 0.35, length = 20, width = 2, color = '#ffe6a8', opacity = 0.32, frame = 0, seed = 5, dust = 50}) => {
  const beams = useMemo(() => { const r = rng(seed); return Array.from({length: count}, (_, i) => ({a: (i / Math.max(1, count - 1) - 0.5) * 2 * spread + (r() - 0.5) * 0.08, b: (r() - 0.5) * spread * 0.6, w: width * (0.6 + r() * 0.8), l: length * (0.75 + r() * 0.35), ph: r() * 6.28})); }, [count, spread, length, width, seed]);
  const mats = useMemo(() => beams.map(() => new THREE.ShaderMaterial({vertexShader: beamVS, fragmentShader: beamFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: {uColor: {value: new THREE.Color(color)}, uOpacity: {value: opacity}}})), [beams, color]);
  const q = useMemo(() => aimQuat(dir), [dir[0], dir[1], dir[2]]);
  const D = new THREE.Vector3(...dir).normalize();
  return <group position={position}>
    <group quaternion={q}>
      {beams.map((b, i) => { mats[i].uniforms.uOpacity.value = opacity * (0.7 + 0.3 * Math.sin(frame * 0.035 + b.ph));
        return <group key={i} rotation={[b.b, 0, b.a]}>
          {[0, Math.PI / 2].map((ry) => <mesh key={ry} rotation={[0, ry, 0]} position={[0, -b.l / 2, 0]} material={mats[i]} frustumCulled={false}><planeGeometry args={[b.w, b.l]} /></mesh>)}
        </group>; })}
    </group>
    <sprite scale={[width * 3, width * 3, 1]}><spriteMaterial map={softTexture()} color={color} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} /></sprite>
    {dust > 0 && <Particles kind="dust" count={dust} center={[D.x * length * 0.45, D.y * length * 0.45 - length * 0.2, D.z * length * 0.45]} area={[width * 2.5, length * 0.5, width * 2.5]} frame={frame} color={color} size={0.06} seed={seed + 1} />}
  </group>;
};

// tiling fbm noise texture for fog sheets (deterministic, cached)
let _fogTex = null;
const fogTexture = () => {
  if (_fogTex) return _fogTex;
  const N = 128, cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); const im = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N * Math.PI * 2, v = y / N * Math.PI * 2; // torus mapping => seamless tile
    const n = fbm(Math.cos(u) * 1.6 + 5, Math.sin(u) * 1.6 + Math.cos(v) * 1.6, 3, 4) * 0.5 + fbm(Math.sin(v) * 1.6 + 9, Math.cos(v) * 1.6, 8, 3) * 0.5;
    const a = clamp01((n + 0.25) * 1.4); const k = (y * N + x) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = 255; im.data[k + 3] = Math.round(a * 255);
  }
  g.putImageData(im, 0, 0); _fogTex = new THREE.CanvasTexture(cv); _fogTex.wrapS = _fogTex.wrapT = THREE.RepeatWrapping; return _fogTex;
};
/**
 * Layered drifting ground fog / mist / low cloud sea: `layers` horizontal noise sheets stacked from y to y+thickness, each drifting
 * at its own speed (parallax inside the fog). Use under cliffs, over moors, around a castle "above clouds".
 * <FogLayer y={0.5} size={80} layers={4} thickness={2.5} color="#dfe8ff" opacity={0.35} frame={f} />
 */
export const FogLayer = ({y = 0, size = 60, layers = 4, thickness = 2, color = '#e6eeff', opacity = 0.3, frame = 0, speed = 0.0008, repeat = 2, center = [0, 0]}) => {
  const mats = useMemo(() => Array.from({length: layers}, (_, i) => { const t = fogTexture().clone(); t.needsUpdate = true; t.repeat.set(repeat * (1 + i * 0.2), repeat * (1 + i * 0.2));
    return new THREE.MeshBasicMaterial({map: t, color, transparent: true, depthWrite: false, opacity, side: THREE.DoubleSide, fog: false}); }), [layers, color, repeat]);
  return <group position={[center[0], y, center[1]]}>{mats.map((m, i) => {
    m.map.offset.set(frame * speed * (1 + i * 0.6) + i * 0.37, frame * speed * 0.4 * (i % 2 ? 1 : -1) + i * 0.21); m.opacity = opacity * (1 - i / (layers + 1) * 0.5);
    return <mesh key={i} material={m} position={[0, (i / Math.max(1, layers - 1)) * thickness, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={10 + i}><planeGeometry args={[size, size]} /></mesh>;
  })}</group>;
};

/**
 * Soft contact shadow blob under a character / prop (grounds floating-looking figures; huge readability win at ~0 cost).
 * <ContactShadow position={[x, groundY + 0.02, z]} radius={0.7} opacity={0.45} />
 */
export const ContactShadow = ({position = [0, 0.02, 0], radius = 0.7, opacity = 0.45, stretch = 1}) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[radius * 2 * stretch, radius * 2, 1]} renderOrder={1}>
    <planeGeometry args={[1, 1]} /><meshBasicMaterial map={softTexture()} color="#000000" transparent opacity={opacity} depthWrite={false} />
  </mesh>
);
