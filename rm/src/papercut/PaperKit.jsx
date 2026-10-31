// PAPERCUT KIT (2026-10-30): 2.5D paper-cutout / archival collage look for IA Shorts. Remotion + three.js, pure functions of frame.
// Every layer is a torn-edge paper cut-out (canvas-drawn, fibre-textured) standing in real 3D space, lit by ONE moving shadow spot,
// so layers throw real soft shadows on the layers behind. Elements move in 12 fps stop-motion steps (with paper "boil"), the camera
// moves smoothly (real parallax). Archival photos become torn, taped cut-outs. Case-board: clippings, pins, animated red string.
import * as THREE from 'three';
import {useMemo, useState, useEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, delayRender, continueRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {rng, fbm, hash2, clamp01} from '../lowpoly/kit/noise.js';
import {softTexture} from '../lowpoly/kit/Sky.jsx';

export const PAPER = {night: '#1d2a4a', navy: '#22325a', ink: '#141a2a', ridge: '#2c3d63', hill: '#3b4f74', moss: '#3f5a4a', pine: '#1f3a35',
  sea: '#2f5a7a', sea2: '#3d7194', foam: '#e9e2cf', cream: '#efe4c8', news: '#e8dfc6', kraft: '#b08a5a', cork: '#9c6d44', red: '#c8372d', moon: '#f3e2a6', amber: '#f2b45a'};

// ---------- loaders (one delayRender each; textures are drawn only after fonts/images exist) ----------
let _fontsReady = false;
/** Load the canvas fonts once (Special Elite, DM Serif Display italic, Lilita One). Render nothing 3D until it returns true. */
export const usePaperFonts = () => {
  const [ok, setOk] = useState(_fontsReady);
  const [h] = useState(() => (_fontsReady ? null : delayRender('paper fonts')));
  useEffect(() => { if (ok) return;
    const fs = [new FontFace('Special Elite', `url(${staticFile('fonts/SpecialElite-Regular.ttf')})`), new FontFace('DM Serif Display', `url(${staticFile('fonts/DMSerifDisplay-Italic.ttf')})`, {style: 'italic'}), new FontFace('Lilita One', `url(${staticFile('fonts/LilitaOne-Regular.ttf')})`)];
    Promise.all(fs.map((x) => x.load().then((l) => document.fonts.add(l)).catch((e) => console.error('font', e)))).then(() => { _fontsReady = true; setOk(true); continueRender(h); }); }, []);
  return ok;
};
const _imgs = new Map();
/** Preload images from public/ (paths relative to public). Returns true when all are decoded. */
export const usePaperImages = (paths) => {
  const [ok, setOk] = useState(paths.every((p) => _imgs.has(p)));
  const [h] = useState(() => (ok ? null : delayRender('paper images')));
  useEffect(() => { if (ok) return;
    Promise.all(paths.map((p) => _imgs.has(p) ? 0 : new Promise((res) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { _imgs.set(p, im); res(); }; im.onerror = () => { console.error('img fail', p); res(); }; im.src = staticFile(p); })))
      .then(() => { setOk(true); continueRender(h); }); }, []);
  return ok;
};

// ---------- paper texture helpers ----------
let _fibre = null;
const fibre = () => { if (_fibre) return _fibre; const N = 256; const cv = document.createElement('canvas'); cv.width = cv.height = N; const g = cv.getContext('2d'); const im = g.createImageData(N, N); const r = rng(77);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const n = fbm(x / 18, y / 18, 3, 3) * 0.5 + (r() - 0.5) * 0.35; const v = 128 + n * 90; const k = (y * N + x) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = Math.max(0, Math.min(255, v)); im.data[k + 3] = 255; }
  g.putImageData(im, 0, 0); g.globalAlpha = 0.18; g.strokeStyle = '#fff'; for (let i = 0; i < 120; i++) { g.lineWidth = 0.6 + r(); g.beginPath(); const x = r() * N, y = r() * N, a = r() * 6.28, l = 6 + r() * 22; g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + r() * 4, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  _fibre = cv; return cv; };
