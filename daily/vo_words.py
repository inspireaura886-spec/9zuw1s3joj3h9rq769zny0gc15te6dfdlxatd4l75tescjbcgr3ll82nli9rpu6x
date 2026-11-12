#!/usr/bin/env python3
"""Word timings for captions/cuts. usage: python3 daily/vo_words.py <work dir> <joined.wav> <tts stats.json> <out vo.json>
faster-whisper (small.en, word timestamps) is aligned to the SCRIPT words (difflib), so captions show the script's spelling;
unmatched script words are interpolated inside their line's span from the TTS timeline."""
import difflib, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
work, wav, stats, out = sys.argv[1:5]
p = load_plan(work); st = json.load(open(stats)); TL = st['timeline']
import soundfile as sf
info = sf.info(wav); dur = info.frames / info.samplerate
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='int8')
import subprocess, numpy as np
audio = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
segs, _ = m.transcribe(audio, language='en', word_timestamps=True, beam_size=5, vad_filter=False)
H = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
S = []  # (token, line index)
for li, l in enumerate(p['lines']):
    for t in tokens(l): S.append((t, li))
a = [norm(t) for t, _ in S]; b = [norm(h[0]) for h in H]
T = [None] * len(S)
for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
    for k in range(blk.size): T[blk.a + k] = (H[blk.b + k][1], H[blk.b + k][2])
# fill gaps: interpolate between known neighbours, bounded by the line span from the TTS timeline
for li, tl in enumerate(TL):
    idx = [k for k, (_, l) in enumerate(S) if l == li]
    s0, s1 = tl['start'], tl['end']
    for k in idx:
        if T[k] and not (s0 - 0.6 <= T[k][0] <= s1 + 0.6): T[k] = None   # reject matches outside their line
    known = [k for k in idx if T[k]]
    for k in idx:
        if T[k]: continue
        prv = max([j for j in known if j < k], default=None); nxt = min([j for j in known if j > k], default=None)
        a0 = T[prv][1] if prv is not None else s0; a1 = T[nxt][0] if nxt is not None else s1
        lo = prv if prv is not None else idx[0] - 1; hi = nxt if nxt is not None else idx[-1] + 1
        f0 = (k - lo) / (hi - lo); f1 = (k + 1 - lo) / (hi - lo)
        T[k] = (a0 + (a1 - a0) * f0 - (0 if prv is None and k == idx[0] else 0), a0 + (a1 - a0) * f1)
words = []
for (t, _), (s, e) in zip(S, T):
    s = max(0.0, s); e = max(s + 0.05, e)
    if words and s < words[-1][1]: s = words[-1][1]; e = max(e, s + 0.05)
    words.append([t, round(s, 3), round(e, 3)])
matched = sum(1 for x in T if x) and sum(1 for k in range(len(S)) if a[k] in b)
json.dump({'lines': p['lines'], 'words': words, 'dur': round(dur, 3), 'whisper_words': len(H), 'script_words': len(S)}, open(out, 'w'))
print('words', len(words), 'whisper', len(H), 'dur', round(dur, 2))
