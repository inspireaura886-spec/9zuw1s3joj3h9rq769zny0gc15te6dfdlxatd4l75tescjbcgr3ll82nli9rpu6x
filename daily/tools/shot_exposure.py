"""Per-shot exposure gate (adapted from Leonxlnx/escapement tools/exposure_check.py, MIT).
Samples one frame mid-way through each shot of a final Short and measures it.
HARD fails (count against the gate): clipped highlights >0.5%, near-white >2%, lifted blacks p5>0.10.
SOFT notes (dark mystery look is allowed): low contrast, dull colour.
Gate fails when more than 2 shots hard-fail. Prints JSON on the last line.
  python3 tools/shot_exposure.py final.mp4 [cuts_seconds_comma_list]
"""
import json, subprocess, sys
import os as _os
sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..", "pylib"))
import numpy as np

def frame(video, t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-vf', 'scale=360:640',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    if len(raw) < 360 * 640 * 3: return None
    return np.frombuffer(raw[:360 * 640 * 3], np.uint8).reshape(640, 360, 3).astype(np.float32) / 255.0

def measure(im):
    im = im[96:560]  # skip caption/title bands
    lum = im @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    p5, p50, p95 = np.percentile(lum, [5, 50, 95])
    clipped = float((im.max(axis=2) > 0.985).mean() * 100); white = float((lum > 0.92).mean() * 100)
    rg = im[..., 0] - im[..., 1]; yb = 0.5 * (im[..., 0] + im[..., 1]) - im[..., 2]
    colorful = float((np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)) * 255)
    hard, soft = [], []
    if clipped > 0.5: hard.append(f'clipped {clipped:.1f}%')
    if white > 2.0: hard.append(f'near-white {white:.1f}%')
    if p5 > 0.10: hard.append(f'washed blacks p5 {p5:.2f}')
    if p95 - p5 < 0.25: soft.append(f'low contrast {p95 - p5:.2f}')
    if colorful < 12: soft.append(f'dull colour {colorful:.0f}')
    return dict(p50=round(float(p50), 3), hard=hard, soft=soft)

def main():
    video = sys.argv[1]
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video],
                               capture_output=True, text=True).stdout.strip() or 0)
    if len(sys.argv) > 2 and sys.argv[2]:
        cuts = [float(x) for x in sys.argv[2].split(',') if x]
    else:
        cuts = [i * 3.0 for i in range(1, int(dur / 3))]
    edges = [0.0] + sorted(c for c in cuts if 0 < c < dur) + [dur]
    shots = []
    for a, b in zip(edges, edges[1:]):
        if b - a < 0.4: continue
        im = frame(video, (a + b) / 2)
        if im is not None: shots.append(dict(t=round((a + b) / 2, 2), **measure(im)))
    bad = [s for s in shots if s['hard']]
    for s in shots:
        print(f"{s['t']:6.2f}s p50 {s['p50']:.2f} " + ('HARD ' + '; '.join(s['hard']) if s['hard'] else 'ok') + (' | ' + '; '.join(s['soft']) if s['soft'] else ''))
    res = dict(shots=len(shots), hard_fail=len(bad), ok=len(bad) <= 2)
    print(json.dumps(res)); sys.exit(0 if res['ok'] else 2)

if __name__ == '__main__': main()