/** jagged polygon edge: subdivide each segment and push points out/in by noise (torn paper). */
export const tear = (pts, seed = 1, amp = 3, step = 8) => { const r = rng(seed); const out = [];
  for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; const L = Math.hypot(x1 - x0, y1 - y0); const n = Math.max(1, Math.floor(L / step)); const nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1);
    for (let j = 0; j < n; j++) { const t = j / n; const d = (r() - 0.5) * 2 * amp; out.push([x0 + (x1 - x0) * t + nx * d, y0 + (y1 - y0) * t + ny * d]); } }
  return out; };
const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };

/**
 * Turn a black "shape" drawing into a paper cut-out texture: lighter torn core rim (`edge` px), fill colour, fibre grain, soft top sheen.
 * draw(g, w, h, r) fills the silhouette in any colour. Returns a cached THREE.CanvasTexture (alpha = shape).
 */
const _cut = new Map();
export const cutTexture = ({key, w = 1024, h = 512, draw, color = '#888', edge = 5, edgeColor = '#f1e9d6', grain = 0.32, seed = 1, sheen = 0.14, details}) => {
  if (key && _cut.has(key)) return _cut.get(key);
  const sh = document.createElement('canvas'); sh.width = w; sh.height = h; const sg = sh.getContext('2d'); sg.fillStyle = '#000'; draw(sg, w, h, rng(seed));
  const tint = (c) => { const t = document.createElement('canvas'); t.width = w; t.height = h; const tg = t.getContext('2d'); tg.drawImage(sh, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = c; tg.fillRect(0, 0, w, h); return t; };
  const out = document.createElement('canvas'); out.width = w; out.height = h; const g = out.getContext('2d');
  if (edge > 0) { const e = tint(edgeColor); const r = rng(seed + 5); for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const d = edge * (0.55 + r() * 0.6); g.drawImage(e, Math.cos(a) * d, Math.sin(a) * d); } }
  g.drawImage(tint(color), 0, 0);
  if (details) { g.save(); g.globalCompositeOperation = 'source-atop'; details(g, w, h, rng(seed + 9)); g.restore(); }
  g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = grain; g.fillStyle = g.createPattern(fibre(), 'repeat'); g.fillRect(0, 0, w, h);
  g.globalAlpha = sheen; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, '#000000'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore();
  const t = new THREE.CanvasTexture(out); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (key) _cut.set(key, t); return t;
};

