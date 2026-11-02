"""Timing hook: shots follow words.json / line times (same idea as claude-animated-shorts: every visual lands 0-3
frames BEFORE its word). Accepts the factory's words formats:
  [[word, start, end], ...]   or   [{"word":..,"start":..,"end":..}, ...]   or   {"words":[...]}.
"""
import json, re
FPS = 30


def load(path):
    d = json.load(open(path))
    if isinstance(d, dict):
        d = d.get('words') or d.get('segments') or []
    out = []
    for w in d:
        if isinstance(w, dict):
            out.append((str(w.get('word', w.get('text', ''))).strip(), float(w['start']), float(w['end'])))
        else:
            out.append((str(w[0]).strip(), float(w[1]), float(w[2])))
    return out


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def at(words, word, n=1, lead=2, offset_s=0.0):
    """Frame where the n-th occurrence of `word` starts, minus `lead` frames (visual leads the voice)."""
    k = 0
    for w, s, e in words:
        if norm(w) == norm(word):
            k += 1
            if k == n:
                return max(0, int(round((s - offset_s) * FPS)) - lead)
    raise KeyError('word not found: %s #%d' % (word, n))


def phrase(words, text, lead=2, offset_s=0.0):
    """Frame where a multi-word phrase starts."""
    t = [norm(x) for x in text.split()]
    W = [norm(w) for w, s, e in words]
    for i in range(len(W) - len(t) + 1):
        if W[i:i + len(t)] == t:
            return max(0, int(round((words[i][1] - offset_s) * FPS)) - lead)
    raise KeyError('phrase not found: ' + text)


def sec(t, lead=0):
    return max(0, int(round(t * FPS)) - lead)
