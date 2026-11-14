"""YouTube (+X) scheduler, v3 (2026-10-11). Instagram is DEAD.  Same call as before, plus safety flags:
usage: python3 post.py <yt|x|both|xtext> <video_url> <dueAt UTC ISO> <title_file_or_text> <desc_file> [x_text] --uploaded <upload time ISO> [--others iso,iso,...] [--force]
  --uploaded  when the litterbox upload happened (REQUIRED): dueAt must be <= 60 h after it (rulebook section 8)
  --others    dueAt of the already scheduled posts: slots must be >= 3 h apart
  --force     post even if this url was already posted to the same channel (normally blocked: never two live posts of one video)
Before anything is sent: SLOT GUARD (dueAt must be 07:45Z = 13:15 IST or 23:30Z = 05:00 IST next IST day), stop rule / Buffer-key expiry (guard.py check), 60 h rule, 3 h gap, title <= 100 chars, X text <= 280.
After each attempt it reports to guard.py: auth_error / disconnected / upload_failed (the stop rule trips at the thresholds), ok on success.
Prints RESULT json. Retries 'could not be read' 3x. Exit: 0 all requested posts scheduled | 1 a post failed | 2 blocked before sending.
xtext = text-only X post (pass - for video_url/title/desc; --uploaded optional). XTHREAD=<json file> adds 2-3 X replies under the root post.
2026-10-30 (Gemini analytics check): X ALWAYS gets the MP4 as a native video asset (same url as YouTube; verified on Buffer: 44/45 X posts
carry a video asset). x_text and XTHREAD replies may now be FILE PATHS (read like title/desc; before this a path was posted as literal text,
e.g. the 11-01 15:00 lf03 teaser). X text/replies with a YouTube link (youtu.be / youtube.com) are BLOCKED (a link sends low-retention
clicks into the Short's first test batch) unless --allow-yt-link. --dry-run prints the exact Buffer jobs and exits before any API call.
Needs guard.py: found next to this file, in ../scary-reels/pipeline, or in $LM_PIPELINE_DIR."""
import json, subprocess, sys, time, os, hashlib, datetime as dt
HERE = os.path.dirname(os.path.abspath(__file__))
for d in (os.environ.get('LM_PIPELINE_DIR'), HERE, os.path.join(HERE, '..', 'scary-reels', 'pipeline'), os.path.join(HERE, '..', 'pipeline')):
    if d and os.path.exists(os.path.join(d, 'guard.py')): sys.path.insert(0, d); break
try: import guard, config
except Exception as ex: print('RESULT', json.dumps({'blocked': f'guard.py not found ({ex}); set LM_PIPELINE_DIR'})); sys.exit(2)

YT = '6aca4b3e6a5c39ccb6720713'; X = '6aca4d046a5c39ccb67215de'
args = sys.argv[1:]
def flag(name, default=None):
    if name in args: i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
uploaded = flag('--uploaded'); others = [o for o in (flag('--others', '') or '').split(',') if o]
force = '--force' in args
if force: args.remove('--force')
dry = '--dry-run' in args
if dry: args.remove('--dry-run')
allow_link = '--allow-yt-link' in args
if allow_link: args.remove('--allow-yt-link')
if len(args) < 5 or args[0] not in ('yt', 'x', 'both', 'xtext'): print(__doc__); sys.exit(2)
mode, url, due, title, desc = args[:5]; xtext = args[5] if len(args) > 5 else None
def rd(s):
    # 2026-10-28 fix: a missing .txt/.json path used to be posted as literal text (Woolpit desc showed the file path)
    if os.path.exists(s): return open(s).read().strip()
    if s.endswith(('.txt', '.json', '.md')) or '/' in s and ' ' not in s:
        sys.exit(f'ABORT: file not found (would post the path as text): {s}')
    return s
title, desc = rd(title), rd(desc)
def rdx(s):  # X text / replies: read a file path, never post a bare path; plain text (incl. bare URLs) passes
    if os.path.exists(s): return open(s).read().strip()
    if s.strip().startswith('/') and ' ' not in s.strip(): sys.exit(f'ABORT: X text file not found (would post the path as text): {s}')
    return s
