import {pal} from '../../../palette.js'; // HUMANE caption palette 2026-11-03
// LF06 FILE 006 "Messages Nobody Can Read" shot components (1920x1080 @ 24 fps).
// 2D: CipherShot (glyph grids: Zodiac Z340 17x20, Z13/Z32, Dorabella curves, Phaistos stamps), ScrapShot (Tamam Shud paper).
// 3D: CodeShot scenes 'screen' (Kryptos courtyard), 'book' (Voynich), 'beach' (Somerton Park), 'hill' (Beale), 'disc' (Phaistos).
// ALL are ILLUSTRATIVE RECREATIONS (no real glyph content is claimed): symbols are generic stand-ins, never the real cipher.
import * as THREE from 'three';
import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Stage, CameraRig, Stars, Orb, Glow, Tree, Building, FogLayer, Particles, Person, clamp01, easeOut, easeInOut} from '../../kit/index.js';
import {FR, FPS, PAL, useCh, relF, TimedOverlays, BigE, PillE, STROKE} from './shots.jsx';

const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const Ov = ({big, pill, startSec, endSec}) => <>
  <TimedOverlays ents={big && big.map((e) => ({...e, kind: 'big'}))} startSec={startSec} endSec={endSec} C={BigE} />
  <TimedOverlays ents={pill && pill.map((e) => ({...e, kind: 'pill'}))} startSec={startSec} endSec={endSec} C={PillE} />
