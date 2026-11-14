#!/usr/bin/env python3
"""Self-heal a Short that failed the shortqa hard gate (Hark task 2026-11-14: "make daily-shorts heal itself").
usage: python3 daily/heal.py <slug> <workdir> <sqa_dir> [--cuts a,b,...] [--jev] [--max-rounds 3] [--rerender]

<workdir> is the run scratch root (same layout the daily `final` job and daily/heal_artifact.sh use):
  <workdir>/final.mp4                      the rendered Short (healed IN PLACE; the pre-round cut is kept as <sqa_dir>/heal/round<k>.mp4)
  <workdir>/daily/work/<slug>/plan.json    plan artifact   (fallback: <workdir>/plan.json)
  <workdir>/case/<slug>/cues.json          tts artifact    (fallback: <workdir>/cues.json)
  <workdir>/case/<slug>/final_audio.wav    mux audio       (fallback: <workdir>/final_audio.wav)
  <workdir>/rm/public/real3d/<slug>.plates.json  plate render info (fallback: <workdir>/<slug>.plates.json)
<sqa_dir> holds shortqa's report.md/report.json (+ jev_frames.json). heal.py writes:
  <sqa_dir>/heal/round<k>.mp4 + round<k>/report.*   (shortqa re-run after each round; SAME thresholds, gate never loosened)
  <sqa_dir>/heal.json  {rounds: [{round, changes, before, after}], pass, rounds_used}

Fix order (cheapest first), re-running shortqa after each round, at most 3 rounds:
  a. dark ranges (YAVG < 45): lift ONLY those time ranges (gamma+brightness, ~0.2 s ramps, no pop, no washed look),
     target YAVG >= 55 on every frame in the range; verified by re-measuring, re-graded up to 2x per round.
  b. frozen stretches (> 1.5 s): with --rerender and Blender available the missing plates (plates.json) are re-rendered
     once from their scene scripts and the comp is re-rendered; otherwise the frozen stretch is covered by a slow
     centred push-in on the still (Ken Burns, <= 5 % zoom, no shake).
  c. "text not readable" / safe-area Jev flags: a darker caption backing is drawn behind the caption band for the
     flagged shots (caption stays inside x 162-918 / y <= 1560).
  d. audio: re-normalised to -14 LUFS / true peak <= -1 dBFS only if the gate failed it.
shortqa stays the hard gate: no threshold here is changed, the video must pass the standard run."""
import json, math, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FPS, TARGET_Y = 30, 56.0


def sh(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def probe_dur(video):
    r = sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video])
    return float(r.stdout.strip() or 0)


