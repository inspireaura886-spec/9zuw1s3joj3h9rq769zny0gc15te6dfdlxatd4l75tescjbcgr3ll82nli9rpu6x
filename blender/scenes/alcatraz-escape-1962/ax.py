"""alcatraz-escape-1962 builders (REAL3D, CINE v2). Units: metres. No people / faces; decoy heads are generic plaster.
cell(): one prison cell, bars on the y=0 plane, interior y in 0..D, bed on +x side, head toward the back wall (+y)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

CW, CD, CH = 1.55, 2.7, 2.4      # cell width (x), depth (y), height (z)
_MATS = {}


def mats():
    if _MATS:
        return _MATS
    m = _MATS
    m['wall'] = M.texture_set('CellWall', 'rough_concrete', scale=2.0, tint=(0.30, 0.34, 0.32), box=True)
    m['floor'] = M.texture_set('CellFloor', 'concrete_floor_worn_001', scale=2.0, tint=(0.28, 0.28, 0.29), box=True)
    m['steel'] = M.principled('CellSteel', base=(0.07, 0.075, 0.08), rough=0.45, metal=0.85, grime=0.3, rough_noise=0.1)
    m['bar'] = M.principled('CellBar', base=(0.05, 0.052, 0.055), rough=0.38, metal=0.9, grime=0.25)
    m['mattress'] = M.principled('Mattress', base=(0.34, 0.33, 0.27), rough=0.9, bump=0.4, bump_scale=60)
    m['blanket'] = M.principled('Blanket', base=(0.15, 0.17, 0.14), rough=0.95, bump=0.7, bump_scale=90, grime=0.3)
    m['pillow'] = M.principled('Pillow', base=(0.55, 0.54, 0.5), rough=0.9, bump=0.3, bump_scale=70)
    m['plaster'] = M.principled('Plaster', base=(0.58, 0.42, 0.34), rough=0.55, sss=0.15, bump=0.12, bump_scale=140)
    m['hair'] = M.principled('RealHair', base=(0.045, 0.028, 0.018), rough=0.4, bump=1.0, bump_scale=900)
    m['wood'] = M.texture_set('CellWood', 'wood_table_worn', scale=1.0, tint=(0.35, 0.28, 0.2), box=True)
    m['tin'] = M.principled('Tin', base=(0.55, 0.56, 0.58), rough=0.3, metal=1.0)
    m['glow'] = M.emission('BulbGlow', (1.0, 0.8, 0.5), 18.0)
    m['tube'] = M.emission('TubeGlow', (0.9, 0.95, 1.0), 6.0)
    return m


def ell(name, loc, sc, mat, seg=28, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1.0, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = sc
    for p in o.data.polygons:
        p.use_smooth = True
    M.assign(o, mat)
    return o


def slab(name, pts, z0, h, mat):
    """Extruded polygon (x, y) list from z0 up by h."""
    n = len(pts)
    vs = [(x, y, z0) for x, y in pts] + [(x, y, z0 + h) for x, y in pts]
    fs = [tuple(range(n, 2 * n)), tuple(reversed(range(n)))]
    for i in range(n):
        j = (i + 1) % n
        fs.append((i, j, n + j, n + i))
    return Md.mesh_obj(name, vs, fs, smooth=False, mats=(mat,))


def cell(cx=0.0, tag='C', head=True, roof=True, vent=False, lamp_out=True, right_wall=True, bunk=True):
    """One cell. Returns dict of useful positions."""
    m = mats()
    x0, x1 = cx - CW / 2, cx + CW / 2
    boxm(tag + 'Floor', (cx, CD / 2, -0.03), (CW + 0.1, CD + 0.1, 0.06), m['floor'])
    if roof:
        boxm(tag + 'Ceil', (cx, CD / 2, CH + 0.03), (CW + 0.1, CD + 0.1, 0.06), m['wall'])
    boxm(tag + 'WallL', (x0 - 0.05, CD / 2, CH / 2), (0.1, CD + 0.1, CH), m['wall'])
    if right_wall:
        boxm(tag + 'WallR', (x1 + 0.05, CD / 2, CH / 2), (0.1, CD + 0.1, CH), m['wall'])
    if not vent:
        boxm(tag + 'WallB', (cx, CD + 0.05, CH / 2), (CW + 0.1, 0.1, CH), m['wall'])
    else:
        # rear wall with a widened vent hole (0.34 wide x 0.5 high at z 0.5..1.0, x = cx+0.12)
        hx, hz0, hz1, hw = cx + 0.12, 0.5, 1.0, 0.34
        yy = CD + 0.05
        boxm(tag + 'WBl', (x0 + (hx - hw / 2 - x0) / 2, yy, CH / 2), (hx - hw / 2 - x0 + 0.05, 0.1, CH), m['wall'])
        boxm(tag + 'WBr', (hx + hw / 2 + (x1 - hx - hw / 2) / 2 + 0.025, yy, CH / 2), (x1 - hx - hw / 2 + 0.1, 0.1, CH), m['wall'])
        boxm(tag + 'WBt', (hx, yy, hz1 + (CH - hz1) / 2), (hw, 0.1, CH - hz1), m['wall'])
        boxm(tag + 'WBb', (hx, yy, hz0 / 2), (hw, 0.1, hz0), m['wall'])
        # chipped rim + bent grille bars + rubble
        for k, dx in enumerate((-0.12, 0.0, 0.12)):
            b = boxm(tag + 'Grille%d' % k, (hx + dx, CD - 0.02, hz0 + 0.25), (0.018, 0.02, 0.5), m['bar'])
            b.rotation_euler = (0, math.radians((-14, 7, 22)[k]), 0)
        rnd = random.Random(7)
        for k in range(9):
            r = rnd.uniform(0.012, 0.03)
            boxm(tag + 'Chip%d' % k, (hx + rnd.uniform(-0.26, 0.2), CD - rnd.uniform(0.05, 0.4), r / 2), (r * 2, r * 1.6, r), m['wall'], 0.003)
    # front bars (pitch 0.1) + rails
    nb_ = int(CW / 0.1)
    for k in range(nb_):
        bx = x0 + 0.05 + 0.1 * k
        boxm(tag + 'Bar%d' % k, (bx, 0.0, CH / 2), (0.022, 0.022, CH), m['bar'])
    for z in (0.08, 0.95, 1.75, CH - 0.05):
        boxm(tag + 'Rail%.2f' % z, (cx, 0.0, z), (CW, 0.04, 0.05), m['bar'])
    # fittings: fold-down shelf (left), tin cup, small toilet block (back-left)
    boxm(tag + 'Shelf', (x0 + 0.17, CD * 0.55, 0.88), (0.3, 0.9, 0.04), m['steel'])
    cyl(tag + 'Cup', (x0 + 0.2, CD * 0.5, 0.9), (x0 + 0.2, CD * 0.5, 0.98), 0.04, m['tin'], 14)
    boxm(tag + 'Toilet', (x0 + 0.25, CD - 0.3, 0.2), (0.4, 0.45, 0.4), M.principled(tag + 'Porc', base=(0.5, 0.5, 0.48), rough=0.2), 0.04)
    info = dict(head=None)
    if bunk:
        bx = x1 - 0.42
        boxm(tag + 'BunkFrame', (bx, CD - 1.08, 0.46), (0.74, 2.0, 0.04), m['steel'])
        for lx in (-0.33, 0.33):
            for ly in (-0.95, 0.95):
                boxm(tag + 'Leg%.2f%.2f' % (lx, ly), (bx + lx, CD - 1.08 + ly, 0.23), (0.04, 0.04, 0.46), m['steel'])
        boxm(tag + 'Mattress', (bx, CD - 1.08, 0.53), (0.70, 1.94, 0.1), m['mattress'], 0.03)
        if head:
            boxm(tag + 'Pillow', (bx, CD - 0.32, 0.64), (0.46, 0.3, 0.12), m['pillow'], 0.05)
            # blanket over a stuffed shape (lumpy body under it)
            boxm(tag + 'Blanket', (bx, CD - 1.45, 0.66), (0.68, 1.15, 0.12), m['blanket'], 0.05)
            ell(tag + 'LumpA', (bx, CD - 1.3, 0.67), (0.22, 0.55, 0.1), m['blanket'])
            ell(tag + 'LumpB', (bx - 0.02, CD - 1.85, 0.66), (0.17, 0.3, 0.09), m['blanket'])
            hp = (bx, CD - 0.34, 0.80)
            ell(tag + 'Head', hp, (0.095, 0.12, 0.125), m['plaster'])
            ell(tag + 'Hair', (hp[0], hp[1] + 0.028, hp[2] + 0.018), (0.1, 0.108, 0.118), m['hair'])
            ell(tag + 'Nose', (hp[0], hp[1] - 0.112, hp[2] + 0.0), (0.02, 0.03, 0.025), m['plaster'], 12, 8)
            info['head'] = hp
        else:
            boxm(tag + 'Blanket0', (bx, CD - 1.08, 0.6), (0.66, 1.8, 0.04), m['blanket'], 0.02)
    info['bed_x'] = x1 - 0.42
    return info


def corridor_light(x, y, z=2.1, power=140, tube=False):
    m = mats()
    if tube:
        boxm('CTube%.1f' % x, (x, y, z + 0.28), (0.14, 1.2, 0.04), m['tube'])
    else:
        ell('CBulb%.1f' % x, (x, y, z), (0.07, 0.07, 0.07), m['glow'], 14, 8)
        cyl('CCord%.1f' % x, (x, y, z + 0.07), (x, y, 2.9), 0.006, m['steel'], 6)
    Wd.point('CLamp%.1f' % x, (x, y, z), color=(1.0, 0.78, 0.5), power=power, radius=0.08)


def cellhouse_corridor(n=9, heads=(3, 4, 5), start=-6.2, wall_y=-2.6):
    """Row of n cells along +x (cx = start + i*CW), a main walkway in front, outer wall with high windows."""
    m = mats()
    for i in range(n):
        cell(start + i * CW, tag='K%d_' % i, head=(i in heads), roof=True, right_wall=(i == n - 1), lamp_out=False, bunk=True)
    xm = start + (n - 1) * CW / 2
    L = n * CW + 2
    boxm('WalkFloor', (xm, wall_y / 2, -0.03), (L, -wall_y + 0.1, 0.06), m['floor'])
    boxm('WalkCeil', (xm, wall_y / 2, 3.6), (L, -wall_y + 0.1, 0.06), m['wall'])
    boxm('OuterWall', (xm, wall_y - 0.05, 1.8), (L, 0.1, 3.6), m['wall'])
    boxm('EndWall', (xm + L / 2, wall_y / 2, 1.8), (0.1, -wall_y + 0.1, 3.6), m['wall'])
    boxm('EndWall2', (xm - L / 2, wall_y / 2, 1.8), (0.1, -wall_y + 0.1, 3.6), m['wall'])
    win = M.emission('WinGlow', (0.45, 0.6, 0.85), 1.2)
    for i in range(0, n, 2):
        boxm('Win%d' % i, (start + i * CW + 0.4, wall_y - 0.0, 2.5), (0.7, 0.03, 1.4), win)
    # tier mid-level cells above (dark boxes) to read as a tier
    for i in range(n):
        boxm('Upper%d' % i, (start + i * CW, CD / 2, CH + 0.4), (CW + 0.1, CD + 0.1, 0.8), m['wall'])
    for i in range(1, n, 2):
        corridor_light(start + i * CW, -1.2, 2.2, power=60 if i != 3 else 100)
    return xm


def utility_corridor(cx_vent=0.12, y0=None):
    """Narrow service corridor behind a cell's rear wall (utility passage with pipes, a bulb, dust)."""
    m = mats()
    y0 = CD + 0.1 if y0 is None else y0
    w = 1.1
    boxm('UFloor', (0, y0 + w / 2, -0.03), (6.0, w, 0.06), m['floor'])
    boxm('UBack', (0, y0 + w + 0.05, 2.0), (6.0, 0.1, 4.0), m['wall'])
    boxm('UCeil', (0, y0 + w / 2, 4.03), (6.0, w, 0.06), m['wall'])
    boxm('UEndL', (-3.0, y0 + w / 2, 2.0), (0.1, w, 4.0), m['wall'])
    boxm('UEndR', (3.0, y0 + w / 2, 2.0), (0.1, w, 4.0), m['wall'])
    pipe = M.principled('UPipe', base=(0.16, 0.17, 0.17), rough=0.5, metal=0.7, grime=0.5)
    for k, (z, r) in enumerate(((3.4, 0.09), (3.1, 0.06), (2.1, 0.05))):
        cyl('UPipe%d' % k, (-3.0, y0 + w - 0.2 - 0.1 * k, z), (3.0, y0 + w - 0.2 - 0.1 * k, z), r, pipe, 14)
    for k in range(7):
        boxm('UBrace%d' % k, (-2.7 + k * 0.9, y0 + w - 0.35, 3.3), (0.05, 0.4, 0.04), pipe)
    ell('UBulb', (0.9, y0 + 0.5, 3.3), (0.07, 0.07, 0.07), m['glow'], 14, 8)
    Wd.point('ULamp', (0.9, y0 + 0.5, 3.25), color=(1.0, 0.78, 0.5), power=190, radius=0.08)
    ladder = M.principled('ULad', base=(0.09, 0.09, 0.1), rough=0.5, metal=0.8)
    for z in [0.3 + 0.3 * k for k in range(12)]:
        boxm('URung%.1f' % z, (-1.2, y0 + w - 0.12, z), (0.4, 0.025, 0.025), ladder)
    boxm('URailA', (-1.4, y0 + w - 0.12, 2.0), (0.03, 0.03, 4.0), ladder)
    boxm('URailB', (-1.0, y0 + w - 0.12, 2.0), (0.03, 0.03, 4.0), ladder)
    CN.haze(center=(0, y0 + w / 2, 2.0), size=(5.8, w - 0.1, 3.9), density=0.05, color=(0.9, 0.88, 0.8), anisotropy=0.6, noise=0.4, noise_scale=0.3)


