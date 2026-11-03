"""Test harness: runs a scene script unchanged, hooks kit.core.render, and adds checks from the vendored
social-video extension (vendor/ext/k1.zip, GPL-3.0-or-later, v1.1.0):
  loop scan (curves that don't close over the scene range + movie textures that freeze), optional loop fix,
  subject projection (2D bbox of the camera's focus object per frame, for the safe-area gate),
  wedge (sweep one numeric property over N values -> stills + labelled contact sheet).
The scene file on disk is never modified; any fix is applied in memory for this run only.

Workflow usage (scene input = this file, real scene in args):
  scene=blender/tools/k1.py  args="--k1-scene blender/scenes/X/b09_loop.py --k1 scan|fix|proj|wedge
        [--k1-proj 10,120,220] [--k1-path 'view_settings.exposure' --k1-from 0.6 --k1-to 1.8 --k1-n 5
        --k1-frame 130 --k1-pct 35] [--pct 50 --samples 16]"
Outputs in --out: k1_<tag>.txt (JSON report), pre_%05d.png (fix mode: frames before the fix), %05d.png,
  wedge_sheet.png + wedge_NN.png + wedge_values.txt (wedge mode).
"""
import bpy, sys, os, json, runpy, math, shutil, zipfile, tempfile, importlib, time

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../blender
sys.path.insert(0, B)
from kit import core  # noqa: E402

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def opt(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d


MODE = opt('--k1', 'scan')
SCENE = opt('--k1-scene')
PROJ = [int(x) for x in (opt('--k1-proj', '') or '').split(',') if x.strip()]
ROOT = os.path.dirname(B)
ZIP = os.path.join(ROOT, 'vendor', 'ext', 'k1.zip')
_orig_render = core.render
REP = {'mode': MODE, 'scene': SCENE, 'argv': argv}


def enable_ext():
    """The workflow installs the zip with `blender --command extension install-file -r user_default`; enable it.
    Fallback: unpack the zip to a temp package and register it directly."""
    import addon_utils
    name = None
    try:
        with zipfile.ZipFile(ZIP) as z:
            for ln in z.read('blender_manifest.toml').decode().splitlines():
                if ln.strip().startswith('id'):
                    name = ln.split('=', 1)[1].strip().strip('"')
    except Exception as ex:
        REP['zip_error'] = str(ex)
    if name:
        try:
            m = addon_utils.enable('bl_ext.user_default.' + name, default_set=True)
            if m and hasattr(bpy.ops.svk, 'loop_check'):
                REP['ext_load'] = 'extension (installed via --command extension install-file)'
                return m
        except Exception as ex:
            REP['ext_enable_error'] = repr(ex)
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(ZIP) as z:
        z.extractall(os.path.join(tmp, 'k1pkg'))
    sys.path.insert(0, tmp)
    m = importlib.import_module('k1pkg')
    m.register()
    REP['ext_load'] = 'fallback (unzipped + register())'
    return m


def find_cam():
    f = sys._getframe()
    while f:
        c = f.f_locals.get('cam')
        if c is not None and hasattr(c, 'shots'):
            return c
        f = f.f_back
    return None


def subject_name(cam, fr):
    o = opt('--k1-subject')
    if o:
        return o
    if cam:
        for s in cam.shots:
            if s['a'] <= fr < s['b'] and isinstance(s.get('focus'), str) and s['focus'] in bpy.data.objects:
                return s['focus']
    for n in ('TicTac', 'F1', 'Fighter'):
        if n in bpy.data.objects:
            return n
    return None


def bbox2d(sc, name):
    """Pixel bbox (x0, y0, x1, y1, top-left origin, full 1080x1920 frame) of an object + all its mesh descendants."""
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector
    obs = []
    for pat in name.split(','):
        if pat.endswith('*'):
            roots = [o for o in sc.objects if o.name.startswith(pat[:-1])]
        else:
            roots = [bpy.data.objects[pat]] if pat in bpy.data.objects else []
        for r in roots:
            obs += [r] + list(r.children_recursive)
    dg = bpy.context.evaluated_depsgraph_get()
    W, H = sc.render.resolution_x, sc.render.resolution_y
    xs, ys, zs = [], [], []
    for o in obs:
        if o.type != 'MESH':
            continue
        oe = o.evaluated_get(dg)
        if '_flame' in o.name or o.hide_render:
            continue
        for c in oe.bound_box:
            p = world_to_camera_view(sc, sc.camera, oe.matrix_world @ Vector(c))
            xs.append(p.x * W); ys.append((1 - p.y) * H); zs.append(p.z)
    if not xs:
        return None
    return {'obj': name, 'bbox': [round(min(xs), 1), round(min(ys), 1), round(max(xs), 1), round(max(ys), 1)],
            'behind_cam': min(zs) <= 0}


def poses(sc, frames):
    out = {}
    names = [n for n in ('F1', 'F2', 'Fighter', 'TicTac') if n in bpy.data.objects]
    for f in frames:
        sc.frame_set(f)
        d = {'cam': [round(v, 3) for v in sc.camera.matrix_world.translation],
             'cam_rot': [round(v, 4) for v in sc.camera.matrix_world.to_quaternion()]}
        for n in names:
            d[n] = [round(v, 3) for v in bpy.data.objects[n].matrix_world.translation]
        out[str(f)] = d
    return out


def scan(m, sc):
    for o in list(bpy.context.selected_objects):
        o.select_set(False)
    ctx = bpy.context
    curves = [dict(owner=o, path=p, index=i, start=round(a, 5), end=round(b, 5), delta=round(b - a, 5))
              for (o, p, i, a, b) in m.loop.loop_report(ctx, selected_only=False)]
    tex = [dict(material=a, node=b, why=c) for (a, b, c) in m.loop.texture_report(ctx)]
    try:
        bpy.ops.svk.loop_check()
        op_count = sc.svk_loop_issues
    except Exception as ex:
        op_count = 'op error: %r' % ex
    f1 = sc.frame_end + 1
    beyond = {}
    for o in sc.objects:
        for idb in (o, getattr(o, 'data', None)):
            ad = getattr(idb, 'animation_data', None) if idb is not None else None
            if ad and ad.action:
                for fc in ad.action.fcurves:
                    n = sum(1 for k in fc.keyframe_points if k.co.x > f1 + 1e-6)
                    if n:
                        beyond['%s:%s[%d]' % (o.name, fc.data_path, fc.array_index)] = n
    return {'range': [sc.frame_start, sc.frame_end, 'checks f%d vs f%d' % (sc.frame_start, sc.frame_end + 1)],
            'keys_beyond_loop_end': beyond,
            'curves': curves, 'textures': tex, 'operator_issue_count': op_count}


def close_fix(m, sc):
    """The extension's 'CLOSE' method (key the start value at frame_end+1, drop keys past it), safe key removal."""
    import math as _m
    f0, f1 = sc.frame_start, sc.frame_end + 1
    fixed = []
    for owner, idb in m.loop._anim_blocks(bpy.context, False):
        for fc in m.beat._fcurves(idb):
            a_, b_ = fc.evaluate(f0), fc.evaluate(f1)
            d = _m.remainder(a_ - b_, _m.tau) if fc.data_path.endswith('rotation_euler') else a_ - b_
            has_close = any(abs(k.co.x - f1) < 1e-6 and abs(k.co.y - a_) < 1e-6 for k in fc.keyframe_points)
            if abs(d) > 1e-6:
                fc.keyframe_points.insert(f1, a_, options={'FAST'})
                has_close = True
                fixed.append('%s:%s[%d] %.4g->%.4g' % (owner, fc.data_path, fc.array_index, b_, a_))
            if has_close:
                while True:
                    ks = [k for k in fc.keyframe_points if k.co.x > f1 + 1e-6]
                    if not ks:
                        break
                    fc.keyframe_points.remove(ks[-1])
            fc.update()
    return fixed


def write_rep(a, tag):
    os.makedirs(a.out, exist_ok=True)
    with open(os.path.join(a.out, 'k1_%s.txt' % tag), 'w') as fh:
        json.dump(REP, fh, indent=1)
    print('K1REPORT', json.dumps(REP)[:20000], flush=True)


def hook(a, sc=None, frames=None):
    sc = sc or bpy.context.scene
    t0 = time.time()
    m = enable_ext()
    stills = [int(x) for x in a.stills.split(',') if x.strip()] if a.stills else list(range(a.start, a.end + 1))
    tag = '%s_%s' % (MODE, '-'.join(str(x) for x in stills[:4]))
    cam = find_cam()
    REP['shake'] = {'kicks': len(getattr(cam, 'kicks', []) or []), 'drift': getattr(cam, 'drift', None)}
    if PROJ or MODE == 'proj':
        pr = {}
        for f in sorted(set(PROJ + stills)):
            sc.frame_set(f)
            n = subject_name(cam, f)
            pr[str(f)] = bbox2d(sc, n) if n else None
        REP['subject_px'] = pr
    seam = sorted({sc.frame_start, sc.frame_end, sc.frame_end + 1} | set(stills))
    if MODE in ('scan', 'fix'):
        REP['scan_before'] = scan(m, sc)
        REP['poses_before'] = poses(sc, seam)
    write_rep(a, tag)
    if MODE == 'fix' and '--k1-nopre' not in argv:
        _orig_render(a, sc, frames)
    if MODE == 'fix':
        for f in stills:
            p = os.path.join(a.out, '%05d.png' % f)
            if os.path.exists(p):
                os.replace(p, os.path.join(a.out, 'pre_%05d.png' % f))
        try:
            r = bpy.ops.svk.loop_fix(method='CLOSE')
            REP['fix_result'] = list(r)
        except Exception as ex:
            # v1.1.0 bug: loop_fix removes several keys past the loop end with remove(fast=True) from a stale list
            # -> 'Keyframe not in F-Curve'. Same CLOSE logic, keys removed one at a time.
            REP['fix_op_error'] = str(ex).splitlines()[-1]
            REP['fix_result'] = close_fix(m, sc)
        write_rep(a, tag)
        REP['scan_after'] = scan(m, sc)
        REP['poses_after'] = poses(sc, seam)
    if MODE == 'wedge':
        path = opt('--k1-path', 'view_settings.exposure')
        full = 'bpy.data.scenes["%s"].%s' % (sc.name, path)
        sc.frame_set(int(opt('--k1-frame', str(stills[0]))))
        sc.svk_output_dir = os.path.join(a.out, 'wd')
        r = bpy.ops.svk.wedge(data_path=full, start=float(opt('--k1-from', '0.6')), end=float(opt('--k1-to', '1.8')),
                              count=int(opt('--k1-n', '5')), percent=int(opt('--k1-pct', '35')),
                              columns=int(opt('--k1-cols', '5')))
        REP['wedge_result'] = list(r)
        REP['wedge_sheet'] = sc.svk_last_sheet
        d = os.path.dirname(sc.svk_last_sheet) if sc.svk_last_sheet else None
        if d and os.path.isdir(d):
            for fn in os.listdir(d):
                shutil.copy(os.path.join(d, fn), os.path.join(a.out, fn))
        json.dump({'frames': 0, 'render_s': round(time.time() - t0, 1), 'wall_s': round(time.time() - t0, 1)},
                  open(os.path.join(a.out, 'timing.json'), 'w'))
        write_rep(a, tag)
        return {}
    info = _orig_render(a, sc, frames)
    REP['secs'] = round(time.time() - t0, 1)
    write_rep(a, tag)
    return info


core.render = hook
runpy.run_path(os.path.join(ROOT, SCENE) if not os.path.isabs(SCENE) else SCENE, run_name='__main__')
