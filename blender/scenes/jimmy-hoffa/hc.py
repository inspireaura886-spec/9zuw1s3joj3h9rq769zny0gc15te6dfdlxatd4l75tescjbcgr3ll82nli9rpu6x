"""jimmy-hoffa builders (REAL3D, CINE v2, 2026-11-05 task B). No people, no faces. 1975 period props, muted dusk/night palette.
Smooth eased camera only. Wide shots (24-35 mm) use cam.shot directly."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hcommon import *


def beam(name, p0, p1, w, h, mat):
    """Box of cross-section w x h along p0->p1."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    o = Wd.box(name, (p0 + p1) / 2, (d.length, w, h))
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('X', 'Z')
    o.data.materials.append(mat)
    return o


def checker_mat(name, c1, c2, size_m=0.45, rough=0.25):
    m, nb, b, out = M.new(name)
    tc = nb.n('ShaderNodeTexCoord')
    ck = nb.n('ShaderNodeTexChecker')
    ck.inputs['Scale'].default_value = 1.0 / size_m
    ck.inputs['Color1'].default_value = (*c1, 1)
    ck.inputs['Color2'].default_value = (*c2, 1)
    nb.l(tc, 'Object', ck, 'Vector')
    nb.l(ck, 'Color', b, 'Base Color')
    b.inputs['Roughness'].default_value = rough
    return m


def sedan(name, loc, yaw=0.0, paint=(0.22, 0.03, 0.04), lights=False, scale=1.0):
    """1970s full-size sedan, built at the origin (length along X, nose +X) then moved. Generic, no badge."""
    pm = M.principled(name + 'Paint', base=paint, rough=0.28, metal=0.35, coat=0.7, coat_rough=0.08, grime=0.12)
    gl = M.principled(name + 'Glass', base=(0.02, 0.028, 0.034), rough=0.04, spec=0.8)
    tire = M.principled(name + 'Tire', base=(0.012, 0.012, 0.012), rough=0.85)
    chrome = M.principled(name + 'Chrome', base=(0.75, 0.76, 0.78), rough=0.12, metal=1.0)
    root = Md.empty(name, (0, 0, 0))
    parts = [boxm(name + 'Low', (0, 0, 0.62), (5.5, 2.0, 0.68), pm, 0.14),
             boxm(name + 'Hood', (1.45, 0, 0.98), (2.0, 1.86, 0.06), pm, 0.02),
             boxm(name + 'Trunk', (-2.05, 0, 0.98), (1.2, 1.86, 0.06), pm, 0.02),
             boxm(name + 'Cab', (-0.35, 0, 1.2), (2.75, 1.78, 0.5), gl, 0.12),
             boxm(name + 'Roof', (-0.4, 0, 1.47), (2.45, 1.74, 0.06), pm, 0.03),
             boxm(name + 'BumpF', (2.78, 0, 0.42), (0.14, 2.06, 0.15), chrome, 0.02),
             boxm(name + 'BumpR', (-2.78, 0, 0.42), (0.14, 2.06, 0.15), chrome, 0.02)]
    for sx in (1.7, -1.75):
        for sy in (0.95, -0.95):
            parts.append(cyl(name + 'W%.1f%.1f' % (sx, sy), (sx, sy - 0.12, 0.35), (sx, sy + 0.12, 0.35), 0.35, tire, 24))
            o_ = 1 if sy > 0 else -1
            parts.append(cyl(name + 'H%.1f%.1f' % (sx, sy), (sx, sy + o_ * 0.1, 0.35), (sx, sy + o_ * 0.13, 0.35), 0.17, chrome, 16))
    hl = M.emission(name + 'HL', (1.0, 0.92, 0.75), 30.0 if lights else 0.6)
    tl = M.emission(name + 'TL', (0.8, 0.12, 0.08), 3.0 if lights else 0.5)
    for sy in (0.7, -0.7):
        parts.append(boxm(name + 'Head%.1f' % sy, (2.77, sy, 0.7), (0.05, 0.4, 0.14), hl))
        parts.append(boxm(name + 'Tail%.1f' % sy, (-2.77, sy, 0.7), (0.05, 0.42, 0.12), tl))
    for p in parts:
        p.parent = root
    root.scale = (scale,) * 3
    root.location = loc
    root.rotation_euler = (0, 0, math.radians(yaw))
    return root


def lamp_post(name, x, y, h=7.5, power=5200, spot_deg=110, rgb=(1.0, 0.8, 0.52), arm=1.6, yaw=0):
    steel = M.principled('LampSteel', base=(0.08, 0.085, 0.09), rough=0.5, metal=0.8)
    cyl(name + 'Pole', (x, y, 0), (x, y, h), 0.09, steel, 10)
    hx = x + arm * math.cos(math.radians(yaw)); hy = y + arm * math.sin(math.radians(yaw))
    beam(name + 'Arm', (x, y, h), (hx, hy, h + 0.15), 0.1, 0.1, steel)
    gm = M.emission(name + 'Lens', rgb, 25.0)
    boxm(name + 'Head', (hx, hy, h + 0.1), (0.9, 0.4, 0.14), steel, 0.02)
    boxm(name + 'Glow', (hx, hy, h + 0.02), (0.78, 0.3, 0.02), gm)
    Wd.spot(name + 'Spot', (hx, hy, h), (hx, hy, 0), color=rgb, power=power, size_deg=spot_deg, blend=0.85, radius=0.25)


