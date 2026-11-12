#!/usr/bin/env python3
"""Write out/<date>/<slug>/: final.mp4, yt_title.txt, yt_desc.txt, x_text.txt, x_thread.json, qa.json (+ contact.jpg, VERIFY.md).
usage: python3 daily/finalize.py <work dir> <final.mp4> <shortqa out dir> <shortqa exit code> <plates.json> <out dir>"""
import json, os, re, shutil, sys
work, final, qd, rc, plates, out = sys.argv[1:7]
os.makedirs(out, exist_ok=True)
for f in ['yt_title.txt', 'yt_desc.txt', 'x_text.txt', 'x_thread.json', 'VERIFY.md']:
    if os.path.exists(os.path.join(work, f)): shutil.copy(os.path.join(work, f), out)
if os.path.exists(final): shutil.copy(final, os.path.join(out, 'final.mp4'))
for f in ['contact.jpg', 'opening.jpg', 'report.md']:
    if os.path.exists(os.path.join(qd, f)): shutil.copy(os.path.join(qd, f), out)
checks = []
if os.path.exists(os.path.join(qd, 'report.md')):
    for l in open(os.path.join(qd, 'report.md')):
        m = re.match(r'- \[( |x)\] (.*?): (.*)$', l.strip())
        if m: checks.append({'check': m.group(2), 'ok': m.group(1) == 'x', 'detail': m.group(3)})
pl = json.load(open(plates)) if os.path.exists(plates) else {}
p = json.load(open(os.path.join(work, 'plan.json')))
qa = {'slug': p['slug'], 'narrator': p['narrator'], 'scheme': p['scheme'], 'shortqa_exit': int(rc),
      'pass': int(rc) == 0 and os.path.exists(final) and not pl.get('replaced'), 'checks': checks,
      'plates_replaced': pl.get('replaced', {}), 'note': 'pass = shortqa gate passed and every plate rendered; Hark still looks at contact.jpg before posting'}
json.dump(qa, open(os.path.join(out, 'qa.json'), 'w'), indent=1)
print(json.dumps({k: qa[k] for k in ('slug', 'pass', 'shortqa_exit', 'plates_replaced')}))