def spoon(loc, yaw=20.0):
    m = mats()
    root = Md.empty('Spoon', loc)
    h = cyl('SpoonHandle', (0, 0, 0.004), (0.17, 0, 0.004), 0.007, m['tin'], 8)
    h.parent = root
    b = ell('SpoonBowl', (-0.035, 0, 0.004), (0.04, 0.026, 0.006), m['tin'], 16, 8)
    b.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def sea_night(NF, moon_dir=(0.25, 0.9, 0.3), moon=1.4, half=1800, wave_scale=0.9, wind=10.0, z=0.0):
    Wd.hdri('qwantani_night_puresky', strength=0.18, bg_strength=0.45, rot=60)
    Wd.moon(direction=moon_dir, strength=moon, color=(0.62, 0.72, 1.0), angle=0.55)
    Wd.sea_plane(size=120000, z=z - 1.2 * wave_scale, color=(0.004, 0.008, 0.013), rough=0.3, wave=0.1, frames=max(NF, 60))
    return Wd.ocean_wide(center=(0, 0, z), half=half, wave_scale=wave_scale, choppy=0.8, wind=wind, time_frames=max(NF, 60),
                         color=(0.004, 0.009, 0.014), rough=0.1)


def sf_lights(center=(0, 4200, 8), radius=2200, n=1400, seed=3, strength=55, size=6):
    """Distant San Francisco shore glow (generic city lights)."""
    Wd.city_lights('SFLights', center=center, radius=radius, count=n, seed=seed, color=(1.0, 0.68, 0.38), strength=strength,
                   size=size, cluster=0.6)
    Wd.city_lights('SFLights2', center=(center[0] + 1200, center[1] + 400, center[2]), radius=radius * 0.5, count=n // 3, seed=seed + 5,
                   color=(0.9, 0.9, 1.0), strength=strength * 0.6, size=size, cluster=0.6)