def restaurant(x0=0, y0=20, w=44, d=11, h=4.6, glow=True):
    """Low brick suburban restaurant, long front on -Y (facing the lot), lit windows, glowing generic sign."""
    brick = M.principled('Brick', base=(0.20, 0.085, 0.06), rough=0.8, grime=0.35, bump=0.5, bump_scale=60)
    trim = M.principled('Trim', base=(0.55, 0.52, 0.46), rough=0.7, grime=0.2)
    roofm = M.principled('RoofM', base=(0.05, 0.05, 0.055), rough=0.9)
    boxm('RestBody', (x0, y0, h / 2), (w, d, h), brick, 0.03)
    boxm('RestRoof', (x0, y0 - 0.6, h + 0.12), (w + 1.6, d + 2.4, 0.24), roofm)
    boxm('RestFascia', (x0, y0 - d / 2 - 0.55, h - 0.35), (w + 1.4, 0.15, 0.7), trim)
    win = M.emission('RestWin', (1.0, 0.82, 0.55), 5.0)
    yf = y0 - d / 2 - 0.02
    for i in range(7):
        xx = x0 - w / 2 + 4.0 + i * 5.2
        if i == 3:
            boxm('RestDoor', (xx, yf, 1.2), (1.8, 0.06, 2.4), win)
            continue
        boxm('RestWin%d' % i, (xx, yf, 1.9), (3.4, 0.06, 1.5), win)
        boxm('RestSill%d' % i, (xx, yf - 0.06, 1.1), (3.7, 0.18, 0.1), trim)
    if glow:
        Wd.area('RestSpill', (x0, y0 - d / 2 + 1.0, 3.2), (x0, y0 - d / 2 - 12, 0.4), color=(1.0, 0.78, 0.5), power=2600, size=26.0)
    # roadside sign: tall pole, generic glowing panel (no brand)
    steel = M.principled('SignSteel', base=(0.1, 0.1, 0.11), rough=0.4, metal=0.8)
    sx, sy = x0 - w / 2 - 3.0, y0 - d / 2 - 8.0
    cyl('SignPole', (sx, sy, 0), (sx, sy, 7.0), 0.13, steel, 12)
    pan = M.emission('SignPanel', (1.0, 0.86, 0.62), 4.0)
    boxm('SignPanel', (sx, sy, 7.6), (4.2, 0.35, 1.8), pan, 0.03)
    dark = M.principled('SignInk', base=(0.03, 0.025, 0.02), rough=0.6)
    text_obj('SignTxt', 'RESTAURANT', (sx - 1.85, sy - 0.2, 7.5), size=0.55, mat=dark, rot=(math.pi / 2, 0, 0))
    Wd.point('SignLight', (sx, sy - 1.5, 7.0), color=(1.0, 0.8, 0.55), power=900, radius=0.3)


def dusk_sky(sun_az=100, haze=True, hdri_strength=0.7, sun=2.2, elev=3.5):
    CN.hdri_sun('qwantani_dawn_puresky', sun_az=sun_az, strength=hdri_strength, tint=(0.8, 0.88, 1.08))
    CN.sun(elev=elev, az=sun_az, warmth='late', strength=sun, check=False)


def lot(cars=('lone',), lamp=True, phone=False, NF=100):
    """Suburban restaurant parking lot at dusk. cars: 'lone' (one maroon sedan at the origin under a lamp) and/or 'far2'
    (two dark sedans far back). phone=True adds a pay phone on a pole near the building (left foreground)."""
    dusk_sky(sun_az=100)
    CN.ground('Lot', 'asphalt_02', (150, 70), center=(0, 6, 0), tile_m=4.0, tint=(0.38, 0.38, 0.42))
    CN.ground('Verge', 'forest_ground_04', (500, 300), center=(0, 40, -0.05), tile_m=6.0, tint=(0.25, 0.27, 0.22))
    stripe = M.principled('Stripe', base=(0.6, 0.6, 0.56), rough=0.6)
    for r, y in enumerate((5.0, 11.0)):
        for i in range(-12, 13):
            boxm('St%d_%d' % (r, i), (i * 2.8 + 1.4, y, 0.012), (0.1, 4.9, 0.01), stripe)
    restaurant()
    CN.scatter('fir_tree_01', 36, (-85, 85, 44, 80), seed=3, scale=(1.5, 2.3))
    if lamp:
        lamp_post('LampA', 2.8, 8.0, yaw=200)
        lamp_post('LampB', -24, 9, yaw=0, power=4200)
        lamp_post('LampC', 28, 12, yaw=180, power=4200)
    if 'lone' in cars:
        sedan('Hero', (0.0, 5.0, 0), yaw=90, paint=(0.20, 0.025, 0.035), lights=False)
    if 'far2' in cars:
        sedan('FarA', (-9.5, 11.0, 0), yaw=90, paint=(0.018, 0.02, 0.026), lights=False)
        sedan('FarB', (-6.9, 11.1, 0), yaw=92, paint=(0.02, 0.022, 0.03), lights=False)
    if phone:
        steel = M.principled('PhoneSteel', base=(0.35, 0.37, 0.4), rough=0.3, metal=0.9)
        dk = M.principled('PhoneBody', base=(0.04, 0.05, 0.06), rough=0.4, metal=0.5)
        px, py = -5.5, 7.5
        cyl('PhonePost', (px, py, 0), (px, py, 1.9), 0.05, steel, 10)
        boxm('PhoneBox', (px, py - 0.12, 1.45), (0.42, 0.22, 0.62), dk, 0.03)
        glow = M.emission('PhoneSign', (0.85, 0.92, 1.0), 6.0)
        boxm('PhoneSign', (px, py - 0.12, 1.98), (0.5, 0.06, 0.2), glow)
        pg = cyl('PhoneCord', (px - 0.25, py - 0.2, 1.4), (px - 0.28, py - 0.2, 0.7), 0.012, dk, 6)
        boxm('Handset', (px - 0.28, py - 0.2, 0.62), (0.07, 0.06, 0.22), dk, 0.02)
        Wd.point('PhoneLamp', (px, py - 0.8, 2.3), color=(0.8, 0.9, 1.0), power=140, radius=0.15)
    CN.haze(center=(0, 8, 5), size=(120, 60, 10), density=0.0035, color=(0.8, 0.84, 0.95), anisotropy=0.4, noise=0.3,
            noise_scale=0.08, height_falloff=0.5)


