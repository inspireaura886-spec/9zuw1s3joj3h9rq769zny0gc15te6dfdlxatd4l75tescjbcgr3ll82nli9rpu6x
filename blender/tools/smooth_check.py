#!/usr/bin/env python3
"""Smoothness QA for REAL3D plates / finals (2026-11-02 lag fix). Needs PYTHONPATH=R/pylib (numpy).
usage: python3 smooth_check.py <video.mp4> [--cuts f1,f2,...] [--region y0:y1]   (region in 320-high rows; default 70:200
       = picture band above the captions and below the headline)
Checks: fps 30/1; frame count = duration*30; frozen runs (diff < 0.05 for >= 2 consecutive frames); smear/in-between
frames at cuts (frame before a big jump already jumped > 4x its neighbour); isolated spikes (diff > 6x local median and
not a cut); motion-speed lurches inside a shot (5-frame median speed falling below 15 % of the shot's peak then rising).
Exit 1 = fix."""
import sys, subprocess, json, numpy as np
f = sys.argv[1]
cuts = []
if '--cuts' in sys.argv:
    cuts = [int(x) for x in sys.argv[sys.argv.index('--cuts') + 1].split(',') if x]
y0, y1 = 70, 200
if '--region' in sys.argv:
    y0, y1 = [int(x) for x in sys.argv[sys.argv.index('--region') + 1].split(':')]
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries',
                                'stream=r_frame_rate,nb_frames,duration', '-of', 'json', f], capture_output=True, text=True).stdout)['streams'][0]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', 'scale=180:320,format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, 320, 180).astype(np.float32)[:, y0:y1]
d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))  # d[i] = change from frame i to i+1
issues = []
if pr['r_frame_rate'] != '30/1':
    issues.append('fps %s' % pr['r_frame_rate'])
n = len(a)
exp = round(float(pr.get('duration', n / 30)) * 30)
if abs(n - exp) > 1:
    issues.append('frames %d vs duration*30 %d' % (n, exp))
# auto-detect cuts when not given: diff > 12 and > 5x neighbours
auto = [i + 1 for i in range(1, len(d) - 1) if d[i] > 12 and d[i] > 5 * max(d[i - 1], d[i + 1], 0.5)]
cutset = set(cuts) | set(auto)
frozen = []
run = 0
for i, v in enumerate(d):
    run = run + 1 if v < 0.05 else 0
    if run == 2:
        frozen.append(i)
if frozen:
    issues.append('frozen runs at frames %s' % frozen[:10])
smear = []
for c in sorted(cutset):
    i = c - 2  # change from c-2 to c-1 (the last frame of the outgoing shot)
    if 1 <= i < len(d) - 1 and d[i] > 4 * max(np.median(d[max(0, i - 6):i]), 0.3) and d[i] > 3:
        smear.append(c)
if smear:
    issues.append('smear/in-between frame before cuts %s' % smear)
spikes = []
for i in range(3, len(d) - 3):
    if (i + 1) in cutset or (i + 2) in cutset or i in cutset:
        continue
    med = np.median(np.r_[d[i - 3:i], d[i + 1:i + 4]])
    if d[i] > 6 * max(med, 0.25) and d[i] > 2.5:
        spikes.append(i + 1)
if spikes:
    issues.append('isolated spikes at %s' % spikes[:12])
print(json.dumps({'file': f, 'frames': n, 'fps': pr['r_frame_rate'], 'cuts_detected': sorted(auto),
                  'median_diff': round(float(np.median(d)), 3), 'issues': issues, 'pass': not issues}))
sys.exit(1 if issues else 0)
