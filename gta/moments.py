#!/usr/bin/env python3
"""Moment finder: audio loudness spikes + scene changes + Twitch chat spikes.

Approach borrowed and adapted from:
- cclank/jevclip (MIT): ffmpeg/stdlib pipeline, signal -> candidates -> model ranking
- VadlapatiKarthik/autoclipper: chat spike = message count in a rolling window
  over baseline x threshold; comment-timestamp spikes for YouTube
- nirvagold/stream-clipper (MIT): audio + chat analysis for highlight windows

No login, no API keys (Twitch chat uses the public GQL client id).
"""
import json, math, os, re, subprocess, sys, urllib.request

BIN = 0.5          # seconds per audio RMS bin
CHAT_BIN = 10.0    # seconds per chat bin
CLIP_MIN, CLIP_MAX = 20.0, 45.0
AUDIO_SPIKE_DB = 8.0   # dB above rolling median
TWITCH_GQL = 'https://gql.twitch.tv/gql'
TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'
CHAT_HASH = 'b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a'
CHAT_MAX_PAGES = int(os.environ.get('GTA_CHAT_MAX_PAGES', '200'))


def sh(args, timeout=1800):
    return subprocess.run(args, capture_output=True, text=True, timeout=timeout).stdout


def probe_duration(path):
    out = sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def rms_bins(path, duration):
    """Per-BIN RMS in dBFS, decoded to 16 kHz mono f32."""
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', '16000',
                          '-f', 'f32le', '-'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    n, buf = 0, 16000 * BIN
    cur, bins = 0.0, 0.0
    counts, i = [], 0
    while True:
        data = p.stdout.read(4)
        if not data:
            break
        cur += float(__import__('struct').unpack('<f', data)[0]) ** 2
        n += 1
        if n >= buf:
            bins = max(bins, math.sqrt(cur / n) + 1e-12)
            counts.append(20 * math.log10(math.sqrt(cur / n) + 1e-12))
            cur, n = 0.0, 0
            i += 1
    p.stdout.close()
    p.wait(timeout=60)
    if n > 40:
        counts.append(20 * math.log10(math.sqrt(cur / n) + 1e-12))
    return counts