def diner():
    """1970s diner interior at dusk. Room x -7..7, y -9..9, z 0..3.2. Hero booth at the window wall (x=+6), two untouched cups."""
    Wd.hdri('moonless_golf', strength=0.03)
    floor = checker_mat('DinerFloor', (0.11, 0.11, 0.115), (0.55, 0.53, 0.48), 0.45, 0.22)
    wall = M.principled('DinerWall', base=(0.30, 0.34, 0.33), rough=0.8, grime=0.25)
    ceil = M.principled('DinerCeil', base=(0.55, 0.55, 0.52), rough=0.9)
    vinyl = M.principled('Vinyl', base=(0.04, 0.17, 0.17), rough=0.45, coat=0.3, bump=0.2, bump_scale=120)
    chrome = M.principled('DChrome', base=(0.8, 0.8, 0.82), rough=0.1, metal=1.0)
    formica = M.principled('Formica', base=(0.55, 0.55, 0.5), rough=0.35, grime=0.1)
    wood = M.texture_set('DinerWood', 'wood_table_worn', scale=1.5, tint=(0.35, 0.24, 0.16), box=True)
    boxm('DFloor', (0, 0, -0.02), (14, 18, 0.04), floor)
    boxm('DCeil', (0, 0, 3.22), (14, 18, 0.04), ceil)
    boxm('DWallW', (-7.05, 0, 1.6), (0.1, 18, 3.2), wall)
    boxm('DWallN', (0, 9.05, 1.6), (14, 0.1, 3.2), wall)
    boxm('DWallS', (0, -9.05, 1.6), (14, 0.1, 3.2), wall)
    # window wall (east): dusk sky card outside, mullions
    sky = M.emission('DuskCard', (0.36, 0.45, 0.68), 1.6)
    boxm('DSky', (9.5, 0, 2.0), (0.1, 30, 8), sky)
    boxm('DWinSill', (7.0, 0, 0.9), (0.2, 18, 0.1), chrome)
    boxm('DWinTop', (7.0, 0, 2.7), (0.2, 18, 0.1), wall)
    for i in range(-4, 5):
        boxm('DMull%d' % i, (7.0, i * 2.0, 1.8), (0.1, 0.07, 1.8), chrome)
    boxm('DWallLow', (7.02, 0, 0.45), (0.1, 18, 0.9), wall)
    boxm('DWallHi', (7.02, 0, 2.95), (0.1, 18, 0.5), wall)
    Wd.area('DuskIn', (8.5, 0, 2.0), (-1, 0, 1.2), color=(0.6, 0.72, 1.0), power=900, size=14)
    # booths along the window wall
    for i, y in enumerate((-6.0, -3.0, 0.0, 3.0, 6.0)):
        tx = 6.0
        boxm('BTable%d' % i, (tx - 0.1, y, 0.75), (0.7, 1.1, 0.04), formica, 0.01)
        cyl('BPed%d' % i, (tx - 0.1, y, 0.05), (tx - 0.1, y, 0.73), 0.05, chrome, 10)
        for s in (-1, 1):
            boxm('BSeat%d_%d' % (i, s), (tx - 0.1, y + s * 0.95, 0.24), (0.95, 0.62, 0.48), vinyl, 0.06)
            boxm('BBack%d_%d' % (i, s), (tx - 0.1, y + s * 1.24, 0.72), (0.95, 0.12, 0.7), vinyl, 0.05)
    # hero booth y=0: two coffee cups, saucers, a napkin dispenser, a folded menu
    cup = M.principled('Cup', base=(0.78, 0.76, 0.7), rough=0.15)
    cof = M.principled('Coffee', base=(0.03, 0.015, 0.008), rough=0.05)
    for cy_ in (-0.32, 0.32):
        cyl('Saucer%.1f' % cy_, (5.9, cy_, 0.77), (5.9, cy_, 0.785), 0.085, cup, 24)
        cyl('Cup%.1f' % cy_, (5.9, cy_, 0.785), (5.9, cy_, 0.855), 0.052, cup, 24)
        cyl('Cof%.1f' % cy_, (5.9, cy_, 0.852), (5.9, cy_, 0.858), 0.046, cof, 24)
    boxm('Napkins', (6.05, 0.0, 0.83), (0.1, 0.16, 0.14), chrome, 0.01)
    boxm('Menu', (5.78, 0.0, 0.775), (0.18, 0.26, 0.012), cup)
    # counter + stools (west)
    boxm('Counter', (-4.2, 0, 0.55), (0.9, 12, 1.1), wood, 0.03)
    boxm('CounterTop', (-4.2, 0, 1.12), (1.1, 12.2, 0.06), formica, 0.01)
    for k in range(7):
        y = -5.0 + k * 1.65
        cyl('StoolP%d' % k, (-3.25, y, 0.05), (-3.25, y, 0.62), 0.035, chrome, 8)
        cyl('StoolS%d' % k, (-3.25, y, 0.62), (-3.25, y, 0.72), 0.2, vinyl, 20)
    boxm('BackBar', (-6.6, 0, 1.3), (0.5, 12, 2.6), wood, 0.02)
    shelf = M.principled('Shelf', base=(0.5, 0.5, 0.48), rough=0.4)
    for z in (1.4, 1.9, 2.4):
        boxm('Shelf%.1f' % z, (-6.3, 0, z), (0.3, 11, 0.04), shelf)
    for k in range(18):
        cyl('Mug%d' % k, (-6.3, -5.2 + k * 0.6, 1.42), (-6.3, -5.2 + k * 0.6, 1.5), 0.045, cup, 12)
    # pendant lamps + ceiling glow
    pm = M.emission('PendantGlow', (1.0, 0.82, 0.55), 7.0)
    for i, y in enumerate((-6, -2, 2, 6)):
        for x in (-1.0, 3.2):
            cyl('PCord%d_%.0f' % (i, x), (x, y, 3.2), (x, y, 2.5), 0.01, chrome, 6)
            boxm('PShade%d_%.0f' % (i, x), (x, y, 2.44), (0.5, 0.5, 0.12), cup, 0.03)
            boxm('PBulb%d_%.0f' % (i, x), (x, y, 2.37), (0.34, 0.34, 0.02), pm)
            Wd.point('PL%d_%.0f' % (i, x), (x, y, 2.2), color=(1.0, 0.8, 0.52), power=110, radius=0.12)
    Wd.area('DinerFill', (0, 0, 3.1), (0, 0, 0), color=(1.0, 0.86, 0.66), power=160, size=9)
    CN.haze(center=(0, 0, 1.6), size=(13.6, 17.6, 3.1), density=0.006, color=(0.95, 0.9, 0.82), anisotropy=0.5, noise=0.2, noise_scale=0.4)


