"""taos-hum shared helpers (REAL3D, 2026-11-05). Smooth eased camera only. Objects and places, one sleeping silhouette, no gore."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rc import *
from kit import cine as CN

ADOBE = (0.62, 0.45, 0.31)


def cyl(name, p0, p1, r, mat, seg=20):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    for p in o.data.polygons: p.use_smooth = True
    M.assign(o, mat)
    return o


def sphere(name, loc, r, mat, scale=(1, 1, 1), seg=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=r, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    for p in o.data.polygons: p.use_smooth = True
    M.assign(o, mat)
    return o


def adobe_mat(tint=ADOBE, scale=1.2):
    return M.texture_set('AdobeM', 'rough_concrete', scale=scale, tint=tint, box=True)


def glow(name, color=(1.0, 0.66, 0.34), strength=6.0):
    m = M.emission(name, color=color, strength=strength)
    return M.no_light(m)


def ridge(name, w=900, h=240, z0=0.0, amp=90.0, seed=3, loc=(0, 0, 0), rot=0.0, color=(0.018, 0.02, 0.028)):
    rnd = random.Random(seed)
    ph = [rnd.uniform(0, 6.28) for _ in range(5)]
    def zf(u, v):
        e = math.sin(math.pi * v) ** 0.7
        s = 0.5 * math.sin(u * 7 + ph[0]) + 0.3 * math.sin(u * 17 + ph[1]) + 0.2 * math.sin(u * 41 + ph[2])
        return z0 + amp * e * (0.55 + 0.45 * s) * (0.2 + 0.8 * v)
    o = grid(name, w, h, 120, 12, zf)
    o.location = loc
    o.rotation_euler = (0, 0, rot)
    M.assign(o, M.principled(name + 'M', base=color, rough=0.95))
    return o


def glass_of_water(name, loc, frames, pulse_every=26, r=0.036, h=0.11, ring_from=6):
    """Tumbler (thin shell) with water and expanding surface rings (the 'hum' pulse)."""
    x, y, z = loc
    gm = M.principled(name + 'Gl', base=(0.9, 0.95, 1.0), rough=0.03, alpha=0.18, spec=0.9)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=r * 0.9, radius2=r * 1.08, depth=h, end_fill_type='NOTHING', location=(x, y, z + h / 2))
    sh = bpy.context.active_object; sh.name = name + 'Shell'
    for p in sh.data.polygons: p.use_smooth = True
    M.assign(sh, gm)
    wm = M.principled(name + 'Wa', base=(0.55, 0.65, 0.7), rough=0.03, transmission=0.9, ior=1.33, spec=0.8)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=r * 0.88, depth=h * 0.72, location=(x, y, z + h * 0.38))
    wa = bpy.context.active_object; wa.name = name + 'Water'
    for p in wa.data.polygons: p.use_smooth = True
    M.assign(wa, wm)
    topz = z + h * 0.38 + h * 0.36
    rm = M.principled(name + 'Ring', base=(0.9, 0.95, 1.0), rough=0.05, spec=1.0, emission=(0.7, 0.8, 1.0), emit=0.25)
    k = 0
    f0 = ring_from
    while f0 < frames:
        bpy.ops.mesh.primitive_torus_add(major_radius=r * 0.85, minor_radius=r * 0.012, major_segments=40, minor_segments=6, location=(x, y, topz))
        rg = bpy.context.active_object; rg.name = '%sRing%d' % (name, k); M.assign(rg, rm)
        rg.visible_shadow = False
        for f, s in ((max(0, f0 - 1), 0.001), (f0, 0.12), (f0 + pulse_every - 2, 1.0), (f0 + pulse_every - 1, 0.001)):
            rg.scale = (s, s, s); rg.keyframe_insert('scale', frame=f)
        f0 += pulse_every
        k += 1
    return wa


def night_sky(moon_dir=(-0.5, 0.5, 0.42), moon=0.9, hdri='rogland_clear_night', hs=0.14):
    Wd.hdri(hdri, strength=hs, bg_strength=1.0)
    Wd.moon(direction=moon_dir, strength=moon, color=(0.62, 0.72, 1.0), angle=0.7)


def house(x0=0.0, y0=0.0, win_glow=1.0):
    """Single-storey adobe: main block 8 x 5 x 2.9 (front face toward -Y), stepped side block, parapet, vigas, deep window, door."""
    am = adobe_mat()
    dm = M.principled('DoorM', base=(0.1, 0.07, 0.05), rough=0.7)
    wood = M.texture_set('VigaM', 'wood_table_worn', scale=2.0, tint=(0.3, 0.22, 0.15), box=True)
    body = Wd.box('Body', (x0, y0, 1.45), (8.0, 5.0, 2.9)); M.assign(body, am)
    par = Wd.box('Parapet', (x0, y0, 3.05), (8.2, 5.2, 0.3)); M.assign(par, am)
    side = Wd.box('SideBlock', (x0 + 5.0, y0 + 0.6, 1.1), (3.6, 3.6, 2.2)); M.assign(side, am)
    spar = Wd.box('SideParapet', (x0 + 5.0, y0 + 0.6, 2.3), (3.8, 3.8, 0.25)); M.assign(spar, am)
    # vigas (beam ends) poking out of the front face under the parapet
    for i in range(9):
        xx = x0 - 3.6 + i * 0.9
        cyl('Viga%d' % i, (xx, y0 - 2.4, 2.75), (xx, y0 - 2.95, 2.75), 0.09, wood, seg=12)
    # window in the front face (deep sill) at x0+1.6
    wx, wy = x0 + 1.6, y0 - 2.5
    fr = Wd.box('WinFrame', (wx, wy - 0.02, 1.55), (1.0, 0.16, 1.0)); M.assign(fr, M.principled('FrameM', base=(0.08, 0.06, 0.05), rough=0.6))
    pane = Wd.box('WinPane', (wx, wy + 0.04, 1.55), (0.82, 0.04, 0.82)); M.assign(pane, glow('WinGlow', strength=5.5 * win_glow))
    sill = Wd.box('Sill', (wx, wy - 0.18, 1.02), (1.3, 0.38, 0.1)); M.assign(sill, am)
    Wd.point('WinLight', (wx, wy - 1.2, 1.4), color=(1.0, 0.62, 0.3), power=70 * win_glow, radius=0.3)
    door = Wd.box('Door', (x0 - 1.6, y0 - 2.52, 1.0), (1.0, 0.1, 2.0)); M.assign(door, dm)
    step = Wd.box('Step', (x0 - 1.6, y0 - 2.9, 0.06), (1.4, 0.6, 0.12)); M.assign(step, am)
    return (wx, wy)


def hum_rings(name, center, frames, z=0.02, every=34, rmax=14.0, normal_up=True):
    """Very faint ground-plane rings that expand from a point (visual 'hum'); optional."""
    rm = M.principled(name + 'M', base=(0.6, 0.7, 0.9), rough=0.4, emission=(0.45, 0.6, 1.0), emit=0.12, alpha=0.25)
    k = 0
    f0 = 0
    while f0 < frames:
        bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.03, major_segments=64, minor_segments=6, location=(center[0], center[1], z))
        rg = bpy.context.active_object; rg.name = '%s%d' % (name, k); M.assign(rg, rm)
        rg.visible_shadow = False
        for f, s in ((max(0, f0 - 1), 0.01), (f0, 0.5), (f0 + 60, rmax)):
            rg.scale = (s, s, s * 0.2); rg.keyframe_insert('scale', frame=f)
        f0 += every
        k += 1


def bedroom(frames, moon=2.2):
    """Night bedroom: adobe walls, window in left wall with moon shaft, bed with blanket-covered sleeper silhouette, nightstand with glass of water + clock."""
    am = adobe_mat((0.5, 0.4, 0.32), 1.5)
    floor = Wd.box('Floor', (0, 0, -0.05), (5.4, 4.9, 0.1)); M.assign(floor, M.texture_set('FloorM', 'wood_table_worn', scale=1.6, tint=(0.34, 0.25, 0.18), box=True))
    ceil = Wd.box('Ceil', (0, 0, 2.75), (5.4, 4.9, 0.1)); M.assign(ceil, am)
    for nm, c, s in (('WallB', (0, 2.3, 1.35), (5.4, 0.1, 2.7)), ('WallF', (0, -2.3, 1.35), (5.4, 0.1, 2.7)), ('WallR', (2.55, 0, 1.35), (0.1, 4.9, 2.7))):
        o = Wd.box(nm, c, s); M.assign(o, am)
    # left wall with window opening y 0.2..1.6, z 0.95..2.05
    for nm, c, s in (('WLa', (-2.55, -1.05, 1.35), (0.1, 2.5, 2.7)), ('WLb', (-2.55, 1.95, 1.35), (0.1, 0.7, 2.7)),
                     ('WLc', (-2.55, 0.9, 0.475), (0.1, 1.4, 0.95)), ('WLd', (-2.55, 0.9, 2.375), (0.1, 1.4, 0.65))):
        o = Wd.box(nm, c, s); M.assign(o, am)
    Wd.area('MoonWin', (-4.2, 0.9, 2.6), (0.6, 1.2, 0.2), color=(0.6, 0.72, 1.0), power=3200 * moon / 2.2, size=1.4)
    # bed
    bed = Wd.box('BedFrame', (0.9, 1.25, 0.22), (1.6, 2.1, 0.44)); M.assign(bed, M.principled('BedM', base=(0.12, 0.08, 0.06), rough=0.6))
    mat = Wd.box('Mattress', (0.9, 1.25, 0.5), (1.5, 2.0, 0.14)); M.assign(mat, M.principled('SheetM', base=(0.55, 0.55, 0.58), rough=0.9))
    hb = Wd.box('Headboard', (0.9, 2.26, 0.7), (1.7, 0.08, 1.0)); M.assign(hb, M.principled('HeadM', base=(0.1, 0.07, 0.05), rough=0.6))
    pil = sphere('Pillow', (0.9, 2.0, 0.64), 0.26, M.principled('PillowM', base=(0.6, 0.6, 0.64), rough=0.9), scale=(1.1, 0.8, 0.32))
    head = sphere('Head', (0.9, 1.93, 0.72), 0.095, M.principled('HeadSkin', base=(0.22, 0.14, 0.1), rough=0.8))
    def zf(u, v):
        d = abs(u - 0.5)
        drape = 0.2 * max(0.0, (d - 0.38) / 0.12) ** 1.5
        body = 0.1 * math.exp(-(d / 0.2) ** 2) * min(1.0, v * 3.0)
        shoulder = 0.07 * math.exp(-(d / 0.26) ** 2) * math.exp(-((v - 0.82) / 0.1) ** 2)
        return 0.58 + body + shoulder - drape
    bl = grid('Blanket', 1.5, 1.45, 36, 36, zf)
    bl.location = (0.9, 0.82, 0.0)
    M.assign(bl, M.principled('BlanketM', base=(0.36, 0.2, 0.17), rough=0.85, sss=0.0, bump=0.2))
    for f in range(0, frames, 6):   # slow breathing
        s = 1.0 + 0.012 * math.sin(f / 30.0 * 2 * math.pi * 0.25)
        bl.scale = (1, 1, s); bl.keyframe_insert('scale', frame=f)
    # nightstand + glass + clock
    ns = Wd.box('NightStand', (-0.35, 2.02, 0.28), (0.5, 0.42, 0.56)); M.assign(ns, M.principled('NSM', base=(0.14, 0.1, 0.07), rough=0.55))
    glass_of_water('Gl', (-0.42, 1.98, 0.56), frames, r=0.04, h=0.12)
    ck = Wd.box('Clock', (-0.22, 2.0, 0.59), (0.13, 0.05, 0.06)); M.assign(ck, M.principled('ClockM', base=(0.03, 0.03, 0.03), rough=0.5))
    cf = Wd.box('ClockFace', (-0.22, 1.972, 0.59), (0.1, 0.004, 0.036)); M.assign(cf, glow('ClockGlow', color=(1.0, 0.1, 0.06), strength=4.0))
    Wd.point('ClockLight', (-0.22, 1.85, 0.62), color=(1.0, 0.15, 0.08), power=0.8, radius=0.05)
    # faint ambient bounce so shadows are not dead black
    Wd.point('Bounce', (0.4, 0.2, 2.3), color=(0.55, 0.65, 1.0), power=14, radius=0.5)