</>;
const keysOf = (cam, d) => cam.map((k) => ({...k, f: Math.round(k.t * d)}));
const cue = (VO, e, startSec) => (e ? Math.max(0, relF(VO, e, startSec)) : null);
const RecTag = ({text = 'ILLUSTRATIVE RECREATION'}) => <div style={{position: 'absolute', right: 96, bottom: 250, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#cfd8ea', opacity: 0.75, ...STROKE(6)}}>{text}</div>;

// ---------------------------------------------------------------- 2D glyphs (SVG, font-independent)
const GLYPHS = [
  (s) => <circle cx={0} cy={0} r={s * 0.38} fill="none" stroke="currentColor" strokeWidth={s * 0.12} />,
  (s) => <path d={`M${-s * 0.4} ${s * 0.35}L0 ${-s * 0.4}L${s * 0.4} ${s * 0.35}Z`} fill="none" stroke="currentColor" strokeWidth={s * 0.12} strokeLinejoin="round" />,
  (s) => <rect x={-s * 0.33} y={-s * 0.33} width={s * 0.66} height={s * 0.66} fill="none" stroke="currentColor" strokeWidth={s * 0.12} />,
  (s) => <path d={`M${-s * 0.38} ${-s * 0.38}L${s * 0.38} ${s * 0.38}M${s * 0.38} ${-s * 0.38}L${-s * 0.38} ${s * 0.38}`} stroke="currentColor" strokeWidth={s * 0.13} strokeLinecap="round" />,
  (s) => <path d={`M0 ${-s * 0.42}L0 ${s * 0.42}M${-s * 0.42} 0L${s * 0.42} 0`} stroke="currentColor" strokeWidth={s * 0.13} strokeLinecap="round" />,
  (s) => <path d={`M0 ${-s * 0.42}L${s * 0.36} 0L0 ${s * 0.42}L${-s * 0.36} 0Z`} fill="currentColor" />,
  (s) => <path d={`M${-s * 0.38} ${s * 0.1}A${s * 0.38} ${s * 0.38} 0 0 1 ${s * 0.38} ${s * 0.1}`} fill="none" stroke="currentColor" strokeWidth={s * 0.13} strokeLinecap="round" />,
  (s) => <circle cx={0} cy={0} r={s * 0.22} fill="currentColor" />,
  (s) => <path d={`M${-s * 0.3} ${-s * 0.4}L${-s * 0.3} ${s * 0.4}M${s * 0.3} ${-s * 0.4}L${s * 0.3} ${s * 0.4}`} stroke="currentColor" strokeWidth={s * 0.13} strokeLinecap="round" />,
  (s) => <path d={`M${-s * 0.4} ${-s * 0.1}Q0 ${-s * 0.6} ${s * 0.4} ${-s * 0.1}M${-s * 0.4} ${s * 0.25}Q0 ${-s * 0.25} ${s * 0.4} ${s * 0.25}`} fill="none" stroke="currentColor" strokeWidth={s * 0.11} strokeLinecap="round" />,
  (s) => <path d={`M${-s * 0.35} ${s * 0.35}L${s * 0.35} ${s * 0.35}L0 ${-s * 0.35}Z`} fill="currentColor" />,
  (s) => <path d={`M${-s * 0.4} 0L${s * 0.4} 0M0 ${-s * 0.4}L0 ${s * 0.4}M${-s * 0.28} ${-s * 0.28}L${s * 0.28} ${s * 0.28}`} stroke="currentColor" strokeWidth={s * 0.1} strokeLinecap="round" />,
];
// Dorabella-style: a small curve (1-3 loops) pointing one of 8 directions
const Curve = ({s, loops, dir}) => {
  const a = (dir / 8) * Math.PI * 2; const r = s * 0.17;
  return <g transform={`rotate(${(a * 180) / Math.PI})`} color="currentColor">
    {Array.from({length: loops}, (_, i) => <path key={i} d={`M${-s * 0.3 + i * r * 1.7} ${r} A${r} ${r} 0 0 1 ${-s * 0.3 + i * r * 1.7 + r * 1.6} ${r}`} fill="none" stroke="currentColor" strokeWidth={s * 0.1} strokeLinecap="round" />)}
  </g>;
};

export const CipherShot = ({big, pill, startSec, endSec, kind = 'zodiac', cols = 17, rows = 20, head = 'ILLUSTRATIVE STAND-IN SYMBOLS', foot, color = pal().active, scanAt = null, scanDur = 4, solvedAt = null, solvedText = [], hot = null, noteStamp, stampAt = null, size = 34, dim = 0.6, bg = 'radial-gradient(ellipse at 50% 45%, #2a2418 0%, #090806 88%)', tint = '#e8dcb8'}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const {VO} = useCh();
  const sF = cue(VO, scanAt, startSec); const vF = cue(VO, solvedAt, startSec); const tF = cue(VO, stampAt, startSec);
  const gw = cols * size * 1.12; const gh = rows * size * 1.18; const x0 = 960 - gw / 2; const y0 = 600 - gh / 2;
  const scan = sF === null ? -1 : clamp01((f - sF) / FR(scanDur));
  const solved = vF === null ? 0 : easeOut(clamp01((f - vF) / 14));
  const appear = clamp01(f / 14);
  return <AbsoluteFill style={{background: bg}}>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
      <g opacity={appear * dim * (1 - 0.7 * solved)} style={{color: tint}}>
        {Array.from({length: cols * rows}, (_, i) => { const c = i % cols; const r = Math.floor(i / cols); const x = x0 + (c + 0.5) * size * 1.12; const y = y0 + (r + 0.5) * size * 1.18;
          const g = Math.floor(rnd(i * 3.7 + 1) * GLYPHS.length); const isHot = hot && hot.includes(i); const col = isHot && f > (vF ?? 9999) - 4 ? color : (scan >= 0 && (r + c * 0.3) / (rows + cols * 0.3) < scan ? '#fff6d0' : tint);
          return <g key={i} transform={`translate(${x},${y})`} style={{color: col}}>{kind === 'dora' ? <Curve s={size} loops={1 + Math.floor(rnd(i + 5) * 3)} dir={Math.floor(rnd(i + 9) * 8)} /> : GLYPHS[g](size)}</g>; })}
      </g>
      {scan >= 0 && scan < 1 && <rect x={x0 - 20} y={y0 + scan * gh - 6} width={gw + 40} height={12} fill={color} opacity={0.75} />}
    </svg>
    {solved > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: solved, transform: `scale(${0.9 + 0.1 * solved})`}}>
      {solvedText.map((t, i) => <div key={i} style={{fontFamily: 'Lilita One', fontSize: i === 0 ? 120 : 64, color: i === 0 ? color : '#ffffff', letterSpacing: 6, margin: '8px 0', ...STROKE(14)}}>{t}</div>)}
    </div>}
    {tF !== null && f >= tF && <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, textAlign: 'center', transform: `rotate(-3deg) scale(${spring({frame: f - tF, fps, config: {damping: 8, stiffness: 190}})})`}}>
      <span style={{fontFamily: 'Lilita One', fontSize: 88, color: pal().alt, border: `10px solid ${pal().alt}`, padding: '4px 36px', letterSpacing: 8, background: 'rgba(6,6,10,0.7)'}}>{noteStamp}</span></div>}
    <div style={{position: 'absolute', left: 96, bottom: 190, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#cfd8ea', opacity: 0.85, ...STROKE(6)}}>{head}</div>
    {foot && <div style={{position: 'absolute', left: 96, bottom: 225, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 28, letterSpacing: 3, color: '#cfd8ea', opacity: 0.85, ...STROKE(6)}}>{foot}</div>}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
  </AbsoluteFill>;
};

// Tamam Shud scrap + the five indented lines of capitals (letters are a generic stand-in: the real letters are not reproduced)
export const ScrapShot = ({big, pill, startSec, endSec, mode = 'scrap', revealAt = null, strikeAt = null}) => {
  const f = useCurrentFrame(); const {VO} = useCh(); const rF = cue(VO, revealAt, startSec); const kF = cue(VO, strikeAt, startSec);
  const t = rF === null ? 1 : clamp01((f - rF) / 12); const strike = kF === null ? 0 : clamp01((f - kF) / 10);
  const lines = ['QXNVLPSDK', 'HEDVWK', 'TFKRUYZBCMA', 'JPOLXDEWNQR', 'ZYTBGHVCSLUAM'];
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #2b2a2e 0%, #08080a 88%)'}}>
    {mode === 'scrap' ? <div style={{position: 'absolute', left: 660, top: 280, width: 600, height: 440, transform: 'rotate(-4deg)', background: '#e9dfc6', boxShadow: '0 40px 90px rgba(0,0,0,0.8)', clipPath: 'polygon(0 6%, 12% 0, 30% 4%, 52% 0, 76% 5%, 100% 0, 97% 38%, 100% 66%, 96% 100%, 70% 95%, 42% 100%, 18% 94%, 0 100%, 3% 55%)', textAlign: 'center'}}>
      <div style={{fontFamily: 'Special Elite', fontSize: 120, color: '#2a2a30', marginTop: 120, letterSpacing: 6}}>TAMAM</div>
      <div style={{fontFamily: 'Special Elite', fontSize: 120, color: '#2a2a30', letterSpacing: 6}}>SHUD</div>
    </div> :
    <div style={{position: 'absolute', left: 460, top: 220, width: 1000, height: 640, transform: 'rotate(-1.5deg)', background: '#d8cdb0', boxShadow: '0 40px 90px rgba(0,0,0,0.8)', opacity: 0.45 + 0.55 * t}}>
      <div style={{position: 'absolute', left: 40, top: 24, fontFamily: 'Fredoka', fontWeight: 700, fontSize: 28, letterSpacing: 4, color: '#6a4a30'}}>INDENTATIONS · BACK OF THE BOOK · STAND-IN LETTERS</div>
      {lines.map((l, i) => <div key={i} style={{position: 'absolute', left: 70, top: 100 + i * 100, fontFamily: 'Special Elite', fontSize: 72, letterSpacing: 14, color: '#4a4a55', opacity: 0.85 * t}}>{l}{i === 1 && strike > 0 && <span style={{position: 'absolute', left: 0, top: 40, height: 8, width: `${strike * 100}%`, background: '#9a1d14'}} />}</div>)}
    </div>}
    <Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />
    <RecTag />
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- canvas textures
const useTex = (draw, w, h) => useMemo(() => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}, []); // eslint-disable-line

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lettersTex = (ctx, w, h) => {
  ctx.fillStyle = '#b4662f'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#2a1608';
  ctx.font = 'bold 22px monospace'; ctx.textBaseline = 'middle';
  for (let r = 0; r < Math.floor(h / 30); r++) for (let c = 0; c < Math.floor(w / 24); c++) ctx.fillText(LETTERS[Math.floor(rnd(r * 91 + c * 7 + 3) * 26)], c * 24 + 4, r * 30 + 18);
};
const pageTex = (ctx, w, h, plant) => {
  ctx.fillStyle = '#d9c79a'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const top = plant ? h * 0.48 : 40;
  for (let r = 0; r < (plant ? 11 : 22); r++) { let x = 40; const y = top + r * 22; while (x < w - 60) { const n = 12 + Math.floor(rnd(r * 13 + x) * 30); ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + n * 0.3, y - 10 - rnd(x + r) * 8, x + n * 0.7, y + 10, x + n, y - 2); ctx.stroke(); x += n + 14; } }
  if (plant) { ctx.strokeStyle = '#2f6a38'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(w / 2, h * 0.42); ctx.lineTo(w / 2, 40); ctx.stroke();
    for (let i = 0; i < 7; i++) { const y = h * 0.4 - i * 48; ctx.fillStyle = i % 2 ? '#3f8a4a' : '#5aa05a'; [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.ellipse(w / 2 + s * 46, y, 40, 16, s * 0.5, 0, 6.3); ctx.fill(); }); }
    ctx.fillStyle = '#a8352f'; ctx.beginPath(); ctx.arc(w / 2, 36, 22, 0, 6.3); ctx.fill(); }
};
const discTex = (ctx, w, h) => {
  ctx.fillStyle = '#b98a5c'; ctx.fillRect(0, 0, w, h); const cx = w / 2, cy = h / 2; let a = 0, r = w * 0.44; ctx.fillStyle = '#4a2c14';
  let i = 0; while (r > w * 0.06) { const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2); const k = Math.floor(rnd(i * 5.1) * 4);
    if (k === 0) { ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.3); ctx.fill(); } else if (k === 1) ctx.fillRect(-9, -13, 18, 26); else if (k === 2) { ctx.beginPath(); ctx.moveTo(-12, 12); ctx.lineTo(0, -14); ctx.lineTo(12, 12); ctx.fill(); } else { ctx.fillRect(-14, -4, 28, 8); ctx.fillRect(-4, -14, 8, 28); }
    ctx.restore(); a += 0.19; r -= 0.9 + 0.045 * i * 0.08; i++; }
  ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, w * 0.47, 0, 6.3); ctx.stroke();
};