def garage():
    """Police impound garage. Room x -13..13, y -10..10, z 0..4.6. Maroon sedan at the origin, evidence tape on stands."""
    Wd.hdri('moonless_golf', strength=0.02)
    CN.ground('GFloor', 'concrete_floor_worn_001', (26, 20), tile_m=2.5, tint=(0.33, 0.33, 0.34))
    wall = M.texture_set('GWall', 'rough_concrete', scale=3.0, tint=(0.34, 0.37, 0.38), box=True)
    steel = M.principled('GSteel', base=(0.18, 0.19, 0.2), rough=0.4, metal=0.8, grime=0.3)
    boxm('GCeil', (0, 0, 4.62), (26, 20, 0.04), wall)
    boxm('GWallW', (-13.02, 0, 2.3), (0.1, 20, 4.6), wall)
    boxm('GWallE', (13.02, 0, 2.3), (0.1, 20, 4.6), wall)
    boxm('GWallS', (0, -10.02, 2.3), (26, 0.1, 4.6), wall)
    boxm('GWallN', (0, 10.02, 2.3), (26, 0.1, 4.6), wall)
    door = M.principled('RollDoor', base=(0.2, 0.22, 0.23), rough=0.45, metal=0.7)
    for k in range(22):
        boxm('Rib%d' % k, (0, 9.93, 0.1 + k * 0.2), (8.0, 0.06, 0.16), door, 0.01)
    # fluorescent strips
    tube = M.emission('Tube', (0.85, 0.95, 1.0), 9.0)
    for ix in (-6, 0, 6):
        for iy in (-5, 1, 6):
            boxm('Tube%d_%d' % (ix, iy), (ix, iy, 4.5), (0.2, 3.2, 0.04), tube)
    Wd.area('WorkLightA', (0, 0, 4.4), (0, 0, 0), color=(0.85, 0.92, 1.0), power=2400, size=8.0)
    Wd.area('WorkLightB', (7, -3, 4.4), (0, 0, 0.6), color=(0.9, 0.95, 1.0), power=1200, size=3.0)
    sedan('Hero', (0, 0, 0), yaw=0, paint=(0.22, 0.03, 0.04))
    # stains under the car
    ink = M.principled('Oil', base=(0.01, 0.01, 0.012), rough=0.05)
    boxm('Oil', (0.3, -0.1, 0.006), (1.4, 0.9, 0.006), ink)
    # tape on four stands
    tape = M.principled('Tape', base=(0.62, 0.52, 0.14), rough=0.5)
    pts = [(-3.9, -2.6), (3.9, -2.6), (3.9, 2.6), (-3.9, 2.6)]
    for i, (x, y) in enumerate(pts):
        cyl('TStand%d' % i, (x, y, 0), (x, y, 1.15), 0.025, steel, 8)
        cyl('TBase%d' % i, (x, y, 0), (x, y, 0.03), 0.18, steel, 14)
    for i in range(4):
        (x0, y0), (x1, y1) = pts[i], pts[(i + 1) % 4]
        for z in (1.1, 0.85):
            beam('Tape%d_%.2f' % (i, z), (x0, y0, z), (x1, y1, z - 0.04), 0.0016, 0.06, tape)
    # props: workbench, shelves, toolbox, drums
    boxm('Bench', (-11.3, 3, 0.45), (1.2, 5, 0.9), steel, 0.02)
    boxm('BenchTop', (-11.3, 3, 0.92), (1.3, 5.1, 0.06), M.principled('BTop', base=(0.2, 0.15, 0.1), rough=0.5))
    for k in range(4):
        boxm('GShelf%d' % k, (-12.6, -4.5, 0.4 + k * 0.7), (0.5, 4, 0.05), steel)
    for k in range(8):
        boxm('Box%d' % k, (-12.6, -6 + k * 0.5, 0.55 + (k % 4) * 0.7), (0.4, 0.38, 0.28), M.principled('Carton%d' % k, base=(0.28, 0.2, 0.12), rough=0.8))
    boxm('Toolbox', (10.8, -5, 0.55), (0.7, 1.2, 1.1), M.principled('TB', base=(0.18, 0.04, 0.04), rough=0.4, metal=0.5), 0.03)
    cyl('Drum1', (10.5, 5.5, 0), (10.5, 5.5, 0.9), 0.3, M.principled('Drum', base=(0.05, 0.1, 0.18), rough=0.45, metal=0.5), 20)
    CN.haze(center=(0, 0, 2.3), size=(25.4, 19.4, 4.4), density=0.007, color=(0.8, 0.88, 0.95), anisotropy=0.55, noise=0.25, noise_scale=0.3)


