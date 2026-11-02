"""IA What-If LOOK TEST (not an episode, never posted): cockpit of the crew's hijacked orbital salvage ship, year 2142.
Worn, lived-in interior; pilot console with glowing screens and Zib's red button; big front window onto Jupiter + stars.
One slow cruise-eased push-in, 240 f, NO shake, NO dust/particles. Crew (2D rig) is composited in Remotion.
Layers:  --layer bg  (default) everything except FG_* objects (FG still cast shadows/bounce)
         --layer fg  only FG_* objects (low side console edge bottom-right + overhead cable bundle), transparent film -> RGBA PNG
Red button flash keyed at BOOP (frame 120): button emission + red point light + screens tint red.
Camera must match /workspace/work/look_test/plan.py (P0, P1, LK, lens 24) - Remotion projects the crew with the same numbers.
All assets procedural or CC0 Poly Haven (metal_plate, concrete_floor_worn_001 textures)."""
import sys, os, math, random, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
import bpy
import numpy as np
from mathutils import Vector
from kit import core, camera as C, world as Wd, mat as M, interiors as I

a = core.args()
LAYER = 'bg'
if '--layer' in a.extra:
    LAYER = a.extra[a.extra.index('--layer') + 1]
sc = core.reset()
NF = 240
BOOP = 120
rnd = random.Random(2142)
core.setup_render(sc, samples=20, look='AgX - Medium High Contrast', exposure=0.55, bounces=5, clamp_ind=5.0,
                  vol_step=8.0, vol_max_steps=16)
if LAYER == 'bg':
    core.finish(sc, glare=0.6, glare_thr=1.0, glare_size=8, vignette=0.32, lens_dist=0.0, dispersion=0.0,
                lift=(0.99, 1.0, 1.04), gain=(1.03, 1.0, 0.96), sat=0.96)
else:
    sc.use_nodes = False
    sc.render.film_transparent = True
    sc.render.image_settings.color_mode = 'RGBA'

# ---------------------------------------------------------------- world: black space + procedural stars
w = bpy.data.worlds.new('Space')
sc.world = w
w.use_nodes = True
nt = w.node_tree
nb = M.NB(nt)
for n in list(nt.nodes):
    if n.type != 'OUTPUT_WORLD':
        nt.nodes.remove(n)
wout = [n for n in nt.nodes if n.type == 'OUTPUT_WORLD'][0]
tc = nb.n('ShaderNodeTexCoord')
vo = nb.n('ShaderNodeTexVoronoi', Scale=110.0)
nb.l(tc, 'Generated', vo, 'Vector')
mr = nb.n('ShaderNodeMapRange')
mr.inputs['From Min'].default_value = 0.0
mr.inputs['From Max'].default_value = 0.12
mr.inputs['To Min'].default_value = 1.0
mr.inputs['To Max'].default_value = 0.0
nb.l(vo, 'Distance', mr, 'Value')
pw = nb.math('POWER', mr.outputs['Result'], vb=6.0)
nz = nb.n('ShaderNodeTexNoise', Scale=40.0)
nb.l(tc, 'Generated', nz, 'Vector')
gate = nb.math('GREATER_THAN', nz.outputs['Fac'], vb=0.52)
st = nb.math('MULTIPLY', pw.outputs[0], gate.outputs[0])
st2 = nb.math('MULTIPLY', st.outputs[0], vb=6.0)
bgc = nb.n('ShaderNodeBackground')
bgc.inputs['Color'].default_value = (0.0006, 0.0008, 0.0016, 1)
bgs = nb.n('ShaderNodeBackground')
bgs.inputs['Color'].default_value = (0.85, 0.9, 1.0, 1)
nb.l(st2, 0, bgs, 'Strength')
add = nb.n('ShaderNodeAddShader')
nb.l(bgc, 'Background', add, 0)
nb.l(bgs, 'Background', add, 1)
nb.l(add, 'Shader', wout, 'Surface')
try:
    w.cycles_visibility.diffuse = False  # stars never light the room
    w.cycles_visibility.glossy = False
except Exception:
    pass

