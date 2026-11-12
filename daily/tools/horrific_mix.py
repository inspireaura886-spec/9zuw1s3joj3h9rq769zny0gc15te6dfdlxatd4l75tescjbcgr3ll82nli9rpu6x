#!/usr/bin/env python3
"""HORRIFIC sound-design preset (user 2026-10-25 19:05 IST: "the music is what makes our videos boring" -> hooking, chilling, dopamine bed + SFX).
Default final-audio step for every Short and long-form chapter from 2026-10-25 (FACTORY.md). AUDIO ONLY: never needs a frame re-render.

usage (run anywhere):
  python3 tools/horrific_mix.py <case_dir> [--track <mp3|wav>] [--out raw/final_audio.wav] [--hook <sec>] [--reveal <sec>]
                                [--cuts a,b,c] [--dur <sec>] [--dry]   (--dry = print the plan only)
Inputs from <case_dir>: raw/vo_fx.wav (voice already through audio_fx suspense chain; if missing it is made from vo.wav),
  cues.json (hook "word@sec", reveal "word@sec", cuts [...], hits [...], dur_video), vo.json (word times, for SFX ducking).
Track: --track, else tools/music_pick.py picks one from reels/music_library (never the same as the previous video) and logs it.

What it builds (all self-synthesised SFX = zero rights risk):
  1. BRAAM + sub hit on the hook word inside the first 0.5 s (at max(0.05, hook - 0.05)).
  2. MUSIC bed: track offset so its biggest drop lands on the main reveal (same detector as music_drop.py); bed sits ~5 dB under the voice
     and ducks only ~4.5 dB while words play (was 7-9 dB), plus the 2.6 kHz presence dip so words stay clear.
  3. RISERS: 1.6 s riser ending on every hit/reveal in cues (main reveal gets a 2.4 s riser).
  4. WHOOSH / STINGER on each cut (whoosh on section cuts, every other cut a short stinger), light so the voice wins.
  5. HEARTBEAT + TICK layer from ~30% of the video to the main reveal, tempo accelerating 62 -> 128 bpm, gain rising; stops dead at the gap.
  6. 0.3 s SILENCE GAP: music + SFX fall to silence 0.3 s before the main reveal, then the HIT (sub boom + braam) on the reveal word.
  7. Master: -14 LUFS integrated, true peak <= -1 dBTP (pedalboard limiters), 48 kHz stereo -> raw/final_audio.wav (old file kept as raw/final_audio_prev.wav).
Then run tools/master_check.py on the muxed mp4 as usual.
"""
import sys, os, json, argparse, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, iirpeak, lfilter
SR = 48000
BED_DB = float(os.environ.get("BED_DB", "10.5"))  # 2026-10-25 user: bgm too loud/pointy -> +3 dB lower
BED_LP = float(os.environ.get("BED_LP", "7500"))  # tame ear-piercing highs on bed + SFX  # bed loudness under the voice (dB); tuned 2026-10-25: 5 dB left only 5.7 dB voice-to-rest under words, 7.5 gives ~9
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(HERE)
rng = np.random.default_rng(7)

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x, axis=0)
def env_ad(n, a, d):  # attack/decay envelope in samples
    e = np.ones(n); A = max(1, int(a * SR)); e[:A] = np.linspace(0, 1, A); t = np.arange(n - A) / SR; e[A:] = np.exp(-t / max(d, 1e-3)); return e
def norm(x, peak=1.0): m = np.abs(x).max(); return x * (peak / m) if m > 0 else x

# ---------------------------------------------------------------- self-synthesised SFX
def braam(dur=2.2, f0=43.65, giant=False):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, det in enumerate([0, 0.35, -0.4, 0.7]):          # detuned saw stack (brass-like)
        ph = 2 * np.pi * (f0 + det) * t; s = np.zeros(n)
        for h in range(1, 18): s += np.sin(h * ph) / h * (0.92 ** h)
        x += s
    x += 0.6 * np.sin(2 * np.pi * f0 / 2 * t)                # sub octave
    cut = 180 + 2600 * np.exp(-t / 0.35)                     # filter snap open then close
    y = np.zeros(n); blk = 2400
    for i in range(0, n, blk): y[i:i + blk] = lp(x[i:i + blk], min(cut[i], 20000), 2)
    y = np.tanh((3.0 if giant else 2.2) * norm(y)) * env_ad(n, 0.01, 1.6 if giant else 0.9)
    if giant: y = y + 0.7 * norm(lp(np.sin(2 * np.pi * (f0 / 2) * t) * np.exp(-t / 1.4), 120))  # extra sub layer
    return norm(y, 0.95)