# ----------------------------------------------------------------------------- island
def island(NF, lighthouse=True):
    """Alcatraz-like rock island with a long cellhouse, water tower and lighthouse at night. Island centre at the origin,
    cellhouse long axis along x. Not to scale to the metre."""
    m = mats()
    rock = M.texture_set('IslandRock', 'rocky_terrain_02', scale=0.05, tint=(0.22, 0.2, 0.18), box=True)
    Wd.terrain('Rock', size=620, res=140, height=14, scale=0.012, center=(0, 0, -2), seed=4, mat=rock, island=1.0)
    boxm('Plateau', (0, 0, 4.0), (190, 62, 8.0), rock, 0.5)
    boxm('PlateauLow', (60, -10, 1.5), (110, 70, 4.0), rock, 0.5)
    conc = M.principled('CellhouseWall', base=(0.30, 0.30, 0.28), rough=0.85, grime=0.3, bump=0.2, bump_scale=60)
    roof = M.principled('CellhouseRoof', base=(0.07, 0.075, 0.08), rough=0.7)
    boxm('Cellhouse', (-4, 0, 17.0), (126, 24, 18), conc, 0.2)
    boxm('CellRoof', (-4, 0, 26.6), (127, 25, 1.4), roof, 0.2)
    win = M.emission('IslWin', (1.0, 0.78, 0.45), 5.0)
    for k in range(-26, 27):
        for z in (14.0, 19.0):
            if (k * 7 + int(z)) % 5:
                boxm('Wn%d_%d' % (k, z), (-4 + k * 2.3, -12.05, z), (0.9, 0.04, 1.6), win)
    boxm('Annex', (68, 6, 13.0), (24, 22, 10), conc, 0.2)
    boxm('Warden', (-82, 14, 13.0), (16, 12, 10), conc, 0.2)
    cyl('WTower', (-70, -14, 8), (-70, -14, 40), 3.2, conc, 18)
    cyl('WTank', (-70, -14, 40), (-70, -14, 46), 6.0, conc, 18)
    if lighthouse:
        cyl('LHTower', (88, -12, 9), (88, -12, 38), 3.6, conc, 16)
        lam = M.emission('LHLamp', (1.0, 0.92, 0.7), 40.0)
        cyl('LHLantern', (88, -12, 38), (88, -12, 41), 2.0, lam, 12)
        piv = Md.empty('LHPivot', (88, -12, 40))
        sp = Wd.spot('LHBeam', (88, -12, 40), (400, -12, 40), color=(1.0, 0.92, 0.75), power=6e5, size_deg=7, blend=0.4, radius=0.5)
        sp.parent = piv
        sp.location = (0, 0, 0)
        sp.rotation_euler = (0, math.radians(-90), 0)
        for f in range(0, max(NF, 60) + 1, 5):
            piv.rotation_euler = (0, 0, math.radians(f * 4.5))
            piv.keyframe_insert('rotation_euler', frame=f)
        if piv.animation_data and piv.animation_data.action:
            for fc in piv.animation_data.action.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'LINEAR'
    Wd.point('IslFlood', (-4, -40, 30), color=(1.0, 0.8, 0.55), power=40000, radius=2.0)