# ---------------------------------------------------------------- materials
hull = M.texture_set('Hull', 'metal_plate', scale=1.2, tint=(0.42, 0.46, 0.5), box=True, rough_mul=1.0)
floor_m = M.texture_set('Deck', 'metal_plate', scale=1.6, tint=(0.22, 0.23, 0.25), box=True, rough_mul=0.9)
paint_m = M.principled('PanelPaint', base=(0.10, 0.13, 0.16), rough=0.55, grime=0.5, rough_noise=0.2, bump=0.05)
paint2 = M.principled('PanelPaint2', base=(0.20, 0.17, 0.12), rough=0.6, grime=0.55, rough_noise=0.2, bump=0.05)
dark = M.principled('DarkMetal', base=(0.03, 0.033, 0.036), rough=0.45, metal=0.7, grime=0.4)
rubber = M.principled('Rubber', base=(0.012, 0.012, 0.014), rough=0.7)
cable_r = M.principled('CableRed', base=(0.35, 0.04, 0.03), rough=0.6)
cable_y = M.principled('CableYel', base=(0.5, 0.36, 0.05), rough=0.6)
cable_b = M.principled('CableBlu', base=(0.03, 0.12, 0.3), rough=0.6)
glass = M.thin_glass('Window', refl=0.015)


def hazard(name, scale=14.0):
    m, nb2, b, out = M.new(name)
    tc2 = nb2.n('ShaderNodeTexCoord')
    wv = nb2.n('ShaderNodeTexWave', Scale=scale, Distortion=0.0)
    wv.wave_profile = 'SAW'
    nb2.l(tc2, 'Object', wv, 'Vector')
    gt = nb2.math('GREATER_THAN', wv.outputs['Fac'], vb=0.5)
    mx = nb2.n('ShaderNodeMix')
    mx.data_type = 'RGBA'
    mx.inputs[6].default_value = (0.02, 0.02, 0.02, 1)
    mx.inputs[7].default_value = (0.75, 0.52, 0.04, 1)
    nb2.l(gt, 0, mx, 'Factor')
    nb2.l(mx, 2, b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.6
    return m


haz = hazard('Hazard')


def bx(name, c, s, m, rot=None, bev=0.01):
    o = Wd.box(name, c, s)
    if rot:
        o.rotation_euler = [math.radians(r) for r in rot]
    o.data.materials.append(m)
    if bev:
        I.bevel(o, bev, 2)
    return o


def cyl(name, c, r, h, m, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=c, rotation=[math.radians(x) for x in rot])
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o


def cable(name, pts, r, m):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 3
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, cu)
    sc.collection.objects.link(o)
    cu.materials.append(m)
    return o


def screen_img(name, kind, seed, w=512, h=320):
    r = np.random.RandomState(seed)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    img = np.zeros((h, w, 3), np.float32)
    img[...] = (0.004, 0.02, 0.035)
    cy = np.array([0.15, 0.85, 1.0])
    grid = ((x % 32) < 1) | ((y % 32) < 1)
    img[grid] = cy * 0.12
    if kind == 0:  # waveform + bars
        for k, (amp, fr, ph, off) in enumerate([(40, 0.03, 0, 110), (22, 0.071, 1, 120), (14, 0.15, 2, 230)]):
            wy = off + amp * np.sin(x * fr + ph) * (0.6 + 0.4 * np.sin(x * 0.011 + k))
            img[np.abs(y - wy) < 1.6] = cy if k < 2 else np.array([1.0, 0.7, 0.2])
        for i in range(10):
            bh = r.randint(20, 90)
            img[(x > 300 + i * 20) & (x < 314 + i * 20) & (y > 300 - bh) & (y < 300)] = cy * 0.8
    elif kind == 1:  # orbit/radar plot
        cx, cyy = w * 0.38, h * 0.5
        rr = np.sqrt((x - cx) ** 2 + (y - cyy) ** 2)
        for R in (40, 80, 120):
            img[np.abs(rr - R) < 1.2] = cy * 0.6
        el = np.sqrt(((x - cx) / 140) ** 2 + ((y - cyy) / 60) ** 2)
        img[np.abs(el - 1) < 0.012] = np.array([1.0, 0.65, 0.2])
        img[rr < 9] = np.array([1.0, 0.75, 0.4])
        for i in range(9):
            img[(x > 330) & (x < 330 + r.randint(60, 160)) & (np.abs(y - (50 + i * 26)) < 4)] = cy * (0.5 + 0.5 * (i == 3))
    else:  # ship schematic + warning tags
        img[(np.abs(y - h * 0.5) < 26) & (x > 60) & (x < 420)] = cy * 0.25
        img[(np.abs(np.abs(y - h * 0.5) - 26) < 1.5) & (x > 60) & (x < 420)] = cy
        img[(np.abs(x - 60) < 1.5) & (np.abs(y - h * 0.5) < 26)] = cy
        img[(np.abs(x - 420) < 1.5) & (np.abs(y - h * 0.5) < 26)] = cy
        for i in range(4):
            xx = 90 + i * 85
            img[(np.abs(x - xx) < 22) & (np.abs(y - h * 0.5 + 70) < 10)] = np.array([1.0, 0.45, 0.15]) * (1 if i == 2 else 0.4)
        for i in range(6):
            img[(x > 40) & (x < 40 + r.randint(80, 300)) & (np.abs(y - (250 + i * 10)) < 2)] = cy * 0.7
    img = img[::-1]
    return I._img(name, np.clip(img, 0, 1))