if xtext: xtext = rdx(xtext)  # 2026-10-30: a path used to be posted literally on X (lf03 teaser 11-01 15:00)
if mode in ('yt', 'both') and '--force' not in sys.argv:
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import channel_titles as _ct
        _live = {_ct.norm(v): k for k, v in _ct.titles().items()}
        if _ct.norm(title) in _live: sys.exit(f'ABORT: this title is already live on YouTube as {_live[_ct.norm(title)]} (duplicate guard 2026-10-28)')
    except SystemExit: raise
    except Exception as e: print('WARN duplicate guard could not check channel:', e)
if len(desc) < 80: sys.exit('ABORT: description under 80 chars, looks broken: ' + desc[:80])

def block(why): print('RESULT', json.dumps({'blocked': why})); sys.exit(2)
# DEDUPE GUARD (user 2026-10-31 21:45 IST, standing rule: NO remakes or re-uploads of any posted case, ever).
# Every Short needs CASE_SLUG=<factory slug> (optional CASE_ALIASES="a|b" extra names). Refuses if the case matches a SENT post
# or a row of analytics/CASE_ALIASES.csv. ALLOW_REPEAT=1 overrides (nothing sets it; only the user may ask for it).
_R = os.path.abspath(os.path.join(HERE, '..', '..'))
if mode in ('yt', 'both', 'x'):
    _slug = os.environ.get('CASE_SLUG', '').strip()
    if not _slug:  # derive from a case path in the args (…/cases/<slug>/yt_title.txt or XTHREAD)
        import re as _re0
        for _a in sys.argv[1:] + [os.environ.get('XTHREAD', '')]:
            _mm = _re0.search(r'(?:cases|factory|longform)/([A-Za-z0-9_.-]+)/', os.path.abspath(_a) if os.path.exists(_a) else _a)
            if _mm: _slug = _mm.group(1); break
    if not _slug: block('CASE_SLUG=<factory slug> is required (dedupe guard, user rule 2026-10-31)')
    sys.path.insert(0, os.path.join(_R, 'tools')); import dedupe_check as _dd
    _kw = [k for k in os.environ.get('CASE_ALIASES', '').split('|') if k.strip()]
    _al, _m = _dd.check(_slug, title.replace('#shorts', '').strip(), _kw, sent_only=True)
    if (_al or _m) and os.environ.get('ALLOW_REPEAT') != '1':
        block('DEDUPE: %s repeats an already-posted case: %s' % (_slug, '; '.join([r['case_id'] + ' ' + (r['first_posted_ist'] or '?') for r in _al] + ['%s %s %s' % (x[1][:16], x[2][:50], x[3]) for x in _m[:3]])))
# SLOT GUARD (user 2026-11-03 21:46): posts go out ONLY at 13:15 IST (07:45Z) and 05:00 IST (23:30Z of the previous UTC day). 21:30 IST (16:00Z) and 15:00 IST are retired.
ALLOWED_SLOTS_UTC = {(7, 45): '13:15 IST', (16, 0): '21:30 IST'}  # user 2026-11-06 22:56: 05:00 back to 21:30
try:
    _d = dt.datetime.fromisoformat(due.replace('Z', '+00:00')).astimezone(dt.timezone.utc)
except Exception: block(f'dueAt is not an ISO time: {due}')
if (_d.hour, _d.minute) not in ALLOWED_SLOTS_UTC and not os.environ.get('USER_APPROVED_NOW'):  # USER_APPROVED_NOW=<msg id>: one-off post the user explicitly ordered now (2026-10-31 23:10)
    block(f'dueAt {due} is not an allowed slot: only 13:15 IST (07:45Z) or 21:30 IST (16:00Z) (user rule 2026-11-06)')
if not dry and guard.check() != 0: block('stop rule / key expiry: see guard.py status')