// ---------- shape library: (g, w, h, r, o) => fills a silhouette ----------
export const SHAPES = {
  /** ridge / hills: top edge from fbm, fills to bottom. o: base (0..1 of h from top), amp, freq, jag */
  ridge: (g, w, h, r, o = {}) => { const base = (o.base ?? 0.45) * h, amp = (o.amp ?? 0.25) * h, fq = o.freq ?? 3, s = r() * 100; const pts = [[0, h]];
    for (let x = 0; x <= w; x += 6) pts.push([x, base - fbm(x / w * fq, s, 2, 4) * amp - Math.sin(x / w * Math.PI) * amp * (o.hump ?? 0.3) + (r() - 0.5) * (o.jag ?? 3)]); pts.push([w, h]); poly(g, pts); },
  /** row of pine trees on a ground strip. o: count, minH, maxH (0..1 of h), ground (strip height px) */
  pines: (g, w, h, r, o = {}) => { const n = o.count ?? 14; g.fillRect(0, h - (o.ground ?? 30), w, o.ground ?? 30);
    for (let i = 0; i < n; i++) { const x = (i + 0.2 + r() * 0.6) / n * w, th = h * ((o.minH ?? 0.45) + r() * ((o.maxH ?? 0.95) - (o.minH ?? 0.45))), tw = th * (0.32 + r() * 0.1), base = h - (o.ground ?? 30) + 4; const tiers = 4 + Math.floor(r() * 2);
      g.fillRect(x - tw * 0.05, base - th * 0.2, tw * 0.1, th * 0.2);
      for (let k = 0; k < tiers; k++) { const ty = base - th * 0.12 - k * th * 0.8 / tiers, ww = tw * (1 - k / (tiers + 0.6)); poly(g, tear([[x - ww / 2, ty], [x + ww / 2, ty], [x, ty - th * 0.38]], (i * 31 + k), 2, 9)); } } },
  /** full moon disc with torn edge */
  moon: (g, w, h, r) => { const pts = []; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; pts.push([w / 2 + Math.cos(a) * w * 0.46, h / 2 + Math.sin(a) * h * 0.46]); } poly(g, tear(pts, 3, 2.5, 10)); },
  /** cloud: union of circles */
  cloud: (g, w, h, r) => { const n = 7; for (let i = 0; i < n; i++) { const x = w * (0.15 + 0.7 * i / (n - 1)), rad = h * (0.22 + r() * 0.2); g.beginPath(); g.arc(x, h * 0.62 - r() * h * 0.15, rad, 0, Math.PI * 2); g.fill(); } g.fillRect(w * 0.12, h * 0.6, w * 0.76, h * 0.25); },
  /** sea band: sine-wave top edge. o: waves, amp */
  waves: (g, w, h, r, o = {}) => { const n = o.waves ?? 6, A = (o.amp ?? 0.18) * h, ph = o.phase ?? 0; const pts = [[0, h]]; for (let x = 0; x <= w; x += 6) pts.push([x, A + A * Math.sin(x / w * n * Math.PI * 2 + ph) * 0.8 + (r() - 0.5) * 2]); pts.push([w, h]); poly(g, pts); },
  /** lighthouse on a rock island (tower, gallery, lantern room, cottage) */
  lighthouse: (g, w, h, r) => { poly(g, tear([[0, h], [w * 0.05, h * 0.82], [w * 0.2, h * 0.74], [w * 0.5, h * 0.7], [w * 0.8, h * 0.76], [w, h * 0.86], [w, h]], 4, 4, 10));
    poly(g, [[w * 0.43, h * 0.72], [w * 0.46, h * 0.28], [w * 0.54, h * 0.28], [w * 0.57, h * 0.72]]); g.fillRect(w * 0.41, h * 0.25, w * 0.18, h * 0.03); g.fillRect(w * 0.455, h * 0.17, w * 0.09, h * 0.08);
    poly(g, [[w * 0.44, h * 0.17], [w * 0.5, h * 0.11], [w * 0.56, h * 0.17]]); g.fillRect(w * 0.6, h * 0.6, w * 0.22, h * 0.13); poly(g, [[w * 0.58, h * 0.6], [w * 0.71, h * 0.52], [w * 0.84, h * 0.6]]); },
  /** standing human figure (coat) */
  figure: (g, w, h, r) => { g.beginPath(); g.arc(w / 2, h * 0.11, w * 0.14, 0, Math.PI * 2); g.fill(); poly(g, tear([[w * 0.3, h * 0.2], [w * 0.7, h * 0.2], [w * 0.8, h * 0.62], [w * 0.68, h * 0.64], [w * 0.64, h], [w * 0.53, h], [w * 0.5, h * 0.68], [w * 0.47, h], [w * 0.36, h], [w * 0.32, h * 0.64], [w * 0.2, h * 0.62]], 8, 1.5, 7)); },
  /** small rowing boat */
  boat: (g, w, h, r) => { poly(g, tear([[0, h * 0.55], [w, h * 0.55], [w * 0.85, h * 0.95], [w * 0.15, h * 0.95]], 6, 1.5, 8)); g.fillRect(w * 0.48, h * 0.05, w * 0.03, h * 0.5); poly(g, [[w * 0.51, h * 0.08], [w * 0.8, h * 0.48], [w * 0.51, h * 0.48]]); },
  /** torn rectangle (clipping / note / photo backing) */
  rect: (g, w, h, r, o = {}) => { const m = o.margin ?? 6; poly(g, tear([[m, m], [w - m, m], [w - m, h - m], [m, h - m]], o.seed ?? 2, o.amp ?? 2.5, 9)); },
  /** grass tufts foreground */
  grass: (g, w, h, r) => { g.fillRect(0, h * 0.7, w, h * 0.3); for (let i = 0; i < 70; i++) { const x = r() * w, bh = h * (0.25 + r() * 0.55), bw = 6 + r() * 10, lean = (r() - 0.5) * 30; poly(g, [[x - bw, h * 0.75], [x + bw, h * 0.75], [x + lean, h * 0.75 - bh]]); } },
};