def screen_mat(name, kind, seed, strength=2.2, scroll=0.0, wall=False):
    m, nb2, b, out = M.new(name)
    M.no_light(m)
    m.node_tree.nodes.remove(b)
    tc2 = nb2.n('ShaderNodeTexCoord')
    mp = nb2.n('ShaderNodeMapping')
    if wall:  # boxes have no UVs: use bbox-normalised Generated coords, (y, z) -> (u, v)
        sp2 = nb2.n('ShaderNodeSeparateXYZ')
        nb2.l(tc2, 'Generated', sp2, 'Vector')
        cb2 = nb2.n('ShaderNodeCombineXYZ')
        nb2.l(sp2, 'Y', cb2, 'X')
        nb2.l(sp2, 'Z', cb2, 'Y')
        nb2.l(cb2, 'Vector', mp, 'Vector')
    else:
        nb2.l(tc2, 'UV', mp, 'Vector')
    if scroll:
        M.animate(mp.inputs['Location'], 'default_value', [(0, (0, 0, 0)), (NF, (scroll, 0, 0))])
        M.set_interp(m.node_tree, 'LINEAR', extrapolate=True)
    tx = nb2.n('ShaderNodeTexImage')
    tx.image = screen_img(name + '_img', kind, seed)
    tx.extension = 'REPEAT'
    nb2.l(mp, 'Vector', tx, 'Vector')
    mx = nb2.n('ShaderNodeMix')
    mx.data_type = 'RGBA'
    mx.blend_type = 'MIX'
    nb2.l(tx, 'Color', mx, 6)
    mx.inputs[7].default_value = (1.0, 0.05, 0.03, 1)
    fac = mx.inputs['Factor']
    fac.default_value = 0.0
    M.animate(fac, 'default_value', FLASH_KEYS_SCR)
    em = nb2.n('ShaderNodeEmission', Strength=strength)
    nb2.l(mx, 2, em, 'Color')
    nb2.l(em, 'Emission', out, 'Surface')
    return m


# flash envelope (frame, value 0..1): two quick red pulses then decay
FLASH = [(0, 0.0), (BOOP - 1, 0.0), (BOOP + 2, 1.0), (BOOP + 7, 0.25), (BOOP + 11, 0.9), (BOOP + 18, 0.3), (BOOP + 30, 0.08), (BOOP + 45, 0.0)]
FLASH_KEYS_SCR = [(f, v * 0.55) for f, v in FLASH]

# ---------------------------------------------------------------- shell: floor, walls, roof, ribs
XW, Y0, YF, ZR = 1.85, -3.3, 2.45, 2.75
bx('Floor', (0, (Y0 + YF) / 2, -0.04), (2 * XW, YF - Y0, 0.08), floor_m, bev=0)
bx('FloorStrip', (0, 1.32, 0.003), (2.6, 0.12, 0.006), haz, bev=0)
for i, xx in enumerate((-0.9, 0.9)):
    bx('Grate%d' % i, (xx, -0.4, 0.004), (0.06, 5.0, 0.008), dark, bev=0)