def court():
    """Empty 1970s courtroom. Room x -10..10, y -13..13, z 0..7. Judge bench + witness stand at +Y wall, counsel tables, gallery."""
    Wd.hdri('moonless_golf', strength=0.03)
    wood = M.texture_set('CWood', 'wood_table_worn', scale=1.2, tint=(0.30, 0.19, 0.12), box=True)
    wood2 = M.texture_set('CWood2', 'wood_table_worn', scale=1.2, tint=(0.44, 0.30, 0.20), box=True)
    plaster = M.principled('CPlaster', base=(0.45, 0.45, 0.42), rough=0.85, grime=0.25)
    floor = M.principled('CFloor', base=(0.05, 0.06, 0.055), rough=0.3, grime=0.2)
    brass = M.principled('Brass', base=(0.7, 0.52, 0.2), rough=0.25, metal=1.0)
    leath = M.principled('Leather', base=(0.04, 0.1, 0.07), rough=0.5, coat=0.2)
    boxm('CFloor', (0, 0, -0.02), (20, 26, 0.04), floor)
    boxm('CCeil', (0, 0, 7.02), (20, 26, 0.04), plaster)
    boxm('CWallN', (0, 13.05, 3.5), (20, 0.1, 7), wood)
    boxm('CWallS', (0, -13.05, 3.5), (20, 0.1, 7), plaster)
    boxm('CWallW', (-10.05, 0, 3.5), (0.1, 26, 7), plaster)
    boxm('CWallE', (10.05, 0, 3.5), (0.1, 26, 7), plaster)
    for k in range(-4, 5):                                         # wainscot panels behind the bench
        boxm('Pan%d' % k, (k * 2.2, 12.95, 2.2), (2.0, 0.08, 3.4), wood2, 0.03)
    # tall windows on the west wall (cold dusk light)
    cold = M.emission('CWin', (0.55, 0.68, 0.95), 3.0)
    for k in range(5):
        boxm('CWinP%d' % k, (-9.98, -9 + k * 4.2, 4.0), (0.06, 2.0, 3.4), cold)
        boxm('CWinM%d' % k, (-9.95, -9 + k * 4.2, 4.0), (0.07, 0.07, 3.4), wood)
    Wd.area('CWinLight', (-9.0, 0, 4.2), (6, 0, 1.0), color=(0.62, 0.75, 1.0), power=5200, size=18)
    # judge's bench (raised), witness stand, clerk
    boxm('Bench', (0, 10.8, 0.75), (6.2, 1.9, 1.5), wood, 0.04)
    boxm('BenchTop', (0, 10.3, 1.55), (6.5, 1.0, 0.09), wood2, 0.02)
    boxm('BenchDais', (0, 10.9, 0.12), (8.0, 3.2, 0.24), wood)
    boxm('JChair', (0, 11.6, 1.95), (0.9, 0.24, 1.0), leath, 0.08)
    boxm('JSeat', (0, 11.2, 1.7), (0.9, 0.85, 0.2), leath, 0.06)
    boxm('WitBox', (-5.6, 10.0, 0.55), (2.0, 1.7, 1.1), wood, 0.04)
    boxm('WitRail', (-5.6, 9.1, 1.2), (2.0, 0.08, 0.28), wood2, 0.02)
    boxm('WitSeat', (-5.6, 10.3, 1.2), (0.7, 0.7, 0.16), leath, 0.05)
    boxm('WitBack', (-5.6, 10.7, 1.55), (0.7, 0.1, 0.62), leath, 0.05)
    boxm('Clerk', (5.4, 9.4, 0.55), (3.0, 1.2, 1.1), wood, 0.03)
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.8, depth=0.06, location=(0, 12.86, 5.0))
    seal = bpy.context.active_object; seal.rotation_euler = (math.pi / 2, 0, 0); seal.name = 'Seal'
    M.assign(seal, brass)
    # counsel tables + chairs
    for sx in (-3.6, 3.6):
        boxm('Tbl%.0f' % sx, (sx, 4.2, 0.4), (3.6, 1.3, 0.8), wood2, 0.02)
        for k in range(2):
            ch = (sx - 0.8 + k * 1.6, 3.0)
            boxm('CCh%.0f_%d' % (sx, k), (ch[0], ch[1], 0.5), (0.55, 0.55, 0.08), leath, 0.03)
            boxm('CChB%.0f_%d' % (sx, k), (ch[0], ch[1] - 0.3, 0.9), (0.55, 0.08, 0.8), leath, 0.03)
    # jury box (east)
    boxm('Jury', (8.5, 5.0, 0.4), (2.0, 6.5, 0.8), wood, 0.03)
    for k in range(6):
        boxm('JSeat%d' % k, (8.8, 2.4 + k * 1.0, 1.2), (0.6, 0.6, 0.12), leath, 0.04)
    # bar rail + gallery pews
    boxm('BarRail', (0, 0.5, 0.55), (13.0, 0.12, 1.1), wood, 0.02)
    for r in range(6):
        y = -2.5 - r * 1.7
        for sx in (-5.0, 5.0):
            boxm('Pew%d_%.0f' % (r, sx), (sx, y, 0.22), (7.0, 0.55, 0.44), wood2, 0.02)
            boxm('PewB%d_%.0f' % (r, sx), (sx, y - 0.28, 0.7), (7.0, 0.1, 0.9), wood2, 0.02)
    # pendants
    pm = M.emission('CPend', (1.0, 0.84, 0.6), 7.0)
    for ix in (-6, 0, 6):
        for iy in (-8, -2, 4, 9):
            cyl('CCord%d_%d' % (ix, iy), (ix, iy, 7.0), (ix, iy, 5.6), 0.012, brass, 6)
            boxm('CShade%d_%d' % (ix, iy), (ix, iy, 5.55), (0.8, 0.8, 0.18), brass, 0.05)
            boxm('CBulb%d_%d' % (ix, iy), (ix, iy, 5.44), (0.6, 0.6, 0.03), pm)
            Wd.point('CPL%d_%d' % (ix, iy), (ix, iy, 5.2), color=(1.0, 0.8, 0.55), power=420, radius=0.2)
    Wd.spot('BenchSpot', (0, 3, 6.6), (0, 10.5, 1.6), color=(1.0, 0.84, 0.62), power=2800, size_deg=50, blend=0.7, radius=0.3)
    Wd.spot('WitSpot', (-3.5, 3, 6.6), (-5.6, 10.0, 1.2), color=(1.0, 0.86, 0.66), power=2600, size_deg=34, blend=0.7, radius=0.3)
    CN.haze(center=(0, 0, 3.5), size=(19.6, 25.6, 6.9), density=0.0045, color=(0.88, 0.9, 0.95), anisotropy=0.6, noise=0.3, noise_scale=0.25)


