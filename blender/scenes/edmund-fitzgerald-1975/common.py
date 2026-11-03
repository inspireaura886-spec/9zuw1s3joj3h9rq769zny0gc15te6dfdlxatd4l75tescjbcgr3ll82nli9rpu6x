"""Shared helpers for the edmund-fitzgerald-1975 REAL3D plates (short-line-b, 2026-11-03).
Generic 1950s Great Lakes ore freighter (laker), 222 m (729 ft), beam 22.9 m, loaded freeboard ~4 m: forward pilothouse,
21 hatch covers, aft engine house + stack. No names/marks on the model (the real ship appears only in the PD USCG photo).
Rules baked in: NO shake/kicks/handheld (kit), cruise-eased camera moves, ship roll/pitch are slow smooth sines only."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, mat as M, timing as T, interiors as I
from mathutils import Vector
import bpy

L2 = 111.0      # half length (m)
B = 11.45       # half beam
D = 4.0         # deck height above the waterline (loaded)
KEEL = -8.0     # keel below the waterline


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def setup(sc, exposure=1.0, vol=True, samples=20, glare=0.55, vignette=0.4, sat=0.9):
    core.setup_render(sc, samples=samples, look='AgX - Medium High Contrast', exposure=exposure,
                      vol_step=6.0 if vol else 8.0, vol_max_steps=48 if vol else 24, bounces=4, clamp_ind=4.0)
    core.finish(sc, glare=glare, glare_thr=1.0, glare_size=8, vignette=vignette, streaks=0.0,
                lift=(0.97, 1.0, 1.06), gain=(1.02, 1.0, 0.97), sat=sat)


def finish_cam(cam, NF, a, sc):
    cam.bake(0, NF - 1)
    sc.frame_start, sc.frame_end = 0, NF - 1
    core.render(a, sc)


# ---------------------------------------------------------------- materials
def hull_mat():
    """Dark hull paint, rust-red deck on up-facing faces (by normal), grime + streak breakup."""
    m, nb, b, out = M.new('FitzHull')
    geo = nb.n('ShaderNodeNewGeometry')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(geo, 'Normal', sep, 'Vector')
    up = nb.n('ShaderNodeMapRange')
    up.inputs['From Min'].default_value = 0.6
    up.inputs['From Max'].default_value = 0.8
    nb.l(sep, 'Z', up, 'Value')
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=0.6, Detail=10.0, Roughness=0.65)
    nb.l(tc, 'Object', nz, 'Vector')
    side = nb.n('ShaderNodeValToRGB')
    side.color_ramp.elements[0].position = 0.4
    side.color_ramp.elements[0].color = (0.035, 0.036, 0.04, 1)
    side.color_ramp.elements[1].position = 0.75
    side.color_ramp.elements[1].color = (0.075, 0.06, 0.05, 1)
    nb.l(nz, 'Fac', side, 'Fac')
    deck = nb.n('ShaderNodeValToRGB')
    deck.color_ramp.elements[0].position = 0.35
    deck.color_ramp.elements[0].color = (0.16, 0.045, 0.03, 1)
    deck.color_ramp.elements[1].position = 0.8
    deck.color_ramp.elements[1].color = (0.09, 0.04, 0.03, 1)
    nb.l(nz, 'Fac', deck, 'Fac')
    mix = nb.n('ShaderNodeMix')
    mix.data_type = 'RGBA'
    nb.l(up, 'Result', mix, 0)
    nt = m.node_tree
    nt.links.new(side.outputs['Color'], mix.inputs[6])
    nt.links.new(deck.outputs['Color'], mix.inputs[7])
    nt.links.new(mix.outputs[2], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.42
    b.inputs['Coat Weight'].default_value = 0.25  # wet sheen
    b.inputs['Coat Roughness'].default_value = 0.15
    n2 = nb.n('ShaderNodeTexNoise', Scale=3.0, Detail=6.0)
    nb.l(tc, 'Object', n2, 'Vector')
    bp = nb.n('ShaderNodeBump', Strength=0.12, Distance=0.05)
    nb.l(n2, 'Fac', bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    return m


def white_mat():
    return M.principled('FitzWhite', base=(0.62, 0.62, 0.6), rough=0.45, coat=0.2, grime=0.45, rough_noise=0.15,
                        bump=0.05, bump_scale=20)


def water_mat(crest=1.6, crest1=3.2, color=(0.006, 0.012, 0.014)):
    """Dark lake water with white foam on the wave crests (world Z of the displaced ocean) broken by noise."""
    m, nb, b, out = M.new('LakeWater')
    geo = nb.n('ShaderNodeNewGeometry')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(geo, 'Position', sep, 'Vector')
    mr = nb.n('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = crest
    mr.inputs['From Max'].default_value = crest1
    nb.l(sep, 'Z', mr, 'Value')
    nz = nb.n('ShaderNodeTexNoise', Scale=0.35, Detail=10.0, Roughness=0.7)
    nb.l(geo, 'Position', nz, 'Vector')
    nmr = nb.n('ShaderNodeMapRange')
    nmr.inputs['From Min'].default_value = 0.42
    nmr.inputs['From Max'].default_value = 0.62
    nb.l(nz, 'Fac', nmr, 'Value')
    foam = nb.math('MULTIPLY', mr.outputs['Result'], nmr.outputs['Result'])
    mix = nb.n('ShaderNodeMix')
    mix.data_type = 'RGBA'
    nt = m.node_tree
    nt.links.new(foam.outputs[0], mix.inputs[0])
    mix.inputs[6].default_value = (*color, 1)
    mix.inputs[7].default_value = (0.55, 0.6, 0.62, 1)
    nt.links.new(mix.outputs[2], b.inputs['Base Color'])
    rr = nb.n('ShaderNodeMapRange')
    rr.inputs['To Min'].default_value = 0.05
    rr.inputs['To Max'].default_value = 0.8
    nt.links.new(foam.outputs[0], rr.inputs['Value'])
    nt.links.new(rr.outputs['Result'], b.inputs['Roughness'])
    b.inputs['IOR'].default_value = 1.33
    b.inputs['Specular IOR Level'].default_value = 0.6
    return m


# ---------------------------------------------------------------- freighter
def _half_breadth(y):
    """Plan shape: straight midbody, fine bow over the last 20 m, rounded stern over the last 9 m."""
    if y > L2 - 20:
        u = (L2 - y) / 20.0
        return max(0.03, u ** 0.55)
    if y < -L2 + 9:
        u = (y + L2) / 9.0
        return 0.62 + 0.38 * math.sin(u * math.pi / 2) ** 0.7
    return 1.0


def _sheer(y):
    """Deck rises toward the bow (raised forecastle look) and slightly at the stern."""
    s = 0.0
    if y > L2 - 30:
        s += 1.6 * ((y - (L2 - 30)) / 30.0) ** 2
    if y < -L2 + 20:
        s += 0.6 * (((-L2 + 20) - y) / 20.0) ** 2
    return s


def _ring(y, w, sheer, keel):
    bx = B * w
    pts = []
    # starboard deck edge -> side -> bilge -> bottom -> port side -> port deck edge -> deck camber back
    prof = [(1.0, D + sheer), (1.0, -2.0), (1.0, keel + 2.2), (0.94, keel + 0.7), (0.8, keel + 0.08), (0.4, keel),
            (0.0, keel)]
    half = [(bx * px if px < 1.0 else bx, z) for px, z in prof]
    for x, z in half:
        pts.append((x, y, z))
    for x, z in reversed(half[:-1]):
        pts.append((-x, y, z))
    for cx, dz in ((-0.5, 0.18), (0.0, 0.28), (0.5, 0.18)):
        pts.append((bx * cx, y, D + sheer + dz))
    return pts


def freighter(name='Ship', loc=(0, 0, 0), y_range=(-L2, L2), lights=True, ragged=None, seed=4):
    """Build the laker (or the part with y in y_range, for the wreck). Returns the root empty (bow = +Y)."""
    rnd = random.Random(seed)
    root = Md.empty(name, loc)
    y0, y1 = y_range
    ys = sorted(set([y0, y1] + [v for v in
                    [-L2, -110.5, -109.5, -108, -106, -104, -102, -99, -96, -90, -80, -60, -30, 0, 30, 60, 80, 88,
                     91, 94, 97, 100, 102.5, 105, 107, 108.5, 109.8, 110.6, L2] if y0 < v < y1]))
    rings = []
    for y in ys:
        w = _half_breadth(y)
        keel = KEEL + (2.5 * ((y - (L2 - 12)) / 12.0) ** 2 if y > L2 - 12 else 0.0)
        r = _ring(y, w, _sheer(y), keel)
        if ragged and ((ragged == 'aft' and y == y0) or (ragged == 'fwd' and y == y1)):
            r = [(x + rnd.uniform(-0.4, 0.4), yy + rnd.uniform(-2.5, 2.5), z + rnd.uniform(-0.6, 0.6)) for x, yy, z in r]
        rings.append(r)
    v, f = Md.loft(rings, cap_start=(ragged != 'aft' and y0 <= -L2 + 0.01), cap_end=(ragged != 'fwd' and y1 >= L2 - 0.01))
    hull = Md.mesh_obj(name + '_Hull', v, f, parent=root, smooth=False, mats=(hull_mat(),))
    if ragged:
        so = hull.modifiers.new('Sol', 'SOLIDIFY')
        so.thickness = 0.35
    wm = white_mat()
    dark = M.principled('FitzDark', base=(0.03, 0.03, 0.032), rough=0.4, coat=0.2)
    hatch_m = M.principled('FitzHatch', base=(0.13, 0.05, 0.035), rough=0.55, grime=0.5, rough_noise=0.15,
                           bump=0.15, bump_scale=8)
    win_m = M.emission('FitzWindows', (1.0, 0.72, 0.42), 9.0)
    parts = []

    def bx(nm, c, s, m, bev=0.08):
        if not (y0 <= c[1] <= y1):
            return None
        o = Wd.box(name + nm, c, s)
        o.parent = root
        o.data.materials.append(m)
        if bev:
            bv = o.modifiers.new('Bev', 'BEVEL')
            bv.width = bev
            bv.segments = 2
        parts.append(o)
        return o

    # 21 hatch covers + coaming
    for i in range(21):
        yc = -80 + i * 8.0
        bx('_Coam%d' % i, (0, yc, D + 0.45), (17.0, 4.2, 0.7), hatch_m, 0.05)
        bx('_Hatch%d' % i, (0, yc, D + 0.95), (16.2, 3.6, 0.35), hatch_m, 0.12)
    # forward house (forecastle + texas deck + pilothouse) on the raised bow
    zf = D + _sheer(98)
    bx('_FHouse1', (0, 97.5, zf + 1.4), (19.0, 11.0, 2.8), wm)
    bx('_FHouse2', (0, 98.5, zf + 4.1), (16.0, 8.5, 2.6), wm)
    bx('_Pilot', (0, 99.5, zf + 6.6), (15.0, 6.0, 2.4), wm)
    bx('_PilotWin', (0, 102.55, zf + 6.9), (13.2, 0.12, 0.9), win_m, 0)
    bx('_FWin1', (0, 103.05, zf + 1.6), (14.0, 0.12, 0.5), win_m, 0)
    for s in (-1, 1):
        bx('_SWin%d' % s, (s * 7.55, 99.5, zf + 6.9), (0.12, 4.5, 0.8), win_m, 0)
        bx('_SWin2%d' % s, (s * 8.05, 98.5, zf + 4.2), (0.12, 6.5, 0.45), win_m, 0)
    bx('_FMast', (0, 98.0, zf + 11.5), (0.35, 0.35, 7.5), dark, 0)
    bx('_Radar1', (0, 98.0, zf + 9.4), (3.6, 0.35, 0.22), dark, 0)
    # aft engine house + stack
    za = D + _sheer(-100)
    bx('_AHouse1', (0, -99.0, za + 1.6), (21.5, 18.0, 3.2), wm)
    bx('_AHouse2', (0, -101.0, za + 4.6), (17.0, 12.0, 2.8), wm)
    bx('_AWin1', (0, -89.95, za + 1.8), (18.0, 0.12, 0.5), win_m, 0)
    for s in (-1, 1):
        bx('_AWinS%d' % s, (s * 10.8, -99.0, za + 1.8), (0.12, 14.0, 0.5), win_m, 0)
        bx('_AWinS2%d' % s, (s * 8.55, -101.0, za + 4.7), (0.12, 9.0, 0.45), win_m, 0)
    if y0 <= -103 <= y1:
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=2.3, depth=7.5, location=(0, -103.0, za + 9.4))
        st = bpy.context.active_object
        st.name = name + '_Stack'
        st.parent = root
        st.location = (0, -103.0, za + 9.4)
        st.data.materials.append(dark)
        bpy.ops.object.shade_smooth()
        parts.append(st)
    bx('_AMast', (0, -94.0, za + 9.0), (0.3, 0.3, 6.0), dark, 0)
    # deck rails (thin dark bars along both sides)
    for s in (-1, 1):
        if y1 > -88 and y0 < 90:
            a, b2 = max(y0, -88), min(y1, 90)
            bx('_Rail%d' % s, (s * (B - 0.3), (a + b2) / 2, D + 1.0), (0.08, b2 - a, 0.08), dark, 0)
    # deck tunnel vents
    for i in range(6):
        bx('_Vent%d' % i, (B - 1.6, -70 + i * 28.0, D + 0.7), (0.6, 0.6, 1.4), dark, 0.05)
    if lights:
        for k, yl in enumerate([-84, -56, -28, 0, 28, 56, 84]):
            if y0 <= yl <= y1:
                p = Wd.point(name + '_DeckL%d' % k, (0, yl, D + 7.0), color=(1.0, 0.78, 0.5), power=2500, radius=0.25)
                p.parent = root
                p.location = (0, yl, D + 7.0)
        for nm, c, col, pw in (('Mast', (0, 98.0, zf + 15.4), (1, 0.95, 0.85), 400), ('Port', (-8.2, 100.5, zf + 4.4), (1, 0.08, 0.05), 150),
                               ('Stbd', (8.2, 100.5, zf + 4.4), (0.1, 1.0, 0.3), 150), ('AftM', (0, -94.0, za + 12.2), (1, 0.95, 0.85), 300)):
            if y0 <= c[1] <= y1:
                Md.nav_light(name + '_' + nm, c, col, root, power=pw, strength=30, radius=0.25)
        for nm, c in (('PilotL', (0, 101.0, zf + 6.6)), ('AftL', (0, -95.0, za + 2.0))):
            if y0 <= c[1] <= y1:
                p = Wd.point(name + '_' + nm, c, color=(1.0, 0.7, 0.4), power=600, radius=0.5)
                p.parent = root
                p.location = c
    return root


def ship_motion(root, NF, speed=0.12, y0=0.0, roll_amp=2.6, pitch_amp=1.0, list_deg=(3.0, 3.0), heave=0.5,
                period_s=7.5, z0=0.0, step=3):
    """Slow forward motion + smooth roll/pitch/heave sines + a (possibly growing) starboard list. Never jitter."""
    root.rotation_mode = 'XYZ'
    for f in list(range(0, NF + step, step)):
        t = f / 30.0
        w = 2 * math.pi / period_s
        lst = list_deg[0] + (list_deg[1] - list_deg[0]) * min(1.0, f / max(1, NF))
        root.location = (0, y0 + speed * f, z0 + heave * math.sin(w * t * 0.8 + 0.7))
        root.rotation_euler = (math.radians(pitch_amp * math.sin(w * t * 0.9 + 1.3)),
                               math.radians(lst + roll_amp * math.sin(w * t)), 0)
        root.keyframe_insert('location', frame=f)
        root.keyframe_insert('rotation_euler', frame=f)
    M.set_interp(root, 'BEZIER')


def storm_lake(NF, wave_scale=2.4, wind=22.0, choppy=1.3, half=2500.0, center=(0, 0, 0), fog=0.0016, moon=0.9,
               moon_dir=(0.2, 0.9, 0.18), sky=0.10, crest=1.6, crest1=3.4):
    """November night storm on Lake Superior: low dark overcast sky, dim cold moonlight IN FRONT of the camera through
    the overcast, big FFT waves with crest foam, storm haze around the ship."""
    Wd.hdri('kloppenheim_02_puresky', strength=sky, bg_strength=sky * 0.9, rot=200, tint=(0.55, 0.62, 0.75))
    Wd.moon(direction=moon_dir, strength=moon, color=(0.6, 0.7, 0.9), angle=3.0)
    o = Wd.ocean_wide(center=center, half=half, inner=320.0, d0=0.9, spatial=160, res=11, wave_scale=wave_scale,
                      choppy=choppy, time_frames=NF, wind=wind)
    o.data.materials.clear()
    o.data.materials.append(water_mat(crest, crest1))
    Wd.sea_plane(size=60000, z=-0.6, color=(0.006, 0.012, 0.014), rough=0.3, frames=NF)
    if fog:
        Wd.fog(center=(center[0], center[1], 40), size=(1600, 1600, 120), density=fog, color=(0.6, 0.66, 0.75),
               anisotropy=0.35, noise=0.5, noise_scale=0.004)
    return o