const step12 = (f) => Math.floor(f * 12 / 30);
/**
 * One paper cut-out layer in 3D. shape = key of SHAPES (or draw fn), opts passed to it. size = [w, h] world units, px = canvas size.
 * Stop-motion: bob (units) / sway (rad) / drift ([dx,dy] per second) advance in 12 fps steps; `boil` = tiny per-step jitter.
 * Casts + receives real shadows from the PaperStage key light. emissive>0 makes it glow (moon, windows).
 * <CutLayer shape="ridge" opts={{base:0.4, amp:0.3}} size={[40,10]} position={[0,3,-10]} color={PAPER.ridge} seed={3} frame={f} />
 */
export const CutLayer = ({shape = 'rect', opts = {}, size = [10, 5], px, position = [0, 0, 0], rotation = [0, 0, 0], color = '#777', edge = 5, edgeColor, seed = 1, frame = 0,
  bob = 0, sway = 0, drift = [0, 0], boil = 0.004, speed = 0.5, castShadow = true, receiveShadow = true, emissive = 0, details, opacity = 1, wrapX}) => {
  const P = px || [Math.min(2048, Math.round(size[0] * 64)), Math.min(2048, Math.round(size[1] * 64))];
  const key = JSON.stringify([typeof shape === 'string' ? shape : shape.name, opts, P, color, edge, edgeColor, seed]) + (details ? details.name : '');
  const map = useMemo(() => cutTexture({key: details ? null : key, w: P[0], h: P[1], color, edge, edgeColor, seed, details,
    draw: (g, w, h, r) => (typeof shape === 'string' ? SHAPES[shape] : shape)(g, w, h, r, opts)}), [key]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({map, alphaTest: 0.5, roughness: 0.95, metalness: 0, side: THREE.DoubleSide, transparent: opacity < 1, opacity,
    emissive: new THREE.Color(emissive ? color : '#000'), emissiveMap: emissive ? map : null, emissiveIntensity: emissive}), [map, emissive, opacity]);
  const s = step12(frame); const r = hash2(s, seed, 3) - 0.5, r2 = hash2(s, seed, 5) - 0.5;
  let x = position[0] + drift[0] * s / 12 + r * boil, y = position[1] + bob * Math.sin(s * speed + seed) + r2 * boil;
  if (wrapX) x = ((x - wrapX[0]) % (wrapX[1] - wrapX[0]) + (wrapX[1] - wrapX[0])) % (wrapX[1] - wrapX[0]) + wrapX[0];
  return <mesh position={[x, y, position[2]]} rotation={[rotation[0], rotation[1], rotation[2] + sway * Math.sin(s * speed * 0.8 + seed * 2) + r * boil * 2]} material={mat} castShadow={castShadow} receiveShadow={receiveShadow}>
    <planeGeometry args={size} /></mesh>;
};

/**
 * Archival photo as a taped, torn cut-out with a white border, sepia/contrast grade and two tape strips. src = public path (preload with usePaperImages).
 * <PhotoCut src="flannan/IMG1.jpg" size={[3,4]} position={[0,2,0.1]} rotation={[0,0,-0.05]} frame={f} />
 */
