"""mh370-seven-handshakes-2014 shared helpers (REAL3D + CINE LOOK v2 lighting/finish, 2026-11-05, subagent mh370-s2s3).
User rule 2026-11-05 09:53: 14-18 shots, mostly WIDE (24-35 mm establishing), close-ups only as accents.
So wide shots use the kit Cam directly (cine.shot clamps lenses to 50-85 mm); the CINE v2 parts used are
setup (AgX MHC, OIDN, motion blur), HDRI-sun alignment, low key sun, bounded haze, auto-exposure + exposure gate.
Samples kept affordable (24 spp, 6 bounces, 8 transparent bounces, vol steps <= 48).
Sensitivity: no passengers, cabin interiors, faces, crash imagery; the aircraft never meets the water.
Livery generic (white top / grey belly / dark blue cheatline), no airline logo.
Camera: smooth eased dolly / push / orbit / crane only (kit cruise ease). NO shake, kicks or handheld."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import bpy, bmesh
from kit import core, camera as C, world as Wd, models as Md, mat as M, presets as P, interiors as I
from kit import cine as CN
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))


def arg(a, key, default=None, cast=str):
    if key in a.extra:
        return cast(a.extra[a.extra.index(key) + 1])
    return default


def look(sc, samples=24, vol=True, glare=0.35, glare_thr=1.0, vignette=0.24, sat=0.95, lift=(0.99, 1.0, 1.03),
         gain=(1.03, 1.0, 0.97)):
    """CINE v2 setup at an affordable sample/bounce budget."""
    CN.setup(sc, samples=samples, adaptive=0.03, vol=vol, vol_step=4.0, glare=glare, glare_thr=glare_thr,
             vignette=vignette, sat=sat, lift=lift, gain=gain)
    cy = sc.cycles
    cy.max_bounces = 6
    cy.diffuse_bounces = 3
    cy.glossy_bounces = 3
    cy.transmission_bounces = 4
    cy.transparent_max_bounces = 8
    cy.sample_clamp_indirect = 6.0
    try:
        cy.volume_max_steps = 48 if vol else 16
    except Exception:
        pass
    return sc


def go(cam, NF, a, sc, meter=None, target=0.24):
    return CN.render(cam, NF, a, sc, meter_frame=meter, target=target)


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


# ---------------------------------------------------------------- materials
def glow_mat(name, color=(0.55, 0.9, 1.0), strength=6.0):
    """Emission mixed with Transparent; animate nodes['Mix'].inputs[0] (0 = invisible, 1 = full glow). No light."""
    m, nb, b, out = M.new(name)
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    tr = nb.n('ShaderNodeBsdfTransparent')
    em = nb.n('ShaderNodeEmission', Strength=strength)
    em.inputs['Color'].default_value = (*color, 1)
    mx = nb.n('ShaderNodeMixShader')
    mx.name = 'Mix'
    nb.l(tr, 'BSDF', mx, 1)
    nb.l(em, 'Emission', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    mx.inputs[0].default_value = 1.0
    return m


def key_fac(m, keys):
    s = m.node_tree.nodes['Mix'].inputs[0]
    for f, v in keys:
        s.default_value = v
        s.keyframe_insert('default_value', frame=f)


def key_strength(m, keys):
    e = [n for n in m.node_tree.nodes if n.bl_idname == 'ShaderNodeEmission'][0]
    for f, v in keys:
        e.inputs['Strength'].default_value = v
        e.inputs['Strength'].keyframe_insert('default_value', frame=f)


# ---------------------------------------------------------------- geometry
def ring_mesh(name, r=1.0, w=0.02, n=128):
    """Flat annulus in XY, inner r-w/2 outer r+w/2."""
    vs, fs = [], []
    for k in range(n):
        t = 2 * math.pi * k / n
        vs += [((r - w / 2) * math.cos(t), (r - w / 2) * math.sin(t), 0), ((r + w / 2) * math.cos(t), (r + w / 2) * math.sin(t), 0)]
    for k in range(n):
        a, b = 2 * k, 2 * ((k + 1) % n)
        fs.append((a, b, b + 1, a + 1))
    return Md.mesh_obj(name, vs, fs, smooth=False)


def curve_poly(name, pts, bevel=0.01, mat=None, cyclic=False):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = bevel
    cu.bevel_resolution = 2
    sp = cu.splines.new('POLY')
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (*q, 1)
    sp.use_cyclic_u = cyclic
    o = link(bpy.data.objects.new(name, cu))
    if mat:
        o.data.materials.append(mat)
    return o


def grow_curve(o, keys):
    cu = o.data
    cu.bevel_factor_mapping_end = 'SPLINE'
    for f, v in keys:
        cu.bevel_factor_end = v
        cu.keyframe_insert('bevel_factor_end', frame=f)


def text_obj(name, body, loc, size=0.1, mat=None, rot=(0, 0, 0), align='LEFT', extrude=0.0):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = body
    cu.size = size
    cu.align_x = align
    cu.extrude = extrude
    o = link(bpy.data.objects.new(name, cu))
    o.location = loc
    o.rotation_euler = rot
    if mat:
        o.data.materials.append(mat)
    return o


def cyl(name, p0, p1, r, mat, seg=20):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.active_object
    o.name = name
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    for p in o.data.polygons:
        p.use_smooth = True
    M.assign(o, mat)
    return o


def boxm(name, c, s, mat, bev=0.0):
    o = Wd.box(name, c, s)
    o.data.materials.append(mat)
    if bev:
        I.bevel(o, bev)
    return o


# ---------------------------------------------------------------- aircraft: generic wide-body twin (777-like silhouette)
def widebody(name='Jet', f1=300, scale=1.95, cabin_glow=1.6, lights=True):
    """Kit airliner re-shaped into a generic long-haul twin: rear engines + T-tail removed, two big underwing
    turbofans and a low tailplane added; whole aircraft scaled to ~63 m. Nose +Y. Generic livery, no logo."""
    root = Md.airliner(name, f1=f1, cabin_glow=cabin_glow, livery=(0.05, 0.10, 0.30), lights=lights)
    for o in list(root.children_recursive):
        if any(k in o.name for k in ('_Nac', '_Disc', '_Pylon', '_Stab')):
            bpy.data.objects.remove(o, do_unlink=True)
    pm = bpy.data.materials.get('AirlinerPaint')
    nac = M.principled('NacelleWB', base=(0.62, 0.63, 0.65), rough=0.3, metal=0.85, rough_noise=0.08, grime=0.2)
    dark = M.principled('IntakeWB', base=(0.015, 0.015, 0.015), rough=0.5, metal=0.6)
    for s in (1, -1):
        cx, cy, cz = s * 5.4, 6.4, -1.75
        rings, Kn = [], 28
        for j in range(17):
            u = j / 16
            r = 0.95 + 0.12 * math.sin(min(1, u / 0.25) * math.pi / 2) - 0.38 * max(0, (u - 0.62) / 0.38) ** 1.4
            if j == 0:
                r = 0.88
            rings.append([(cx + r * math.cos(2 * math.pi * k / Kn), cy - u * 4.6, cz + r * math.sin(2 * math.pi * k / Kn)) for k in range(Kn)])
        v, f = Md.loft(rings)
        o = Md.mesh_obj(name + '_WBNac%d' % s, v, f, parent=root, mats=(nac,))
        Md.subsurf(o, 1, 1)
        pts = [(cx + 0.86 * math.cos(2 * math.pi * k / Kn), cy - 0.04, cz + 0.86 * math.sin(2 * math.pi * k / Kn)) for k in range(Kn)]
        Md.mesh_obj(name + '_WBIntake%d' % s, pts, [tuple(range(Kn))], parent=root, mats=(dark,))
        pv = [(cx - 0.12, cy - 0.6, cz + 0.6), (cx + 0.12, cy - 0.6, cz + 0.6), (cx + 0.12, cy - 3.6, cz + 0.6), (cx - 0.12, cy - 3.6, cz + 0.6),
              (cx - 0.12, cy - 0.6, cz + 1.25), (cx + 0.12, cy - 0.6, cz + 1.25), (cx + 0.12, cy - 3.6, cz + 1.2), (cx - 0.12, cy - 3.6, cz + 1.2)]
        pf = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
        Md.mesh_obj(name + '_WBPylon%d' % s, pv, pf, parent=root, smooth=False, mats=(nac,))
        Md.wing(name + '_WBStab%d' % s, (s * 0.7, -12.6, 0.35), 6.2, 3.4, 1.3, 32, 6, 0.10, 0.09, side=s, parent=root,
                mats=(pm,))
    root.scale = (scale, scale, scale)
    return root


def fly_line(obj, NF, p0, v, step=1):
    """Constant-velocity flight: p0 + v*f (v = m per frame vector)."""
    p0, v = Vector(p0), Vector(v)
    for f in range(0, NF + 1, step):
        obj.location = p0 + v * f
        obj.keyframe_insert('location', frame=f)
    if obj.animation_data and obj.animation_data.action:
        for fc in obj.animation_data.action.fcurves:
            for k in fc.keyframe_points:
                k.interpolation = 'LINEAR'


def night_cruise(NF, moon_dir=(-0.3, 0.9, 0.3), moon=2.4, coverage=0.5):
    Wd.hdri('kloppenheim_02_puresky', strength=0.4, bg_strength=0.6, rot=140, tint=(0.75, 0.85, 1.1))
    Wd.moon(direction=moon_dir, strength=moon, color=(0.62, 0.72, 1.0), angle=0.55)
    Wd.clouds(center=(0, 1500, -900), size=(18000, 18000, 360), density=0.05, scale=0.0011, coverage=coverage,
              detail=4, color=(0.9, 0.93, 1.0), anisotropy=0.4, evolve=0.05, frames=NF, sharp=0.2)
    Wd.cloud_deck_far(z=-800, hole=6800)
    Wd.sea_plane(size=80000, z=-3000, color=(0.004, 0.007, 0.012), rough=0.75, wave=0.1, frames=NF)


# ---------------------------------------------------------------- control rooms (modern flat displays showing a radar picture)
def console_row(prefix, n, x0, dx, y, ppis, mats, chairs=True, yaw=0.0, lit=None, scale_screen=1.0):
    """n workstations along X facing -Y: desk + two flat screens (radar picture) + keyboard + office chair."""
    desk_m, frame_m, chair_m, key_m = mats
    for i in range(n):
        x = x0 + i * dx
        boxm('%sDesk%d' % (prefix, i), (x, y, 0.37), (1.5, 0.8, 0.74), desk_m, 0.01)
        boxm('%sTop%d' % (prefix, i), (x, y - 0.05, 0.755), (1.6, 0.95, 0.03), frame_m, 0.005)
        for j, sx in enumerate((-0.36, 0.36)):
            cx, cy, cz = x + sx, y + 0.18, 1.12
            boxm('%sMon%d_%d' % (prefix, i, j), (cx, cy + 0.03, cz), (0.62 * scale_screen, 0.04, 0.46 * scale_screen), frame_m, 0.006)
            ppi = ppis[(i * 2 + j) % len(ppis)] if (lit is None or i == lit or j == 0) else ppis[-1]
            sw, sh = 0.56 * scale_screen, 0.40 * scale_screen
            me = bpy.data.meshes.new('%sScr%d_%d' % (prefix, i, j))
            # square UV window centred on the screen (radar circle fits the height; corners dark)
            vs = [(-sw / 2, 0, -sh / 2), (sw / 2, 0, -sh / 2), (sw / 2, 0, sh / 2), (-sw / 2, 0, sh / 2)]
            me.from_pydata(vs, [], [(0, 1, 2, 3)])
            uv = me.uv_layers.new()
            k = sw / sh
            for lp, (u, v) in zip(me.loops, ((0.5 - k / 2, 0), (0.5 + k / 2, 0), (0.5 + k / 2, 1), (0.5 - k / 2, 1))):
                uv.data[lp.index].uv = (u, v)
            o = link(bpy.data.objects.new(me.name, me))
            o.location = (cx, cy, cz)
            o.rotation_euler = (math.radians(-8), 0, 0)
            o.data.materials.append(ppi)
            stand = boxm('%sStand%d_%d' % (prefix, i, j), (cx, cy + 0.06, 0.86), (0.05, 0.05, 0.22), frame_m)
        boxm('%sKey%d' % (prefix, i), (x, y - 0.25, 0.78), (0.46, 0.15, 0.02), key_m, 0.003)
        if chairs:
            office_chair('%sChair%d' % (prefix, i), (x + random.Random(i).uniform(-0.2, 0.2), y - 0.85, 0),
                         yaw=random.Random(i + 7).uniform(-25, 25), mat=chair_m)


def office_chair(name, loc, yaw=0.0, mat=None):
    x, y, z = loc
    root = Md.empty(name, loc)
    parts = []
    parts.append(boxm(name + 'Seat', (0, 0, 0.47), (0.5, 0.48, 0.08), mat, 0.03))
    b = boxm(name + 'Back', (0, -0.24, 0.82), (0.46, 0.06, 0.55), mat, 0.03)
    b.rotation_euler = (math.radians(-8), 0, 0)
    parts.append(b)
    pole_m = bpy.data.materials.get('ChairPole') or M.principled('ChairPole', base=(0.25, 0.25, 0.26), rough=0.3, metal=0.9)
    parts.append(cyl(name + 'Pole', (0, 0, 0.08), (0, 0, 0.45), 0.025, pole_m, 12))
    for k in range(5):
        t = 2 * math.pi * k / 5
        parts.append(cyl(name + 'Leg%d' % k, (0, 0, 0.07), (0.3 * math.cos(t), 0.3 * math.sin(t), 0.05), 0.018, pole_m, 8))
    for p in parts:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def control_room(NF, blips_hero=(), cool=False, size=(16, 14, 3.2), rows=3, per_row=5, hero_lit=True, seed=4,
                 haze=0.012, t0=0.0, hero_vis=None):
    """Night area-control / radar room. Hero workstation = row 0, index per_row//2 (screen centre at ~(0, 0.18, 1.12)).
    Returns the hero PPI material."""
    sx, sy, sz = size
    desk_m = M.principled('DeskM', base=(0.06, 0.065, 0.07), rough=0.5, metal=0.2, grime=0.3)
    frame_m = M.principled('FrameM', base=(0.012, 0.012, 0.014), rough=0.35, metal=0.4)
    chair_m = M.principled('ChairM', base=(0.03, 0.035, 0.045) if not cool else (0.03, 0.04, 0.05), rough=0.75, bump=0.2,
                           bump_scale=300)
    key_m = M.principled('KeyM', base=(0.02, 0.02, 0.02), rough=0.5)
    glow = 4.5
    hero = I.ppi_material('PPI_hero', frames=NF, blips=blips_hero, seed=seed, glow=glow, t0=t0)
    others = [I.ppi_material('PPI_o%d' % k, frames=NF, seed=seed + 1 + k, glow=3.0, t0=t0 + 0.9 * k,
                             blips=[((0.2 * k - 0.3, 0.4), (0.2 * k - 0.1, 0.2), 2.0)]) for k in range(3)]
    dim = I.ppi_material('PPI_dim', frames=NF, seed=seed + 9, glow=1.2, t0=t0 + 2.0)
    mid = per_row // 2
    for r in range(rows):
        y = r * 2.6
        lst = [hero] + others + [dim] if r == 0 else others + [dim]
        console_row('R%d' % r, per_row, -mid * 2.0, 2.0, y, lst if r else others + [dim],
                    (desk_m, frame_m, chair_m, key_m), lit=None)
    # hero screens: row 0 middle desk both monitors = hero picture
    for j in (0, 1):
        o = bpy.data.objects.get('R0Scr%d_%d' % (mid, j))
        if o:
            o.data.materials.clear()
            o.data.materials.append(hero)
    floor = M.texture_set('RoomFloor', 'concrete_floor_worn_001', scale=4.0, tint=(0.28, 0.28, 0.3))
    wall = M.principled('RoomWall', base=(0.05, 0.055, 0.06) if not cool else (0.04, 0.05, 0.06), rough=0.8, grime=0.25)
    ceil = M.principled('Ceil', base=(0.08, 0.08, 0.085), rough=0.9)
    yc = (rows - 1) * 1.3
    boxm('Floor', (0, yc, -0.02), (sx, sy, 0.04), floor)
    boxm('Ceiling', (0, yc, sz + 0.02), (sx, sy, 0.04), ceil)
    boxm('BackWall', (0, yc + sy / 2, sz / 2), (sx, 0.1, sz), wall)
    boxm('LWall', (-sx / 2, yc, sz / 2), (0.1, sy, sz), wall)
    boxm('RWall', (sx / 2, yc, sz / 2), (0.1, sy, sz), wall)
    boxm('FWall', (0, yc - sy / 2, sz / 2), (sx, 0.1, sz), wall)
    # ceiling panels (dimmed night lighting) - visible emitters, real light from soft areas
    pm = M.emission('PanelGlow', (0.75, 0.85, 1.0) if cool else (1.0, 0.93, 0.82), 0.6)
    for ix in range(-2, 3):
        for iy in range(rows + 1):
            boxm('Panel%d_%d' % (ix, iy), (ix * 3.0, iy * 2.6 - 1.3, sz - 0.01), (1.2, 0.6, 0.02), pm)
    for iy in range(rows):
        Wd.area('CeilA%d' % iy, (0, iy * 2.6 - 0.6, sz - 0.1), (0, iy * 2.6 - 0.6, 0), color=(0.7, 0.8, 1.0) if cool else (1.0, 0.9, 0.78),
                power=120 if cool else 90, size=4.0)
    # screen spill on the hero desk + a hooded lamp
    Wd.area('ScreenSpill', (0, -0.2, 1.15), (0, -1.2, 0.9), color=(0.35, 1.0, 0.5), power=8, size=0.8)
    if hero_lit:
        Wd.spot('HeroLamp', (0.7, -0.5, 2.6), (0.1, -0.1, 0.8), color=(1.0, 0.8, 0.55), power=220, size_deg=40, blend=0.6, radius=0.06)
    if haze > 0:
        Wd.fog(center=(0, yc, sz / 2), size=(sx - 0.4, sy - 0.4, sz - 0.1), density=haze, color=(0.85, 0.88, 0.9),
               anisotropy=0.45, noise=0.4, noise_scale=0.5)
    return hero


# ---------------------------------------------------------------- Earth (NASA Blue Marble texture, credit in desc)
EARTH_R = 100.0
GEO_R = EARTH_R * 42164.0 / 6371.0
SUB_LON = 64.5      # Inmarsat-3F1 (IOR) sub-satellite longitude, deg E


def lonlat(lon, lat, r=EARTH_R):
    lo, la = math.radians(lon), math.radians(lat)
    return Vector((r * math.cos(la) * math.cos(lo), r * math.cos(la) * math.sin(lo), r * math.sin(la)))


def earth(name='Earth', r=EARTH_R, atmo=True, night=0.0):
    """Sphere with equirect lookup from object coords (lon 0 at +X, east toward +Y), so lonlat() positions match."""
    bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80, radius=r, location=(0, 0, 0))
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth()
    m, nb, b, out = M.new('EarthM')
    tc = nb.n('ShaderNodeTexCoord')
    sep = nb.n('ShaderNodeSeparateXYZ')
    nb.l(tc, 'Object', sep, 'Vector')
    lon = nb.math('ARCTAN2', sep.outputs['Y'], sep.outputs['X'])
    u = nb.math('MULTIPLY_ADD', lon.outputs[0], vb=1 / (2 * math.pi))
    u.inputs[2].default_value = 0.5
    zr = nb.math('DIVIDE', sep.outputs['Z'], vb=r)
    lat = nb.math('ARCSINE', zr.outputs[0])
    v = nb.math('MULTIPLY_ADD', lat.outputs[0], vb=1 / math.pi)
    v.inputs[2].default_value = 0.5
    cmb = nb.n('ShaderNodeCombineXYZ')
    nb.l(u, 0, cmb, 'X')
    nb.l(v, 0, cmb, 'Y')
    tex = nb.n('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(os.path.join(HERE, 'earth_bluemarble_2048.jpg'), check_existing=True)
    tex.interpolation = 'Cubic'
    tex.extension = 'EXTEND'
    nb.l(cmb, 'Vector', tex, 'Vector')
    nb.l(tex, 'Color', b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.6
    b.inputs['Specular IOR Level'].default_value = 0.35
    o.data.materials.append(m)
    if atmo:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=r * 1.018, location=(0, 0, 0))
        a = bpy.context.active_object
        a.name = 'Atmo'
        bpy.ops.object.shade_smooth()
        am, nb2, b2, out2 = M.new('AtmoM')
        M.no_light(am)
        am.node_tree.nodes.remove(b2)
        lw = nb2.n('ShaderNodeLayerWeight', Blend=0.35)
        pw = nb2.math('POWER', lw.outputs['Facing'], vb=3.0)
        em = nb2.n('ShaderNodeEmission', Strength=1.6)
        em.inputs['Color'].default_value = (0.32, 0.55, 1.0, 1)
        tr = nb2.n('ShaderNodeBsdfTransparent')
        mx = nb2.n('ShaderNodeMixShader')
        nb2.l(pw, 0, mx, 'Fac')
        nb2.l(tr, 'BSDF', mx, 1)
        nb2.l(em, 'Emission', mx, 2)
        nb2.l(mx, 'Shader', out2, 'Surface')
        a.data.materials.append(am)
        a.visible_shadow = False
    return o


def small_circle(center_dir, rho_deg, r=EARTH_R * 1.004, n=256):
    P_ = Vector(center_dir).normalized()
    e1 = P_.cross(Vector((0, 0, 1)))
    if e1.length < 1e-6:
        e1 = Vector((1, 0, 0))
    e1.normalize()
    e2 = P_.cross(e1)
    rr = math.radians(rho_deg)
    pts = []
    for k in range(n + 1):
        t = 2 * math.pi * k / n
        d = P_ * math.cos(rr) + (e1 * math.cos(t) + e2 * math.sin(t)) * math.sin(rr)
        pts.append(tuple(d * r))
    return pts


# illustrative ping-ring radii (deg of arc from the sub-satellite point); arc 7 ~ 43.7 deg runs through the
# southern Indian Ocean (approx 38 S 88 E). Shape follows the ATSB/Inmarsat BTO arcs; the real figure is the inset.
RING_RHO = [32.6, 34.6, 36.2, 37.7, 39.4, 41.3, 43.7]


def satellite(name='Sat', loc=(0, 0, 0), scale=1.0):
    root = Md.empty(name, loc)
    gold = M.principled('MLI', base=(0.85, 0.58, 0.18), rough=0.22, metal=1.0, bump=0.35, bump_scale=18)
    cell = M.principled('Cells', base=(0.02, 0.03, 0.09), rough=0.18, metal=0.3, coat=0.8)
    alu = M.principled('SatAlu', base=(0.7, 0.72, 0.75), rough=0.3, metal=1.0)
    white = M.principled('SatWhite', base=(0.8, 0.8, 0.78), rough=0.45)
    parts = [boxm(name + 'Bus', (0, 0, 0), (1.6, 1.6, 2.2), gold, 0.03)]
    for s in (1, -1):
        parts.append(cyl(name + 'Boom%d' % s, (s * 0.8, 0, 0), (s * 1.6, 0, 0), 0.04, alu, 10))
        for k in range(3):
            pnl = boxm(name + 'Panel%d_%d' % (s, k), (s * (2.6 + k * 2.05), 0, 0), (2.0, 0.04, 1.9), cell, 0.0)
            parts.append(pnl)
            parts.append(boxm(name + 'PFrame%d_%d' % (s, k), (s * (2.6 + k * 2.05), 0.025, 0), (2.02, 0.01, 0.05), alu))
    # main reflector dish + feed
    bm = bmesh.new()
    rd, dp, n = 1.1, 0.35, 40
    verts = [bm.verts.new((0, 0, 0))]
    for k in range(n):
        t = 2 * math.pi * k / n
        verts.append(bm.verts.new((rd * math.cos(t), rd * math.sin(t), dp)))
    for k in range(n):
        bm.faces.new((verts[0], verts[1 + k], verts[1 + (k + 1) % n]))
    me = bpy.data.meshes.new(name + 'Dish')
    bm.to_mesh(me)
    bm.free()
    dish = link(bpy.data.objects.new(name + 'Dish', me))
    dish.data.materials.append(white)
    dish.location = (0, -0.9, -1.1)
    dish.rotation_euler = (math.radians(120), 0, 0)
    parts.append(dish)
    for p in parts:
        p.parent = root
    root.scale = (scale,) * 3
    return root


# ---------------------------------------------------------------- dawn ocean (southern Indian Ocean)
def dawn_world(sun_az=70.0, elev=7.0, strength=4.0, hdri_strength=0.9):
    CN.hdri_sun('qwantani_dawn_puresky', sun_az=sun_az, strength=hdri_strength)
    return CN.sun(elev=elev, az=sun_az, warmth='golden', strength=strength, check=False)


def swell_ocean(NF, half=4500.0, wave_scale=2.2, wind=16.0, choppy=0.9, color=(0.006, 0.014, 0.02), rough=0.08,
                center=(0, 0, 0)):
    Wd.sea_plane(size=240000, z=center[2] - 2.5 * wave_scale, color=color, rough=max(rough, 0.12), wave=0.15, frames=max(NF, 60))
    return Wd.ocean_wide(center=center, half=half, wave_scale=wave_scale, choppy=choppy, wind=wind, time_frames=max(NF, 60),
                         color=color, rough=rough)


def space_world(stars=1.0, seed=0.0):
    """Black space with a fine star field in every direction (no horizon glow)."""
    w = bpy.data.worlds.new('Space')
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nb = M.NB(nt)
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nb.n('ShaderNodeOutputWorld')
    tc = nb.n('ShaderNodeTexCoord')
    vo = nb.n('ShaderNodeTexVoronoi', Scale=900.0)
    nb.l(tc, 'Generated', vo, 'Vector')
    st = nb.math('POWER', nb.math('SUBTRACT', va=1.0, b=vo.outputs['Distance']).outputs[0], vb=70.0)
    nz = nb.n('ShaderNodeTexNoise', Scale=30.0)
    nb.l(tc, 'Generated', nz, 'Vector')
    st2 = nb.math('MULTIPLY', st.outputs[0], nz.outputs['Fac'])
    st3 = nb.math('MULTIPLY', st2.outputs[0], vb=stars * 2.5)
    bg = nb.n('ShaderNodeBackground')
    bg.inputs['Color'].default_value = (0.8, 0.85, 1.0, 1)
    nb.l(st3, 0, bg, 'Strength')
    lp = nb.n('ShaderNodeLightPath')
    mx = nb.n('ShaderNodeMixShader')
    blk = nb.n('ShaderNodeBackground', Strength=0.0)
    nb.l(lp, 'Is Camera Ray', mx, 'Fac')
    nb.l(blk, 'Background', mx, 1)
    nb.l(bg, 'Background', mx, 2)
    nb.l(mx, 'Shader', out, 'Surface')
    return w