def yavg_frames(video):
    """per-frame YAVG list (same measurement shortqa uses)"""
    y = sh(['ffmpeg', '-i', video, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-an', '-f', 'null', '-']).stderr
    return [float(x) for x in re.findall(r'YAVG=([\d.]+)', y)]


def find(*paths):
    for p in paths:
        if p and os.path.exists(p):
            return p
    return None


def load_report(sqa_dir, fallback_md=True):
    p = os.path.join(sqa_dir, 'report.json')
    if os.path.exists(p):
        return json.load(open(p))
    if not fallback_md:
        return None
    # parse report.md the same way finalize.py does (older runs have no report.json yet)
    md = open(os.path.join(sqa_dir, 'report.md')).read() if os.path.exists(os.path.join(sqa_dir, 'report.md')) else ''
    if not md:
        return None
    rep = {'checks': [], 'failed': []}
    for l in md.splitlines():
        m = re.match(r'- \[( |x)\] (.*?): (.*)$', l.strip())
        if m:
            ok = m.group(1) == 'x'
            rep['checks'].append({'name': m.group(2), 'ok': ok, 'detail': m.group(3)})
            if not ok:
                rep['failed'].append(m.group(2))
                if 'dark stretch' in m.group(2):
                    rep['dark_ranges'] = [{'start': float(a), 'end': float(b)} for a, b in re.findall(r'([\d.]+)-([\d.]+)s', m.group(3))]
                if 'frozen' in m.group(2):
                    rep['frozen_ranges'] = [{'start': float(x), 'end': None, 'duration': None} for x in re.findall(r'([\d.]+)', m.group(3))]
                if 'Loudness' in m.group(2):
                    rep['lufs'] = float(re.findall(r'-?[\d.]+', m.group(3))[0])
                if 'True peak' in m.group(2):
                    rep['true_peak_dbfs'] = float(re.findall(r'-?[\d.]+', m.group(3))[0])
    rep['pass'] = not rep['failed']
    return rep


def shot_ranges(cues, plan):
    """[(start, end, scene)] per shot from cuts + frames"""
    cuts = list(cues.get('cuts', []))
    n = int(cues.get('frames', 0))
    fr = [round(c * FPS) for c in cuts] + [n]
    return [(fr[k] / FPS, fr[k + 1] / FPS, plan['shots'][k].get('scene', '')) for k in range(len(cuts))]


def overlap_flags(jev, shots):
    """shots flagged 'text not readable' / safe-area -> [(start, end)]"""
    out = []
    if not jev:
        return out
    # tools/jev.py frames shape: {"shots": [{"shot": 1, "flags": [...], "inside_safe_area": bool}]}
    for s in jev.get('shots') or []:
        try:
            k = int(s.get('shot', 0)) - 1
        except Exception:
            continue
        fl = list(s.get('flags') or [])
        if s.get('inside_safe_area') is False and not any('safe' in f for f in fl):
            fl.append('caption outside safe area')
        if 0 <= k < len(shots) and any(('not readable' in f) or ('safe' in f) or ('box' in f) for f in fl):
            out.append((shots[k][0], shots[k][1]))
    # legacy shape: {"flags": {"1": ["text not readable"]}}
    flags = jev.get('flags') or {}
    for k, s in enumerate(shots):
        fl = flags.get(str(k + 1)) or flags.get(k + 1) or []
        if any(('not readable' in f) or ('safe' in f) or ('box' in f) for f in fl):
            out.append((s[0], s[1]))
    seen, uniq = set(), []
    for s in out:
        if s not in seen:
            seen.add(s); uniq.append(s)
    return uniq


def lift_params(min_y, mean_y):
    """gamma + brightness that lift the darkest frame to ~TARGET_Y without washing the range.

    ffmpeg eq gamma > 1 BRIGHTENS midtones (gamma < 1 darkens), so solve
    255 * (min/255) ** (1/g) = target  ->  g = ln(min/255) / ln(target/255).
    """
    target = TARGET_Y
    g = math.log(max(min_y, 1.0) / 255.0) / math.log(target / 255.0)
    g = max(1.02, min(2.2, g))          # never darken an already-dark range
    b = 0.012 if min_y < 34 else 0.0
    # keep the mid-tones moody: if the range average would be pushed past ~95, soften the gamma
    g_avg = math.log(max(mean_y, 1.0) / 255.0) / math.log(95.0 / 255.0)
    if g_avg < g:
        g = max(1.02, g_avg)
    return round(g, 3), round(b, 4)


def eq_chain(dark, dur):
    """one eq filter per dark range: plateau + two 0.2 s half-strength ramps (no visible pop)"""
    f = []
    for d in dark:
        a = max(0.0, d['start'] - 0.05)
        b = min(dur, d['end'] + 0.05)
        g, br = lift_params(d.get('min_yavg', 40.0), d.get('mean_yavg', 45.0))
        if b - a <= 0.5:                       # short dip: single window, the ramp would be the whole range
            f.append(f"eq=gamma={g}:brightness={br}:enable='between(t,{a:.3f},{b:.3f})'")
        else:
            g2, b2 = round(1 - (1 - g) / 2, 3), round(br / 2, 4)
            f.append(f"eq=gamma={g2}:brightness={b2}:enable='between(t,{a:.3f},{a + 0.2:.3f})'")
            f.append(f"eq=gamma={g}:brightness={br}:enable='between(t,{a + 0.2:.3f},{b - 0.2:.3f})'")
            f.append(f"eq=gamma={g2}:brightness={b2}:enable='between(t,{b - 0.2:.3f},{b:.3f})'")
    return f


def zoom_segs(frozen, dur):
    """[(a, b, nframes)] slow push-in segments around each frozen stretch"""
    segs = []
    for d in frozen:
        a = max(0.0, (d['start'] if d.get('start') is not None else 0.0) - 0.4)
        end = d.get('end')
        if end is None:
            end = (d['start'] or 0.0) + 2.0
        b = min(dur, end + 0.4)
        if b - a < 1.0:
            b = min(dur, a + 1.5)
        n = max(2, round((b - a) * FPS))
        segs.append((a, b, n))
    return segs


def build_vfilter(round_no, dark, frozen, backing, dur, report):
    """whole-video filtergraph: trim/zoompan/concat (frozen) -> eq lifts (dark) -> caption backing -> yuv420p"""
    segs = zoom_segs(frozen, dur)
    parts, chain = [], []
    if segs:
        cuts_pts = [0.0] + [x for s in segs for x in (s[0], s[1])] + [dur]
        for i in range(0, len(cuts_pts) - 1):
            a, b = cuts_pts[i], cuts_pts[i + 1]
            if b - a < 1 / FPS:
                continue
            zi = [s for s in segs if abs(s[0] - a) < 0.02]
            if zi:
                _, _, n = zi[0]
                rate = round(0.05 / n, 6)
                parts.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,scale=1620:2880:flags=lanczos,"
                             f"zoompan=z='min(zoom+{rate},1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                             f"d=1:s=1080x1920:fps={FPS},setpts=PTS-STARTPTS[v{i}]")
            else:
                parts.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{i}]")
            chain.append(f'[v{i}]')
        parts.append(''.join(chain) + f'concat=n={len(chain)}:v=1:a=0[vc]')
        src = '[vc]'
    else:
        src = '[0:v]'
    eqf = eq_chain(dark, dur)
    cur = src
    for i, e in enumerate(eqf):
        nxt = f'[e{i}]' if i < len(eqf) - 1 or backing else '[ve]'
        parts.append(f'{cur}{e}{nxt}')
        cur = nxt
    for i, (a, b) in enumerate(backing):
        nxt = f'[c{i}]'
        parts.append(f"{cur}eq=brightness=0.008:enable='between(t,{a:.3f},{b:.3f})'{nxt}")
        cur = nxt
    for i, (a, b) in enumerate(backing):
        last = i == len(backing) - 1
        nxt = '[vf]' if last else f'[b{i}]'
        parts.append(f"{cur}drawbox=x=162:y=1252:w=756:h=160:color=black@0.35:t=fill:enable='between(t,{a:.3f},{b:.3f})'{nxt}")
        cur = nxt
    parts.append(f'{cur}format=yuv420p[vout]')
    return ';'.join(parts)


def encode(video, vfilter, audio_mode, workdir, out):
    cmd = ['ffmpeg', '-y', '-i', video]
    if vfilter:
        cmd += ['-filter_complex', vfilter, '-map', '[vout]']
    else:
        cmd += ['-map', '0:v']
    if audio_mode == 'copy':
        cmd += ['-map', '0:a', '-c:a', 'copy']
    else:
        af = audio_mode
        cmd += ['-map', '0:a', '-af', af, '-c:a', 'aac', '-b:a', '192k']
    cmd += ['-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-r', '30', '-movflags', '+faststart', out]
    r = sh(cmd)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-1500:])
        sys.exit('ffmpeg encode failed (round %s)' % audio_mode)