// ---------------------------------------------------------------- 3D scenes
const Kryptos = ({clueGlow = 0, f}) => {
  const tex = useTex(lettersTex, 1200, 600); const N = 18; const len = 36;
  const seg = useMemo(() => Array.from({length: N}, (_, i) => { const t0 = i / N, t1 = (i + 1) / N; const x0 = (t0 - 0.5) * len, x1 = (t1 - 0.5) * len; const z0 = Math.sin(t0 * Math.PI * 2) * 3.2, z1 = Math.sin(t1 * Math.PI * 2) * 3.2;
    const tx = tex.clone(); tx.needsUpdate = true; tx.repeat.set(1 / N, 1); tx.offset.set(t0, 0); return {x: (x0 + x1) / 2, z: (z0 + z1) / 2, ry: -Math.atan2(z1 - z0, x1 - x0), w: Math.hypot(x1 - x0, z1 - z0) + 0.05, tx}; }), [tex]);
  return <group>
    {seg.map((s, i) => <mesh key={i} position={[s.x, 3.2, s.z]} rotation={[0, s.ry, 0]}><boxGeometry args={[s.w, 6.2, 0.18]} /><meshLambertMaterial map={s.tx} flatShading /></mesh>)}
    {clueGlow > 0 && <Glow position={[len * 0.32, 3, 1.6]} size={14} color="#ffd070" opacity={0.35 * clueGlow} />}
    <mesh position={[0, 0.1, 0]}><boxGeometry args={[40, 0.2, 9]} /><meshLambertMaterial color="#4a4a52" flatShading /></mesh>
  </group>;
};