bx('WallL', (-XW - 0.04, (Y0 + YF) / 2, ZR / 2), (0.08, YF - Y0, ZR), hull, bev=0)
bx('WallR', (XW + 0.04, (Y0 + YF) / 2, ZR / 2), (0.08, YF - Y0, ZR), hull, bev=0)
bx('Roof', (0, (Y0 + YF) / 2, ZR + 0.04), (2 * XW + 0.2, YF - Y0, 0.08), hull, bev=0)
bx('BackWall', (0, Y0 - 0.04, ZR / 2), (2 * XW, 0.08, ZR), paint_m, bev=0)
# ribs every 0.7 m: wall posts + ceiling beam, chamfered upper corners
for k, yy in enumerate(np.arange(-2.6, 2.2, 0.7)):
    for s in (-1, 1):
        bx('RibW%d_%d' % (k, s), (s * (XW - 0.07), yy, 1.1), (0.14, 0.1, 2.2), paint_m, bev=0.012)
        bx('RibC%d_%d' % (k, s), (s * (XW - 0.32), yy, ZR - 0.25), (0.62, 0.1, 0.14), paint_m, rot=(0, s * 35, 0), bev=0.012)
    bx('RibT%d' % k, (0, yy, ZR - 0.06), (2 * XW - 0.8, 0.1, 0.12), paint_m, bev=0.012)
# wall panels (inset, mixed paint = patched-up salvage ship), small wall displays
for k, yy in enumerate(np.arange(-2.25, 1.9, 0.7)):
    for s in (-1, 1):
        m = paint2 if rnd.random() < 0.3 else paint_m
        bx('Pan%d_%d' % (k, s), (s * (XW - 0.05), yy, 1.25), (0.04, 0.56, 0.9), m, bev=0.008)
        if rnd.random() < 0.35:
            o = bx('WallScr%d_%d' % (k, s), (s * (XW - 0.08), yy, 1.45), (0.01, 0.26, 0.16), screen_mat('WS%d_%d' % (k, s), k % 3, 40 + k * 2 + s, 1.4, wall=True), bev=0)
# pipes along both walls
for s in (-1, 1):
    for zz, rr, mm in ((2.28, 0.045, dark), (2.18, 0.025, cable_y), (0.32, 0.05, dark), (0.22, 0.03, cable_b)):
        cyl('Pipe%d_%.2f' % (s, zz), (s * (XW - 0.2), (Y0 + YF) / 2, zz), rr, YF - Y0, mm, rot=(90, 0, 0), verts=16)
# overhead strip lamps (visual only) + their real light
lampm = M.emission('StripLamp', color=(1.0, 0.82, 0.62), strength=6.0)
for k, yy in enumerate((-1.6, -0.2, 1.1)):
    bx('Strip%d' % k, (0, yy, ZR - 0.13), (0.7, 0.07, 0.02), lampm, bev=0)
    Wd.area('StripLight%d' % k, (0, yy, ZR - 0.18), (0, yy, 0), color=(1.0, 0.8, 0.6), power=30, size=0.7)
# sagging cable bundles along the ceiling (lived-in)
for k, (x0, mm) in enumerate(((-1.1, cable_r), (-1.0, rubber), (1.05, cable_b), (1.15, rubber), (0.95, cable_y))):
    cable('CeilCable%d' % k, [(x0, -3.0, ZR - 0.1), (x0 + 0.05, -1.6, ZR - 0.42 - 0.05 * k), (x0 - 0.05, -0.3, ZR - 0.15),
                             (x0 + 0.04, 0.9, ZR - 0.38 - 0.04 * k), (x0, 2.2, ZR - 0.12)], 0.018 + 0.006 * (k % 2), mm)

# ---------------------------------------------------------------- front bulkhead + big window
bx('JambL', (-1.62, YF, 1.37), (0.46, 0.16, 2.75), hull, bev=0.02)
bx('JambR', (1.62, YF, 1.37), (0.46, 0.16, 2.75), hull, bev=0.02)
bx('Header', (0, YF, 2.62), (3.7, 0.18, 0.34), hull, bev=0.02)
bx('Sill', (0, YF, 0.5), (3.7, 0.16, 1.0), paint_m, bev=0.02)
bx('FrameIn', (0, YF - 0.09, 2.44), (2.8, 0.04, 0.05), dark, bev=0.005)
gl = I.Md.mesh_obj('Glass', [(-1.4, YF + 0.03, 0.98), (1.4, YF + 0.03, 0.98), (1.4, YF + 0.03, 2.46), (-1.4, YF + 0.03, 2.46)],
                   [(0, 1, 2, 3)], smooth=False, mats=(glass,))