# ----------------------------------------------------------------------------- raft
def raft(name='Raft', loc=(0, 0, 0), yaw=0.0, silhouettes=3, scale=1.0):
    """Improvised raft of stitched tan raincoat tubes (generic) with faceless dark silhouettes crouched on it."""
    tan = M.principled('RaftTan', base=(0.30, 0.22, 0.10), rough=0.55, bump=0.4, bump_scale=140, grime=0.3, sss=0.05)
    dark = M.principled('Sil', base=(0.006, 0.007, 0.01), rough=0.8)
    root = Md.empty(name, loc)
    parts = []
    L, W = 3.0, 1.55
    for sx in (-1, 1):
        t = cyl(name + 'Tube%d' % sx, (-L / 2, sx * (W / 2 - 0.2), 0.0), (L / 2, sx * (W / 2 - 0.2), 0.0), 0.2, tan, 18)
        parts.append(t)
        parts.append(ell(name + 'EndA%d' % sx, (-L / 2, sx * (W / 2 - 0.2), 0.0), (0.2, 0.2, 0.2), tan, 14, 8))
        parts.append(ell(name + 'EndB%d' % sx, (L / 2, sx * (W / 2 - 0.2), 0.0), (0.2, 0.2, 0.2), tan, 14, 8))
    for k in range(4):
        parts.append(cyl(name + 'Thwart%d' % k, (-1.0 + k * 0.7, -W / 2 + 0.2, 0.02), (-1.0 + k * 0.7, W / 2 - 0.2, 0.02), 0.13, tan, 14))
    for k in range(silhouettes):
        px = -0.9 + k * 0.85
        parts.append(ell(name + 'Body%d' % k, (px, 0.0, 0.34), (0.2, 0.26, 0.3), dark, 14, 10))
        parts.append(ell(name + 'Hd%d' % k, (px, 0.0, 0.72), (0.1, 0.1, 0.11), dark, 14, 10))
    parts.append(cyl(name + 'Paddle', (-0.3, -0.7, 0.55), (0.8, -1.45, 0.05), 0.02, dark, 6))
    for p in parts:
        p.parent = root
    root.rotation_euler = (0, 0, math.radians(yaw))
    root.scale = (scale, scale, scale)
    return root