def rolling_median(vals, window):
    out = []
    for i in range(len(vals)):
        lo, hi = max(0, i - window // 2), min(len(vals), i + window // 2 + 1)
        s = sorted(vals[lo:hi])
        out.append(s[len(s) // 2])
    return out


def audio_peaks(path, duration):
    """[(t_seconds, dB over rolling median)] for the loudest moments."""
    counts = rms_bins(path, duration)
    if not counts:
        return []
    med = rolling_median(counts, int(120 / BIN))
    peaks = [(i * BIN, counts[i] - med[i]) for i in range(len(counts))
             if counts[i] - med[i] >= AUDIO_SPIKE_DB]
    # keep local maxima, min 15 s apart
    peaks.sort(key=lambda x: -x[1])
    kept = []
    for t, s in peaks:
        if all(abs(t - k[0]) >= 15 for k in kept):
            kept.append((t, s))
        if len(kept) >= 15:
            break
    kept.sort()
    return kept


def scene_cuts(path):
    """[t_seconds] where ffmpeg detects a scene change (>0.3)."""
    out = sh(['ffmpeg', '-v', 'info', '-i', path, '-vf',
              "select='gt(scene,0.30)',metadata=print:file=-", '-an', '-f', 'null', '-'], timeout=3600)
    return [float(m) for m in re.findall(r'pts_time:([0-9.]+)', out)]


def twitch_chat(video_id):
    """[(t_seconds)] message timestamps of a Twitch VOD chat replay (public GQL)."""
    msgs, cursor, pages = [], '', 0
    while pages < CHAT_MAX_PAGES:
        body = json.dumps({'operationName': 'VideoCommentsByOffsetOrCursor',
                           'variables': {'videoID': str(video_id), 'cursor': cursor} if cursor else
                           {'videoID': str(video_id), 'contentOffsetSeconds': 0},
                           'extensions': {'persistedQuery': {'version': 1, 'sha256Hash': CHAT_HASH}}}).encode()
        req = urllib.request.Request(TWITCH_GQL, data=body, headers={
            'Client-ID': TWITCH_CLIENT_ID, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read().decode())
        except Exception:
            break
        try:
            edges = data['data']['video']['comments']['edges']
        except (TypeError, KeyError):
            break
        if not edges:
            break
        msgs += [e['node'].get('contentOffsetSeconds', 0) for e in edges]
        if not data['data']['video']['comments']['pageInfo'].get('hasNextPage'):
            break
        cursor = edges[-1]['cursor']
        pages += 1
    msgs.sort()
    return msgs


def chat_peaks(msg_ts, duration):
    """[(bin_center, z)] chat spikes: count/CHAT_BIN vs rolling baseline (autoclipper style)."""
    if not msg_ts:
        return []
    nb = int(duration // CHAT_BIN) + 1
    counts = [0] * nb
    for t in msg_ts:
        if 0 <= t < duration:
            counts[int(t // CHAT_BIN)] += 1
    med = rolling_median(counts, 30)
    out = []
    for i, c in enumerate(counts):
        base = max(med[i], 1.0)
        z = (c - med[i]) / base
        if c >= 5 and z >= 2.0:
            out.append((i * CHAT_BIN + CHAT_BIN / 2, z))
    return out


def build_candidates(duration, audio, cuts, chat, top=8):
    """Merge signals into non-overlapping 20-45 s windows, scored."""
    # scene-cut density bins (5 s)
    density = {}
    for t in cuts:
        density[int(t // 5) * 5] = density.get(int(t // 5) * 5, 0) + 1
    centers = [(t, ('audio', s)) for t, s in audio]
    centers += [(t, ('scene', density.get(int(t // 5) * 5, 0))) for t in cuts if density.get(int(t // 5) * 5, 0) >= 2]
    centers += [(t, ('chat', z)) for t, z in chat]
    # collapse centers closer than 12 s
    centers.sort()
    clusters = []
    for t, (kind, s) in centers:
        if clusters and t - clusters[-1]['t'] <= 12:
            clusters[-1]['signals'].append((kind, s))
        else:
            clusters.append({'t': t, 'signals': [(kind, s)]})

    def score(cl):
        s = sum(max(k.get('s', 0), 0) for k, v in cl['signals'] for k in [v] if True)
        kinds = {k for k, _ in cl['signals']}
        return s + 3 * (len(kinds) - 1)   # bonus when several signals agree

    for cl in clusters:
        cl['score'] = score(cl)
    clusters.sort(key=lambda c: -c['score'])
    windows = []
    for cl in clusters:
        t = cl['t']
        start = max(0.0, min(t - 10.0, duration - CLIP_MIN))
        end = min(duration, max(start + CLIP_MIN, t + 25.0))
        if end - start > CLIP_MAX:
            if t - start > CLIP_MAX - 20:
                start = max(0, t - (CLIP_MAX - 20))
            end = min(duration, start + CLIP_MAX)
        if end - start < CLIP_MIN:
            continue
        if any(not (end <= w[0] + 1 or start >= w[1] - 1) for w in windows):
            continue   # keep later windows non-overlapping
        windows.append((start, end, cl['score'], cl['signals']))
        if len(windows) >= top:
            break
    if not windows and duration >= CLIP_MIN * 0.8:
        # very short source (e.g. a clip): one window around the loudest point
        t = audio[0][0] if audio else duration / 2
        start = max(0.0, min(t - duration / 3, duration - min(CLIP_MAX, duration)))
        end = min(duration, start + min(CLIP_MAX, max(CLIP_MIN, duration)))
        windows.append((start, end, 1.0, [('fallback', 0)]))
    windows.sort()
    return windows


def find_moments(analysis_path, video_id=None, kind=None):
    duration = probe_duration(analysis_path)
    if duration <= 0:
        return 0, []
    audio = audio_peaks(analysis_path, duration)
    cuts = scene_cuts(analysis_path)
    chat = []
    chat_n = 0
    if kind == 'twitch_vod' and video_id:
        msgs = twitch_chat(video_id)
        chat_n = len(msgs)
        chat = chat_peaks(msgs, duration)
    windows = build_candidates(duration, audio, cuts, chat)
    info = {'duration': duration, 'audio_peaks': len(audio), 'scene_cuts': len(cuts),
            'chat_messages': chat_n, 'chat_spikes': len(chat)}
    return duration, windows, info


def twitch_vods(channel, n=3):
    """Latest n ARCHIVE VODs of a Twitch channel: [{id, title, lengthSeconds}] (public GQL)."""
    body = json.dumps({'query': 'query { user(login: "%s") { videos(first: %d, type: ARCHIVE) '
                    '{ edges { node { id title lengthSeconds } } } } }' % (channel, n)}).encode()
    req = urllib.request.Request(TWITCH_GQL, data=body, headers={
        'Client-ID': TWITCH_CLIENT_ID, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode())
        return [e['node'] for e in data['data']['user']['videos']['edges'] if e['node'].get('id')]
    except Exception:
        return []
