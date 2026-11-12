#!/usr/bin/env python3
"""plan.json -> Qwen3-TTS job file. usage: python3 daily/tts_job.py <work dir> <qwen repo dir> <job name>"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
work, q, name = sys.argv[1:4]
p = load_plan(work); n = p['narrator']; vid = VOICE_ID[n]
assert os.path.exists(f'{q}/voices/{vid}/ref.wav'), f'voice {vid} missing in qwennyy'
L = [{'speaker': vid, 'text': l, 'pause': 0.2, 'seed': SEEDS[n]} for l in p['lines']]
os.makedirs(f'{q}/jobs', exist_ok=True)
json.dump({'language': 'English', 'seed': SEEDS[n], 'lines': L}, open(f'{q}/jobs/{name}.json', 'w'), indent=1)
print(len(L), 'lines, voice', n, 'seed', SEEDS[n])
