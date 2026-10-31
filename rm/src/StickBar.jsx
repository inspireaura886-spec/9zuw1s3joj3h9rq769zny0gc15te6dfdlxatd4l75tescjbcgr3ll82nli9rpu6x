import {AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig, Audio, staticFile} from 'remotion';
import MOUTH from './mouth.json';

// Stick figure doing pull-ups + muscle-up on a bar. Front view, 1080x1920, 300 frames @30fps.
const W = 1080, FLOOR = 1520, BAR_Y = 700, CX = 540;
const L = {head: 46, neck: 22, torso: 190, up: 108, fore: 102, thigh: 122, shin: 122};
const HAND_DX = 128;
const STAND_SY = FLOOR - (L.thigh + L.shin) - L.torso + 6; // shoulder y when standing
const HANG_SY = BAR_Y + 196;
const TOP_SY = BAR_Y + 2; // chin over bar
const LOCK_SY = BAR_Y - 196; // muscle-up lockout
const ease = Easing.bezier(0.45, 0, 0.25, 1);

const kf = (f, pts, e = ease) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [f0, v0] = pts[i], [f1, v1] = pts[i + 1];
    if (f <= f1) return interpolate(f, [f0, f1], [v0, v1], {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  }
  return pts[pts.length - 1][1];
};

// two-bone IK; side = +1 bends elbow/knee to the right of S->T direction
const ik = (S, T, a, b, side) => {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  d = Math.min(Math.max(d, Math.abs(a - b) + 1), a + b - 0.5);
  const th = Math.atan2(dy, dx);
  const al = Math.acos((a * a + d * d - b * b) / (2 * a * d));
  const ang = th + side * al;
  const J = [S[0] + a * Math.cos(ang), S[1] + a * Math.sin(ang)];
  const dd = Math.hypot(dx, dy);
  const E = dd > a + b ? [S[0] + (a + b) * Math.cos(th), S[1] + (a + b) * Math.sin(th)] : T;
  return [J, E];
};

const REPS = [60, 95, 130, 165, 200]; // each rep: up 15, hold 4, down 16