def lab():
    """Forensic lab bench, 2001. Evidence bag with a hair strand under a desk lamp; microscope; shelves."""
    Wd.hdri('moonless_golf', strength=0.03)
    wall = M.principled('LWall', base=(0.38, 0.42, 0.42), rough=0.7, grime=0.2)
    black = M.principled('Epoxy', base=(0.012, 0.014, 0.016), rough=0.12, spec=0.6)
    steel = M.principled('LSteel', base=(0.5, 0.52, 0.55), rough=0.25, metal=1.0)
    cab = M.principled('Cabinet', base=(0.28, 0.32, 0.34), rough=0.5)
    floor = M.principled('LFloor', base=(0.14, 0.15, 0.16), rough=0.3)
    boxm('LFloor', (0, 0, -0.02), (10, 8, 0.04), floor)
    boxm('LCeil', (0, 0, 3.02), (10, 8, 0.04), wall)
    boxm('LWallN', (0, 3.05, 1.5), (10, 0.1, 3), wall)
    boxm('LWallS', (0, -3.95, 1.5), (10, 0.1, 3), wall)
    boxm('LWallW', (-5.05, 0, 1.5), (0.1, 8, 3), wall)
    boxm('LWallE', (5.05, 0, 1.5), (0.1, 8, 3), wall)
    boxm('LBase', (0, 1.0, 0.45), (6.0, 1.3, 0.9), cab, 0.02)
    boxm('LTop', (0, 1.0, 0.92), (6.1, 1.4, 0.05), black, 0.005)
    for k in range(8):
        boxm('LDoor%d' % k, (-2.6 + k * 0.74, 0.34, 0.45), (0.7, 0.02, 0.8), cab, 0.01)
    for z in (1.5, 2.1, 2.7):
        boxm('LShelf%.1f' % z, (0, 2.75, z), (6.0, 0.4, 0.04), steel)
    jars = M.thin_glass('Jar', refl=0.1, tint=(0.8, 0.95, 0.9))
    for k in range(26):
        z = (1.5, 2.1, 2.7)[k % 3] + 0.12
        cyl('Jar%d' % k, (-2.8 + k * 0.22, 2.75, z - 0.08), (-2.8 + k * 0.22, 2.75, z + 0.12), 0.06, jars, 14)
    # evidence bag (transparent) with hair strand and a seal strip
    bag = M.thin_glass('Bag', refl=0.18, tint=(0.95, 0.97, 1.0))
    boxm('Bag', (0.0, 0.0, 0.962), (0.36, 0.26, 0.012), bag, 0.004)
    seal = M.principled('BagSeal', base=(0.55, 0.14, 0.1), rough=0.5)
    boxm('BagSeal', (0.0, 0.1, 0.971), (0.36, 0.035, 0.004), seal)
    paper = M.principled('Tag', base=(0.8, 0.78, 0.7), rough=0.7)
    boxm('BagTag', (-0.13, -0.08, 0.970), (0.1, 0.06, 0.003), paper)
    hair = M.principled('HairM', base=(0.06, 0.035, 0.02), rough=0.35)
    pts = [(-0.09 + 0.018 * k, -0.01 + 0.015 * math.sin(k * 1.1), 0.97 + 0.002 * (k % 2)) for k in range(11)]
    curve_poly('Hair', pts, bevel=0.0014, mat=hair)
    # microscope
    mic = M.principled('Micro', base=(0.05, 0.055, 0.06), rough=0.3, metal=0.8)
    boxm('MBase', (0.75, 0.2, 0.95), (0.18, 0.25, 0.04), mic, 0.01)
    cyl('MPillar', (0.75, 0.3, 0.95), (0.75, 0.3, 1.28), 0.03, mic, 12)
    beam('MArm', (0.75, 0.3, 1.2), (0.75, 0.18, 1.42), 0.05, 0.05, mic)
    cyl('MTube', (0.75, 0.15, 1.4), (0.75, 0.04, 1.14), 0.035, steel, 16)
    boxm('MStage', (0.75, 0.15, 1.02), (0.12, 0.12, 0.01), steel)
    # laptop with a glowing screen + beaker
    scr = M.emission('Laptop', (0.5, 0.75, 1.0), 2.0)
    boxm('LapBase', (-0.95, 0.2, 0.95), (0.34, 0.24, 0.015), mic, 0.004)
    lp = boxm('LapScr', (-0.95, 0.33, 1.08), (0.34, 0.012, 0.22), scr)
    lp.rotation_euler = (math.radians(-12), 0, 0)
    cyl('Beaker', (-0.45, -0.1, 0.945), (-0.45, -0.1, 1.05), 0.04, jars, 16)
    Wd.spot('Desk', (0.35, -0.45, 1.55), (0.0, 0.0, 0.96), color=(1.0, 0.86, 0.66), power=130, size_deg=36, blend=0.7, radius=0.04)
    boxm('LampBase', (0.5, -0.55, 0.95), (0.12, 0.12, 0.03), mic)
    beam('LampArm', (0.5, -0.55, 0.96), (0.38, -0.5, 1.5), 0.012, 0.012, mic)
    lh = M.emission('LampHead', (1.0, 0.85, 0.62), 12.0)
    boxm('LampHead', (0.36, -0.5, 1.53), (0.16, 0.1, 0.05), lh, 0.01)
    Wd.area('LabCool', (0, 0, 2.95), (0, 0.5, 0.9), color=(0.75, 0.88, 1.0), power=380, size=3.5)
    CN.haze(center=(0, 0, 1.5), size=(9.8, 7.8, 2.9), density=0.004, color=(0.85, 0.92, 0.95), anisotropy=0.4, noise=0.2, noise_scale=0.4)


