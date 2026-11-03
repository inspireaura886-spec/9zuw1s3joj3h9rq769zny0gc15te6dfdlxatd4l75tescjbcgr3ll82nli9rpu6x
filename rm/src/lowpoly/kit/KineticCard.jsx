import {pal} from '../../palette.js';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
// AYGRAMM TECHNIQUES 2026-10-23: kinetic typography card (heavy bold font + one serif-italic accent word + corner brackets).
// Every word is CUED to the voice: it stays hidden (opacity 0, no start state applied early) until its own word plays.
// words: vo.json words [[text, s, e], ...] for the whole video; lines: [[{w:'THE', start: 12.31}, {w:'dogs', start: 12.6, accent:true}], ...]
// Build lines with cueLine(words, 'the dogs jumped', fromSec, accentWord) so start times come from the voice, never by hand.
// y = top of the card (keep 230-620 for headlines). Stay up until hideAt (sec) or forever.
const STROKE = (px, c) => ({WebkitTextStroke: `${px}px ${c || pal().ink}`, paintOrder: 'stroke fill'});
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
export const cueLine = (words, text, fromSec = 0, accent = '') => {
  const toks = text.split(/\s+/); let i = words.findIndex((w) => w[1] >= fromSec - 0.05 && norm(w[0]) === norm(toks[0]));
  if (i < 0) throw new Error(`cueLine: "${toks[0]}" not found after ${fromSec}s`);
  return toks.map((t, k) => { const w = words[i + k]; if (!w || norm(w[0]) !== norm(t)) throw new Error(`cueLine: "${t}" does not match the voice`);
    return {w: t, start: w[1], accent: norm(t) === norm(accent)}; });
};
export const KineticCard = ({lines, y = 260, size = 104, color, accentColor, hideAt = null, brackets = true, offsetSec = 0}) => {
  color = color || pal().text; accentColor = accentColor || pal().active;
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps + offsetSec;
  const first = lines[0]?.[0]?.start ?? 0; if (t < first - 0.02) return null;
  const out = hideAt == null ? 1 : interpolate(t, [hideAt - 0.12, hideAt], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (out <= 0) return null;
  const bIn = spring({frame: Math.round((t - first) * fps), fps, config: {damping: 14, stiffness: 180}});
  const B = (pos) => ({position: 'absolute', width: 70 * bIn, height: 70 * bIn, borderColor: accentColor, borderStyle: 'solid', borderWidth: 0, ...pos});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: out}}>
      <div style={{position: 'absolute', top: y, left: 80, right: 80, padding: '36px 30px', textAlign: 'center'}}>
        {brackets && <>
          <div style={B({left: 0, top: 0, borderLeftWidth: 10, borderTopWidth: 10})} />
          <div style={B({right: 0, top: 0, borderRightWidth: 10, borderTopWidth: 10})} />
          <div style={B({left: 0, bottom: 0, borderLeftWidth: 10, borderBottomWidth: 10})} />
          <div style={B({right: 0, bottom: 0, borderRightWidth: 10, borderBottomWidth: 10})} /></>}
        {lines.map((ln, li) => (
          <div key={li} style={{lineHeight: 1.05}}>
            {ln.map((wd, wi) => {
              if (t < wd.start - 0.02) return <span key={wi} style={{visibility: 'hidden', fontFamily: wd.accent ? 'DM Serif Display' : 'Lilita One', fontSize: wd.accent ? size * 1.12 : size}}>{wd.w} </span>;
              const sc = spring({frame: Math.round((t - wd.start) * fps), fps, config: {damping: 12, stiffness: 240, mass: 0.6}, from: wd.accent ? 1.5 : 0.6, to: 1});
              return <span key={wi} style={{display: 'inline-block', marginRight: size * 0.22, transform: `scale(${sc})`,
                fontFamily: wd.accent ? 'DM Serif Display' : 'Lilita One', fontStyle: wd.accent ? 'italic' : 'normal',
                fontSize: wd.accent ? size * 1.12 : size, color: wd.accent ? accentColor : color, textTransform: wd.accent ? 'none' : 'uppercase',
                ...STROKE(wd.accent ? 8 : 12), textShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>{wd.w}</span>;
            })}
          </div>))}
      </div>
    </AbsoluteFill>
  );
};