def bob(obj, NF, amp=0.09, period=70.0, roll=2.2, phase=0.0):
    """Slow smooth sea motion (sine on z + tiny roll). Not shake: period ~2.3 s."""
    for f in range(0, NF + 1, 3):
        a = 2 * math.pi * (f / period) + phase
        obj.location.z = amp * math.sin(a)
        obj.rotation_euler = (math.radians(roll * math.sin(a + 0.8)), math.radians(roll * 0.6 * math.sin(a)), obj.rotation_euler[2])
        obj.keyframe_insert('location', index=2, frame=f)
        obj.keyframe_insert('rotation_euler', frame=f)


# ----------------------------------------------------------------------------- table, desk, bench
def room_box(sx, sy, sz, z0=0.0, wall=None, floor=None, tag='R'):
    m = mats()
    wall = wall or m['wall']
    floor = floor or m['floor']
    boxm(tag + 'Floor', (0, 0, z0 - 0.02), (sx, sy, 0.04), floor)
    boxm(tag + 'Ceil', (0, 0, z0 + sz + 0.02), (sx, sy, 0.04), wall)
    boxm(tag + 'WN', (0, sy / 2 + 0.05, z0 + sz / 2), (sx, 0.1, sz), wall)
    boxm(tag + 'WS', (0, -sy / 2 - 0.05, z0 + sz / 2), (sx, 0.1, sz), wall)
    boxm(tag + 'WE', (sx / 2 + 0.05, 0, z0 + sz / 2), (0.1, sy, sz), wall)
    boxm(tag + 'WW', (-sx / 2 - 0.05, 0, z0 + sz / 2), (0.1, sy, sz), wall)