export const PhotoCut = ({src, size = [3, 4], position = [0, 0, 0], rotation = [0, 0, 0], frame = 0, seed = 2, sepia = 0.55, border = 0.06, tape = true, boil = 0.003, castShadow = true}) => {
  const map = useMemo(() => { const im = _imgs.get(src); const W = 900, H = Math.round(900 * size[1] / size[0]); return cutTexture({key: 'photo:' + src + W + H + seed, w: W, h: H, color: '#f4efe2', edge: 4, seed,
    draw: (g, w, h) => SHAPES.rect(g, w, h, null, {margin: 14, seed, amp: 3}),
    details: (g, w, h) => { if (!im) return; const b = w * border; const iw = w - 2 * b, ih = h - 2 * b - (h * 0.06); const sc = Math.max(iw / im.width, ih / im.height);
      g.save(); g.beginPath(); g.rect(b, b, iw, ih); g.clip(); g.filter = `sepia(${sepia}) contrast(1.18) brightness(0.95)`; g.drawImage(im, b + (iw - im.width * sc) / 2, b + (ih - im.height * sc) / 2, im.width * sc, im.height * sc); g.restore(); g.filter = 'none';
      if (tape) { g.fillStyle = 'rgba(236,222,170,0.75)'; g.save(); g.translate(w * 0.5, 10); g.rotate(-0.06); g.fillRect(-w * 0.16, -14, w * 0.32, 44); g.restore(); } }}); }, [src, size[0], size[1], seed]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({map, alphaTest: 0.5, roughness: 0.85, side: THREE.DoubleSide}), [map]);
  const s = step12(frame); const r = hash2(s, seed, 3) - 0.5;
  return <mesh position={[position[0] + r * boil, position[1] + (hash2(s, seed, 7) - 0.5) * boil, position[2]]} rotation={[rotation[0], rotation[1], rotation[2] + r * boil * 2]} material={mat} castShadow={castShadow} receiveShadow><planeGeometry args={size} /></mesh>;
};

/**
 * Newspaper clipping: torn newsprint, masthead (DM Serif italic), headline (Special Elite caps), fake text columns, optional red circle.
 * Needs usePaperFonts() ready. <Clipping head="3 KEEPERS VANISHED" mast="The Oban Times" date="DEC. 1900" size={[3.2,2.2]} position=... />
 */
export const Clipping = ({head = 'HEADLINE', mast = 'The Evening Post', date = '', size = [3, 2], position = [0, 0, 0], rotation = [0, 0, 0], frame = 0, seed = 4, circle = false, color = PAPER.news, castShadow = true, boil = 0.003}) => {
  const map = useMemo(() => { const W = 1000, H = Math.round(1000 * size[1] / size[0]);
    return cutTexture({key: 'clip:' + head + mast + date + W + H + seed + circle, w: W, h: H, color, edge: 3, edgeColor: '#fbf6e8', seed, grain: 0.22,
      draw: (g, w, h) => SHAPES.rect(g, w, h, null, {margin: 10, seed, amp: 4}),
      details: (g, w, h, r) => { g.fillStyle = '#231f1a'; g.font = `italic ${Math.round(h * 0.11)}px "DM Serif Display"`; g.textAlign = 'center'; g.fillText(mast, w / 2, h * 0.16);
        g.fillRect(w * 0.06, h * 0.19, w * 0.88, 3); g.font = `${Math.round(h * 0.045)}px "Special Elite"`; g.fillText(date, w / 2, h * 0.245); g.fillRect(w * 0.06, h * 0.265, w * 0.88, 2);
        let fs = h * 0.15; g.font = `${Math.round(fs)}px "Special Elite"`; while (g.measureText(head).width > w * 0.88 && fs > 10) { fs *= 0.92; g.font = `${Math.round(fs)}px "Special Elite"`; }
        g.fillText(head, w / 2, h * 0.27 + fs * 1.0);
        g.fillStyle = 'rgba(40,36,30,0.55)'; const top = h * 0.27 + fs * 1.35; const cols = 3, cw = w * 0.88 / cols;
        for (let c = 0; c < cols; c++) for (let y = top; y < h * 0.93; y += h * 0.035) g.fillRect(w * 0.06 + c * cw + 6, y, (cw - 18) * (0.7 + r() * 0.3), h * 0.014);
        if (circle) { g.strokeStyle = 'rgba(190,40,30,0.85)'; g.lineWidth = 7; g.beginPath(); g.ellipse(w / 2, h * 0.27 + fs * 0.65, w * 0.46, fs * 0.85, -0.03, 0, Math.PI * 2); g.stroke(); } }}); }, [head, mast, date, size[0], size[1], seed, circle]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({map, alphaTest: 0.5, roughness: 0.95, side: THREE.DoubleSide}), [map]);
  const s = step12(frame); const r = hash2(s, seed, 3) - 0.5;
  return <mesh position={[position[0] + r * boil, position[1], position[2]]} rotation={[rotation[0], rotation[1], rotation[2] + r * boil * 2]} material={mat} castShadow={castShadow} receiveShadow><planeGeometry args={size} /></mesh>;
};

