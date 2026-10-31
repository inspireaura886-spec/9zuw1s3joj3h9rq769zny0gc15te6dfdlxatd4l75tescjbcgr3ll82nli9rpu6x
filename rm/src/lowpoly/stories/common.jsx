import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile} from 'remotion';
import {Pill, clamp01} from '../kit/index.js';

export const Flash = ({at = [], len = 7, k = 0.55, color = '#e8f0ff'}) => { const f = useCurrentFrame(); let o = 0; for (const a of at) if (f >= a && f < a + len) o = Math.max(o, k * (1 - (f - a) / len) * (Math.sin((f - a) * 2.2) > -0.3 ? 1 : 0.3)); return o > 0 ? <AbsoluteFill style={{background: color, opacity: o, mixBlendMode: 'screen'}} /> : null; };
export const flashAt = (f, at, len = 7) => { let o = 0; for (const a of at) if (f >= a && f < a + len) o = Math.max(o, 1 - (f - a) / len); return o; };
export const PhotoCard = ({src, credit, tag, delay = 0, zoom = [1.04, 1.16], pan = [0, -30], dur = 120, rot = -2}) => {
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
export const DocCard = ({lines, source, delay = 0, top = 560, width = 900, size = 44, highlight = []}) => {
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
export const Fonts2 = () => <style>{`@font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}`}</style>;

/** line segment between two points (glowing beam, bolt segment, path). */
export const Seg = ({a, b, w = 0.1, color = '#ffffff', opacity = 1, add = true}) => {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b); const d = vb.clone().sub(va); const len = d.length(); if (len < 1e-4) return null;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); const m = va.clone().add(vb).multiplyScalar(0.5);
  return <mesh position={m.toArray()} quaternion={q}><cylinderGeometry args={[w, w, len, 5]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} blending={add ? THREE.AdditiveBlending : THREE.NormalBlending} depthWrite={false} fog={false} /></mesh>;
};
