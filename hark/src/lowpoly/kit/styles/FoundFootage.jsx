// STYLE e (2026-10-30): 2D, cheap. Three exports:
//  <VhsOverlay />            CRT/VHS found-footage layer over ANY scene: scanlines, rolling tracking bar, chroma fringe, noise,
//                            REC/PLAY + timecode + date stamp, CRT curvature vignette, brief tracking glitch at `glitchAt`.
//  <PaperCollage images headlines />  old-newspaper parallax collage: aged paper sheets + clippings + photos drift at different
//                            depths, slight rotations, push-in. Headlines are YOUR text (real archival headlines only if sourced);
//                            body copy is drawn as grey column bars, never fake readable text.
//  <FoundFootage ... />      transition combo: collage, VHS tracking tear at mid, then the hero image as a VHS tape frame.
// All pure functions of frame. Images: staticFile paths (public-domain / own).
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {cl, lerp, ramp, eio, h1} from './util.js';

// v2 (bench 2026-10-30): static noise PNGs offset per frame instead of per-frame SVG feTurbulence (2.3 -> see STYLES.md s/frame)
const NOISE = () => `url(${staticFile('styles/noise256.png')})`; const PAPER = () => `url(${staticFile('styles/paper256.png')})`;
const noisePos = (f) => `${Math.floor(h1(f, 1) * 256)}px ${Math.floor(h1(f, 2) * 256)}px`;
const pad = (n) => String(n).padStart(2, '0');

export const VhsOverlay = ({stamp = 'OCT 30 1987', startTc = 0, mode = 'PLAY', glitchAt = -99, strength = 1, rec = false}) => {
  const f = useCurrentFrame();
  const g = Math.max(0, 1 - Math.abs(f - glitchAt) / 5); // 0..1 around glitchAt
  const barY = ((f * 9 + 400) % 2300) - 200;
  const s = startTc + Math.floor(f / 30); const tc = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {/* scanlines */}
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 2px, transparent 2px, transparent 5px)', opacity: 0.8 * strength}} />
    {/* chroma fringe: red/cyan edge tints */}
    <AbsoluteFill style={{boxShadow: `inset ${6 + g * 20}px 0 40px rgba(255,40,60,0.18), inset -${6 + g * 20}px 0 40px rgba(40,220,255,0.16)`}} />
    {/* rolling tracking bar */}
    <div style={{position: 'absolute', left: 0, right: 0, top: barY, height: 70 + g * 160, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.10) 60%, transparent)', mixBlendMode: 'screen', opacity: strength}} />
    {/* tracking tear lines during glitch */}
    {g > 0 && Array.from({length: 7}, (_, i) => <div key={i} style={{position: 'absolute', left: (h1(i, f) - 0.5) * 120 * g, width: '100%', top: `${h1(i + 9, f) * 100}%`, height: 6 + h1(i, 3) * 30, background: 'rgba(255,255,255,0.35)', mixBlendMode: 'screen'}} />)}
    {/* noise */}
    <AbsoluteFill style={{backgroundImage: NOISE(), backgroundPosition: noisePos(f), opacity: (0.07 + g * 0.2) * strength}} />
    {/* CRT curvature vignette */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
    {/* OSD */}
    <div style={{position: 'absolute', top: 240, left: 80, fontFamily: 'monospace', fontWeight: 700, fontSize: 44, color: '#f2f2f2', textShadow: '3px 0 rgba(255,40,60,0.7), -3px 0 rgba(40,220,255,0.7)', letterSpacing: 3}}>
      {rec ? <span style={{color: '#ff3b3b', opacity: Math.floor(f / 15) % 2 ? 1 : 0.2}}>● REC</span> : `${mode} ▶`}
    </div>
    <div style={{position: 'absolute', top: 1340, left: 80, fontFamily: 'monospace', fontWeight: 700, fontSize: 40, color: '#f2f2f2', textShadow: '3px 0 rgba(255,40,60,0.7), -3px 0 rgba(40,220,255,0.7)', letterSpacing: 3, lineHeight: 1.3}}>
      <div>{tc}</div><div>{stamp}</div>
    </div>
  </AbsoluteFill>;
};

