#!/usr/bin/env python3
"""Jev judgment layer for the daily Shorts: TypeSafe System One (model jev-latest) called DIRECTLY over HTTP
(POST https://api.typesafe.ai/v1/systemone; multipart with the `request` JSON first and one file part per image,
header TypeSafe-Danger-Zone-Images: true). Key: env TYPESAFE_API_KEY (workflow maps it from repo secret JEV; never
printed). Missing key -> {"ok": false, "skipped": true} + a warning, exit 0: plain shortqa decides.
Jev makes judgments, this code makes decisions: noul >= 0.7 = yes, <= 0.3 = no, in between = uncertain.
Any API error -> {"ok": false, "error": ...}, exit 0. The run never fails because of Jev. shortqa stays the hard gate.
Questions are atomic (choice / score / noul / box) and live in tools/jev_questions.json; this file combines them.

  choose  <candidates.json> [n=2]   topic pick from verified candidates (choice; ranked by probability)
  review  <work dir>                hook score + one noul per script line against the fact pack + pacing + payoff -> go/no-go
  package <work dir>                title among 3-5 candidates (titles.json) + frame-0 hook text + palette + sound bed (choice)
  narrators <work dir A> <work dir B>  which Short gets narrator_m (the other gets narrator_f; alternation kept)
  frames  <final.mp4> <cuts,comma> <out dir>   per shot: noul caption present + box (judged in code vs x 162-918, y <= 1560), noul readable, score exposure, noul subject clear, score interest
  decide  <shortqa report.md> [frames.json] [review.json]   post/no-post decided in code: shortqa hard gate AND frames AND script go
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
Q = json.load(open(os.path.join(HERE, 'jev_questions.json')))
MODEL = os.environ.get('JEV_MODEL', 'jev-latest')
SAFE = dict(left=162 / 1080, right=918 / 1080, bottom=1560 / 1920)
SCHEMES = ['sage', 'dusty-teal', 'slate', 'clay', 'lavender', 'sand', 'dusk-rose', 'fog-blue', 'stone']


class Skip(Exception):
    pass


URL = os.environ.get('TYPESAFE_URL', 'https://api.typesafe.ai/v1/systemone')
YES, NO = 0.7, 0.3
def verdict(p):
    return None if p is None else ('yes' if p >= YES else 'no' if p <= NO else 'uncertain')


def _key():
    k = os.environ.get('TYPESAFE_API_KEY', '')
    if not k: raise Skip('TYPESAFE_API_KEY not set (repo secret JEV)')
    return k


def client():   # kept for callers that only want the key check
    return _key()


def q(group, name, **fmt):
    d = dict(Q[group][name]); d['instructions'] = d['instructions'].format(**fmt) if fmt else d['instructions']
    return d


def ask(state, questions, images=None):
    """state/questions as plain JSON; images = {reference: jpg/png path} (reference must appear in state).
    Returns {name: simplified answer}: noul -> p, choice -> {choice, confidence, p}, score -> {score, max, confidence},
    box -> {top, bottom, left, right, confidence} (fractions of height/width)."""
    import urllib.request, uuid
    key = _key()
    body = {'model': MODEL, 'state': state, 'questions': questions}
    hdr = {'Authorization': 'Bearer ' + key}
    if images or any(v.get('type') == 'box' for v in questions.values()):
        hdr['TypeSafe-Danger-Zone-Images'] = 'true'
    if images:
        body['assets'] = {ref: {'type': 'image', 'part': f'img{i}'} for i, ref in enumerate(images)}
        bd = 'ts' + uuid.uuid4().hex; parts = []
        parts.append(f'--{bd}\r\nContent-Disposition: form-data; name="request"\r\nContent-Type: application/json\r\n\r\n'.encode() + json.dumps(body).encode() + b'\r\n')
        for i, (ref, path) in enumerate(images.items()):
            ct = 'image/png' if path.lower().endswith('.png') else 'image/jpeg'
            parts.append(f'--{bd}\r\nContent-Disposition: form-data; name="img{i}"; filename="{os.path.basename(path)}"\r\nContent-Type: {ct}\r\n\r\n'.encode() + open(path, 'rb').read() + b'\r\n')
        data = b''.join(parts) + f'--{bd}--\r\n'.encode(); hdr['Content-Type'] = f'multipart/form-data; boundary={bd}'
    else:
        data = json.dumps(body).encode(); hdr['Content-Type'] = 'application/json'
    req = urllib.request.Request(URL, data=data, headers=hdr, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=180) as r: resp = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'HTTP {e.code}: {e.read().decode()[:300]}')
    out = {}
    for k, a in (resp.get('answers') or {}).items():
        t = a.get('type')
        if t == 'noul': out[k] = round(float(a['noul']), 3)
        elif t == 'choice': out[k] = {'choice': a['choice'], 'confidence': round(a.get('confidence', 0), 3), 'p': {x: round(v, 3) for x, v in (a.get('probabilities') or {}).items()}}
        elif t == 'score': out[k] = {'score': round(a['score'], 2), 'confidence': round(a.get('confidence', 0), 3), 'max': len(a.get('legend') or a.get('probabilities') or [0, 0, 0, 0, 0]) - 1}
        elif t == 'box': bx = a.get('box') or {}; out[k] = {s_: bx.get(s_) for s_ in ('top', 'bottom', 'left', 'right')} | {'confidence': a.get('confidence')}
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
    weak = [i for i in range(len(lines)) if verdict(claims.get(f'line_{i}')) == 'no']
    unsure = [i for i in range(len(lines)) if verdict(claims.get(f'line_{i}')) == 'uncertain']
    h = A['hook']['score'] / A['hook']['max'] * 10; pc = A['pacing']['score'] / A['pacing']['max'] * 10; po = A['payoff']['score'] / A['payoff']['max'] * 10
    fixes = []
    if h < 6: fixes.append(f'hook too weak ({h:.1f}/10): line 0 needs an exact number/name + impossible evidence + setting')
    if pc < 5: fixes.append(f'pacing weak ({pc:.1f}/10): a new concrete reveal every 10-12 s, cut filler')
    if po < 5: fixes.append(f'payoff weak ({po:.1f}/10): end on the strongest unexplained detail + "Nobody explained it."')
    for i in weak: fixes.append(f'line {i} has a claim the fact pack does not support (p={claims[f"line_{i}"]}): fix it or add the source to VERIFY.md')
    for i in unsure: fixes.append(f'line {i}: Jev is unsure the fact pack supports it (p={claims[f"line_{i}"]}); tighten the wording or cite it in VERIFY.md')
    go = h >= 6 and pc >= 5 and po >= 5 and not weak
    return {'hook': round(h, 1), 'pacing': round(pc, 1), 'payoff': round(po, 1), 'score': round((h + pc + po) / 3, 1),
            'claims': claims, 'unsupported_lines': weak, 'uncertain_lines': unsure, 'go': go, 'fixes': fixes}


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
    """one frame per shot (60 % in), scaled to 882x1568; Jev judges, code decides per the safe-area rule."""
    import uuid
    os.makedirs(out, exist_ok=True); _key()
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout.strip() or 0)
    cs = [0.0] + [float(c) for c in cuts.split(',') if c] + [dur]
    FQ = {k: q('frame', k) for k in ('caption_present', 'caption_box', 'readable', 'exposure', 'subject_clear', 'interest')}
    shots = []
    for k in range(len(cs) - 1):
        t = cs[k] + (cs[k + 1] - cs[k]) * 0.6; f = os.path.join(out, f'shot_{k + 1:02d}.jpg')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.2f}', '-i', video, '-frames:v', '1', '-vf', 'scale=-2:1568', '-q:v', '3', f], check=True)
        ref = 'frame-' + uuid.uuid4().hex
        try: A = ask({'frame': ref, 'note': f'Shot {k + 1} at {t:.1f} s of a 1080x1920 vertical Short.'}, FQ, images={ref: f})
        except Skip: raise
        except Exception as e: shots.append({'shot': k + 1, 't': round(t, 2), 'error': str(e)[:160]}); continue
        cap = verdict(A.get('caption_present')); b = A.get('caption_box') or {}
        # box always returns a box: judge it only when a caption is present (noul), positions decided here
        inside = None
        if cap in ('yes', 'uncertain') and b.get('left') is not None:
            inside = b['left'] >= SAFE['left'] - 0.01 and b['right'] <= SAFE['right'] + 0.01 and b['bottom'] <= SAFE['bottom'] + 0.005
        ex = A.get('exposure', {}); it = A.get('interest', {})
        exp10 = round(ex.get('score', 0) / max(ex.get('max', 4), 1) * 10, 1); int10 = round(it.get('score', 0) / max(it.get('max', 4), 1) * 10, 1)
        flags = []
        if cap == 'yes' and inside is False: flags.append('caption outside safe area')
        if cap == 'yes' and verdict(A.get('readable')) == 'no': flags.append('text not readable')
        if exp10 < 3.75: flags.append('badly exposed')
        if verdict(A.get('subject_clear')) == 'no': flags.append('subject unclear')
        shots.append({'shot': k + 1, 't': round(t, 2), 'caption_present': A.get('caption_present'), 'caption_box': b, 'inside_safe_area': inside,
                      'readable': A.get('readable'), 'exposure': exp10, 'subject_clear': A.get('subject_clear'), 'interest': int10, 'flags': flags})
    ok = [s for s in shots if 'error' not in s]
    bad = [s['shot'] for s in ok if s['flags']]
    res = {'shots': shots, 'checked': len(ok), 'errors': len(shots) - len(ok), 'flagged_shots': bad,
           'mean_interest': round(sum(s['interest'] for s in ok) / max(len(ok), 1), 1),
           'mean_exposure': round(sum(s['exposure'] for s in ok) / max(len(ok), 1), 1), 'frames_ok': len(ok) > 0 and len(bad) <= 2}
    json.dump(res, open(os.path.join(out, 'jev_frames.json'), 'w'), indent=1)
    return res


def cmd_decide(report, frames=None, review=None):
    """decision in code: post = shortqa hard gate AND frame checks ok (<= 2 flagged shots) AND script go.
    Missing Jev results (no key / error) never block: only shortqa decides then."""
    rep = read(report) or 'NO QA REPORT (render failed)'
    hard = '- [ ]' not in rep and 'NO QA REPORT' not in rep and '- [x]' in rep
    fr = json.load(open(frames)) if frames and os.path.exists(frames) else {}
    rv = json.load(open(review)) if review and os.path.exists(review) else {}
    why = [] if hard else ['shortqa hard gate failed']
    fok = fr.get('frames_ok') if fr.get('ok', 'checked' in fr) and 'frames_ok' in fr else None
    go = rv.get('go') if rv.get('ok') else None
    if fok is False: why.append(f"Jev frame checks flagged shots {fr.get('flagged_shots')}")
    if go is False: why.append('Jev script review no-go: ' + '; '.join(rv.get('fixes', []))[:200])
    if fok is None: why.append('frame checks unavailable')
    if go is None: why.append('script review unavailable')
    return {'post': bool(hard and fok is not False and go is not False), 'shortqa_pass': hard, 'frames_ok': fok, 'script_go': go, 'why': '; '.join(why) or 'all gates passed'}


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
    except Exception as e:
        msg = str(e); k = os.environ.get('TYPESAFE_API_KEY')
        if k: msg = msg.replace(k, '***')
        res = {'ok': False, 'error': msg[:300]}
    print(json.dumps(res))
