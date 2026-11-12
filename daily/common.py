"""Shared helpers for the daily Shorts pipeline (daily/*.py). Paths are relative to the repo root."""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, 'daily')
SCHEMES = ['sage', 'dusty-teal', 'slate', 'clay', 'lavender', 'sand', 'dusk-rose', 'fog-blue', 'stone']
SEEDS = {'narrator_m': 41, 'narrator_f': 51}
VOICE_ID = {'narrator_m': 'd', 'narrator_f': 'e'}   # neutral voice ids in the public qwennyy repo
FPS = 30

def tokens(text):
    """script words as shown in captions (keeps punctuation attached, splits on spaces)"""
    return [w for w in re.split(r'\s+', text.strip()) if w]

def norm(w):
    return re.sub(r'[^a-z0-9]', '', w.lower())

def load_plan(work):
    return json.load(open(os.path.join(work, 'plan.json')))

def used_slugs():
    out = set()
    for l in open(os.path.join(D, 'used_slugs.txt')):
        if l.strip() and not l.startswith('#'): out.add(l.split('\t')[0].strip().lower())
    return out

def scenes():
    out = set()
    for l in open(os.path.join(D, 'SCENES.tsv')).read().splitlines()[1:]:
        if l.strip(): out.add(l.split('\t')[0])
    return out

def comp_id(slug):
    return 'D' + ''.join(p.capitalize() for p in re.split(r'[^a-zA-Z0-9]+', slug) if p)[:40]