# rivets on the jambs
rivm = M.principled('Rivet', base=(0.25, 0.26, 0.27), rough=0.35, metal=0.9)
for s in (-1, 1):
    for zz in np.arange(0.25, 2.5, 0.22):
        cyl('Rv%d_%.2f' % (s, zz), (s * 1.42, YF - 0.085, zz), 0.012, 0.01, rivm, rot=(90, 0, 0), verts=8)

# ---------------------------------------------------------------- pilot console
bx('ConsoleBody', (0, 1.98, 0.42), (2.9, 0.92, 0.84), paint_m, bev=0.03)
bx('ConsoleLip', (0, 1.53, 0.845), (2.9, 0.14, 0.05), dark, rot=(-12, 0, 0), bev=0.015)
bx('ConsoleTop', (0, 1.98, 0.87), (2.86, 0.86, 0.04), dark, bev=0.01)
bx('ConsoleKick', (0, 1.52, 0.06), (2.9, 0.04, 0.12), haz, bev=0)
# three tilted monitors
for i, (xx, kind, wd) in enumerate(((-0.92, 0, 0.62), (0.0, 1, 0.5), (0.92, 2, 0.62))):
    tilt = -18
    zz = 1.08 if i != 1 else 1.03
    bz = bx('Bezel%d' % i, (xx, 2.08, zz), (wd + 0.06, 0.05, 0.36 if i != 1 else 0.28), rubber, rot=(tilt, 0, (-12 if i == 0 else 12 if i == 2 else 0)), bev=0.012)
    hgt = 0.3 if i != 1 else 0.22
    o = I.Md.mesh_obj('Screen%d' % i, [(-wd / 2, -0.027, -hgt / 2), (wd / 2, -0.027, -hgt / 2), (wd / 2, -0.027, hgt / 2), (-wd / 2, -0.027, hgt / 2)],
                      [(0, 1, 2, 3)], smooth=False, mats=(screen_mat('Scr%d' % i, kind, 7 + i, 2.6, scroll=(0.6 if kind == 0 else 0.0)),))
    o.data.uv_layers.new(name='UV')
    for li, uv in zip(o.data.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]):
        o.data.uv_layers[0].data[li.index].uv = uv
    o.parent = bz
    bx('Stand%d' % i, (xx, 2.16, 0.92), (0.06, 0.06, 0.12), dark, bev=0.005)
# switches, toggles, sliders, LEDs on the console top (greebles)
ledm = {c: M.emission('LED_%s' % c, color=col, strength=8.0) for c, col in
        (('g', (0.2, 1.0, 0.35)), ('a', (1.0, 0.55, 0.1)), ('c', (0.2, 0.9, 1.0)))}
for k in range(46):
    xx = rnd.uniform(-1.35, 1.35)
    if abs(xx - 0.22) < 0.2:
        continue
    yy = rnd.uniform(1.62, 1.9)
    t = rnd.random()
    if t < 0.4:
        bx('Tog%d' % k, (xx, yy, 0.9), (0.02, 0.02, 0.05), rivm, rot=(rnd.uniform(-25, 25), 0, 0), bev=0)
    elif t < 0.7:
        bx('Knob%d' % k, (xx, yy, 0.9), (0.05, 0.05, 0.03), rubber, bev=0.006)
    else:
        bx('Led%d' % k, (xx, yy, 0.895), (0.02, 0.012, 0.012), ledm[rnd.choice('gac')], bev=0)
# throttle quadrant (left of centre)
bx('Throttle', (-0.45, 1.75, 0.95), (0.24, 0.22, 0.12), dark, bev=0.02)
for i in range(2):
    bx('Lever%d' % i, (-0.5 + i * 0.1, 1.72, 1.05), (0.025, 0.025, 0.16), rivm, rot=(-20 + i * 14, 0, 0), bev=0.004)
    cyl('LeverKnob%d' % i, (-0.5 + i * 0.1, 1.69, 1.13), 0.025, 0.04, rubber, rot=(0, 90, 0))