def desk_lamp(x, y, z0, tag='DL', power=180, target=(0, 0, 0), warm=(1.0, 0.82, 0.58)):
    m = mats()
    blk = M.principled(tag + 'M', base=(0.03, 0.035, 0.03), rough=0.35, metal=0.7)
    boxm(tag + 'Base', (x, y, z0 + 0.015), (0.14, 0.14, 0.03), blk, 0.01)
    beam(tag + 'Arm1', (x, y, z0 + 0.03), (x - 0.08, y + 0.04, z0 + 0.42), 0.014, 0.014, blk)
    beam(tag + 'Arm2', (x - 0.08, y + 0.04, z0 + 0.42), (x - 0.30, y + 0.05, z0 + 0.52), 0.014, 0.014, blk)
    hm = M.emission(tag + 'Head', (1.0, 0.85, 0.62), 5.0)
    boxm(tag + 'Head', (x - 0.32, y + 0.05, z0 + 0.52), (0.2, 0.12, 0.05), hm, 0.02)
    boxm(tag + 'Shade', (x - 0.32, y + 0.05, z0 + 0.555), (0.24, 0.16, 0.02), blk, 0.01)
    Wd.spot(tag + 'Spot', (x - 0.32, y + 0.05, z0 + 0.5), target, color=warm, power=power, size_deg=58, blend=0.7, radius=0.04)


def beam(name, p0, p1, w, h, mat):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    o = Wd.box(name, (p0 + p1) / 2, (d.length, w, h))
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('X', 'Z')
    o.data.materials.append(mat)
    return o


def squiggle_lines(prefix, x0, y0, z, width, rows, mat, rot=0.0, seed=1, gap=0.026, amp=0.006, bevel=0.0009):
    """Illustrative handwriting: rows of wavy ink strokes (not real text). Lying flat at height z."""
    rnd = random.Random(seed)
    objs = []
    for r in range(rows):
        pts = []
        x = 0.0
        w = width * (0.55 + 0.45 * rnd.random()) if r not in (0, rows - 1) else width * 0.5
        while x < w:
            pts.append((x, math.sin(x * 160 + rnd.random()) * amp * (0.4 + rnd.random()) , 0))
            x += 0.006
        pts = [(x0 + px * math.cos(rot) - (-r * gap + py) * math.sin(rot), y0 + px * math.sin(rot) + (-r * gap + py) * math.cos(rot), z) for px, py, _ in pts]
        objs.append(curve_poly('%s%d' % (prefix, r), pts, bevel=bevel, mat=mat))
    return objs


