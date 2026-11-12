#!/usr/bin/env python3
"""Write reports/<date>.json for Hark (the director) to read next day.
usage: python3 daily/report.py <date> <out/date dir> <plan dir> <run id> '<toJson(needs)>'"""
import glob, json, os, sys
D, base, plan, rid, needs = sys.argv[1:6]
try: N = json.loads(needs)
except Exception: N = {}
def J(f):
    try: return json.load(open(f))
    except Exception: return {}
S = []
slugs = sorted(set([os.path.basename(p) for p in glob.glob(plan + '/*') if os.path.isdir(p)] + [os.path.basename(p) for p in glob.glob(base + '/*') if os.path.isdir(p)]))
for s in slugs:
    q = J(f'{base}/{s}/qa.json'); pl = J(f'{plan}/{s}/plan.json'); rv = q.get('script_review') or J(f'{plan}/{s}/review.json'); fr = q.get('frame_checks') or {}
    S.append({'slug': s, 'case_name': pl.get('case_name'), 'narrator': pl.get('narrator'), 'scheme': pl.get('scheme'),
              'title': (open(f'{base}/{s}/yt_title.txt').read().strip() if os.path.exists(f'{base}/{s}/yt_title.txt') else None),
              'final': os.path.exists(f'{base}/{s}/final.mp4'), 'shortqa_pass': q.get('pass'), 'post': q.get('post'),
              'shortqa_failed': [c['check'] + ': ' + c['detail'] for c in q.get('checks', []) if not c.get('ok')],
              'plates_replaced': q.get('plates_replaced'),
              'jev_script': {k: rv.get(k) for k in ('hook', 'pacing', 'payoff', 'score', 'go', 'unsupported_lines', 'uncertain_lines', 'fixes')} if rv else None,
              'jev_frames': {k: fr.get(k) for k in ('checked', 'errors', 'flagged_shots', 'mean_interest', 'mean_exposure', 'frames_ok')} | {'flags': {x['shot']: x['flags'] for x in fr.get('shots', []) if x.get('flags')}} if fr.get('shots') else (fr or None),
              'decision': (q.get('decision') or {}).get('why')})
R = {'date': D, 'run_id': rid, 'run_url': f"https://github.com/{os.environ.get('GITHUB_REPOSITORY', '')}/actions/runs/{rid}",
     'model': open(f'{plan}/.model').read().strip() if os.path.exists(f'{plan}/.model') else None,
     'jobs': {k: v.get('result') for k, v in N.items()}, 'failures': [k for k, v in N.items() if v.get('result') not in ('success', 'skipped')],
     'shorts': S}
os.makedirs('reports', exist_ok=True); json.dump(R, open(f'reports/{D}.json', 'w'), indent=1)
print(json.dumps(R)[:400])
