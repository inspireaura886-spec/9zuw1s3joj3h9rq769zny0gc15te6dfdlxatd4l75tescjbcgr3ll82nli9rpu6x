#!/usr/bin/env python3
"""YAVG pre-check for a rendered plate PART, with one automatic +1 EV re-render.

The plates matrix renders shot parts in parallel. Right after a part is encoded, this checks its frames with
ffmpeg signalstats. If the part is too dark for the shortqa dark gate (any YAVG < 45, or mean < 55), it re-renders
that part ONCE with +1 EV (pinned from the scene's auto-exposure) and re-encodes it. Never touches other parts.

usage: python3 daily/plate_guard.py <part.mp4> <scene.py> <start> <end> <nf> <out_dir> <frames_dir> <assets> <pct>
env: BLENDER (default `blender`), PLATE_GUARD_MIN (default 45), PLATE_GUARD_MEAN (default 55), PLATE_GUARD_EV (default 1.0)
exit 0 = part usable (original or re-rendered), 1 = still dark after the one retry (the part is kept and reported).
"""
import glob, json, os, re, shutil, subprocess, sys, time


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def yavg(path):
    r = run(['ffmpeg', '-hide_banner', '-i', path, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG',
             '-an', '-f', 'null', '-'])
    return [float(x) for x in re.findall(r'YAVG=([\d.]+)', r.stderr)]


def scene_exposure(frames_dir, start):
    """Auto exposure written by the kit for this part (cine_report_<tag>_<start>.txt), else 0.0."""
    best, best_t = None, -1
    for p in glob.glob(os.path.join(frames_dir, 'cine_report_*_%d.txt' % int(start))):
        try:
            d = json.load(open(p))
            if os.path.getmtime(p) > best_t:
                best, best_t = d, os.path.getmtime(p)
        except Exception:
            pass
    ev = ((best or {}).get('exposure') or {}).get('ev')
    return float(ev) if ev is not None else 0.0


def encode(frames_dir, start, video):
    lst = os.path.join(frames_dir, 'guard_list.txt')
    frames = sorted(glob.glob(os.path.join(frames_dir, '*.png')))
    if not frames:
        return False
    open(lst, 'w').write(''.join("file '%s'\n" % os.path.abspath(f) for f in frames))
    r = run(['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-start_number', str(start), '-i',
             os.path.join(frames_dir, '%05d.png'), '-vf', 'scale=1080:1920:flags=lanczos', '-c:v', 'libx264',
             '-preset', 'medium', '-crf', '10', '-pix_fmt', 'yuv420p', '-r', '30', video])
    return r.returncode == 0


def main():
    part, scene, start, end, nf, out_dir, frames_dir, assets, pct = sys.argv[1:10]
    start, end, nf = int(start), int(end), int(nf)
    lo = float(os.environ.get('PLATE_GUARD_MIN', 45))
    mean_min = float(os.environ.get('PLATE_GUARD_MEAN', 55))
    bump = float(os.environ.get('PLATE_GUARD_EV', 1.0))
    vals = yavg(part)
    mean = sum(vals) / max(1, len(vals))
    low = min(vals) if vals else 0.0
    stat = {'part': part, 'scene': scene, 'start': start, 'end': end, 'frames': len(vals),
            'min_yavg': round(low, 1), 'mean_yavg': round(mean, 1), 'retried': False}
    if vals and low >= lo and mean >= mean_min:
        print(json.dumps(dict(stat, ok=True)))
        return 0
    blender = os.environ.get('BLENDER') or shutil.which('blender')
    if not blender:
        print(json.dumps(dict(stat, ok=False, error='blender not found; part left as rendered')), file=sys.stderr)
        return 1
    ev = scene_exposure(frames_dir, start) + bump
    retry = frames_dir.rstrip('/') + '_retry'
    shutil.rmtree(retry, ignore_errors=True)
    os.makedirs(retry, exist_ok=True)
    cmd = [blender, '-b', '--factory-startup', '-noaudio', '-P', scene, '--', '--start', str(start), '--end', str(end),
           '--out', retry, '--assets', assets, '--pct', str(pct), '--nf', str(nf), '--exposure', '%.2f' % ev]
    r = run(cmd, timeout=5400)
    stat['retried'] = True
    stat['retry_ev'] = round(ev, 2)
    frames = glob.glob(os.path.join(retry, '%05d.png' % start)) + glob.glob(os.path.join(retry, '*.png'))
    if r.returncode != 0 or not frames:
        stat.update(ok=False, error='retry render failed rc=%s frames=%d' % (r.returncode, len(set(frames))))
    elif not encode(retry, start, part):
        stat.update(ok=False, error='retry encode failed')
    else:
        vals2 = yavg(part)
        mean2 = sum(vals2) / max(1, len(vals2))
        low2 = min(vals2) if vals2 else 0.0
        stat.update(after_min_yavg=round(low2, 1), after_mean_yavg=round(mean2, 1),
                    ok=bool(low2 >= lo and mean2 >= mean_min))
    try:
        json.dump(stat, open(os.path.join(out_dir, 'plate_guard_%s_%d.json' % (os.path.basename(scene), start)), 'w'), indent=1)
    except Exception:
        pass
    print(json.dumps(stat))
    return 0 if stat.get('ok') else 1


if __name__ == '__main__':
    sys.exit(main())