export const StickBar = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  // ---- shoulder height over time ----
  let sy;
  const repPts = [[50, HANG_SY]];
  REPS.forEach((r) => { repPts.push([r, HANG_SY], [r + 15, TOP_SY], [r + 19, TOP_SY], [r + 35, HANG_SY]); });

  if (f < 24) sy = STAND_SY + Math.sin(f / 4) * 3;
  else if (f < 36) sy = kf(f, [[24, STAND_SY], [36, STAND_SY + 55]]);
  else if (f < 50) sy = kf(f, [[36, STAND_SY + 55], [50, HANG_SY - 10]], Easing.out(Easing.quad));
  else if (f < 235) sy = f < 60 ? kf(f, [[50, HANG_SY - 10], [55, HANG_SY + 8], [60, HANG_SY]]) : kf(f, repPts);
  else if (f < 280) sy = kf(f, [[235, HANG_SY], [248, TOP_SY - 20], [254, BAR_Y - 70], [264, LOCK_SY], [280, LOCK_SY]]);
  else sy = interpolate(f, [280, 296], [LOCK_SY, STAND_SY + 20], {easing: Easing.in(Easing.quad), extrapolateRight: 'clamp'}) - (f > 296 ? interpolate(f, [296, 300], [0, 20], {extrapolateRight: 'clamp'}) : 0);

  const onBar = f >= 50 && f < 280;
  const swing = onBar ? Math.sin(f / 9) * 6 * (f < 235 ? 1 : 0.3) : 0;
  const S = [CX + swing * 0.3, sy];
  const H = [CX + swing, sy + L.torso];
  const neckTop = [S[0], S[1] - L.neck];
  const headC = [neckTop[0], neckTop[1] - L.head];

  // ---- hands ----
  const barL = [CX - HAND_DX, BAR_Y], barR = [CX + HAND_DX, BAR_Y];
  let hL, hR;
  if (f < 24) { hL = [S[0] - 40, S[1] + 195]; hR = [S[0] + 40, S[1] + 195]; }
  else if (f < 36) { const t = kf(f, [[24, 0], [36, 1]]); hL = [S[0] - 40 - 40 * t, S[1] + 195 - 30 * t]; hR = [S[0] + 40 + 40 * t, S[1] + 195 - 30 * t]; }
  else if (f < 50) {
    const t = kf(f, [[36, 0], [50, 1]], Easing.out(Easing.cubic));
    hL = [interpolate(t, [0, 1], [S[0] - 80, barL[0]]), interpolate(t, [0, 1], [S[1] + 165, barL[1]])];
    hR = [interpolate(t, [0, 1], [S[0] + 80, barR[0]]), interpolate(t, [0, 1], [S[1] + 165, barR[1]])];
  } else if (f < 280) { hL = barL; hR = barR; }
  else { // victory V arms
    const t = kf(f, [[280, 0], [292, 1]]);
    hL = [S[0] - 60 - 90 * t, S[1] - 150 * t + (1 - t) * -40];
    hR = [S[0] + 60 + 90 * t, S[1] - 150 * t + (1 - t) * -40];
  }

  // muscle-up: elbows go behind/down -> bend downward-outward
  const [eL, hLf] = ik(S, hL, L.up, L.fore, sy < BAR_Y ? -1 : 1);
  const [eR, hRf] = ik(S, hR, L.up, L.fore, sy < BAR_Y ? 1 : -1);

  // ---- feet ----
  let fL, fR;
  const grounded = f < 37 || f >= 296;
  if (grounded) { fL = [CX - 52, FLOOR]; fR = [CX + 52, FLOOR]; }
  else {
    const kick = f >= 248 && f < 266 ? 60 : 0; // legs kick during transition
    const tuck = kf(f, [[36, 30], [44, 0]]);
    fL = [H[0] - 30 + swing * 1.5, H[1] + 236 - tuck - kick];
    fR = [H[0] + 30 + swing * 1.5, H[1] + 236 - tuck - kick];
    if (f >= 280) { fL = [H[0] - 45, H[1] + 236]; fR = [H[0] + 45, H[1] + 236]; }
  }
  const [kL, fLf] = ik(H, fL, L.thigh, L.shin, 1);
  const [kR, fRf] = ik(H, fR, L.thigh, L.shin, -1);

  // ---- face ----
  const effort = onBar ? interpolate(HANG_SY - sy, [0, HANG_SY - TOP_SY], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const tired = f > 165 && f < 235 ? 1 : 0;
  const happy = f >= 262;
  const blink = [12, 70, 140, 270].some((b) => f >= b && f < b + 3);
  const brow = happy ? -8 : (effort * 14 + tired * 6);
  const eyeH = blink ? 1.5 : happy ? 4 : 9 - effort * 5;

  // ---- rep counter ----
  const done = REPS.filter((r) => f >= r + 15).length;
  const lastRep = REPS.filter((r) => f >= r + 15).slice(-1)[0];
  const pop = lastRep ? spring({frame: f - (lastRep + 15), fps, config: {damping: 9, stiffness: 180}}) : 0;
  const label = f >= 262 ? 'MUSCLE-UP!' : done > 0 ? `REP ${done}` : 'READY?';
  const labelScale = f >= 262 ? spring({frame: f - 262, fps, config: {damping: 8, stiffness: 160}}) : done > 0 ? 0.85 + 0.15 * pop : 1;

  const ink = '#111';
  const talk = MOUTH[f] || 0;
  const talkW = 10 + 8 * Math.min(1, (MOUTH[f - 1] || 0) + talk);

  const line = (a, b, w = 11) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={ink} strokeWidth={w} strokeLinecap="round" />;
  const shadowW = grounded ? 130 : interpolate(sy, [LOCK_SY, STAND_SY], [60, 130]);

  return (
    <AbsoluteFill style={{background: '#f6f3ec'}}>
      <svg width={W} height={1920} viewBox={`0 0 ${W} 1920`}>
        {/* rig */}
        <line x1={180} y1={BAR_Y - 10} x2={180} y2={FLOOR} stroke="#333" strokeWidth={16} />
        <line x1={900} y1={BAR_Y - 10} x2={900} y2={FLOOR} stroke="#333" strokeWidth={16} />
        <line x1={160} y1={BAR_Y} x2={920} y2={BAR_Y} stroke="#555" strokeWidth={14} strokeLinecap="round" />
        <line x1={80} y1={FLOOR + 4} x2={1000} y2={FLOOR + 4} stroke="#bbb" strokeWidth={6} />
        <ellipse cx={CX} cy={FLOOR + 6} rx={shadowW} ry={12} fill="rgba(0,0,0,0.12)" />

        {/* legs */}
        {line(H, kL)}{line(kL, fLf)}{line(H, kR)}{line(kR, fRf)}

        {/* torso */}
        {line(neckTop, H)}

        {/* arms */}
        {line(S, eL)}{line(eL, hLf)}{line(S, eR)}{line(eR, hRf)}
        {onBar && <><circle cx={barL[0]} cy={barL[1]} r={11} fill={ink} /><circle cx={barR[0]} cy={barR[1]} r={11} fill={ink} /></>}

        {/* head */}
        <circle cx={headC[0]} cy={headC[1]} r={L.head} fill="#fff" stroke={ink} strokeWidth={10} />
        <ellipse cx={headC[0] - 16} cy={headC[1] - 4} rx={5} ry={eyeH} fill={ink} />
        <ellipse cx={headC[0] + 16} cy={headC[1] - 4} rx={5} ry={eyeH} fill={ink} />
        {line([headC[0] - 26, headC[1] - 20 - (happy ? 4 : 0)], [headC[0] - 7, headC[1] - 20 + brow * 0.6], 5)}
        {line([headC[0] + 26, headC[1] - 20 - (happy ? 4 : 0)], [headC[0] + 7, headC[1] - 20 + brow * 0.6], 5)}

        {talk > 0.06
          ? <ellipse cx={headC[0]} cy={headC[1] + 20} rx={talkW} ry={3 + talk * 13} fill={ink} />
          : happy
          ? <path d={`M ${headC[0] - 18} ${headC[1] + 14} Q ${headC[0]} ${headC[1] + 34} ${headC[0] + 18} ${headC[1] + 14}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          : effort > 0.6
          ? <rect x={headC[0] - 15} y={headC[1] + 14} width={30} height={10} rx={3} fill="#fff" stroke={ink} strokeWidth={5} />
          : <path d={`M ${headC[0] - 12} ${headC[1] + 20} Q ${headC[0]} ${headC[1] + 24 - effort * 8} ${headC[0] + 12} ${headC[1] + 20}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />}

        {tired && f % 30 < 20 && <path d={`M ${headC[0] + 50} ${headC[1] - 30} q 8 14 0 20 q -8 -6 0 -20`} fill="#5aa9e6" />}
      </svg>

      <Audio src={staticFile('vo.wav')} />

      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: 'DejaVu Sans Mono, monospace', fontWeight: 700,
        fontSize: 110, color: f >= 262 ? '#c0392b' : ink, transform: `scale(${labelScale})`, letterSpacing: 4}}>{label}</div>
      <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', fontFamily: 'DejaVu Sans Mono, monospace', fontSize: 40, color: '#777', letterSpacing: 10}}>BAR SESSION</div>
    </AbsoluteFill>
  );
};
