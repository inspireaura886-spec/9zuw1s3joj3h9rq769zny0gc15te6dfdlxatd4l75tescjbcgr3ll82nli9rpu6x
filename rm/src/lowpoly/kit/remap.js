// Speed ramps + beat-holds as a pure frame -> scene-time remap (Talwiinder / f1 edit study, GitGems PLAYBOOK #21/#23).
// Feed the result to <Rigged time>, CamPath, particles... everything driven by `t` ramps together.
// segs: [{to: frameEnd, rate}]  rate 1 = real time, 0.3 = slow-mo, 0 = freeze (beat-hold).
export function timeRemap(frame, fps, segs) {
  let f0 = 0, t = 0;
  for (const s of segs) {
    const end = Math.min(frame, s.to);
    if (end > f0) t += ((end - f0) / fps) * s.rate;
    if (frame <= s.to) return t;
    f0 = s.to;
  }
  return t + ((frame - f0) / fps) * (segs.at(-1)?.rate ?? 1);
}
// example: normal to f40, 0.3x on the apex f40-58, 6-frame freeze on the hit, snap back
// const t = timeRemap(frame, 30, [{to: 40, rate: 1}, {to: 58, rate: 0.3}, {to: 64, rate: 0}, {to: 1e9, rate: 1}]);