const Clipping = ({x, y, w, h, rot, head, img, depth, f, dur, seed, paper}) => {
  const t = f / dur; const dx = lerp(-1, 1, t) * 60 * depth, dy = lerp(1, -1, t) * 90 * depth;
  const inT = eio(ramp(f, seed * 3, seed * 3 + 12));
  return <div style={{position: 'absolute', left: x + dx, top: y + dy + (1 - inT) * 120, width: w, height: h, transform: `rotate(${rot + (1 - inT) * 6}deg) scale(${1 + depth * 0.06 * t})`, opacity: inT,
    background: paper, boxShadow: '0 14px 0 rgba(0,0,0,0.35)', padding: 26, boxSizing: 'border-box', overflow: 'hidden'}}>
    <AbsoluteFill style={{backgroundImage: PAPER(), backgroundPosition: `${seed * 37}px ${seed * 53}px`, opacity: 0.22}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 20%, transparent 40%, rgba(120,80,30,0.35) 100%)'}} />
    {head && <div style={{position: 'relative', fontFamily: 'DM Serif Display, Georgia, serif', fontStyle: 'italic', fontSize: Math.min(76, w / 9), lineHeight: 1.0, color: '#1b140c', borderBottom: '4px double #1b140c', paddingBottom: 10, marginBottom: 14}}>{head}</div>}
    {img ? <Img src={staticFile(img)} style={{position: 'relative', width: '100%', height: head ? '62%' : '100%', objectFit: 'cover', filter: 'grayscale(1) sepia(0.55) contrast(1.15)'}} />
      : <div style={{position: 'relative', display: 'flex', gap: 14}}>{[0, 1, 2].map((c) => <div key={c} style={{flex: 1}}>{Array.from({length: 14}, (_, i) => <div key={i} style={{height: 9, marginBottom: 9, background: '#3a2e20', opacity: 0.55, width: `${70 + h1(i + c * 20, seed) * 30}%`}} />)}</div>)}</div>}
  </div>;
};

export const PaperCollage = ({images = [], headlines = [], dur = 105, paper = '#e6d6b2', bg = '#2a2118'}) => {
  const f = useCurrentFrame(); const push = 1 + 0.08 * eio(cl(f / dur));
  const slots = [
    {x: 60, y: 260, w: 600, h: 520, rot: -4, depth: 0.4}, {x: 430, y: 520, w: 590, h: 640, rot: 3, depth: 1.0},
    {x: 90, y: 980, w: 560, h: 480, rot: 2, depth: 0.7}, {x: 520, y: 1250, w: 500, h: 420, rot: -3, depth: 1.3},
    {x: 240, y: 700, w: 640, h: 300, rot: -1, depth: 1.6},
  ];
  const items = slots.map((s, i) => ({...s, img: images[i % Math.max(1, images.length)] && i % 2 === 1 ? images[(i >> 1) % images.length] : null, head: i < headlines.length ? headlines[i] : null}));
  return <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{backgroundImage: PAPER(), opacity: 0.25}} />
    <AbsoluteFill style={{transform: `scale(${push})`}}>
      {items.map((it, i) => <Clipping key={i} {...it} f={f} dur={dur} seed={i + 1} paper={paper} />)}
    </AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.6) 100%)'}} />
  </AbsoluteFill>;
};

export const FoundFootage = ({images = [], headlines = [], hero, dur = 105, stamp = 'SEP 16 1890', cutAt}) => {
  const f = useCurrentFrame(); const c = cutAt ?? Math.round(dur * 0.5);
  const heroSrc = hero || images[0];
  const shake = f >= c && f < c + 6 ? (h1(f, 2) - 0.5) * 40 : 0;
  return <AbsoluteFill style={{background: '#000'}}>
    {f < c ? <PaperCollage images={images} headlines={headlines} dur={dur} /> :
      <AbsoluteFill style={{transform: `translateX(${shake}px) scale(${1.04 + 0.06 * eio(ramp(f, c, dur))})`}}>
        {heroSrc && <Img src={staticFile(heroSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(0.6) sepia(0.35) contrast(1.25) brightness(0.9) blur(0.6px)'}} />}
        {/* RGB split ghost */}
        {heroSrc && <Img src={staticFile(heroSrc)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'translateX(7px)', mixBlendMode: 'screen', opacity: 0.25, filter: 'grayscale(1) sepia(1) hue-rotate(-50deg) saturate(4)'}} />}
      </AbsoluteFill>}
    <VhsOverlay stamp={stamp} glitchAt={c} strength={f < c ? 0.55 : 1} mode={f < c ? 'PLAY' : 'PAUSE'} startTc={763} />
  </AbsoluteFill>;
};
