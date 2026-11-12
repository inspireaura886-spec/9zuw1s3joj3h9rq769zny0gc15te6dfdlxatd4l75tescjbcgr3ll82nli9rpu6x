#!/usr/bin/env python3
"""Model helpers for the daily Shorts workflow (advisory layer; shortqa stays the hard gate).
Keys (repo secrets, never printed): JEV_API_KEY for the jev-1.13-free decision calls (choose/review/decide);
OPENCODE_API_KEY only for the vision models on the OpenCode Zen endpoint. A missing key = that step is SKIPPED with a
warning ("skipped": true) and plain shortqa decides. Every command exits 0 and prints JSON ("ok": false on any error),
so the run never fails because of this layer.

  python3 tools/jev.py choose  <candidates.json> [n=2]        -> {"ok", "picks": [slug...], "why"}       (a) topic choice
  python3 tools/jev.py review  <work dir>                     -> {"ok", "hook": 0-10, "score": 0-10, "go": bool, "fixes": [...]}  (b) script go/no-go
  python3 tools/jev.py vision  <contact.jpg> [opening.jpg]    -> {"ok", "exposure_ok", "captions_readable", "inside_safe_box", "notes"}  (visual check)
  python3 tools/jev.py decide  <qa report.md> [visual.json] [review.json] -> {"ok", "post": bool, "why"}  (c) post/no-post

Roles: decisions = jev-1.13-free via https://opencode.ai/inference/systemone/v1/systemone ;
vision = nemotron-3.5-super-vl-free (fallback mimo-v2.6-flash-free) via the OpenCode Zen chat endpoint."""
import base64, json, os, re, sys, urllib.request

JEV_URL = os.environ.get('JEV_URL', 'https://opencode.ai/inference/systemone/v1/systemone')
JEV_MODEL = os.environ.get('JEV_MODEL', 'jev-1.13-free')
ZEN_URL = os.environ.get('ZEN_URL', 'https://opencode.ai/zen/v1/chat/completions')
VISION_MODELS = [m for m in os.environ.get('VISION_MODELS', 'nemotron-3.5-super-vl-free,mimo-v2.6-flash-free').split(',') if m]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Skip(Exception):
    """a key is missing: skip this advisory step (warning only), plain shortqa decides"""


def _post(url, body, timeout=180, key_env='OPENCODE_API_KEY'):
    key = os.environ.get(key_env, '')
    if not key: raise Skip(f'{key_env} not set')
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method='POST',
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def _text(resp):
    """pull the answer text out of an OpenAI-style, Anthropic-style or plain response"""
    if isinstance(resp, str): return resp
    try: return resp['choices'][0]['message']['content']
    except Exception: pass
    for k in ('output_text', 'text', 'output', 'answer', 'result', 'content', 'decision'):
        v = resp.get(k) if isinstance(resp, dict) else None
        if isinstance(v, str): return v
        if isinstance(v, list):
            parts = [x.get('text', '') if isinstance(x, dict) else str(x) for x in v]
            if any(parts): return '\n'.join(parts)
        if isinstance(v, dict): return json.dumps(v)
    return json.dumps(resp)


def _json(txt):
    m = re.search(r'\{.*\}', txt, re.S)
    if not m: raise ValueError('no JSON in answer: ' + txt[:200])
    return json.loads(m.group(0))


def jev(system, user):
    """decision layer call; tries the chat-style body, then a plain input body"""
    last = None
    for body in ({'model': JEV_MODEL, 'messages': [{'role': 'system', 'content': system}, {'role': 'user', 'content': user}]},
                 {'model': JEV_MODEL, 'input': system + '\n\n' + user}):
        try: return _json(_text(_post(JEV_URL, body, key_env='JEV_API_KEY')))
        except Skip: raise
        except Exception as e: last = e
    raise RuntimeError(f'jev failed: {last}')


def vision(prompt, images):
    content = [{'type': 'text', 'text': prompt}]
    for p in images:
        b = base64.b64encode(open(p, 'rb').read()).decode()
        content.append({'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,' + b}})
    last = None
    for m in VISION_MODELS:
        try:
            r = _post(ZEN_URL, {'model': m, 'messages': [{'role': 'user', 'content': content}], 'max_tokens': 600})
            out = _json(_text(r)); out['model'] = m; return out
        except Skip: raise
        except Exception as e: last = e
    raise RuntimeError(f'vision failed: {last}')


