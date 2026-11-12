#!/usr/bin/env python3
"""Jev decision layer for the daily Shorts (TypeSafe System One, model jev-latest, called DIRECTLY via typesafe-sdk).
Key: env JEV_API_KEY (repo secret; mapped to TYPESAFE_API_KEY for the SDK, never printed). Missing key -> every
command prints {"ok": false, "skipped": true} with a warning on stderr and exits 0: plain shortqa decides.
Any API error -> {"ok": false, "error": ...}, exit 0. The run never fails because of Jev. shortqa stays the hard gate.
Questions are atomic (choice / score / noul / box) and live in tools/jev_questions.json; this file combines them.

  choose  <candidates.json> [n=2]   topic pick from verified candidates (choice; ranked by probability)
  review  <work dir>                hook score + one noul per script line against the fact pack + pacing + payoff -> go/no-go
  package <work dir>                title among 3-5 candidates (titles.json) + frame-0 hook text + palette + sound bed (choice)
  narrators <work dir A> <work dir B>  which Short gets narrator_m (the other gets narrator_f; alternation kept)
  frames  <final.mp4> <cuts,comma> <out dir>   per-shot frame checks: noul readable/exposure, box caption-in-safe-area, score interest
  decide  <shortqa report.md> [frames.json] [review.json]   final post/no-post: shortqa hard gate AND Jev noul AND score floors
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
Q = json.load(open(os.path.join(HERE, 'jev_questions.json')))
MODEL = os.environ.get('JEV_MODEL', 'jev-latest')
SAFE = dict(left=162 / 1080, right=918 / 1080, bottom=1560 / 1920)
SCHEMES = ['sage', 'dusty-teal', 'slate', 'clay', 'lavender', 'sand', 'dusk-rose', 'fog-blue', 'stone']


class Skip(Exception):
    pass


_client = None
def client():
    global _client
    key = os.environ.get('JEV_API_KEY', '')
    if not key: raise Skip('JEV_API_KEY not set')
    if _client is None:
        os.environ['TYPESAFE_API_KEY'] = key
        try: from typesafe_sdk import TypeSafeClient
        except ImportError:
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'typesafe-sdk'], check=True)
            from typesafe_sdk import TypeSafeClient
        _client = TypeSafeClient(api_key=key, model=MODEL, timeout=120)
    return _client


def q(group, name, **fmt):
    d = dict(Q[group][name]); d['instructions'] = d['instructions'].format(**fmt) if fmt else d['instructions']
    return d


def ask(state, questions):
    """questions: {name: question dict}. Returns {name: simplified answer}."""
    r = client().system_one(state=state, questions=questions)
    out = {}
    for k, a in r.answers.items():
        t = a.type
        if t == 'noul': out[k] = round(float(a.noul), 3)
        elif t == 'choice': out[k] = {'choice': a.choice, 'confidence': round(a.confidence, 3), 'p': {x: round(v, 3) for x, v in a.probabilities.items()}}
        elif t == 'score': out[k] = {'score': round(a.score, 2), 'confidence': round(a.confidence, 3), 'max': len(a.legend) - 1}
        elif t == 'box': out[k] = {'top': a.box.top, 'bottom': a.box.bottom, 'left': a.box.left, 'right': a.box.right, 'confidence': a.confidence}
    return out


def read(p, n=None):
    return open(p).read()[:n] if os.path.exists(p) else ''


# ---------------------------------------------------------------- commands
def cmd_choose(cands, n=2):
    C = json.load(open(cands))[:30]
    crit = {c['slug']: f"{c.get('title', '')} | hook: {c.get('hook', '')} | {c.get('kind', '')}"[:400] for c in C}
    a = ask({'candidates': 'Fresh, never-posted candidate topics for today.'}, {'pick': dict(q('topic', 'pick'), criteria=crit)})['pick']
    ranked = sorted(a['p'], key=lambda s: -a['p'][s])
    return {'picks': ranked[:int(n)], 'probabilities': a['p']}


def fact_pack(work, plan):
    slug = plan['slug']; root = os.path.dirname(HERE)
    parts = [read(os.path.join(work, 'VERIFY.md'), 8000)]
    for f in ('factpack.md', 'VERIFY.md'):
        parts.append(read(os.path.join(root, 'daily', 'ready', slug, f), 8000))
    return '\n\n'.join(p for p in parts if p)


def cmd_review(work):
    p = json.load(open(os.path.join(work, 'plan.json'))); lines = p['lines']
    narration = '\n'.join(f'{i}: {l}' for i, l in enumerate(lines))
    A = ask({'narration': narration, 'first_line': lines[0]},
            {'hook': q('script', 'hook'), 'pacing': q('script', 'pacing'), 'payoff': q('script', 'payoff')})
    fp = fact_pack(work, p)
    claims = ask({'fact_pack': fp[:14000], 'narration': narration},
                 {f'line_{i}': q('script', 'claim', line=f'line {i}: "{l}"') for i, l in enumerate(lines)})
    weak = [i for i in range(len(lines)) if claims.get(f'line_{i}', 1) < 0.5]
    h = A['hook']['score'] / A['hook']['max'] * 10; pc = A['pacing']['score'] / A['pacing']['max'] * 10; po = A['payoff']['score'] / A['payoff']['max'] * 10
    fixes = []
    if h < 6: fixes.append(f'hook too weak ({h:.1f}/10): line 0 needs an exact number/name + impossible evidence + setting')
    if pc < 5: fixes.append(f'pacing weak ({pc:.1f}/10): a new concrete reveal every 10-12 s, cut filler')
    if po < 5: fixes.append(f'payoff weak ({po:.1f}/10): end on the strongest unexplained detail + "Nobody explained it."')
    for i in weak: fixes.append(f'line {i} has a claim the fact pack does not support (p={claims[f"line_{i}"]}): fix it or add the source to VERIFY.md')
    go = h >= 6 and pc >= 5 and po >= 5 and not weak
    return {'hook': round(h, 1), 'pacing': round(pc, 1), 'payoff': round(po, 1), 'score': round((h + pc + po) / 3, 1),
            'claims': claims, 'unsupported_lines': weak, 'go': go, 'fixes': fixes}


def cmd_package(work):
    p = json.load(open(os.path.join(work, 'plan.json'))); story = '\n'.join(p['lines'])
    T = json.load(open(os.path.join(work, 'titles.json'))) if os.path.exists(os.path.join(work, 'titles.json')) else {}
    titles = [t for t in T.get('titles', []) if isinstance(t, str) and t.endswith('#shorts') and len(t) <= 100][:5]
    thumbs = [t for t in T.get('thumb_texts', []) if isinstance(t, str) and len(t) <= 40][:5]
    other = os.environ.get('OTHER_SCHEME', '')
    qs = {'palette': dict(q('style', 'palette'), criteria={s: None for s in SCHEMES if s != other}), 'bed': q('style', 'bed')}
    if len(titles) >= 2: qs['title'] = dict(q('packaging', 'title'), criteria={t: None for t in titles})
    if len(thumbs) >= 2: qs['thumb'] = dict(q('packaging', 'thumb'), criteria={t: None for t in thumbs})
    A = ask({'story': story, 'scenes': [s['scene'].split('/')[-2] + '/' + s['scene'].split('/')[-1] for s in p['shots']]}, qs)
    return {k: v['choice'] for k, v in A.items()} | {'detail': A}


def cmd_narrators(wa, wb):
    pa = json.load(open(os.path.join(wa, 'plan.json'))); pb = json.load(open(os.path.join(wb, 'plan.json')))
    crit = {'A_male': f"male narrator for '{pa['case_name']}', female for '{pb['case_name']}'",
            'B_male': f"male narrator for '{pb['case_name']}', female for '{pa['case_name']}'"}
    A = ask({'story_A': '\n'.join(pa['lines']), 'story_B': '\n'.join(pb['lines'])}, {'narrator': dict(q('style', 'narrator'), criteria=crit)})
    return {'male': pa['slug'] if A['narrator']['choice'] == 'A_male' else pb['slug'], 'detail': A['narrator']}


def cmd_frames(video, cuts, out):
    from typesafe_sdk import Image
    os.makedirs(out, exist_ok=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout.strip() or 0)
    cs = [0.0] + [float(c) for c in cuts.split(',') if c] + [dur]
    shots = []
    client()   # raise Skip before extracting frames when there is no key
    for k in range(len(cs) - 1):
        t = cs[k] + (cs[k + 1] - cs[k]) * 0.6; f = os.path.join(out, f'shot_{k + 1:02d}.jpg')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', video, '-frames:v', '1', '-vf', 'scale=540:960', '-q:v', '3', f], check=True)
        try:
            A = ask({'frame': Image(open(f, 'rb').read()), 'note': f'Shot {k + 1} at {t:.1f} s of a 1080x1920 vertical Short.'},
                    {'readable': q('frame', 'readable'), 'caption_box': q('frame', 'caption_box'), 'interest': q('frame', 'interest')})
        except Skip: raise
        except Exception as e:
            shots.append({'shot': k + 1, 't': round(t, 2), 'error': str(e)[:160]}); continue
        b = A.get('caption_box') or {}
        inside = (not b) or (b.get('confidence') is not None and b['confidence'] < 0.3) or (
            b['left'] >= SAFE['left'] - 0.01 and b['right'] <= SAFE['right'] + 0.01 and b['bottom'] <= SAFE['bottom'] + 0.005)
        it = A.get('interest', {}); shots.append({'shot': k + 1, 't': round(t, 2), 'readable': A.get('readable'), 'caption_box': b,
                                                   'inside_safe_area': bool(inside), 'interest': round(it.get('score', 0) / max(it.get('max', 4), 1) * 10, 1)})
    ok = [s for s in shots if 'error' not in s]
    bad = [s['shot'] for s in ok if (s['readable'] or 0) < 0.5 or not s['inside_safe_area']]
    res = {'shots': shots, 'checked': len(ok), 'flagged_shots': bad,
           'mean_interest': round(sum(s['interest'] for s in ok) / max(len(ok), 1), 1), 'frames_ok': len(ok) > 0 and len(bad) <= 2}
    json.dump(res, open(os.path.join(out, 'jev_frames.json'), 'w'), indent=1)
    return res


def cmd_decide(report, frames=None, review=None):
    rep = read(report) or 'NO QA REPORT (render failed)'
    hard = '- [ ]' not in rep and 'NO QA REPORT' not in rep and '- [x]' in rep
    fr = json.load(open(frames)) if frames and os.path.exists(frames) else {}
    rv = json.load(open(review)) if review and os.path.exists(review) else {}
    jev_ok = None; note = []
    try:
        A = ask({'shortqa_report': rep[:6000], 'frame_checks': {k: fr.get(k) for k in ('flagged_shots', 'mean_interest', 'frames_ok', 'checked')},
                 'script_review': {k: rv.get(k) for k in ('hook', 'pacing', 'payoff', 'unsupported_lines', 'go')}},
                {'post': q('final', 'post')})
        jev_ok = A['post'] >= 0.5; note.append(f"jev post p={A['post']}")
    except Skip: note.append('jev skipped (no key)')
    except Exception as e: note.append('jev error: ' + str(e)[:120])
    if fr and fr.get('frames_ok') is False: note.append(f"frames flagged {fr.get('flagged_shots')}")
    if rv and rv.get('go') is False: note.append('script review no-go')
    post = bool(hard and jev_ok is not False and fr.get('frames_ok', True) is not False and rv.get('go', True) is not False)
    if not hard: note.insert(0, 'shortqa hard gate failed')
    return {'post': post, 'shortqa_pass': hard, 'jev_post': jev_ok, 'why': '; '.join(note)}


if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit(__doc__)
    cmd, args = sys.argv[1], sys.argv[2:]
    F = {'choose': cmd_choose, 'review': cmd_review, 'package': cmd_package, 'narrators': cmd_narrators, 'frames': cmd_frames, 'decide': cmd_decide}
    if cmd not in F: sys.exit(__doc__)
    try:
        res = F[cmd](*args); res['ok'] = True
    except Skip as e:
        print(f'WARNING: jev {cmd} skipped: {e}; plain shortqa decides', file=sys.stderr)
        res = {'ok': False, 'skipped': True, 'error': str(e)}
        if cmd == 'decide':   # decide still applies the shortqa hard gate without Jev
            os.environ.pop('JEV_API_KEY', None); res = cmd_decide(*args) | {'ok': False, 'skipped': True}
    except Exception as e:
        msg = str(e); k = os.environ.get('JEV_API_KEY')
        if k: msg = msg.replace(k, '***')
        res = {'ok': False, 'error': msg[:300]}
    print(json.dumps(res))