# ----------------------------------------------------------------------------- hydrographic map (units: km)
GG = (0.0, 0.0)             # Golden Gate Bridge
ALC = (4.9, 0.75)           # Alcatraz
HSB = (0.33, 1.3)           # Horseshoe Bay
SF_LAND = [(-8, -3.6), (-5.5, -2.4), (-4.2, -0.9), (-3, -0.3), (-0.6, -0.1), (0.0, -0.1), (0.8, -0.5), (2.0, -0.9), (3.0, -1.2), (4.3, -1.6), (5.6, -2.0),
           (7.0, -2.4), (8.5, -3.2), (10.0, -4.5), (11.0, -6.0), (11.0, -9), (-8, -9)]
MARIN_LAND = [(-8, 3.8), (-5.5, 2.8), (-4.2, 1.5), (-3, 1.05), (-1.0, 1.0), (-0.4, 0.95), (0.1, 1.1), (0.55, 1.3), (1.0, 1.7), (1.6, 2.3), (2.4, 3.4), (3.3, 4.2), (3.7, 5.4),
              (4.0, 6.0), (3.6, 7.5), (3.4, 11), (-8, 11)]
EAST_LAND = [(18.0, -9), (17.3, -4), (16.5, 0.0), (16.0, 3.5), (14.8, 6.5), (13.8, 8.5), (13.0, 11), (22, 11), (22, -9)]
ANGEL = [(3.7 + 0.9 * math.cos(t), 4.8 + 0.7 * math.sin(t)) for t in [2 * math.pi * k / 18 for k in range(18)]]
TREAS = [(9.5 + 1.0 * math.cos(t), 0.2 + 0.55 * math.sin(t)) for t in [2 * math.pi * k / 14 for k in range(14)]]
ALCI = [(ALC[0] + 0.28 * math.cos(t), ALC[1] + 0.2 * math.sin(t)) for t in [2 * math.pi * k / 12 for k in range(12)]]


