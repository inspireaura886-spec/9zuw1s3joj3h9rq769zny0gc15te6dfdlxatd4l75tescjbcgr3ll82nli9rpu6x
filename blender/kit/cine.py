"""CINE LOOK v2 (2026-11-04): the 'real film' layer on top of the REAL3D kit.

Why: user called the old plates "trash" next to 4 Blender reference films. What those share and v1 lacked:
photoscanned real assets, golden/blue-hour or strong motivated key + real HDRI, volumetric haze, shallow DOF on a
hero object in close-up, AgX contrast, motion blur, readable exposure (never murky), dense set dressing.

Rules this module enforces (and reports in <out>/cine_report.txt, which the GitHub job uploads with the stills):
  * assets: Poly Haven CC0 only (HDRIs, scanned models, texture sets via kit/assets.json + fetch_assets.py)
  * look:   AgX + 'Medium High Contrast', motion blur on (shutter 0.5 at frame start), OIDN denoise
  * lens:   50-85 mm, f/1.8-2.8, focus on the hero (a point/object, never 'look target' by default)
  * key:    sun 15-25 deg elevation, golden (warm) or blue hour; interiors: a motivated practical (lamp) key
  * haze:   bounded world-scale volume (box over the whole set; an unbounded world volume fogs the HDRI to grey)
  * camera: smooth eased dolly / push-in only (kit cruise ease, kick/handheld are no-ops; shake_check gate stays)
  * exposure: auto-metered on a fixed frame to mean display luma ~0.26 (gate 0.18-0.35); --exposure X pins it
  * grain:  NOT baked into plates (kit rule: grain + LUT in the Remotion finish); compare sheets add it in post

Use in a beat script:
    from kit import cine as CN
    sc = core.reset(); CN.setup(sc, samples=128)
    CN.hdri_sun('industrial_sunset_02', sun_az=95, strength=1.0)      # rotates the HDRI so its sun sits at sun_az
    CN.sun(elev=17, az=95, warmth='golden', strength=4.5)
    CN.haze(center=..., size=..., density=0.006)
    col = CN.model('grass_medium_01'); CN.scatter('grass_medium_01', 60, area, avoid=...)
    cam = C.Cam(); CN.shot(cam, 0, NF, C.dolly(p0, p1, look=L), lens=58, fstop=2.2, focus=HERO)
    CN.render(cam, NF, a, sc, meter_frame=NF // 2)
"""
import bpy, os, math, glob, json, random
from mathutils import Vector
from . import core, world as Wd, mat as M, presets as P, camera as C

LENS = (50.0, 85.0)
FSTOP = (1.8, 2.8)
SUN_ELEV = (15.0, 25.0)
LUMA = (0.18, 0.35)
LUMA_TARGET = 0.26
REPORT = {'module': 'cine_v2', 'warnings': [], 'assets': [], 'shots': []}

WARM = {'golden': (1.0, 0.70, 0.42), 'late': (1.0, 0.60, 0.32), 'blue': (0.62, 0.74, 1.0), 'noon': (1.0, 0.95, 0.88)}


def warn(msg):
    REPORT['warnings'].append(msg)
    print('CINE warn:', msg, flush=True)


# ---------------------------------------------------------------- render setup
def setup(sc, samples=128, exposure=0.0, adaptive=0.015, vol=True, glare=0.32, glare_thr=1.1, vignette=0.22,
          sat=0.97, lift=(0.995, 1.0, 1.02), gain=(1.02, 1.0, 0.97), lens_dist=-0.006, dispersion=0.0035):
    """Cycles CPU + OIDN at film settings: AgX MHC, motion blur, more bounces (scanned foliage needs transparent
    bounces), finer volume steps for shafts; gentle lens finish (less vignette than v1: no murky corners)."""
    core.setup_render(sc, samples=samples, look='AgX - Medium High Contrast', exposure=exposure, motion_blur=True,
                      shutter=0.5, bounces=8, vol_step=1.5 if vol else 8.0, vol_max_steps=160 if vol else 16,
                      clamp_ind=10.0, adaptive=adaptive)
    cy = sc.cycles
    cy.diffuse_bounces = 4
    cy.glossy_bounces = 4
    cy.transmission_bounces = 8
    cy.transparent_max_bounces = 48      # alpha-card grass / leaves stack up fast
    cy.volume_bounces = 1
    cy.sample_clamp_direct = 0.0
    try:
        cy.use_light_tree = True
    except Exception:
        pass
    core.finish(sc, glare=glare, glare_thr=glare_thr, glare_size=8, vignette=vignette, lens_dist=lens_dist,
                dispersion=dispersion, lift=lift, gain=gain, sat=sat)
    REPORT.update(look=sc.view_settings.look, view=sc.view_settings.view_transform, motion_blur=sc.render.use_motion_blur,
                  shutter=sc.render.motion_blur_shutter, samples=samples, denoise=cy.use_denoising)
    return sc