def boom(dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR; f = 38 + 70 * np.exp(-t / 0.06)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    x += 0.5 * hp(rng.standard_normal(n), 900) * np.exp(-t / 0.03)   # transient crack
    return norm(np.tanh(1.8 * x), 0.95)
def riser(dur=1.6):  # BANNED synth riser replaced 2026-10-28 by licensed CC0 build-ups
    import buildup_sfx; return buildup_sfx.load(dur, SR)
def _old_synth_riser_BANNED(dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR; p = t / dur
    nz = bp(rng.standard_normal(n), 300, 6000) * (p ** 2.2)
    f = 140 * (12 ** p); tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (p ** 1.8) * 0.5
    sh = np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * (p ** 3) * 0.3   # shepard-ish upper voice
    x = nz * 0.6 + tone + sh; x[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR)); return norm(x, 0.8)
def whoosh(dur=0.55):
    n = int(dur * SR); t = np.arange(n) / SR; nz = rng.standard_normal(n); y = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        c = 400 + 5000 * np.sin(np.pi * min(1, i / n)) ; y[i:i + blk] = bp(nz[i:i + blk], c * 0.5, min(c * 1.6, 20000), 2)
    return norm(y * np.sin(np.pi * t / dur) ** 1.5, 0.7)
def stinger(dur=0.7):
    n = int(dur * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t) for f in (311.1, 329.6, 466.2, 698.5)) * np.exp(-t / 0.18)   # dissonant cluster
    x += 0.4 * hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.04)
    return norm(x, 0.7)
def heartbeat_layer(n_total, t0, t1, bpm0=62, bpm1=128):
    out = np.zeros(n_total); t = t0
    def thump(f, d=0.16):
        m = int(d * SR); tt = np.arange(m) / SR; return np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.05)
    while t < t1:
        p = (t - t0) / max(1e-3, t1 - t0); bpm = bpm0 + (bpm1 - bpm0) * p ** 1.6; g = 0.35 + 0.65 * p
        for dt, f, a in ((0, 52, 1.0), (0.17 * 60 / bpm * 1.6, 46, 0.7)):        # lub-dub
            i = int((t + dt) * SR); th = thump(f) * a * g; j = min(n_total, i + len(th))
            if i < n_total: out[i:j] += th[:j - i]
        # clock tick on the off-beat (high, quiet)
        i = int((t + 30 / bpm) * SR); tk = hp(rng.standard_normal(int(0.012 * SR)), 3000) * np.exp(-np.arange(int(0.012 * SR)) / SR / 0.003) * 0.25 * g
        j = min(n_total, i + len(tk))
        if i < n_total: out[i:j] += tk[:j - i]
        t += 60 / bpm
    return out

# ---------------------------------------------------------------- music bed with drop on the reveal
def load(path, n=None):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).astype(np.float64)
    return x
