"""taos b04 (WIDE): dusk desert, field kit (tripod mic, geophone spike + cable, magnetometer case with live screen); shot 1 wide orbit, shot 2 low dolly past the geophone. NF 148."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tc import *
a = core.args(); NF = arg(a, '--nf', 148, int)
sc = core.reset()
setup(sc, exposure=0.5, vol=True, glare=0.5, vignette=0.38)
CN.hdri_sun('qwantani_dawn_puresky', sun_az=200.0, strength=0.9)
CN.sun(elev=5.0, az=200.0, warmth='late', strength=3.2, angle=1.5, check=False)
CN.ground('Desert', 'dry_ground_rocks', (400, 400), center=(0, 0, 0), tile_m=3.0, tint=(0.62, 0.52, 0.45))
ridge('Ridge', loc=(0, 260, -2), amp=110, seed=8, color=(0.05, 0.045, 0.06))
CN.scatter('dry_branches_medium_01', 40, (-30, 30, -20, 40), seed=2, scale=(1.2, 2.4))
CN.scatter('grass_medium_02', 260, (-24, 24, -18, 30), seed=3, scale=(0.9, 1.6))
metal = M.principled('Alu', base=(0.55, 0.56, 0.6), rough=0.35, metal=1.0)
dark = M.principled('BlackPlastic', base=(0.03, 0.03, 0.035), rough=0.5)
foam = M.principled('Foam', base=(0.08, 0.08, 0.09), rough=0.95)
# tripod + boom mic
top = Vector((0, 0, 1.45))
for i in range(3):
    ang = i * 2.094 + 0.4
    cyl('Leg%d' % i, top, (math.cos(ang) * 0.7, math.sin(ang) * 0.7, 0.0), 0.014, metal, seg=10)
cyl('Mast', (0, 0, 1.45), (0, 0, 1.58), 0.02, dark, seg=12)
cyl('Mic', (0, 0.35, 1.6), (0, -0.3, 1.58), 0.04, foam, seg=16)
cyl('MicTip', (0, -0.3, 1.58), (0, -0.36, 1.58), 0.03, dark, seg=16)
# geophone spike in the ground + cable to the case
gp = cyl('GeoBody', (1.4, 0.8, 0.06), (1.4, 0.8, 0.0), 0.05, dark, seg=14)
cyl('GeoSpike', (1.4, 0.8, 0.0), (1.4, 0.8, -0.1), 0.01, metal, seg=8)
pts = [(1.4, 0.8, 0.06), (1.6, 0.5, 0.01), (1.9, 0.2, 0.012), (2.3, -0.1, 0.01), (2.7, -0.2, 0.02)]
cu = bpy.data.curves.new('Cable', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.006; cu.bevel_resolution = 2
sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
for bp, q in zip(sp.bezier_points, pts):
    bp.co = q; bp.handle_left_type = bp.handle_right_type = 'AUTO'
co = bpy.data.objects.new('Cable', cu); bpy.context.scene.collection.objects.link(co); co.data.materials.append(dark)
# magnetometer case
case = Wd.box('Case', (3.0, -0.2, 0.12), (0.62, 0.42, 0.24)); M.assign(case, M.principled('CaseM', base=(0.12, 0.13, 0.12), rough=0.55))
lid = Wd.box('Lid', (3.0, -0.02, 0.36), (0.62, 0.04, 0.4)); lid.rotation_euler = (math.radians(-18), 0, 0); M.assign(lid, M.principled('LidM', base=(0.1, 0.11, 0.1), rough=0.55))
scr = Wd.box('Screen', (3.0, -0.065, 0.37), (0.5, 0.004, 0.3)); scr.rotation_euler = (math.radians(-18), 0, 0); M.assign(scr, glow('ScreenGlow', color=(0.4, 1.0, 0.7), strength=1.6))
tr = Wd.box('Trace', (3.0, -0.067, 0.37), (0.46, 0.002, 0.004)); tr.rotation_euler = (math.radians(-18), 0, 0); M.assign(tr, glow('TraceGlow', color=(0.7, 1.0, 0.85), strength=7.0))
sph = sphere('Probe', (3.55, 0.3, 0.15), 0.07, M.principled('ProbeM', base=(0.7, 0.35, 0.1), rough=0.4))
cyl('ProbePole', (3.55, 0.3, 0.15), (3.55, 0.3, 0.9), 0.01, metal, seg=8)
Wd.point('ScreenLight', (3.0, -0.5, 0.45), color=(0.5, 1.0, 0.8), power=1.2, radius=0.08)
CN.haze(center=(0, 0, 3), size=(80, 80, 10), density=0.004, color=(1.0, 0.82, 0.7), anisotropy=0.55, height_falloff=1.2)
cam = C.Cam(clip_end=2000)
S = 84
cam.shot(0, S, C.orbit(Vector((1.5, 0.3, 0.0)), r=8.0, a0=215, a1=262, h=(1.5, 1.9), r1=6.4, look_h=0.7), lens=24, fstop=8.0, focus=Vector((1.5, 0.3, 0.5)))
cam.shot(S, NF, C.dolly(Vector((0.4, -1.3, 0.28)), Vector((1.3, -1.35, 0.3)), look=Vector((1.4, 0.8, 0.12)), look1=Vector((2.4, 0.0, 0.2))), lens=35, fstop=3.5, focus=Vector((1.4, 0.8, 0.1)))
finish_cam(cam, NF, a, sc)