# coffee mug (lived-in)
cyl('Mug', (0.75, 1.72, 0.94), 0.04, 0.1, paint2)
# THE RED BUTTON: pedestal, hazard ring, glowing mushroom cap
BTN = (0.22, 1.64, 0.93)
bx('BtnBase', (BTN[0], BTN[1], 0.905), (0.2, 0.2, 0.05), dark, bev=0.01)
cyl('BtnRing', (BTN[0], BTN[1], 0.935), 0.085, 0.02, haz, verts=32)
btn_m, nb3, b3, out3 = M.new('BtnRed')
M.no_light(btn_m)
b3.inputs['Base Color'].default_value = (0.6, 0.02, 0.01, 1)
b3.inputs['Roughness'].default_value = 0.25
b3.inputs['Coat Weight'].default_value = 0.6
b3.inputs['Emission Color'].default_value = (1.0, 0.06, 0.02, 1)
M.animate(b3.inputs['Emission Strength'], 'default_value', [(f, 0.8 + 7.0 * v) for f, v in FLASH])
cap = cyl('BtnCap', (BTN[0], BTN[1], 0.965), 0.06, 0.045, btn_m, verts=32)
red = Wd.point('FlashLight', (BTN[0], BTN[1] - 0.15, 1.05), color=(1.0, 0.05, 0.02), power=0.0, radius=0.05)
for f, v in FLASH:
    red.data.energy = 0.3 + 55.0 * v
    red.data.keyframe_insert('energy', frame=f)
# pilot seat pushed aside (back right), crate (back left)
bx('SeatBase', (1.25, 1.05, 0.25), (0.5, 0.5, 0.06), dark, bev=0.01)
bx('SeatPost', (1.25, 1.05, 0.12), (0.08, 0.08, 0.24), dark, bev=0)
bx('Seat', (1.25, 1.05, 0.5), (0.52, 0.52, 0.12), paint2, bev=0.04)
bx('SeatBack', (1.27, 1.28, 0.88), (0.52, 0.12, 0.7), paint2, rot=(-10, 0, 0), bev=0.05)
bx('Crate', (-1.35, 1.05, 0.22), (0.5, 0.42, 0.44), paint2, rot=(0, 0, 8), bev=0.02)
bx('CrateLid', (-1.35, 1.05, 0.455), (0.52, 0.44, 0.03), haz, rot=(0, 0, 8), bev=0.005)
# loose cables from console to floor
cable('LooseA', [(-0.9, 1.5, 0.6), (-0.95, 1.38, 0.1), (-0.6, 1.25, 0.012), (0.1, 1.33, 0.012)], 0.012, cable_r)
cable('LooseB', [(1.1, 1.5, 0.7), (1.15, 1.35, 0.05), (1.4, 0.9, 0.012), (1.7, 0.2, 0.012)], 0.014, rubber)

# ---------------------------------------------------------------- FOREGROUND layer objects (FG_*)
fgm = M.principled('FGPaint', base=(0.07, 0.08, 0.09), rough=0.5, grime=0.5, metal=0.3)
bx('FG_SideConsole', (0.85, -0.5, 0.15), (1.3, 0.45, 0.3), fgm, bev=0.03)
bx('FG_SideLip', (0.85, -0.725, 0.3), (1.32, 0.06, 0.04), dark, bev=0.012)
bx('FG_SideStrip', (0.85, -0.758, 0.3), (1.2, 0.01, 0.012), M.emission('FGStrip', color=(0.2, 0.9, 1.0), strength=6.0), bev=0)
for k in range(9):
    bx('FG_Key%d' % k, (0.35 + k * 0.1, -0.55, 0.31), (0.05, 0.05, 0.02), ledm['a' if k == 4 else 'c'] if k % 2 else rubber, bev=0)
cable('FG_CableA', [(-1.6, 0.1, ZR - 0.05), (-0.9, 0.18, 1.9), (0.0, 0.2, 1.74), (0.9, 0.25, 1.9), (1.6, 0.3, ZR - 0.05)], 0.03, rubber)
cable('FG_CableB', [(-1.6, 0.16, ZR - 0.05), (-0.85, 0.22, 1.96), (0.05, 0.25, 1.82), (0.95, 0.3, 1.97), (1.6, 0.34, ZR - 0.05)], 0.02, cable_r)