/** Typed note (sticky/index card) with a few typewriter lines. */
export const Note = ({lines = [], size = [1.6, 1.2], position = [0, 0, 0], rotation = [0, 0, 0], color = '#f2e7a8', seed = 9, frame = 0}) => {
  const map = useMemo(() => { const W = 600, H = Math.round(600 * size[1] / size[0]); return cutTexture({key: 'note:' + lines.join('|') + W + H + color + seed, w: W, h: H, color, edge: 2, seed, grain: 0.2,
    draw: (g, w, h) => SHAPES.rect(g, w, h, null, {margin: 6, seed, amp: 1.2}),
    details: (g, w, h) => { g.fillStyle = '#26211a'; g.textAlign = 'left'; const fs = Math.round(h / (lines.length + 1.6)); g.font = `${fs}px "Special Elite"`; lines.forEach((l, i) => g.fillText(l, w * 0.08, fs * 1.25 * (i + 1))); }}); }, [lines.join('|'), size[0], size[1], color, seed]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({map, alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide}), [map]);
  return <mesh position={position} rotation={rotation} material={mat} castShadow receiveShadow><planeGeometry args={size} /></mesh>;
};

/** Push pin (casts a real shadow on the board). */
export const Pin = ({position = [0, 0, 0], color = PAPER.red}) => (
  <group position={position}>
    <mesh position={[0, 0, 0.12]} castShadow><sphereGeometry args={[0.09, 14, 10]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
    <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.05, 0.07, 0.07, 12]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
  </group>
);

/** Red string between pins, drawn on over [start, start+len] frames (sags a little between points). */
export const RedString = ({points = [], frame = 0, start = 0, len = 30, color = PAPER.red, radius = 0.018, z = 0.15}) => {
  const geo = useMemo(() => { const pts = []; points.forEach((p, i) => { pts.push(new THREE.Vector3(p[0], p[1], z)); const q = points[i + 1]; if (q) pts.push(new THREE.Vector3((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 0.12, z + 0.02)); });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 160, radius, 6, false); }, [JSON.stringify(points), radius, z]);
  const t = clamp01((frame - start) / Math.max(1, len)); const n = geo.index.count; geo.setDrawRange(0, Math.floor(n * t / 6) * 6);
  return <mesh geometry={geo} castShadow><meshStandardMaterial color={color} roughness={0.6} /></mesh>;
};

/** Cork board / desk backdrop: a big cut layer with speckle + optional frame. */
export const Board = ({size = [16, 22], position = [0, 0, -0.05], color = PAPER.cork, seed = 12}) => (
  <CutLayer shape="rect" opts={{margin: 2, amp: 0.5}} size={size} px={[1024, 1408]} position={position} color={color} seed={seed} edge={0} grain={0.5}
    details={function corkDots(g, w, h, r) { for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,35,15,0.35)' : 'rgba(230,190,130,0.25)'; g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); } }} castShadow={false} />
);

/**
 * Paper shot: CSS backdrop + ThreeCanvas with real shadows, warm ambient, ONE moving key spot (castShadow, 1024 map) + optional rim.
 * keyPos / keyTarget can be functions of frame (swinging desk lamp, passing torch).
 * <PaperStage keyPos={(f)=>[-6+f*0.02, 9, 8]} keyTarget={[0,2,-4]} overlay={<PaperFinish/>}>...</PaperStage>
 */
export const PaperStage = ({children, overlay, bg = 'linear-gradient(180deg, #121a33 0%, #1d2a4a 60%, #2b3550 100%)', keyPos = [-5, 9, 8], keyTarget = [0, 2, -4], keyColor = '#ffe2b8', keyI = 2.6, ambient = 0.55, ambientColor = '#9fb0d8', angle = 0.75, mapSize = 1024, fog}) => {
  const {width, height} = useVideoConfig(); const f = useCurrentFrame();
  const kp = typeof keyPos === 'function' ? keyPos(f) : keyPos; const kt = typeof keyTarget === 'function' ? keyTarget(f) : keyTarget;
  const tgt = useMemo(() => new THREE.Object3D(), []); tgt.position.set(...kt); tgt.updateMatrixWorld();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: bg}} />
      <ThreeCanvas flat shadows width={width} height={height} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} camera={{fov: 40, position: [0, 2, 12]}}>
        {fog && <fog attach="fog" args={fog} />}
        <ambientLight intensity={ambient} color={ambientColor} />
        <primitive object={tgt} />
        <spotLight position={kp} target={tgt} angle={angle} penumbra={0.6} intensity={keyI} decay={0} color={keyColor} castShadow shadow-mapSize-width={mapSize} shadow-mapSize-height={mapSize} shadow-bias={-0.0006} shadow-radius={6} />
        {children}
      </ThreeCanvas>
      {overlay}
    </AbsoluteFill>
  );
};