def hydro_map(NF, flow=True, window=False, paths=False, label=True):
    """Dark glowing 3D tide-model map of San Francisco Bay (stylised, 1 unit = 1 km). Returns dict of glow mats."""
    deep = M.principled('MapSea', base=(0.004, 0.02, 0.03), rough=0.35, metal=0.4)
    land = M.principled('MapLand', base=(0.012, 0.03, 0.04), rough=0.5, metal=0.2)
    edge = glow_mat('MapEdge', (0.35, 0.85, 1.0), 4.0)
    grid = glow_mat('MapGrid', (0.2, 0.55, 0.7), 1.2)
    boxm('MapBase', (6.5, 1.0, -0.12), (40, 30, 0.2), deep)
    for nm, poly in (('SF', SF_LAND), ('Marin', MARIN_LAND), ('East', EAST_LAND), ('Angel', ANGEL), ('Treas', TREAS)):
        slab('Land' + nm, poly, 0.0, 0.16, land)
        curve_poly('Edge' + nm, [(x, y, 0.17) for x, y in poly], bevel=0.03, mat=edge, cyclic=True)
    slab('LandAlc', ALCI, 0.0, 0.22, land)
    curve_poly('EdgeAlc', [(x, y, 0.23) for x, y in ALCI], bevel=0.025, mat=edge, cyclic=True)
    # grid lines on the water
    for gx in range(-8, 23, 2):
        curve_poly('GX%d' % gx, [(gx, -9, 0.01), (gx, 11, 0.01)], bevel=0.008, mat=grid)
    for gy in range(-8, 12, 2):
        curve_poly('GY%d' % gy, [(-8, gy, 0.01), (22, gy, 0.01)], bevel=0.008, mat=grid)
    # Golden Gate span (thin glowing line) + markers
    brg = glow_mat('MapBridge', (1.0, 0.55, 0.3), 5.0)
    curve_poly('GGSpan', [(-0.15, -0.35, 0.3), (0.12, 1.45, 0.3)], bevel=0.035, mat=brg)
    mk = glow_mat('MapAlc', (1.0, 0.85, 0.5), 7.0)
    ell('AlcMarker', (ALC[0], ALC[1], 0.55), (0.1, 0.1, 0.1), mk, 12, 8)
    curve_poly('AlcStem', [(ALC[0], ALC[1], 0.24), (ALC[0], ALC[1], 0.5)], bevel=0.012, mat=mk)
    hm = glow_mat('MapHSB', (0.45, 1.0, 0.6), 7.0)
    ell('HsbMarker', (HSB[0], HSB[1], 0.4), (0.09, 0.09, 0.09), hm, 12, 8)
    ring = ring_mesh('HsbRing', r=0.4, w=0.05, n=48)
    ring.location = (HSB[0], HSB[1], 0.2)
    ring.data.materials.append(hm)
    if label:
        lm = glow_mat('MapText', (0.8, 0.95, 1.0), 3.0)
        text_obj('LblAlc', 'ALCATRAZ', (ALC[0] + 0.4, ALC[1] - 0.55, 0.3), size=0.34, mat=lm)
        text_obj('LblHsb', 'HORSESHOE BAY', (HSB[0] + 0.5, HSB[1] + 0.35, 0.3), size=0.3, mat=lm)
        text_obj('LblGG', 'GOLDEN GATE', (-4.6, 0.25, 0.3), size=0.34, mat=lm)
    out = dict(edge=edge, hm=hm, mk=mk)
    # tide vectors over water (grid of arrows); water test = not inside any land polygon
    def inside(pt, poly):
        x, y = pt
        c = False
        j = len(poly) - 1
        for i in range(len(poly)):
            xi, yi = poly[i]
            xj, yj = poly[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi + 1e-9) + xi:
                c = not c
            j = i
        return c
    arr_m = glow_mat('TideArrow', (0.3, 0.85, 1.0), 3.5)
    arr_hot = glow_mat('TideHot', (0.55, 1.0, 0.75), 6.0)
    out['arr'] = arr_m
    rnd = random.Random(2)
    n_arr = 0
    if flow:
        for gx in [x * 0.8 for x in range(-6, 20)]:
            for gy in [y * 0.8 for y in range(-8, 12)]:
                if gx < -1.0 and False:
                    continue
                if gx > 17 or gy < -3.2 and gx > 2:
                    continue
                if any(inside((gx, gy), pl) for pl in (SF_LAND, MARIN_LAND, EAST_LAND, ANGEL, TREAS)):
                    continue
                if math.hypot(gx - ALC[0], gy - ALC[1]) < 0.5:
                    continue
                # flow direction: into the Gate (west) with a swirl past Alcatraz toward the Marin shore
                ang = math.pi + 0.35 * math.sin(gx * 0.5 + gy * 0.3)
                if gx > 0.5 and gy > 0.2:
                    ang = math.pi - 0.5 + 0.2 * math.sin(gy)
                hot = window and (abs((gy - 0.75) + 0.12 * (gx - 4.9)) < 0.7 and 0.3 < gx < 5.6)
                a = Md.empty('Ar%d' % n_arr, (gx, gy, 0.08))
                mat = arr_hot if hot else arr_m
                sh = cyl('ArS%d' % n_arr, (-0.22, 0, 0), (0.12, 0, 0), 0.018 if not hot else 0.03, mat, 6)
                hd = boxm('ArH%d' % n_arr, (0.2, 0, 0), (0.14, 0.1, 0.02), mat, 0.0)
                hd.rotation_euler = (0, 0, math.radians(45))
                sh.parent = a
                hd.parent = a
                a.rotation_euler = (0, 0, ang)
                a.scale = (1.0, 1.0, 1.0)
                if not hot and window:
                    s = 0.55
                    a.scale = (s, s, s)
                n_arr += 1
    out['n_arr'] = n_arr
    return out


def map_light():
    Wd.hdri('moonless_golf', strength=0.02)
    Wd.area('MapFill', (6, -6, 14), (6, 1, 0), color=(0.5, 0.75, 1.0), power=900, size=18)
    Wd.area('MapRim', (-10, 8, 6), (6, 1, 0), color=(0.6, 0.85, 1.0), power=300, size=10)