def field():
    """Open field near Detroit, 2013: long open trench with spoil mounds and an excavator, survey stakes, low sun."""
    CN.hdri_sun('kloppenheim_02_puresky', sun_az=70, strength=0.7, tint=(0.95, 0.95, 1.05))
    CN.sun(elev=8, az=70, warmth='golden', strength=3.2, check=False)
    soil = M.texture_set('FieldSoil', 'farm_soil', scale=1.0, tint=(0.34, 0.29, 0.24), box=True)
    grass = M.texture_set('FieldGrass', 'forest_ground_04', scale=1.0, tint=(0.30, 0.34, 0.2), box=True)
    # ground as slabs around the trench x in [-3,3], y in [-10,10]
    big = 400
    def slab(name, c, s, m):
        o = Wd.box(name, c, s); o.data.materials.append(m)
    slab('GL', (-3 - big / 2, 0, -2.0), (big, big * 2, 4.0), grass)
    slab('GR', (3 + big / 2, 0, -2.0), (big, big * 2, 4.0), grass)
    slab('GF', (0, -10 - big / 2, -2.0), (6.0, big, 4.0), grass)
    slab('GB', (0, 10 + big / 2, -2.0), (6.0, big, 4.0), grass)
    slab('TrenchFloor', (0, 0, -2.6), (6.0, 20.0, 1.0), soil)
    # spoil mounds
    for i, (x, y, sx, sy, sz) in enumerate(((-7.5, -4, 4.5, 8, 1.4), (-6.8, 5.5, 4, 6, 1.1), (7.8, -6, 3.6, 5, 1.0))):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, radius=1.0, location=(x, y, 0.0))
        o = bpy.context.active_object; o.name = 'Spoil%d' % i
        o.scale = (sx, sy, sz); bpy.ops.object.shade_smooth()
        M.assign(o, soil)
    # excavator (muted orange-ochre), boom reaching over the trench
    body = M.principled('ExcBody', base=(0.5, 0.25, 0.04), rough=0.5, metal=0.2, grime=0.35)
    dark = M.principled('ExcDark', base=(0.02, 0.022, 0.025), rough=0.7, grime=0.2)
    glass = M.principled('ExcGlass', base=(0.04, 0.06, 0.08), rough=0.05, spec=0.8)
    ex, ey = 9.5, 0.0
    for sy in (-1.15, 1.15):
        boxm('Track%.1f' % sy, (ex, ey + sy, 0.5), (4.4, 0.85, 1.0), dark, 0.12)
    boxm('ExcDeck', (ex, ey, 1.25), (3.6, 2.4, 0.6), body, 0.05)
    boxm('ExcEngine', (ex + 1.5, ey, 1.9), (1.3, 2.2, 0.9), body, 0.06)
    boxm('ExcCab', (ex - 0.5, ey + 0.2, 2.15), (1.5, 1.5, 1.5), glass, 0.08)
    boxm('ExcRoof', (ex - 0.5, ey + 0.2, 2.95), (1.7, 1.7, 0.08), body, 0.02)
    p0 = Vector((ex - 1.2, ey, 1.7)); p1 = Vector((ex - 5.4, ey, 4.4)); p2 = Vector((ex - 8.3, ey, 1.6))
    beam('Boom', p0, p1, 0.5, 0.6, body)
    beam('Stick', p1, p2, 0.36, 0.42, body)
    beam('Ram', p0 + Vector((-0.3, 0.2, 0.2)), p1 + Vector((0.2, 0.2, -0.4)), 0.14, 0.14, dark)
    bk = boxm('Bucket', (p2.x - 0.15, ey, p2.z - 0.35), (0.7, 1.25, 0.7), dark, 0.06)
    bk.rotation_euler = (0, math.radians(35), 0)
    # survey stakes + ribbons (muted pale blue) around the trench
    st = M.principled('Stake', base=(0.55, 0.45, 0.28), rough=0.7)
    rb = M.principled('Ribbon', base=(0.35, 0.55, 0.7), rough=0.6)
    for k in range(10):
        for sx in (-5.2, 5.2):
            y = -9 + k * 2.0
            cyl('Stake%d_%.0f' % (k, sx), (sx, y, 0), (sx, y, 0.9), 0.015, st, 6)
            boxm('Rib%d_%.0f' % (k, sx), (sx, y, 0.85), (0.02, 0.18, 0.06), rb)
    cone = M.principled('Cone', base=(0.5, 0.2, 0.04), rough=0.5)
    for i, (x, y) in enumerate(((-5.5, -11), (5.5, -11), (0, -12.5))):
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.2, radius2=0.03, depth=0.7, location=(x, y, 0.35))
        c = bpy.context.active_object; c.name = 'Cone%d' % i; M.assign(c, cone)
    CN.scatter('fir_tree_01', 55, (-120, 120, 60, 130), seed=5, scale=(1.6, 2.6))
    CN.haze(center=(0, 20, 6), size=(260, 120, 14), density=0.0022, color=(0.95, 0.88, 0.8), anisotropy=0.65, noise=0.3, noise_scale=0.04, height_falloff=0.5)