/** Finish for paper shots: paper grain (multiply), warm vignette, 12 fps exposure flutter, drifting dust specks, optional light leak. */
export const PaperFinish = ({grain = 0.16, vignette = 0.6, leak = true, seed = 0}) => {
  const f = useCurrentFrame(); const s = step12(f); const r = rng(s * 7 + seed);
  const ex = 0.03 * hash2(s, 3, seed);
  const lk = leak ? 0.5 + 0.5 * Math.sin(f * 0.035 + seed) : 0;
  return (<AbsoluteFill style={{pointerEvents: 'none'}}>
    {leak && <AbsoluteFill style={{background: `radial-gradient(circle at ${85 - lk * 20}% ${10 + lk * 12}%, rgba(255,150,70,${0.28 * lk}) 0%, rgba(255,120,60,0) 45%)`, mixBlendMode: 'screen'}} />}
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(25,12,0,${vignette}) 100%)`}} />
    <AbsoluteFill style={{background: '#000', opacity: ex}} />
    {Array.from({length: 5}, (_, i) => { const x = r() * 100, y = r() * 100, z = 2 + r() * 5; return r() < 0.5 ? <div key={i} style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: z, height: z, borderRadius: '50%', background: 'rgba(30,20,10,0.5)'}} /> : null; })}
    <AbsoluteFill style={{opacity: grain, mixBlendMode: 'multiply', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' seed='${s % 40}'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.45 0 0 0 0 0.35 0 0 0 1.2 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`}} />
  </AbsoluteFill>);
};

/** Cut-paper title: words on torn paper strips that slap in on 12 fps steps (Lilita / DM Serif accent). */
export const PaperTitle = ({lines = [], y = 250, size = 86}) => {
  const f = useCurrentFrame();
  return (<div style={{position: 'absolute', top: y, left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
    {lines.map((l, i) => { const s = step12(f - (l.at || 0)); if (f < (l.at || 0)) return null; const k = s <= 0 ? 1.25 : s === 1 ? 0.96 : 1; const rot = (l.rot ?? (i % 2 ? 1.6 : -1.4));
      return <div key={i} style={{transform: `rotate(${rot}deg) scale(${k})`, background: l.red ? PAPER.red : '#f1e8d2', color: l.red ? '#fff6e6' : '#1a1712', padding: '6px 26px 10px',
        fontFamily: l.red ? 'DM Serif Display' : 'Lilita One', fontStyle: l.red ? 'italic' : 'normal', fontSize: l.size || size, letterSpacing: l.red ? 1 : 3, lineHeight: 1.05,
        clipPath: 'polygon(0% 6%, 3% 0%, 22% 4%, 41% 0%, 63% 5%, 82% 1%, 100% 4%, 98% 52%, 100% 95%, 78% 100%, 57% 95%, 35% 100%, 14% 96%, 0% 100%, 2% 48%)',
        boxShadow: '0 10px 18px rgba(0,0,0,0.45)', filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.5))'}}>{l.text}</div>; })}
  </div>);
};
export const PaperGlow = ({position, size = 3, color = PAPER.moon, opacity = 0.6}) => <sprite position={position} scale={[size, size, 1]}><spriteMaterial map={softTexture()} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} toneMapped={false} /></sprite>;