def rubric():
    p = os.path.join(ROOT, 'daily', 'CRITIC_RUBRIC.md')
    return open(p).read() if os.path.exists(p) else ''


def cmd_choose(cands, n=2):
    C = json.load(open(cands))
    sys_ = ('You pick topics for a YouTube Shorts channel: "True mysteries science can\'t fully explain, in under 60 seconds." '
            'Priority: UFO/radar/signals with an official record or hard number; aviation/maritime vanishings with a physical clue; '
            'mass environmental anomalies with one hard number. Prefer strong frame-1 hooks, verified sources, nothing graphic. '
            f'Answer ONLY JSON: {{"picks": [{n} slugs from the list, best first], "why": "one line"}}')
    out = jev(sys_, json.dumps(C)[:12000])
    slugs = {c['slug'] for c in C}
    out['picks'] = [s for s in out.get('picks', []) if s in slugs][:n]
    return out


def cmd_review(work):
    p = json.load(open(os.path.join(work, 'plan.json')))
    title = open(os.path.join(work, 'yt_title.txt')).read().strip() if os.path.exists(os.path.join(work, 'yt_title.txt')) else ''
    sys_ = ('You are a harsh fresh critic for mystery Shorts. Judge ONLY the script and shot plan against this rubric '
            '(criteria 1 hook, 7 mini-reveals, 9 ending, 10 facts). Line 1 must state an exact number or named subject + impossible '
            'evidence + concrete setting inside 2.5 s; a "But..." twist near 15-18 s; last line ends "Nobody explained it.".\n'
            + rubric()[:3500] +
            '\nAnswer ONLY JSON: {"hook": 0-10, "score": 0-10, "go": true|false, "fixes": ["max 3 concrete fixes"]}. go=false only if hook < 6 or score < 6.5.')
    user = json.dumps({'title': title, 'lines': p['lines'], 'heads': [s.get('head') for s in p['shots']]})
    return jev(sys_, user)


def cmd_vision(*imgs):
    prompt = ('These are frames from a 1080x1920 vertical mystery Short (contact sheet: 2 frames per second; opening: first 3 s). '
              'Check: exposure (no crushed/blown or near-black frames), on-screen text readable at phone size, captions/headlines '
              'fully inside the safe box (x 162-918 of 1080 width, nothing below y 1560 of 1920), no yellow/red template captions, '
              'no shaky/smeared frames. Answer ONLY JSON: {"exposure_ok": bool, "captions_readable": bool, "inside_safe_box": bool, '
              '"notes": "max 3 short issues with tile positions"}')
    return vision(prompt, [i for i in imgs if os.path.exists(i)])


def cmd_decide(report, visual=None, review=None):
    rep = open(report).read() if os.path.exists(report) else 'NO QA REPORT (render failed)'
    vis = json.load(open(visual)) if visual and os.path.exists(visual) else {}
    rev = json.load(open(review)) if review and os.path.exists(review) else {}
    sys_ = ('You make the final post/no-post call for a mystery Short. Machine QA (shortqa) is a HARD gate: any unchecked "- [ ]" '
            'line means post=false. Otherwise weigh the visual check and the script review; refuse if captions leave the safe box, '
            'text is unreadable, frames are badly exposed, or the hook is weak (< 6). Answer ONLY JSON: {"post": true|false, "why": "one line"}')
    out = jev(sys_, json.dumps({'shortqa_report': rep[:6000], 'visual_check': vis, 'script_review': rev}))
    if '- [ ]' in rep or 'NO QA REPORT' in rep: out['post'] = False   # shortqa stays the hard gate
    return out


if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    cmd, args = sys.argv[1], sys.argv[2:]
    try:
        f = {'choose': cmd_choose, 'review': cmd_review, 'vision': cmd_vision, 'decide': cmd_decide}[cmd]
        if cmd == 'choose' and len(args) > 1: args[1] = int(args[1])
        res = f(*args); res['ok'] = True
    except KeyError: sys.exit(__doc__)
    except Skip as e:
        print(f'WARNING: jev.py {cmd} skipped: {e}; falling back to plain shortqa', file=sys.stderr)
        res = {'ok': False, 'skipped': True, 'error': str(e)}
    except Exception as e:
        msg = str(e)
        for k in ('JEV_API_KEY', 'OPENCODE_API_KEY'):
            if os.environ.get(k): msg = msg.replace(os.environ[k], '***')
        res = {'ok': False, 'error': msg[:300]}
    print(json.dumps(res))