# Hark 2026-10-20 22:58 (user): Gemini-coded renders must never be posted while daily-special/STOP_GEMINI_PATH exists.
_stop=os.path.join(HERE,'..','..','daily-special','STOP_GEMINI_PATH')
if os.path.exists(_stop) and any('daily-special' in os.path.abspath(a) or 'dailyspecial' in a for a in sys.argv[1:]):
    block('Gemini path paused by user (daily-special/STOP_GEMINI_PATH): never post Gemini-coded renders')
if not uploaded and mode == 'xtext': uploaded = dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')  # text post: no video upload
if not uploaded: block('--uploaded <ISO time of the litterbox upload> is required (60 h rule)')
# Hark 2026-10-21: the 60 h rule exists for 72 h litterbox links. Drive anyone-with-link URLs don't expire, so BANK
# Shorts hosted on Drive may be scheduled days ahead (usage-safety dump). Gap rule still applies.
_upl_check = due if 'drive.usercontent.google.com' in url else uploaded
if guard.can_schedule(due, _upl_check, others) != 0: block('schedule rule: dueAt more than 60 h after the upload, or less than 3 h from another slot')
if len(title) > 100 and mode in ('yt', 'both'): block(f'YouTube title is {len(title)} chars (max 100)')
if xtext and len(xtext) > 280: block(f'X text is {len(xtext)} chars (max 280)')
if mode in ('yt', 'both') and '#shorts' not in title.lower(): print('warn: title has no #shorts')
if mode == 'both' and not xtext: print('warn: mode both but no x_text -> X skipped')

def gql(q, v):
    r = subprocess.run(['curl', '-s', '--max-time', '120', 'https://api.buffer.com', '-H', 'Content-Type: application/json', '-d', json.dumps({'query': q, 'variables': v})], capture_output=True, text=True)
    try: return json.loads(r.stdout)
    except Exception: return {'raw': r.stdout[:300]}
def classify(r):
    s = json.dumps(r).lower()
    if 'could not be read' in s: return 'retry'
    if any(k in s for k in ('unauthor', 'invalid token', 'authentication', 'api key', 'forbidden', 'expired')): return 'auth_error'
    if 'disconnect' in s or 'reconnect' in s: return 'disconnected'
    if 'raw' in r and not str(r['raw']).strip().startswith('{'): return 'ambiguous'
    return 'other'

# Hark 2026-10-13: AI_TAG=false only when the Short has NO realistic AI imagery (real photos + non-realistic animation only). Default true.
AI_TAG = 'false' if os.environ.get('AI_TAG','true').lower() in ('0','false','no') else 'true'
QYT = ('mutation($text:String!,$url:String!,$title:String!,$due:DateTime){ createPost(input:{ text:$text, channelId:"%s", schedulingType: automatic, mode: customScheduled, dueAt:$due, '
 'metadata:{ youtube:{ title:$title, categoryId:"27", madeForKids:false, isAiGenerated:%s, privacy:public, notifySubscribers:true, license:youtube, embeddable:true } }, '
 'assets:[{ video:{ url:$url } }] }) { ... on PostActionSuccess { post { id status dueAt } } ... on MutationError { message } } }') % (YT, AI_TAG)
QX = ('mutation($text:String!,$assets:[AssetInput!]!,$meta:PostInputMetaData,$due:DateTime){ createPost(input:{ text:$text, channelId:"%s", schedulingType: automatic, mode: customScheduled, dueAt:$due, '
 'assets:$assets, metadata:$meta }) { ... on PostActionSuccess { post { id status dueAt } } ... on MutationError { message } } }') % X
# Hark addition 2026-10-11 (user wants X text posts + X reply threads kept): XTHREAD=<json list of 2-3 reply strings>
replies = [rdx(r) for r in json.load(open(os.environ['XTHREAD']))] if os.environ.get('XTHREAD') else []
import re as _re
_ytl = _re.compile(r'(youtu\.be/|youtube\.com/)', _re.I)
for _t in ([xtext] if xtext else []) + replies:
    if _t and _t.strip().startswith('/') and ' ' not in _t.strip(): block(f'X text looks like an unread file path: {_t[:80]}')
    if _t and _ytl.search(_t) and not allow_link: block('X text/reply has a YouTube link: X gets the native MP4 only (Gemini analytics 2026-10-30); pass --allow-yt-link to override')
