#!/usr/bin/env python3
"""List fresh topic candidates (unused verified packs first, then unused STORY_BANK rows) as JSON for tools/jev.py choose.
usage: python3 daily/candidates.py > candidates.json"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import D, used_slugs
U = used_slugs(); out = []
for s in sorted(os.listdir(os.path.join(D, 'ready'))):
    if s in U: continue
    f = os.path.join(D, 'ready', s)
    t = open(f + '/yt_title.txt').read().strip() if os.path.exists(f + '/yt_title.txt') else s
    h = open(f + '/script.txt').read().strip().split('\n')[0][:200] if os.path.exists(f + '/script.txt') else ''
    out.append({'slug': s, 'kind': 'verified pack (daily/ready)', 'title': t, 'hook': h})
for l in open(os.path.join(D, 'STORY_BANK.md')):
    c = [x.strip() for x in l.split('|')]
    if len(c) < 10 or c[2] in ('slug', '---', '') or c[2] in U: continue
    if 'used' in c[-2].lower() or 'posted' in c[-2].lower(): continue
    if any(c[2].split('-')[0] in u for u in U if len(c[2].split('-')[0]) > 4): continue
    out.append({'slug': c[2], 'kind': 'story bank (verify with 2 sources)', 'title': c[1], 'hook': c[4][:200], 'scare': c[6]})
seen = set(); out = [o for o in out if not (o['slug'] in seen or seen.add(o['slug']))]
print(json.dumps(out[:40], indent=1))
