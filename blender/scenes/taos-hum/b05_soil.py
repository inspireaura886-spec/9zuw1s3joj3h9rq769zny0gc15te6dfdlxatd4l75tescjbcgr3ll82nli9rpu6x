"""taos b05: cross-section soil slab (strata), a gopher digs a tunnel while the instrument screen beside it stays a flat line. Wide shot then push. NF 128."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tc import *
a = core.args(); NF = arg(a, '--nf', 128, int)
sc = core.reset()
setup(sc, exposure=0.9, vol=False, glare=0.45, vignette=0.4)
Wd.hdri('qwantani_night_puresky', strength=0.08, bg_strength=0.6)
CN.ground('Ground', 'dry_ground_rocks', (60, 60), center=(0, 0, -0.01), tile_m=2.5, tint=(0.45, 0.4, 0.36))
W, H, T = 3.6, 1.7, 0.4
layers = [('Top', 'farm_soil', (0.5, 0.42, 0.34), 0.35), ('Sub', 'forest_ground_04', (0.42, 0.36, 0.3), 0.7), ('Rock', 'rocky_terrain_02', (0.4, 0.38, 0.36), 0.65)]
zt = H
for nm, tid, tint, hh in layers:
    zc = zt - hh / 2
    o = Wd.box('L' + nm, (0, 0, zc), (W, T, hh)); M.assign(o, M.texture_set('M' + nm, tid, scale=1.4, tint=tint, box=True))
    zt -= hh
# tunnel path (front face y = -T/2), param 0..1
def path(t):
    x = -1.5 + 3.0 * t
    z = 1.05 + 0.18 * math.sin(t * 7.0) - 0.25 * t
    return (x, -T / 2 - 0.004, z)
N = 60
cu = bpy.data.curves.new('Tun', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.075; cu.bevel_resolution = 4
sp = cu.splines.new('POLY'); sp.points.add(N)
for i, p in enumerate(sp.points):
    q = path(i / N); p.co = (q[0], q[1], q[2], 1)
to = bpy.data.objects.new('Tunnel', cu); bpy.context.scene.collection.objects.link(to)
to.data.materials.append(M.principled('TunnelM', base=(0.01, 0.008, 0.007), rough=1.0))
cu.bevel_factor_start = 0.0
for f in range(0, NF, 4):
    t = min(1.0, max(0.0, f / (NF - 14.0)))
    e = t * t * (3 - 2 * t)
    cu.bevel_factor_end = 0.02 + 0.98 * e
    cu.keyframe_insert('bevel_factor_end', frame=f)
# gopher
gm = M.principled('GopherM', base=(0.28, 0.17, 0.09), rough=0.85, sss=0.1)
gb = sphere('GBody', (0, 0, 0), 0.11, gm, scale=(1.5, 0.9, 0.9))
gh = sphere('GHead', (0.15, 0, 0.02), 0.08, gm)
gn = sphere('GNose', (0.23, 0, 0.02), 0.02, M.principled('NoseM', base=(0.05, 0.03, 0.03), rough=0.5))
ge = sphere('GEye', (0.19, -0.05, 0.06), 0.012, M.principled('EyeM', base=(0.01, 0.01, 0.01), rough=0.2))
tooth = Wd.box('GTooth', (0.22, -0.01, -0.025), (0.015, 0.012, 0.025)); M.assign(tooth, M.principled('ToothM', base=(0.9, 0.85, 0.6), rough=0.4))
gp = [gb, gh, gn, ge, tooth]
for f in range(0, NF, 4):
    t = min(1.0, max(0.0, f / (NF - 14.0))); e = t * t * (3 - 2 * t)
    q = path(0.02 + 0.98 * e)
    for o in gp:
        base = {'GBody': (0, 0, 0), 'GHead': (0.15, 0, 0.02), 'GNose': (0.23, 0, 0.02), 'GEye': (0.19, -0.05, 0.06), 'GTooth': (0.22, -0.01, -0.025)}[o.name]
        o.location = (q[0] + base[0] - 0.08, q[1] - 0.06 + base[1], q[2] + base[2]); o.keyframe_insert('location', frame=f)
# instrument screen: flat line
mon = Wd.box('Mon', (-2.7, -1.0, 0.55), (0.9, 0.08, 0.6)); M.assign(mon, M.principled('MonM', base=(0.03, 0.03, 0.035), rough=0.4))
stand = Wd.box('MonStand', (-2.7, -1.0, 0.15), (0.2, 0.2, 0.3)); M.assign(stand, M.principled('MonStandM', base=(0.05, 0.05, 0.05), rough=0.5))
ms = Wd.box('MonScr', (-2.7, -1.05, 0.55), (0.8, 0.004, 0.5)); M.assign(ms, glow('MonGlow', color=(0.1, 0.35, 0.28), strength=0.9))
ml = Wd.box('MonLine', (-2.7, -1.052, 0.55), (0.74, 0.002, 0.006)); M.assign(ml, glow('MonLineGlow', color=(0.7, 1.0, 0.85), strength=8.0))
Wd.area('Key', (-1.5, -3.2, 2.6), (0, 0, 1.0), color=(1.0, 0.82, 0.62), power=520, size=2.6)
Wd.area('Rim', (2.6, 1.8, 2.2), (0, 0, 0.9), color=(0.55, 0.7, 1.0), power=160, size=2.0)
Wd.point('MonL', (-2.7, -1.5, 0.6), color=(0.5, 1.0, 0.8), power=1.2, radius=0.1)
cam = C.Cam(clip_end=500)
cam.shot(0, NF, C.dolly(Vector((-0.9, -6.2, 1.5)), Vector((-0.5, -4.2, 1.15)), look=Vector((-0.3, 0, 0.95)), look1=Vector((0.0, 0, 0.95))), lens=28, fstop=6.0, focus=Vector((0, 0, 0.95)))
finish_cam(cam, NF, a, sc)