def bridge():
    """Steel through-truss road bridge over a river at dusk (New Jersey look, generic). Span along X, deck z=7.5, water z=0.
    Banks at z=0.8 beyond |x|>20. GPR cart on the east bank under the deck approach."""
    dusk_sky(sun_az=285, hdri_strength=0.7, sun=2.0, elev=4.0)
    steel = M.principled('BrSteel', base=(0.16, 0.17, 0.18), rough=0.55, metal=0.7, grime=0.4)
    conc = M.texture_set('BrConc', 'rough_concrete', scale=2.0, tint=(0.38, 0.38, 0.37), box=True)
    water = M.principled('River', base=(0.012, 0.022, 0.03), rough=0.05, spec=0.8)
    bank = M.texture_set('BrBank', 'rocky_terrain_02', scale=2.0, tint=(0.34, 0.3, 0.25), box=True)
    grass = M.texture_set('BrGrass', 'forest_ground_04', scale=1.0, tint=(0.24, 0.27, 0.18), box=True)
    boxm('RiverPlane', (0, 0, -0.05), (40, 700, 0.1), water)
    boxm('BankE', (20 + 120, 0, -1.6), (240, 700, 4.8), bank)                  # top z=0.8
    boxm('BankW', (-20 - 120, 0, -1.6), (240, 700, 4.8), bank)
    # abutments + piers under the deck ends
    for sx in (-1, 1):
        boxm('Abut%d' % sx, (sx * 27.5, 0, 3.8), (3.0, 11.0, 7.6), conc, 0.05)
        boxm('Pier%d' % sx, (sx * 18.5, 0, 3.6), (1.6, 8.0, 7.2), conc, 0.05)
    # deck
    boxm('Deck', (0, 0, 7.4), (56, 9.2, 0.45), conc, 0.03)
    asph = M.principled('BrAsph', base=(0.03, 0.03, 0.033), rough=0.8)
    boxm('Road', (0, 0, 7.65), (56, 7.6, 0.06), asph)
    lane = M.principled('Lane', base=(0.6, 0.55, 0.3), rough=0.6)
    for k in range(-13, 14):
        boxm('Lane%d' % k, (k * 2.0, 0, 7.69), (1.1, 0.12, 0.01), lane)
    # trusses: top chord z=14, verticals each 4 m, diagonals
    for sy in (-4.4, 4.4):
        beam('Bot%.1f' % sy, (-28, sy, 7.9), (28, sy, 7.9), 0.5, 0.5, steel)
        beam('Top%.1f' % sy, (-24, sy, 13.8), (24, sy, 13.8), 0.55, 0.55, steel)
        beam('EndPostA%.1f' % sy, (-28, sy, 7.9), (-24, sy, 13.8), 0.5, 0.5, steel)
        beam('EndPostB%.1f' % sy, (28, sy, 7.9), (24, sy, 13.8), 0.5, 0.5, steel)
        xs = [-24 + 4 * k for k in range(13)]
        for k, x in enumerate(xs):
            beam('V%.1f_%d' % (sy, k), (x, sy, 7.9), (x, sy, 13.8), 0.32, 0.32, steel)
            if k < 12:
                if k < 6:
                    beam('D%.1f_%d' % (sy, k), (x, sy, 7.9), (x + 4, sy, 13.8), 0.22, 0.22, steel)
                else:
                    beam('D%.1f_%d' % (sy, k), (x, sy, 13.8), (x + 4, sy, 7.9), 0.22, 0.22, steel)
    for k, x in enumerate(range(-24, 25, 4)):                                  # top sway bracing
        beam('Sway%d' % k, (x, -4.4, 13.5), (x, 4.4, 13.5), 0.25, 0.25, steel)
    boxm('Floorbeams', (0, 0, 7.05), (56, 9.0, 0.3), steel, 0.02)
    # railings + lamps on the approaches
    for sy in (-4.6, 4.6):
        boxm('Rail%.1f' % sy, (0, sy, 8.4), (56, 0.08, 0.08), steel)
    for x in (-20, 20):
        lamp_post('BrL%d' % x, x, -5.4, h=6.5, power=3000, yaw=90, arm=-1.0)
    # river reeds / rocks on the banks
    CN.scatter('fir_tree_01', 40, (26, 140, -140, 140), seed=11, scale=(1.4, 2.3), z=0.8, avoid=lambda x, y: abs(y) < 12)
    CN.scatter('fir_tree_01', 40, (-140, -26, -140, 140), seed=12, scale=(1.4, 2.3), z=0.8, avoid=lambda x, y: abs(y) < 12)
    CN.haze(center=(0, 0, 6), size=(120, 200, 14), density=0.003, color=(0.8, 0.84, 0.95), anisotropy=0.5, noise=0.3, noise_scale=0.05, height_falloff=0.4)


def gpr_cart(loc=(23.5, 0.5, 0.8), yaw=0.0):
    """Ground-penetrating-radar cart (bright generic survey cart): 4 wheels, deck, handle, small screen. Plus survey flags."""
    body = M.principled('GPRBody', base=(0.12, 0.2, 0.3), rough=0.45, metal=0.3)
    tire = M.principled('GPRTire', base=(0.015, 0.015, 0.015), rough=0.85)
    alu = M.principled('GPRAlu', base=(0.7, 0.72, 0.75), rough=0.3, metal=1.0)
    scr = M.emission('GPRScr', (0.4, 0.8, 1.0), 3.0)
    root = Md.empty('GPR', (0, 0, 0))
    parts = [boxm('GPRBox', (0, 0, 0.28), (0.7, 0.5, 0.2), body, 0.03)]
    for sx in (0.28, -0.28):
        for sy in (0.28, -0.28):
            parts.append(cyl('GPRW%.2f%.2f' % (sx, sy), (sx, sy - 0.03, 0.12), (sx, sy + 0.03, 0.12), 0.12, tire, 16))
    parts.append(beam('GPRHandle', (-0.3, 0, 0.35), (-0.95, 0, 1.0), 0.025, 0.025, alu))
    parts.append(beam('GPRBar', (-0.95, -0.2, 1.0), (-0.95, 0.2, 1.0), 0.03, 0.03, alu))
    parts.append(boxm('GPRScreen', (-0.9, 0, 1.08), (0.04, 0.3, 0.2), scr))
    for p in parts:
        p.parent = root
    root.location = loc
    root.rotation_euler = (0, 0, math.radians(yaw))
    flag = M.principled('SFlag', base=(0.55, 0.3, 0.1), rough=0.6)
    wire = M.principled('SWire', base=(0.5, 0.5, 0.5), rough=0.4, metal=0.9)
    for i in range(4):
        for j in range(3):
            x, y = loc[0] - 3.5 + i * 2.2, loc[1] - 4.0 + j * 3.0
            cyl('Sw%d_%d' % (i, j), (x, y, loc[2]), (x, y, loc[2] + 0.5), 0.006, wire, 5)
            boxm('Sf%d_%d' % (i, j), (x, y + 0.06, loc[2] + 0.44), (0.01, 0.12, 0.09), flag)
    # worklight tripod
    Wd.spot('GPRFlood', (loc[0] + 3.0, loc[1] - 6.5, loc[2] + 2.6), (loc[0], loc[1], loc[2] + 0.3), color=(1.0, 0.86, 0.66), power=5200, size_deg=60, blend=0.8, radius=0.2)
    cyl('Tripod', (loc[0] + 3.0, loc[1] - 6.5, loc[2]), (loc[0] + 3.0, loc[1] - 6.5, loc[2] + 2.5), 0.03, wire, 8)
    return root