# ---------------------------------------------------------------- Jupiter + light
CAMC = Vector((0.10, -1.55, 1.10))
d = Vector((-0.1429, 0.9642, 0.2236)).normalized()  # lands at screen ~(380, 560) on frame 0 (plan.py unproject)
JD, JR = 3000.0, 620.0
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=JR, location=CAMC + d * JD)
jup = bpy.context.active_object
jup.name = 'Jupiter'
bpy.ops.object.shade_smooth()
jup.rotation_euler = (math.radians(8), math.radians(-14), 0)
jm, nbj, bj, outj = M.new('JupiterMat')
tcj = nbj.n('ShaderNodeTexCoord')
nzj = nbj.n('ShaderNodeTexNoise', Scale=3.0, Detail=10.0, Roughness=0.62)
nbj.l(tcj, 'Object', nzj, 'Vector')
wv = nbj.n('ShaderNodeTexWave', Scale=0.0022, Distortion=7.0, Detail=6.0)
wv.wave_type = 'BANDS'
wv.bands_direction = 'Z'
nbj.l(tcj, 'Object', wv, 'Vector')
cr = nbj.n('ShaderNodeValToRGB')
els = cr.color_ramp.elements
els[0].position, els[0].color = 0.0, (0.42, 0.22, 0.11, 1)
els[1].position, els[1].color = 1.0, (0.93, 0.86, 0.74, 1)
for p, c in ((0.25, (0.78, 0.55, 0.34, 1)), (0.45, (0.95, 0.88, 0.76, 1)), (0.62, (0.62, 0.36, 0.2, 1)), (0.8, (0.88, 0.74, 0.58, 1))):
    e = els.new(p)
    e.color = c
mixf = nbj.n('ShaderNodeMix')
mixf.data_type = 'FLOAT'
mixf.inputs['Factor'].default_value = 0.28
nbj.l(wv, 'Fac', mixf, 2)
nbj.l(nzj, 'Fac', mixf, 3)
nbj.l(mixf, 0, cr, 'Fac')
nbj.l(cr, 'Color', bj, 'Base Color')
bj.inputs['Roughness'].default_value = 0.9
jup.data.materials.append(jm)
jup.visible_shadow = False
# sun: upper right, slightly in front of the camera -> Jupiter half-lit from the right, warm light slants in through the window
sun = bpy.data.lights.new('Sun', 'SUN')
sun.energy = 3.2
sun.color = (1.0, 0.86, 0.68)
sun.angle = math.radians(0.6)
so = bpy.data.objects.new('Sun', sun)
sc.collection.objects.link(so)
rays = Vector((-0.85, -0.057, -0.51)).normalized()  # sun to the right: Jupiter half-lit, warm streak on the left wall
so.rotation_euler = rays.to_track_quat('-Z', 'Y').to_euler()
# warm planetshine through the window (rim/back light) + cyan console fill toward the crew
ps = Wd.area('Planetshine', (-0.3, 3.4, 1.9), (0, 0.5, 0.8), color=(1.0, 0.55, 0.25), power=160, size=2.6)
cf = Wd.area('ConsoleFill', (0.0, 1.45, 1.25), (0.0, 0.2, 0.9), color=(0.25, 0.85, 1.0), power=30, size=1.4)
for lo in (ps, cf):
    lo.visible_camera = False
    lo.visible_glossy = True

# ---------------------------------------------------------------- layer visibility
for o in bpy.data.objects:
    if o.type in ('MESH', 'CURVE'):
        is_fg = o.name.startswith('FG_')
        if LAYER == 'bg' and is_fg:
            o.visible_camera = False
        if LAYER == 'fg' and not is_fg and o.name != 'Glass':
            o.visible_camera = False
        if LAYER == 'fg' and o.name == 'Glass':
            o.visible_camera = False

# ---------------------------------------------------------------- camera: ONE slow cruise push-in (matches plan.py)
P0, P1, LK = (0.10, -1.55, 1.10), (0.05, -1.00, 1.05), (0.0, 2.4, 0.80)
cam = C.Cam()
cam.shot(0, NF, C.dolly(P0, P1, look=LK), lens=24, fstop=5.6, focus=(0.0, 0.85, 0.9))
cam.bake(0, NF - 1)

# camera export for Remotion projection check (stills mode uploads rig_info.json)
if a.stills:
    os.makedirs(a.out, exist_ok=True)
    rec = []
    for f in range(NF):
        sc.frame_set(f)
        mw = cam.obj.matrix_world
        rec.append({'f': f, 'loc': list(mw.translation), 'x': list(mw.col[0][:3]), 'y': list(mw.col[1][:3]), 'z': list(mw.col[2][:3]),
                    'lens': cam.obj.data.lens})
    json.dump({'cam': rec, 'button': BTN, 'layer': LAYER}, open(os.path.join(a.out, 'rig_info.json'), 'w'))
core.render(a, sc)