export const CodeShot = ({scene = 'screen', cam, big, pill, startSec, endSec, rec = true, drift = 0.04, clueAt = null, openAt = null, digAt = null, flipDeg = 0, label}) => {
  const f = useCurrentFrame(); const d = FR(endSec - startSec); const {VO} = useCh();
  const cF = cue(VO, clueAt, startSec); const oF = cue(VO, openAt, startSec); const gF = cue(VO, digAt, startSec);
  const clue = cF === null ? 0 : easeOut(clamp01((f - cF) / 10));
  const pal = scene === 'screen' ? 'night' : scene === 'book' ? 'room' : scene === 'beach' ? 'dusk' : scene === 'hill' ? 'night' : 'room';
  const pageL = useTex((c, w, h) => pageTex(c, w, h, true), 512, 700); const pageR = useTex((c, w, h) => pageTex(c, w, h, false), 512, 700); const dtex = useTex(discTex, 1024, 1024);
  const fog = scene === 'book' || scene === 'disc' ? [20, 80] : [30, 190];
  return <Stage palette={PAL[pal]} fog={fog} overlay={<><Ov big={big} pill={pill} startSec={startSec} endSec={endSec} />{rec && <RecTag />}{label && <div style={{position: 'absolute', left: 96, top: 150, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, letterSpacing: 3, color: '#cfd8ea', opacity: 0.8, ...STROKE(6)}}>{label}</div>}</>}>
    {cam && <CameraRig keys={keysOf(cam, d)} drift={drift} />}
    {(scene === 'screen' || scene === 'hill') && <Stars opacity={0.85} count={200} />}

    {scene === 'screen' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[160, 30]} /><meshLambertMaterial color="#232a26" flatShading /></mesh>
      <mesh position={[0, 0.02, -14]}><boxGeometry args={[60, 0.1, 18]} /><meshLambertMaterial color="#5a5448" flatShading /></mesh>
      <group position={[0, 0.05, -14]}><Kryptos clueGlow={clue} f={f} /></group>
      <mesh position={[0, 9, -48]}><boxGeometry args={[110, 18, 12]} /><meshLambertMaterial color="#2c3140" flatShading /></mesh>
      {Array.from({length: 24}, (_, i) => <mesh key={i} position={[-48 + i * 4.2, 9 + (i % 3) * 3.5 - 2, -41.8]}><boxGeometry args={[2.4, 1.6, 0.2]} /><meshBasicMaterial color={rnd(i) > 0.55 ? '#ffe4a0' : '#202636'} /></mesh>)}
      {[-26, -10, 8, 24].map((x, i) => <mesh key={i} position={[x, 0.4, -4]}><boxGeometry args={[3, 0.8, 1]} /><meshLambertMaterial color="#6a6a70" flatShading /></mesh>)}
      {[-22, 20].map((x, i) => <Tree key={i} position={[x, 0, -10 - i * 4]} s={2.4} kind="round" color="#1d3a24" seed={i + 4} frame={f} />)}
      <Particles kind="motes" center={[0, 4, -10]} area={[40, 8, 20]} count={24} frame={f} />
      <FogLayer y={0.5} size={200} layers={3} thickness={2} color="#7a8aa8" opacity={0.12} frame={f} />
    </>}

    {scene === 'book' && <>
      <mesh position={[0, -0.6, 0]}><boxGeometry args={[40, 1, 24]} /><meshLambertMaterial color="#3a2616" flatShading /></mesh>
      <mesh position={[0, 0.0, 0]} rotation={[0, 0, 0]}><boxGeometry args={[9.4, 0.5, 6.2]} /><meshLambertMaterial color="#5a3a22" flatShading /></mesh>
      <mesh position={[-2.2, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0.04]}><planeGeometry args={[4.3, 5.8]} /><meshLambertMaterial map={pageL} /></mesh>
      <mesh position={[2.2, 0.35, 0]} rotation={[-Math.PI / 2, 0, -0.04]}><planeGeometry args={[4.3, 5.8]} /><meshLambertMaterial map={pageR} /></mesh>
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[0.18, 0.12, 5.9]} /><meshLambertMaterial color="#8a7a5a" flatShading /></mesh>
      {oF !== null && <mesh position={[2.2, 0.36 + 0.9 * Math.sin(clamp01((f - oF) / 18) * Math.PI), 0]} rotation={[-Math.PI / 2 + flipDeg, 0, 0]} visible={f < oF + 18}><planeGeometry args={[4.3, 5.8]} /><meshLambertMaterial map={pageR} /></mesh>}
      <mesh position={[-9, 1.3, 3]}><cylinderGeometry args={[0.6, 0.6, 2.6, 10]} /><meshLambertMaterial color="#e8dcc0" flatShading /></mesh>
      <Glow position={[-9, 3, 3]} size={12} color="#ffb860" opacity={0.6} />
      <pointLight position={[-9, 3.4, 3]} intensity={26} color="#ffb860" distance={36} />
      <Particles kind="dust" center={[0, 4, 0]} area={[22, 8, 14]} count={46} frame={f} />
    </>}

    {scene === 'beach' && <>
      <mesh position={[0, -0.05, 12]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[220, 120]} /><meshLambertMaterial color="#d6c39a" flatShading /></mesh>
      <mesh position={[0, -0.2, -70]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[320, 120]} /><meshLambertMaterial color="#2a5878" flatShading /></mesh>
      {Array.from({length: 7}, (_, i) => <mesh key={i} position={[(i - 3) * 22, 0.06, -12 - Math.sin(f * 0.05 + i) * 0.8]} scale={[10, 0.12, 0.9]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="#e8f2f8" transparent opacity={0.7} /></mesh>)}
      <mesh position={[0, 1.6, 36]}><boxGeometry args={[220, 3.2, 3]} /><meshLambertMaterial color="#8a8680" flatShading /></mesh>
      {[-30, -6, 20, 44].map((x, i) => <mesh key={i} position={[x, 0.7, 33.4]}><boxGeometry args={[6, 1.4, 1.2]} /><meshLambertMaterial color="#9a968e" flatShading /></mesh>)}
      <Person position={[0, 0.2, 6]} rotation={0.5} scale={1.1} pose="sleep" shirt="#d8d4c8" pants="#3a3a42" skin="#c8a888" />
      <Orb position={[40, 10, -120]} radius={7} color="#ffd9a0" /><Glow position={[40, 10, -119]} size={60} color="#ffb070" opacity={0.4} />
      <FogLayer y={0.6} size={200} layers={3} thickness={2} color="#e8c8a8" opacity={0.12} frame={f} />
    </>}

    {scene === 'hill' && <>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[200, 30]} /><meshLambertMaterial color="#223a26" flatShading /></mesh>
      {[-60, -20, 25, 65].map((x, i) => <mesh key={i} position={[x, 4, -70 - (i % 2) * 14]} scale={[34, 14 + (i % 3) * 5, 22]}><sphereGeometry args={[1, 10, 6]} /><meshLambertMaterial color={i % 2 ? '#1c3a2a' : '#26442e'} flatShading /></mesh>)}
      {Array.from({length: 18}, (_, i) => <Tree key={i} position={[-34 + rnd(i) * 68, 0, -60 + rnd(i + 5) * 40]} s={2.8 + rnd(i + 2) * 1.6} kind={i % 3 ? 'round' : 'pine'} color="#17301e" seed={i} frame={f} />)}
      <Building position={[-16, 0, 6]} rotation={0.3} w={7} d={5} h={3.2} roof={1.6} color="#a08a6a" roofColor="#4a3a2a" lit={0.8} litSeed={3} frame={f} />
      <mesh position={[4, 0.1, -14]}><boxGeometry args={[4, 0.3, 4]} /><meshLambertMaterial color="#3a2a1a" flatShading /></mesh>
      <mesh position={[4, 0.15 - (gF === null ? 0 : 0.0), -14]} scale={[1, gF === null || f < gF ? 0.02 : 1, 1]}><boxGeometry args={[1.8, 1.0, 1.2]} /><meshLambertMaterial color="#6a4a22" flatShading /></mesh>
      {gF !== null && f >= gF && <><Glow position={[4, 1.2, -14]} size={9} color="#ffd34a" opacity={0.7 * easeOut(clamp01((f - gF) / 12))} /><Particles kind="sparkle" color="#ffd34a" center={[4, 1.4, -14]} area={[2.4, 2, 2.4]} count={34} frame={f} /></>}
      <Person position={[-5, 0, -8]} rotation={-0.8} scale={1.2} pose="stand" shirt="#7a5a3a" pants="#3a3022" skin="#c8a080" />
      <FogLayer y={0.6} size={200} layers={3} thickness={2} color="#5a7a8a" opacity={0.14} frame={f} />
    </>}

    {scene === 'disc' && <>
      <mesh position={[0, -1.6, 0]}><cylinderGeometry args={[3.4, 3.8, 0.4, 10]} /><meshLambertMaterial color="#2a2118" flatShading /></mesh>
      <group position={[0, 0.2, 0]} rotation={[-0.35, f * 0.006, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[3, 3, 0.34, 40]} /><meshLambertMaterial map={dtex} /></mesh>
        <mesh position={[0, 0, 0.18]}><circleGeometry args={[3, 40]} /><meshLambertMaterial map={dtex} /></mesh>
      </group>
      <pointLight position={[-6, 4, 6]} intensity={30} color="#ffb870" distance={40} />
      <Glow position={[-6, 4, 5]} size={9} color="#ffb870" opacity={0.4} />
      <Particles kind="dust" center={[0, 1, 0]} area={[14, 8, 12]} count={40} frame={f} />
    </>}
  </Stage>;
};
