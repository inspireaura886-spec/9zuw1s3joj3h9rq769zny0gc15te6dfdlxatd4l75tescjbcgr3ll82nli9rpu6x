#!/usr/bin/env python3
"""Final audio: voice + synthesized horror bed (braam on the hook, booms on hits, heartbeat into the reveal,
0.3 s hush before "Nobody", low drone), then two-pass loudnorm to -14 LUFS / TP -1.5.
No music track: the music approval gate (user-approved tracks only) and the public repo keep licensed tracks out.
usage: python3 daily/mix.py <joined.wav> <cues.json> <out final_audio.wav>"""
import json, os, subprocess, sys, tempfile
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tools'))
import horrific_mix as H
SR = H.SR
vo, cues, out = sys.argv[1:4]
C = json.load(open(cues))
v = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', vo, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).astype(np.float64)
n = int(C['dur_video'] * SR); V = np.zeros((n, 2)); V[:min(n, len(v))] = v[:n]
V = V / (np.abs(V).max() + 1e-9) * 0.7
B = np.zeros((n, 2))
def put(sig, t, g_db):
    sig = np.asarray(sig, dtype=np.float64)
    if sig.ndim == 1: sig = np.stack([sig, sig], 1)
    i = int(t * SR); j = min(n, i + len(sig))
    if i < n: B[i:j] += sig[:j - i] * 10 ** (g_db / 20)
try: put(H.braam(3.2, 41.2, giant=True), 0.05, -6); put(H.boom(), 0.05, -10)
except Exception as e: print('braam skipped', e)
for h in C.get('hits', []):
    try: put(H.boom(), h, -16)
    except Exception: pass
rv = C.get('reveal', C['dur_video'] * 0.9)
try:
    if C.get('bed', 'heartbeat') != 'heartbeat': raise RuntimeError('bed=drone (Jev choice)')
    hb = H.heartbeat_layer(n, max(1.0, rv - 22), rv - 0.3)
    hb = np.asarray(hb, dtype=np.float64); hb = np.stack([hb, hb], 1) if hb.ndim == 1 else hb
    B[:len(hb)] += hb[:n] * 10 ** (-20 / 20)
except Exception as e: print('heartbeat skipped', e)
rng = np.random.default_rng(7); dr = rng.standard_normal((n, 2)) * 0.02
dr = H.lp(dr, 160, 4) * 6; t = np.arange(n) / SR; dr *= (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t))[:, None]
B += dr
g = np.ones(n); i0 = int(max(0, rv - 0.3) * SR); i1 = int(rv * SR); B[i0:i1] *= 0.05
try: put(H.boom(), rv, -8)
except Exception: pass
B = B / (np.abs(B).max() + 1e-9) * 0.35
M = V + B; M = M / (np.abs(M).max() + 1e-9) * 0.9
tmp = tempfile.mktemp(suffix='.wav'); sf.write(tmp, M.astype(np.float32), SR)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ar', str(SR), '-ac', '2', tmp + '.ln.wav'], check=True)
def meas(f):
    e = subprocess.run(['ffmpeg', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    import re
    return float(re.findall(r'I:\s+(-?[\d.]+)\s+LUFS', e)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+)\s+dBFS', e)[-1])
src = tmp + '.ln.wav'
for k in range(3):   # trim to -14.0 LUFS with a true-peak limiter at -1.5 dBTP
    I, P = meas(src)
    if abs(I + 14) <= 0.3 and P <= -1.0: break
    dst = tmp + f'.{k}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'volume={-14 - I:.2f}dB,alimiter=limit=0.84:level=false:attack=1:release=60', '-ar', str(SR), '-ac', '2', dst], check=True)
    src = dst
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-c:a', 'pcm_s16le', out], check=True)
I, P = meas(out); print('mix done', out, 'I', I, 'LUFS  TP', P, 'dBFS')