def xvars(text, with_video):
    assets = [{'video': {'url': url}}] if with_video else []
    meta = {'twitter': {'thread': [{'text': text, 'assets': assets}] + [{'text': r, 'assets': []} for r in replies]}} if replies else None
    return {'text': text, 'assets': assets, 'meta': meta, 'due': due}
if replies and any(len(r) > 280 for r in replies): print('RESULT', json.dumps({'blocked': 'an X thread reply is over 280 chars'})); sys.exit(2)

if mode in ('x', 'both') and xtext and not url.startswith('http'): block('X needs the MP4 url as a native video asset')
if dry:
    _j = []
    if mode in ('yt', 'both'): _j.append({'channel': 'youtube', 'title': title, 'video_asset': url, 'due': due})
    if mode in ('x', 'both') and xtext: _j.append({'channel': 'x', 'vars': xvars(xtext, True)})
    if mode == 'xtext' and xtext: _j.append({'channel': 'x', 'vars': xvars(xtext, False)})
    print('DRY-RUN (nothing sent)', json.dumps(_j, indent=1)); sys.exit(0)
LEDGER = os.path.join(config.STATE_DIR, 'ledger.json')
ledger = json.load(open(LEDGER)) if os.path.exists(LEDGER) else {}
res, jobs = {}, []
if mode in ('yt', 'both'): jobs.append(('yt', QYT, {'text': desc, 'url': url, 'title': title, 'due': due}))
if mode in ('x', 'both') and xtext: jobs.append(('x', QX, xvars(xtext, True)))
if mode == 'xtext' and xtext: jobs.append(('x', QX, xvars(xtext, False)))
failed = False
for ch, q, v in jobs:
    key = hashlib.sha1((xtext if mode == 'xtext' else url).encode()).hexdigest()[:16] + ':' + ch
    if key in ledger and not force: res[ch + '_blocked'] = f'this url was already scheduled to {ch} (post {ledger[key]["id"]}); use --force only after deleting that post'; continue
    kind = 'other'
    for k in range(4):
        r = gql(q, v); p = ((r.get('data') or {}).get('createPost') or {}).get('post')
        if p: res[ch] = p; break
        res[ch + '_err'] = json.dumps(r)[:300]; kind = classify(r)
        if kind != 'retry': break
        time.sleep(float(os.environ.get('LM_RETRY_SLEEP', 35)))
    if ch in res:
        ledger[key] = {'id': res[ch].get('id'), 'at': dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}; json.dump(ledger, open(LEDGER, 'w')); guard.ok()
    else:
        failed = True
        if kind == 'ambiguous': res[ch + '_note'] = 'no readable answer: the post MAY exist in Buffer. Check Buffer before retrying (duplicates are not allowed).'
        guard.report(kind if kind in ('auth_error', 'disconnected') else 'upload_failed')
if not failed and mode in ('yt', 'both', 'x') and os.environ.get('CASE_SLUG'):
    try:  # register the case so it can never be made or posted again
        _ap = os.path.join(_R, 'analytics', 'CASE_ALIASES.csv'); _s = os.environ['CASE_SLUG']
        if _s not in open(_ap).read():
            _al = '|'.join([_s.replace('-', ' ')] + [k for k in os.environ.get('CASE_ALIASES', '').split('|') if k.strip()])
            _w = dt.datetime.fromisoformat(due.replace('Z', '+00:00')).astimezone(dt.timezone(dt.timedelta(hours=5, minutes=30))).strftime('%Y-%m-%d %H:%M')
            open(_ap, 'a').write(f'{_s},{_al},{_w},scheduled by post.py\n')
    except Exception as e: print('WARN could not register case in CASE_ALIASES.csv:', e)
print('RESULT', json.dumps(res))
sys.exit(1 if failed else 0)