def loudnorm_af(video):
    """two-pass loudnorm to -14 LUFS / TP -1.0, then a trim pass (same recipe as daily/mix.py)"""
    r = sh(['ffmpeg', '-hide_banner', '-i', video, '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json', '-f', 'null', '-'])
    try:
        js = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
        return (f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
                f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    except Exception:
        return 'loudnorm=I=-14:TP=-1.0:LRA=11'


def audio_stats(video):
    r = sh(['ffmpeg', '-i', video, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    li = re.findall(r'I:\s+(-?[\d.]+)\s+LUFS', r.stderr)
    tp = re.findall(r'Peak:\s+(-?[\d.]+)\s+dBFS', r.stderr)
    return (float(li[-1]) if li else None), (float(tp[-1]) if tp else None)


def run_shortqa(video, outdir, cuts, jev=False):
    cmd = [sys.executable, os.path.join(HERE, 'scary-reels', 'pipeline', 'shortqa.py'), video, outdir]
    if cuts:
        cmd += ['--cuts', ','.join(f'{c:.3f}' for c in cuts)]
    if jev:
        cmd += ['--jev']
    r = subprocess.run(cmd, capture_output=True, text=True)
    return r.returncode, load_report(outdir, fallback_md=False) or load_report(outdir)


def rerender_missing_plates(slug, workdir, plates_info, log):
    """--rerender path: re-render every missing/replaced plate once with Blender (the matrix job is not here)."""
    bl = os.environ.get('HEAL_BLENDER') or shutil.which('blender')
    if not bl:
        log.append('rerender: no blender binary (set HEAL_BLENDER) - falling back to Ken Burns cover')
        return False
    scene_root = find(os.path.join(workdir, 'blender'), os.path.join(os.path.dirname(HERE), 'blender'))
    assets = os.environ.get('HEAL_ASSETS') or os.path.expanduser('~/ia3d_assets')
    pdir = os.path.join(workdir, 'rm', 'public', 'real3d', slug)
    cues = json.load(open(find(os.path.join(workdir, 'case', slug, 'cues.json'), os.path.join(workdir, 'cues.json'))))
    ok, fail = [], []
    for shot, sc in sorted((plates_info.get('replaced') or {}).items()):
        scene = cues.get('scenes', {}).get(shot) or sc
        nf = cues.get('plate_nf', {}).get(shot)
        scene_py = os.path.join(scene_root, scene) if scene else None
        if not scene_py or not os.path.exists(scene_py) or not nf:
            fail.append((shot, 'scene not found')); continue
        fd = os.path.join(workdir, 'heal_plates', shot)
        os.makedirs(fd, exist_ok=True)
        r = sh([bl, '-b', '--factory-startup', '-noaudio', '-P', scene_py, '--', '--start', '0', '--end', str(nf - 1),
                '--out', fd, '--assets', assets, '--pct', '67', '--nf', str(nf)], timeout=7200)
        frames = sorted(f for f in os.listdir(fd) if f.endswith('.png')) if os.path.isdir(fd) else []
        if len(frames) < nf - 1:
            fail.append((shot, f'blender rc={r.returncode} frames={len(frames)}/{nf}')); continue
        lst = os.path.join(fd, 'list.txt')
        open(lst, 'w').write(''.join(f"file '{os.path.join(fd, f)}'\n" for f in frames))
        r2 = sh(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst,
                 '-vf', 'scale=1080:1920:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '10',
                 '-pix_fmt', 'yuv420p', '-r', '30', os.path.join(pdir, shot + '.mp4')])
        (ok if r2.returncode == 0 else fail).append((shot, 'rendered' if r2.returncode == 0 else 'encode failed'))
    plates_info['heal_rerender'] = {'ok': [s for s, _ in ok], 'failed': [s for s, _ in fail]}
    log.append(f'rerender: ok={ok} failed={fail}')
    return not fail


def rerender_comp(slug, workdir, log):
    """--rerender path step 2: regenerate + re-render the Remotion comp over the new plates, mux the original audio."""
    rm = os.environ.get('HEAL_RM')
    if not rm:
        for c in (os.path.join(os.path.dirname(HERE), 'rm'), os.path.join(workdir, 'rm')):
            if os.path.exists(os.path.join(c, 'package.json')):
                rm = c; break
    if not rm or not os.path.exists(os.path.join(rm, 'package.json')):
        log.append('rerender comp: no remotion project (set HEAL_RM) - falling back to Ken Burns cover')
        return False
    plan_dir = find(os.path.join(workdir, 'daily', 'work', slug), os.path.join(workdir, slug))
    case_dir = find(os.path.join(workdir, 'case', slug), os.path.join(workdir, slug))
    audio = find(os.path.join(case_dir or '', 'final_audio.wav'), os.path.join(workdir, 'final_audio.wav'))
    if not (plan_dir and case_dir and audio):
        log.append('rerender comp: missing plan/case/audio'); return False
    g = sh([sys.executable, os.path.join(HERE, 'gen_comp.py'), plan_dir, case_dir], cwd=workdir)
    m = re.search(r'COMP=([A-Za-z0-9]+)', g.stdout)
    if not m:
        log.append('rerender comp: gen_comp failed: ' + (g.stderr or g.stdout)[-300:]); return False
    comp = m.group(1)
    r = sh(['npx', 'remotion', 'render', f'src/real3d/{slug}/entry.jsx', comp, '../v_healed.mp4',
            '--muted', '--concurrency=4', '--codec=h264', '--crf=12', '--jpeg-quality=95'], cwd=rm, timeout=5400)
    if r.returncode != 0 or not os.path.exists(os.path.join(rm, '..', 'v_healed.mp4')):
        log.append('rerender comp: remotion render failed: ' + (r.stderr or '?')[-300:]); return False
    v = os.path.abspath(os.path.join(rm, '..', 'v_healed.mp4'))
    out = os.path.join(workdir, 'final_rerendered.mp4')
    mux = sh(['ffmpeg', '-v', 'error', '-y', '-i', v, '-i', audio, '-map', '0:v', '-map', '1:a',
              '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out])
    if mux.returncode != 0:
        log.append('rerender comp: mux failed: ' + (mux.stderr or '?')[-300:]); return False
    log.append(f'rerender comp: {comp} ok -> final_rerendered.mp4')
    return True


def main():
    a = sys.argv[1:]
    slug, workdir, sqa_dir = a[0], os.path.abspath(a[1]), os.path.abspath(a[2])
    max_rounds = int(a[a.index('--max-rounds') + 1]) if '--max-rounds' in a else 3
    rerender = '--rerender' in a
    cuts = []
    if '--cuts' in a:
        cuts = [float(x) for x in a[a.index('--cuts') + 1].split(',') if x]
    plan_p = find(os.path.join(workdir, 'daily', 'work', slug, 'plan.json'), os.path.join(workdir, 'plan.json'))
    cues_p = find(os.path.join(workdir, 'case', slug, 'cues.json'), os.path.join(workdir, 'cues.json'))
    video = find(os.path.join(workdir, 'final.mp4'), os.path.join(workdir, 'v.mp4'))
    if not (plan_p and cues_p and video):
        sys.exit(f'heal: missing inputs plan={plan_p} cues={cues_p} video={video}')
    plan = json.load(open(plan_p))
    cues = json.load(open(cues_p))
    shots = shot_ranges(cues, plan)
    if not cuts:
        cuts = [c for c in cues['cuts'][1:]]
    plates_p = find(os.path.join(workdir, 'rm', 'public', 'real3d', slug + '.plates.json'),
                    os.path.join(workdir, slug + '.plates.json'))
    plates_info = json.load(open(plates_p)) if plates_p else {}
    heal_dir = os.path.join(sqa_dir, 'heal')
    os.makedirs(heal_dir, exist_ok=True)
    rep = load_report(sqa_dir)
    if not rep:
        sys.exit('heal: no report in ' + sqa_dir + ' (run shortqa first)')
    log, rounds = [], []
    before = {'lufs': rep.get('lufs'), 'tp': rep.get('true_peak_dbfs'), 'dark': rep.get('dark_ranges', []),
              'frozen': rep.get('frozen_ranges', []), 'pass': rep.get('pass')}
    cur = video
    for rnd in range(1, max_rounds + 1):
        if rep.get('pass'):
            break
        changes = []
        dur = probe_dur(cur)
        # (b) frozen: re-render missing plates + the comp if asked to, else Ken Burns cover
        if rerender and rnd == 1 and (plates_info.get('replaced') or plates_info.get('missing')):
            if rerender_missing_plates(slug, workdir, plates_info, log):
                changes.append('re-rendered missing plates ' + str(plates_info['heal_rerender']['ok']))
                if rerender_comp(slug, workdir, log):
                    cur = os.path.join(workdir, 'final_rerendered.mp4')
                    if plates_p:
                        plates_info['healed'] = True
                        json.dump(plates_info, open(plates_p, 'w'), indent=1)
                    rc2, rep2 = run_shortqa(cur, os.path.join(heal_dir, 'rerendered'), cuts, jev='--jev' in a)
                    if rep2 is not None:
                        rep = rep2
                    log.append(f'rendered comp: shortqa exit {rc2}, pass={rep.get("pass")}')
                    if rep.get('pass'):
                        shutil.copy(cur, video)
                        rounds.append({'round': rnd, 'changes': changes + ['comp re-rendered over new plates'],
                                       'before': before, 'after': {'pass': True, 'lufs': rep.get('lufs'),
                                                                   'tp': rep.get('true_peak_dbfs'),
                                                                   'dark': rep.get('dark_ranges', []),
                                                                   'frozen': rep.get('frozen_ranges', []),
                                                                   'shortqa_exit': rc2}})
                        json.dump({'slug': slug, 'rounds': rounds, 'pass': True, 'rounds_used': len(rounds),
                                   'notes': log, 'final': {'video': video, 'lufs': rep.get('lufs'),
                                                           'tp': rep.get('true_peak_dbfs'), 'dark': rep.get('dark_ranges', []),
                                                           'frozen': rep.get('frozen_ranges', []), 'checks': rep.get('checks', [])}},
                                  open(os.path.join(sqa_dir, 'heal.json'), 'w'), indent=1)
                        print(json.dumps({'slug': slug, 'pass': True, 'rounds': len(rounds), 'lufs': rep.get('lufs'),
                                          'dark_left': 0, 'frozen_left': 0}))
                        return
        dark = [dict(d) for d in rep.get('dark_ranges', [])]
        frozen = [dict(d) for d in rep.get('frozen_ranges', [])]
        jev = rep.get('jev')
        if not jev:
            try: jev = json.load(open(os.path.join(sqa_dir, 'jev_frames.json')))
            except Exception: jev = None
        # caption backing is burned into the cut once; later rounds must not stack another pad on it
        backing = overlap_flags(jev, shots) if rnd == 1 else []
        # (a) dark: measure fresh YAVG inside each failing range so the lift is only as strong as needed
        if dark and not rep.get('dark_ranges', [{}])[0].get('min_yavg'):
            vals = yavg_frames(cur)
            for d in dark:
                i0, i1 = int(d['start'] * FPS), max(int(d['start'] * FPS) + 1, int(d['end'] * FPS))
                seg = vals[i0:i1] or [40.0]
                d['min_yavg'] = min(seg); d['mean_yavg'] = sum(seg) / len(seg)
        # (d) audio
        lufs, tp = rep.get('lufs'), rep.get('true_peak_dbfs')
        audio_bad = (lufs is None or not (-15 <= lufs <= -13)) or (tp is None or tp > -1.0)
        af = loudnorm_af(cur) if audio_bad else 'copy'
        if audio_bad:
            changes.append(f'audio renorm to -14 LUFS/TP -1 (was {lufs}/{tp})')
        if backing:
            changes.append('darker caption backing on flagged shots ' + str([f'{s[0]:.1f}-{s[1]:.1f}' for s in backing]))
        if dark:
            changes.append('lifted dark ranges ' + '; '.join(
                f"{d['start']:.2f}-{d['end']:.2f}s YAVG {d.get('min_yavg', '?')} -> target >= {TARGET_Y:.0f}" for d in dark))
        if frozen:
            changes.append('slow push-in cover for frozen ' + '; '.join(
                f"{d['start']:.2f}s" for d in frozen) + (' (rerender failed, fallback)' if rerender else ''))
        if not changes:
            log.append('round %d: nothing to change but the gate still fails - giving up' % rnd)
            break
        vfilter = build_vfilter(rnd, dark, frozen, backing, dur, rep)
        # inner verification: up to 2 re-grades of the eq chain if a lift was too weak
        for attempt in range(3):
            out = os.path.join(heal_dir, f'round{rnd}.mp4')
            encode(cur, vfilter, af, workdir, out)
            vals = yavg_frames(out)
            bad = []
            for d in dark:
                i0, i1 = int(d['start'] * FPS), max(int(d['start'] * FPS) + 1, int(d['end'] * FPS))
                seg = vals[i0:i1] or [0]
                if min(seg) < 52:
                    bad.append((d, min(seg)))
            if not bad or attempt == 2:
                break
            for d, m in bad:   # re-grade stronger from the measured value
                d['min_yavg'] = m
                d['mean_yavg'] = sum(vals[i0:i1]) / max(1, i1 - i0)
            vfilter = build_vfilter(rnd, dark, frozen, backing, dur, rep)
            log.append(f'round {rnd} attempt {attempt + 1}: re-graded {[(round(d["start"], 2), round(m, 1)) for d, m in bad]}')
        cur = out
        rc, rep = run_shortqa(cur, os.path.join(heal_dir, f'round{rnd}'), cuts, jev='--jev' in a)
        after = {'lufs': rep.get('lufs'), 'tp': rep.get('true_peak_dbfs'), 'dark': rep.get('dark_ranges', []),
                 'frozen': rep.get('frozen_ranges', []), 'pass': rep.get('pass'), 'shortqa_exit': rc}
        rounds.append({'round': rnd, 'changes': changes, 'before': before if rnd == 1 else rounds[-1]['after'], 'after': after})
        before = after
        log.append(f'round {rnd}: shortqa exit {rc}, pass={rep.get("pass")}')
        if rep.get('pass'):
            shutil.copy(cur, video)
            if plates_p:
                plates_info['healed'] = True
                json.dump(plates_info, open(plates_p, 'w'), indent=1)
            break
    json.dump({'slug': slug, 'rounds': rounds, 'pass': bool(rep.get('pass')),
               'rounds_used': len(rounds), 'notes': log,
               'final': {'video': video, 'lufs': rep.get('lufs'), 'tp': rep.get('true_peak_dbfs'),
                          'dark': rep.get('dark_ranges', []), 'frozen': rep.get('frozen_ranges', []),
                          'checks': rep.get('checks', [])}},
              open(os.path.join(sqa_dir, 'heal.json'), 'w'), indent=1)
    print(json.dumps({'slug': slug, 'pass': bool(rep.get('pass')), 'rounds': len(rounds),
                      'lufs': rep.get('lufs'), 'dark_left': len(rep.get('dark_ranges', [])),
                      'frozen_left': len(rep.get('frozen_ranges', []))}))
    sys.exit(0 if rep.get('pass') else 1)


if __name__ == '__main__':
    main()