# ---------------------------------------------------------------- world + light
def _hdri_path(hid):
    return os.path.join(M.A(), 'hdri', hid + '.hdr')


def hdri_sun_dir(hid):
    """Brightest region of an equirect HDRI -> (azimuth deg, elevation deg) in Blender's world mapping."""
    import numpy as np
    p = _hdri_path(hid)
    if not os.path.exists(p):
        warn('hdri missing ' + hid)
        return None
    img = bpy.data.images.load(p, check_existing=True)
    w, h = img.size
    a = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(a)
    lum = (a.reshape(h, w, 4)[:, :, :3] * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(2)
    # blur-free robust peak: take the mean position of the top 0.02 % pixels
    thr = np.quantile(lum, 0.9998)
    ys, xs = np.nonzero(lum >= thr)
    u, v = (xs.mean() + 0.5) / w, (ys.mean() + 0.5) / h          # pixel row 0 = bottom (v=0)
    phi = (u - 0.5) * 2 * math.pi
    th = (v - 0.5) * math.pi
    d = Vector((-math.cos(phi) * math.cos(th), math.sin(phi) * math.cos(th), math.sin(th)))
    az = math.degrees(math.atan2(d.y, d.x))
    el = math.degrees(th)
    print('CINE hdri sun', hid, 'az %.1f el %.1f peak %.1f' % (az, el, float(lum.max())), flush=True)
    return az, el


# measured sun direction (az, el in Blender world mapping) per HDRI, logged by hdri_sun_dir on GitHub runs;
# used where numpy is not allowed (JANCTION preview bundles)
HDRI_SUN = {}


def _in_jr():
    try:
        _JR  # noqa: defined only inside a JANCTION preview bundle
        return True
    except NameError:
        return False


def hdri_sun(hid, sun_az=None, strength=1.0, bg_strength=None, tint=(1, 1, 1)):
    """Real HDRI world. sun_az (deg, world: 0=+X, 90=+Y) rotates the map so its sun lands where the key sun is."""
    rot = 0.0
    sd = None
    if sun_az is not None:
        sd = HDRI_SUN.get(hid) if _in_jr() else hdri_sun_dir(hid)
    if sd:
        rot = sd[0] - sun_az            # mapping rotates the lookup vector: world dir d shows texel R(rot) d
        REPORT['hdri_sun_el'] = round(sd[1], 1)
    Wd.hdri(hid, strength=strength, rot=rot, bg_strength=bg_strength, tint=tint)
    REPORT['assets'].append('hdri:' + hid)
    REPORT['hdri'] = dict(id=hid, rot=round(rot, 1), strength=strength)
    return rot


def sun(elev=18.0, az=90.0, warmth='golden', strength=4.0, angle=1.2, check=True):
    """Key sun. elev/az in degrees (az 0=+X, 90=+Y). warmth: golden | late | blue | noon or an RGB tuple."""
    if check and not (SUN_ELEV[0] <= elev <= SUN_ELEV[1]):
        warn('sun elevation %.1f outside %s' % (elev, SUN_ELEV))
    col = WARM.get(warmth, warmth) if isinstance(warmth, str) else warmth
    e, z = math.radians(elev), math.radians(az)
    d = (math.cos(e) * math.cos(z), math.cos(e) * math.sin(z), math.sin(e))
    o = Wd.moon(direction=d, strength=strength, color=col, angle=angle)
    o.name = o.data.name = 'CineSun'
    REPORT['sun'] = dict(elev=elev, az=az, color=list(col), strength=strength)
    return o


def practical(name, loc, target, kelvin_rgb=(1.0, 0.72, 0.45), power=40, cone=70, blend=0.55, radius=0.04):
    """Motivated practical key (desk lamp, window): a spot that a visible fixture explains."""
    s = Wd.spot(name, loc, target, color=kelvin_rgb, power=power, size_deg=cone, blend=blend, radius=radius)
    REPORT.setdefault('practicals', []).append(name)
    return s


def haze(center, size, density=0.006, color=(1.0, 0.93, 0.84), anisotropy=0.62, noise=0.3, noise_scale=0.08,
         height_falloff=1.2):
    """World-scale volumetric haze (bounded box). Forward scattering (anisotropy > 0.5) = glow + shafts toward the sun."""
    o = Wd.fog(center=center, size=size, density=density, color=color, anisotropy=anisotropy, noise=noise,
               noise_scale=noise_scale, height_falloff=height_falloff)
    o.name = 'CineHaze'
    REPORT['haze'] = dict(density=density, size=list(size))
    return o


# ---------------------------------------------------------------- scanned assets
def model(aid):
    """Import a Poly Haven scanned glTF once (hidden collection for instancing)."""
    col = P.gltf(aid)
    if not [o for o in col.all_objects if o.type == 'MESH']:
        warn('model missing ' + aid)
    elif 'model:' + aid not in REPORT['assets']:
        REPORT['assets'].append('model:' + aid)
    return col


def bbox(col):
    mn, mx = Vector((1e9,) * 3), Vector((-1e9,) * 3)
    for o in col.all_objects:
        if o.type != 'MESH':
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    return mn, mx


def place(aid, loc, rot=(0, 0, 0), scale=1.0, ground=True, center=True, name=None):
    """Instance a scanned model with its bbox bottom-centre (or centre) at loc. rot = euler radians.
    Returns the empty with ['size'] = bbox size (metres, before scale)."""
    col = model(aid)
    mn, mx = bbox(col)
    if mn.x < 1e8:
        col.instance_offset = ((mn.x + mx.x) / 2 if center else 0, (mn.y + mx.y) / 2 if center else 0,
                               mn.z if ground else (mn.z + mx.z) / 2)
    e = P.instance(col, loc, 0.0, scale, name or ('inst_' + aid))
    e.rotation_euler = rot
    e['size'] = tuple(mx - mn) if mn.x < 1e8 else (0, 0, 0)
    return e


def scatter(aid, n, area, seed=0, avoid=None, scale=(0.8, 1.25), z=0.0, tilt=0.06):
    """Dense set dressing: n instances of a scanned model in area=(xmin,xmax,ymin,ymax); avoid(x,y)->True skips."""
    col = model(aid)
    mn, mx = bbox(col)
    if mn.x < 1e8:
        col.instance_offset = ((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z)
    rnd = random.Random(seed)
    out, tries = [], 0
    while len(out) < n and tries < n * 30:
        tries += 1
        x, y = rnd.uniform(area[0], area[1]), rnd.uniform(area[2], area[3])
        if avoid and avoid(x, y):
            continue
        e = P.instance(col, (x, y, z(x, y) if callable(z) else z), rnd.uniform(0, 6.283), rnd.uniform(*scale))
        e.rotation_euler = (rnd.uniform(-tilt, tilt), rnd.uniform(-tilt, tilt), e.rotation_euler[2])
        out.append(e)
    REPORT.setdefault('scatter', {})[aid] = REPORT.get('scatter', {}).get(aid, 0) + len(out)
    return out


def ground(name, tid, size, center=(0, 0, 0), tile_m=4.0, tint=None, normal=1.0, rough_mul=1.0):
    """Textured ground plane from a Poly Haven texture set; tile_m = metres per texture repeat."""
    from mathutils import Vector as V
    me = bpy.data.meshes.new(name)
    sx, sy = size[0] / 2, size[1] / 2
    me.from_pydata([(-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for lp in me.loops:
        x, y, _ = me.vertices[lp.vertex_index].co
        uv.data[lp.index].uv = ((x + sx) / size[0], (y + sy) / size[1])
    o = bpy.data.objects.new(name, me)
    o.location = center
    bpy.context.scene.collection.objects.link(o)
    m = M.texture_set(name + 'M', tid, scale=max(size) / tile_m, tint=tint, normal=normal, rough_mul=rough_mul)
    # non-square plane: keep texel aspect square
    mp = [n for n in m.node_tree.nodes if n.bl_idname == 'ShaderNodeMapping']
    if mp:
        mp[0].inputs['Scale'].default_value = (size[0] / tile_m, size[1] / tile_m, 1)
    M.assign(o, m)
    if os.path.isdir(os.path.join(M.A(), 'tex', tid)):
        REPORT['assets'].append('tex:' + tid)
    else:
        warn('texture missing ' + tid)
    return o


# ---------------------------------------------------------------- camera
def shot(cam, a, b, move, lens=58, fstop=2.2, focus=None, roll=0.0):
    """Cam.shot with the cine gates: 50-85 mm, f/1.8-2.8, explicit hero focus. Out-of-range values are clamped."""
    def clamp(v, lo, hi, what):
        vs = v if isinstance(v, (tuple, list)) else (v,)
        if any(x < lo or x > hi for x in vs):
            warn('%s %s clamped to %s-%s' % (what, v, lo, hi))
        c = tuple(min(hi, max(lo, x)) for x in vs)
        return c if isinstance(v, (tuple, list)) else c[0]
    lens = clamp(lens, *LENS, 'lens')
    fstop = clamp(fstop, *FSTOP, 'fstop')
    if focus is None:
        warn('shot %d-%d has no hero focus (focusing on look target)' % (a, b))
    cam.shot(a, b, move, lens=lens, fstop=fstop, focus=focus, roll=roll)
    REPORT['shots'].append(dict(a=a, b=b, lens=lens, fstop=fstop, focus=str(focus)))
    return cam


# ---------------------------------------------------------------- exposure
def _luma_png(path):
    import numpy as np
    img = bpy.data.images.load(path)
    img.colorspace_settings.name = 'Non-Color'      # raw 8-bit display values
    w, h = img.size
    a = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(a)
    bpy.data.images.remove(img)
    a = a.reshape(-1, 4)[:, :3]
    l = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    return float(l.mean()), float((l < 0.04).mean())


def autoexpose(sc, a, frame, target=LUMA_TARGET, iters=3):
    """Meter a small deterministic render of `frame` and set view exposure so mean display luma ~= target.
    Same frame + seed + samples on every GitHub part -> identical exposure (no part-to-part jumps)."""
    if '--exposure' in a.extra:
        sc.view_settings.exposure = float(a.extra[a.extra.index('--exposure') + 1])
        REPORT['exposure'] = dict(mode='pinned', ev=sc.view_settings.exposure)
        return sc.view_settings.exposure
    keep = (sc.render.resolution_percentage, sc.cycles.samples, sc.render.filepath, sc.render.use_motion_blur,
            sc.cycles.use_adaptive_sampling)
    sc.render.resolution_percentage = 14
    sc.cycles.samples = 16
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.seed = 0
    sc.render.use_motion_blur = False
    tmp = os.path.join(a.out, '_meter')
    os.makedirs(tmp, exist_ok=True)
    hist = []
    for i in range(iters):
        sc.frame_set(frame)
        sc.render.filepath = os.path.join(tmp, 'm%d.png' % i)
        bpy.ops.render.render(write_still=True)
        m, dark = _luma_png(sc.render.filepath)
        hist.append((round(sc.view_settings.exposure, 3), round(m, 4)))
        if abs(m - target) < 0.012:
            break
        ev = 2.1 * math.log2(target / max(m, 0.004))
        sc.view_settings.exposure = max(-6.0, min(8.0, sc.view_settings.exposure + max(-3.0, min(3.0, ev))))
    sc.view_settings.exposure = round(sc.view_settings.exposure * 20) / 20
    (sc.render.resolution_percentage, sc.cycles.samples, sc.render.filepath, sc.render.use_motion_blur,
     sc.cycles.use_adaptive_sampling) = keep
    REPORT['exposure'] = dict(mode='auto', ev=sc.view_settings.exposure, meter=hist, frame=frame)
    print('CINE autoexpose', REPORT['exposure'], flush=True)
    return sc.view_settings.exposure


def render(cam, NF, a, sc, meter_frame=None):
    """Bake the camera, meter exposure, write cine_report.txt, render, then exposure-check the written frames.
    Inside a JANCTION preview bundle only the bake runs (the service renders; scene exposure is used as set)."""
    cam.bake(0, NF - 1)
    sc.frame_start, sc.frame_end = 0, NF - 1
    if _in_jr():
        return None
    return _render_full(cam, NF, a, sc, meter_frame)


def _render_full(cam, NF, a, sc, meter_frame=None):
    if a.samples:
        sc.cycles.samples = a.samples
    if a.pct != 100:
        sc.render.resolution_percentage = a.pct
    autoexpose(sc, a, NF // 2 if meter_frame is None else meter_frame)
    os.makedirs(a.out, exist_ok=True)
    info = core.render(a, sc)
    lum = {}
    stills = [int(x) for x in a.stills.split(',') if x.strip()] if a.stills else []
    for f in (stills or [a.start, (a.start + a.end) // 2, a.end]):
        p = os.path.join(a.out, '%05d.png' % f)
        if os.path.exists(p):
            m, dark = _luma_png(p)
            lum[f] = dict(mean=round(m, 3), dark_frac=round(dark, 3),
                          ok=bool(LUMA[0] <= m <= LUMA[1] and dark < 0.35))
            if not lum[f]['ok']:
                warn('exposure gate frame %d mean %.3f dark %.2f (want %.2f-%.2f, dark<0.35)' % (f, m, dark, *LUMA))
    REPORT['luma'] = lum
    REPORT['timing'] = {k: v for k, v in info.items() if k != 'per_frame'}
    procedural = [o.name for o in bpy.context.scene.objects if o.type == 'MESH' and not o.data.materials]
    if procedural:
        warn('meshes without material: %s' % procedural[:8])
    tag = os.path.basename(sys_argv_scene()).replace('.py', '')
    with open(os.path.join(a.out, 'cine_report_%s_%d.txt' % (tag, a.start if not stills else stills[0])), 'w') as f:
        f.write(json.dumps(REPORT, indent=1, default=str))
    print('CINE report', json.dumps(REPORT, default=str), flush=True)
    return info


def sys_argv_scene():
    import sys
    for i, x in enumerate(sys.argv):
        if x == '-P' and i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return 'scene.py'