def find_drop(x):
    m = x.mean(1); hop = 512; nf = len(m) // hop; fps = SR / hop
    lo = lp(m, 150); le = np.sqrt((lo[:nf * hop].reshape(nf, hop) ** 2).mean(1) + 1e-12)
    w = int(fps * 2); sm = np.convolve(le, np.ones(w) / w, 'same'); db = 20 * np.log10(sm + 1e-9)
    jump = db[w:] - db[:-w]; st = int(0.2 * len(jump)); i = st + int(np.argmax(jump[st:])); return (i + w // 2) / fps, float(jump[i])
def bed_for(track, reveal, n):
    x = load(track); drop, j = find_drop(x); off = int((drop - reveal) * SR)
    y = np.zeros((n, 2)); s0, d0 = max(0, off), max(0, -off); k = min(len(x) - s0, n - d0)
    if k > 0: y[d0:d0 + k] = x[s0:s0 + k]
    if k < n - d0 and len(x) > SR * 4:                       # loop the track tail if it runs short (crossfaded)
        pos = d0 + k
        while pos < n:
            seg = x[int(len(x) * 0.25):]; kk = min(len(seg), n - pos); fade = min(int(0.5 * SR), kk)
            y[pos:pos + kk] += seg[:kk]; y[pos:pos + fade] *= np.linspace(0, 1, fade)[:, None]; pos += kk
    fi, fo = int(0.3 * SR), int(1.2 * SR); y[:fi] *= np.linspace(0, 1, fi)[:, None]; y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return y, drop, j

def at(cue):
    if cue is None: return None
    if isinstance(cue, (int, float)): return float(cue)
    return float(str(cue).split('@')[-1])

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('case'); ap.add_argument('--track'); ap.add_argument('--out', default='raw/final_audio.wav')
    ap.add_argument('--hook', type=float); ap.add_argument('--reveal', type=float); ap.add_argument('--cuts'); ap.add_argument('--dur', type=float)
    ap.add_argument('--slug'); ap.add_argument('--dry', action='store_true'); a = ap.parse_args()
    C = os.path.abspath(a.case)
    if a.track: a.track = os.path.abspath(a.track)
    os.chdir(C)
    cues = json.load(open('cues.json')) if os.path.exists('cues.json') else {}
    if not os.path.exists('raw/vo_fx.wav'):
        subprocess.run([sys.executable, os.path.join(HERE, 'audio_fx.py'), 'vo.wav', 'raw/vo_fx.wav', '--fx', 'suspense', '--lufs', '-16'], check=True)
    v, sr = sf.read('raw/vo_fx.wav'); assert sr == SR
    if v.ndim == 1: v = np.stack([v, v], 1)
    dur = a.dur or float(cues.get('dur_video') or 0) or len(v) / SR + 1.0
    n = int(dur * SR); V = np.zeros((n, 2)); V[:min(n, len(v))] = v[:n]
    hook = a.hook if a.hook is not None else (at(cues.get('hook')) or 0.3)
    reveal = a.reveal if a.reveal is not None else (at(cues.get('reveal')) or dur * 0.6)
    cuts = [float(c) for c in a.cuts.split(',')] if a.cuts else [float(c) for c in cues.get('cuts', [])]
    hits = sorted(set([round(float(h), 2) for h in cues.get('hits', []) if abs(float(h) - reveal) > 1.0] + [round(reveal, 2)]))
    track = a.track
    if not track:
        r = subprocess.run([sys.executable, os.path.join(HERE, 'music_pick.py'), '--slug', a.slug or os.path.basename(C)] + (['--dry'] if a.dry else []), capture_output=True, text=True)
        track = r.stdout.strip().splitlines()[-1] if r.returncode == 0 and r.stdout.strip() else None
        if not track: sys.exit('horrific_mix: no track in music_library (add tracks or pass --track)')
    print(f'plan: dur {dur:.2f}s hook {hook:.2f}s reveal {reveal:.2f}s cuts {len(cuts)} hits {hits} track {os.path.basename(track)}')
    if a.dry: return
    B, drop, jump = bed_for(track, reveal, n); print(f'bed: drop {drop:.2f}s ({jump:.1f} dB) aligned to reveal {reveal:.2f}s')
    # --- SFX layer (mono -> stereo)
    S = np.zeros(n)
    def put(sig, t, g_db, align='start'):
        i = int(t * SR) - (len(sig) if align == 'end' else len(sig) // 2 if align == 'center' else 0); g = 10 ** (g_db / 20)
        s0 = max(0, i); e0 = min(n, i + len(sig))
        if e0 > s0: S[s0:e0] += sig[s0 - i:e0 - i] * g
    hk = 0.05 if hook > 0.5 else max(0.05, hook - 0.05); put(braam(3.2, 41.2, giant=True), hk, 0); put(boom(), hk, -4)   # GIANT braam on the hook (user favourite)   # 1. braam + hit in the first 0.5 s
    if hook > 0.5: put(boom(1.0), hook, -8)                                                     #    second hit on the hook word
    for h in hits:                                                                              # 3. risers into every hit/reveal
        main = abs(h - reveal) < 0.05; put(riser(2.4 if main else 1.6), h - (0.3 if main else 0), -7 if main else -11, 'end')
        if not main: put(boom(1.0), h, -10)
    for k, c in enumerate(cuts):                                                                # 4. whoosh/stinger on cuts
        if c < 0.6 or abs(c - reveal) < 0.6: continue
        put(whoosh() if k % 2 == 0 else stinger(), c, -15 if k % 2 == 0 else -19, 'center' if k % 2 == 0 else 'start')
    hb = heartbeat_layer(n, max(1.5, dur * 0.3), reveal - 0.3); S += hb * 10 ** (-9 / 20)     # 5. heartbeat + tick, accelerating
    put(braam(2.6, 41.2), reveal, -2); put(boom(1.8), reveal, -3)                               # 6. the reveal HIT
    S = lp(S, BED_LP, 4); SX = np.stack([S, S], 1)
    # --- levels: bed ~5 dB under voice, duck 4.5 dB under words, 2.6 kHz dip
    import pyloudnorm as pyln
    M = pyln.Meter(SR); lv = M.integrated_loudness(V); lb = M.integrated_loudness(B)
    B *= 10 ** ((lv - BED_DB - lb) / 20)
    B = lp(B, BED_LP, 4); bk2, ak2 = iirpeak(4200, 1.0, fs=SR); B = B - lfilter(bk2, ak2, B, axis=0) * 0.5   # de-harsh: LP + 4.2 kHz dip
    e = lp(np.abs(V).max(1), 7); e = np.clip(e / (np.percentile(e, 95) + 1e-9), 0, 1)
    duck = 1 - (1 - 10 ** (-4.5 / 20)) * e
    bk, ak = iirpeak(2600, 1.2, fs=SR); B = B - lfilter(bk, ak, B, axis=0) * (0.6 * e)[:, None]
    sp = float(np.percentile(np.abs(V), 99.9)); SX *= sp * 10 ** (-3 / 20) / (np.abs(SX).max() + 1e-9) * 1.0
    wm = np.zeros(n)
    if os.path.exists('vo.json'):
        for w in json.load(open('vo.json')).get('words', []):
            s0, e0 = (w[1], w[2]) if isinstance(w, list) else (w.get('start', 0), w.get('end', 0)); wm[int(s0 * SR):int(e0 * SR)] = 1
    wm = lp(wm, 20); SX *= (1 - 0.45 * np.clip(wm, 0, 1))[:, None]   # SFX dip under words, but the hook/reveal hits stay big
    for t in (hk, reveal):
        i, j = int(t * SR), int((t + 1.2) * SR); SX[i:j] /= (1 - 0.45 * np.clip(wm[i:j], 0, 1))[:, None]
    # --- 0.3 s silence gap before the reveal (music + SFX only; the voice is untouched)
    g = np.ones(n); i0 = int((reveal - 0.3) * SR); i1 = int(reveal * SR); r = int(0.06 * SR)
    if i0 > r: g[i0 - r:i0] = np.linspace(1, 0, r); g[i0:i1] = 0
    mix = V + (B * duck[:, None]) * g[:, None] + SX * np.maximum(g, (np.arange(n) >= i1))[:, None]
    # --- master -14 LUFS, TP <= -1
    from pedalboard import Pedalboard, Limiter
    L = M.integrated_loudness(mix); tgt = -14.0; out = mix
    for _ in range(5):
        out = pyln.normalize.loudness(mix, L, tgt)
        out = Pedalboard([Limiter(threshold_db=-4.5, release_ms=150), Limiter(threshold_db=-3.2, release_ms=40)])(out.T.astype(np.float32), SR).T
        out = np.clip(out, -0.69, 0.69); got = M.integrated_loudness(out)  # ceiling -3.2 dBFS: AAC adds ~1.5-2 dB inter-sample overshoot (TP must stay <= -1 after mux)
        if abs(got + 14) < 0.25: break
        tgt += (-14 - got)
    if os.path.exists(a.out) and not os.path.exists(a.out.replace('.wav', '_prev.wav')): os.replace(a.out, a.out.replace('.wav', '_prev.wav'))
    sf.write(a.out, out.astype(np.float32), SR)
    print(f'HORRIFIC mix -> {a.out}  {n/SR:.2f}s  LUFS {M.integrated_loudness(out):.1f}  peak {np.abs(out).max():.3f}  track {os.path.basename(track)}')
    open('music_used.txt', 'a').write(f'HORRIFIC preset 2026-10-25: track {os.path.basename(track)} drop {drop:.2f}s -> reveal {reveal:.2f}s; braam hook {hk:.2f}s; risers {hits}; heartbeat {dur*0.3:.1f}-{reveal-0.3:.1f}s; 0.3 s gap; duck 4.5 dB\n')

if __name__ == '__main__': main()
