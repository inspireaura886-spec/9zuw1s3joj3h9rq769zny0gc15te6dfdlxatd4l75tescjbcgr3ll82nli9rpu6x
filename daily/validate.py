#!/usr/bin/env python3
"""Validate a day's Short plans. usage: python3 daily/validate.py daily/work/<slug> [more dirs]   (exit 1 = fix the listed errors)
Checks PLAYBOOK.md rules: fresh slug (used_slugs.txt + dedupe_check.py), 120-145 words, loop ending, 14-18 shots on
real scene files, heads/chips short, packaging files present and within limits, VERIFY.md with sources."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

def check(work):
    E = []; W = []
    try: p = load_plan(work)
    except Exception as e: return [f'plan.json unreadable: {e}'], W
    slug = p.get('slug', '')
    if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', slug or ''): E.append('slug must be lowercase-hyphenated')
    if os.path.basename(os.path.normpath(work)) != slug: E.append(f'folder name must equal slug ({slug})')
    if slug in used_slugs(): E.append(f'slug {slug} is in daily/used_slugs.txt (already made/posted) - pick another topic')
    if slug == 'titanic-californian-rockets-1912': E.append('titanic-californian-rockets-1912 is off limits')
    names = [p.get('case_name', '')] + list(p.get('aliases', []))
    r = subprocess.run([sys.executable, os.path.join(D, 'dedupe_check.py'), slug] + [n for n in names if n], capture_output=True, text=True)
    if r.returncode == 1: E.append('DEDUPE BLOCK (already posted case): ' + r.stdout.strip().splitlines()[0][:200])
    if p.get('narrator') not in SEEDS: E.append('narrator must be narrator_m or narrator_f')
    if p.get('scheme') not in SCHEMES: E.append(f'scheme must be one of {SCHEMES}')
    lines = p.get('lines') or []
    nw = sum(len(tokens(l)) for l in lines)
    if not 120 <= nw <= 145: E.append(f'script has {nw} words; needs 120-145')
    if not 6 <= len(lines) <= 12: E.append(f'{len(lines)} lines; use 6-12 lines')
    if lines and not lines[-1].strip().endswith('Nobody explained it.'): E.append('last line must end with "Nobody explained it."')
    for i, l in enumerate(lines):
        if re.search(r'\d', l): E.append(f'line {i}: spell numbers/years out in words for the voice ("nineteen forty-seven"), digits go only in heads/chips')
        if len(tokens(l)) > 32: E.append(f'line {i} is {len(tokens(l))} words; max 32')
    shots = p.get('shots') or []
    if not 14 <= len(shots) <= 18: E.append(f'{len(shots)} shots; needs 14-18')
    sc = scenes(); prev = (-1, -1); gidx = []
    for k, s in enumerate(shots):
        li, wi = s.get('line'), s.get('word', 0)
        if not isinstance(li, int) or not (0 <= li < len(lines)): E.append(f'shot {k}: bad line index {li}'); continue
        if not isinstance(wi, int) or not (0 <= wi < len(tokens(lines[li]))): E.append(f'shot {k}: word index {wi} outside line {li}'); continue
        if (li, wi) <= prev: E.append(f'shot {k}: (line {li}, word {wi}) must come after the previous shot')
        prev = (li, wi); gidx.append(sum(len(tokens(x)) for x in lines[:li]) + wi)
        if s.get('scene') not in sc: E.append(f'shot {k}: scene {s.get("scene")} not in daily/SCENES.tsv')
        h = s.get('head') or []
        if not (1 <= len(h) <= 2) or any(len(x) > 22 for x in h): E.append(f'shot {k}: head must be 1-2 strings of <= 22 chars')
        if s.get('chip') and len(s['chip']) > 28: E.append(f'shot {k}: chip > 28 chars')
    if shots and (shots[0].get('line'), shots[0].get('word', 0)) != (0, 0): E.append('shot 0 must start at line 0 word 0')
    for a, b in zip(gidx, gidx[1:] + [nw]):
        if b - a < 4: E.append(f'a shot starting at word {a} lasts only {b - a} words; each shot needs >= 4 words (~1.5 s)'); break
    used = [s.get('scene') for s in shots]
    if len(set(used)) < len(used) - 2: E.append('too many repeated scene files; at most 2 repeats')
    f = lambda n: os.path.join(work, n)
    t = open(f('yt_title.txt')).read().strip() if os.path.exists(f('yt_title.txt')) else ''
    if not t or len(t) > 100 or not t.endswith('#shorts'): E.append('yt_title.txt must be <= 100 chars and end with #shorts')
    d = open(f('yt_desc.txt')).read() if os.path.exists(f('yt_desc.txt')) else ''
    if 'Sources' not in d or len(re.findall(r'https?://', d)) < 2: E.append('yt_desc.txt needs a "Sources:" block with >= 2 URLs')
    if 'AI voice' not in d: E.append('yt_desc.txt must say the narration is an AI voice and visuals are a 3D reconstruction')
    x = open(f('x_text.txt')).read().strip() if os.path.exists(f('x_text.txt')) else ''
    if not x or len(x) > 280: E.append('x_text.txt must be 1-280 chars')
    try:
        th = json.load(open(f('x_thread.json')))
        if not isinstance(th, list) or not th or any(not isinstance(s, str) or len(s) > 280 for s in th): E.append('x_thread.json must be a JSON list of strings <= 280 chars')
    except Exception: E.append('x_thread.json missing or not JSON')
    v = open(f('VERIFY.md')).read() if os.path.exists(f('VERIFY.md')) else ''
    if len(set(re.findall(r'https?://\S+', v))) < 2: E.append('VERIFY.md needs every claim with >= 2 distinct source URLs')
    est = nw / 2.6 + 0.8
    if not 45 <= est <= 56: W.append(f'estimated length {est:.1f} s (target 45-55)')
    return E, W

if __name__ == '__main__':
    dirs = sys.argv[1:]
    if not dirs: sys.exit(__doc__)
    bad = 0; seen = set()
    for w in dirs:
        E, W = check(w)
        try: p = load_plan(w); seen.add(p.get('narrator'))
        except Exception: pass
        print(('FAIL ' if E else 'PASS ') + w)
        for e in E: print('  ERROR', e)
        for e in W: print('  warn', e)
        bad += bool(E)
    if len(dirs) == 2 and len(seen) != 2: print('ERROR the two Shorts must use different narrators (one narrator_m, one narrator_f)'); bad += 1
    sys.exit(1 if bad else 0)
