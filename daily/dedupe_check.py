#!/usr/bin/env python3
"""BLOCKING DEDUPE GUARD (user 2026-10-31 21:37-21:45 IST: NO remakes or re-uploads of any posted case, ever).
usage: python3 daily/dedupe_check.py <slug> "<case name>" [keyword ...] [--sent-only] [--quiet]
Exit 0 = fresh case (never posted).  Exit 1 = REPEAT: prints the matching post(s) (date, title, link).  Exit 2 = usage error.
Sources (all text, lowercased, punctuation stripped, word-boundary substring match):
  analytics/CASE_ALIASES.csv   one row per already-posted case (case_id, aliases a|b|c). A query that hits any alias of a row
                               is a repeat by itself (covers cases posted outside Buffer's 100-post window or by hand).
  analytics/BUFFER_FULL.json   full Buffer text + YT title + X thread (refresh: python3 tools/buffer_full.py)
  POST_LOG.csv                 Buffer rebuild (text cut at 120 chars)
  scary-reels/posted.csv       legacy ledger (rows whose status says sent/posted/verified)
  analytics/videos_2026-10-30.csv  YouTube analytics titles + slugs (all published)
Default: SENT and SCHEDULED Buffer posts count. --sent-only (used by post.py): only already-SENT posts and alias rows count.
When you post a new case, add its row to CASE_ALIASES.csv (post.py appends one automatically)."""
import csv, json, os, re, sys, difflib
R = os.path.dirname(os.path.abspath(__file__))  # daily/: corpus copies in daily/dedupe/
def norm(s): return ' ' + re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', (s or '').lower())).strip() + ' '
STRIP = re.compile(r'\b(remake|v\d+|redo|new|lowpoly|noir|papercut|teaser|lf\d+|short|shorts)\b')
def hit(term, text):
    t = norm(term)
    return len(t.strip()) >= 4 and t in text

def corpus(sent_only):
    out = []  # (status, when, title, link, text)
    p = f'{R}/dedupe/BUFFER_FULL.json'
    if os.path.exists(p):
        for n in json.load(open(p)):
            st = n.get('status')
            if st not in ('sent', 'scheduled') or (sent_only and st != 'sent'): continue
            md = n.get('metadata') or {}
            th = ' '.join(x.get('text', '') for x in (md.get('thread') or []))
            out.append((st, n.get('sentAt') or n.get('dueAt'), md.get('title') or (n.get('text') or '')[:70],
                        n.get('externalLink') or '', ' '.join([n.get('text') or '', md.get('title') or '', th])))
    p = f'{R}/dedupe/POST_LOG.csv'
    if os.path.exists(p):
        for r in csv.DictReader(open(p)):
            if r['status'] not in ('sent', 'scheduled') or (sent_only and r['status'] != 'sent'): continue
            out.append((r['status'], r['when'], r['text'][:70], r['link'], r['text']))
    p = f'{R}/dedupe/posted.csv'
    if os.path.exists(p):
        for r in csv.DictReader(open(p)):
            s = (r.get('status') or '').lower()
            if not re.match(r'(sent|posted|verified)', s): continue
            out.append(('sent', r.get('posted_at_ist'), r.get('caption_hook'), r.get('instagram_link') or '',
                        ' '.join([r.get('filename') or '', r.get('caption_hook') or ''])))
    p = f'{R}/dedupe/videos.csv'
    if os.path.exists(p):
        for r in csv.DictReader(open(p)):
            out.append(('sent', r['posted_ist'], r['title'], 'https://youtu.be/' + r['vid'],
                        ' '.join([r['slug'].replace('-', ' '), r['title'], r.get('hook') or ''])))
    return out

def check(slug, name, kws, sent_only=False):
    base = STRIP.sub(' ', (slug or '').replace('-', ' ').replace('_', ' '))
    q = norm(' '.join([base, name or ''] + list(kws)))
    terms = {t for t in [base, name] + list(kws) if t and len(norm(t).strip()) >= 4}
    alias_hits = []
    p = f'{R}/dedupe/CASE_ALIASES.csv'
    if os.path.exists(p):
        for r in csv.DictReader(open(p)):
            if sent_only and (r.get('note') or '').startswith('scheduled'): continue
            al = [a for a in r['aliases'].split('|') if a.strip()]
            if any(hit(a, q) for a in al) or norm(r['case_id']) == norm(base):
                alias_hits.append(r); terms |= set(al)
    matches = []
    for st, when, title, link, text in corpus(sent_only):
        nt = norm(text)
        found = [t for t in terms if hit(t, nt)]
        if not found and name and difflib.SequenceMatcher(None, norm(name), norm(title)).ratio() >= 0.85: found = ['~title']
        if found: matches.append((st, str(when), (title or '')[:80], link, found[:3]))
    seen, uniq = set(), []
    for m in sorted(matches, key=lambda m: m[1]):
        k = (m[1][:16], m[3] or m[2])
        if k not in seen: seen.add(k); uniq.append(m)
    return alias_hits, uniq

if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    if not a: print(__doc__); sys.exit(2)
    so = '--sent-only' in sys.argv
    al, m = check(a[0], a[1] if len(a) > 1 else '', a[2:], so)
    if not al and not m: print(f'DEDUPE PASS: {a[0]} is a fresh case (no prior post)'); sys.exit(0)
    print(f'DEDUPE BLOCK: {a[0]} repeats an already-posted case (user rule 2026-10-31: no remakes / re-uploads ever)')
    for r in al: print(f'  known posted case: {r["case_id"]} first posted {r["first_posted_ist"] or "?"} {r["note"]}')
    for st, when, title, link, f in m: print(f'  [{st}] {when[:22]} | {title} | {link} | matched {f}')
    sys.exit(1)
