"""mh370 b09 (WIDE 28 mm, VO 'Then a ground station in Perth pinged it by satellite.'): satellite ground-station dish
under a clear starry night sky, small in frame, a lit equipment hut; eased 15 deg orbit. NF default 57."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 57, int)
sc = core.reset(); look(sc, vol=True, glare=0.45, vignette=0.24)
Wd.hdri('rogland_clear_night', strength=0.6, bg_strength=1.6, rot=200)
Wd.moon(direction=(-0.6, 0.5, 0.35), strength=0.9, color=(0.62, 0.72, 1.0), angle=0.55)
CN.ground('Ground', 'dry_ground_rocks', (600, 600), tile_m=5.0, tint=(0.55, 0.5, 0.45))
white = M.principled('DishWhite', base=(0.78, 0.79, 0.8), rough=0.42, grime=0.15)
steel = M.principled('Steel', base=(0.5, 0.52, 0.55), rough=0.35, metal=0.9)
def dish(name, loc, rd=7.0, el=38, az=20):
    bm = bmesh.new(); n, rings = 48, 10
    vs = [[None] * n for _ in range(rings + 1)]
    for j in range(rings + 1):
        r = rd * j / rings; z = r * r / (4 * 0.42 * rd)
        for k in range(n):
            t = 2 * math.pi * k / n
            vs[j][k] = bm.verts.new((r * math.cos(t), r * math.sin(t), z))
    for j in range(rings):
        for k in range(n):
            bm.faces.new((vs[j][k], vs[j][(k + 1) % n], vs[j + 1][(k + 1) % n], vs[j + 1][k]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    d = link(bpy.data.objects.new(name, me)); d.data.materials.append(white)
    sol = d.modifiers.new('S', 'SOLIDIFY'); sol.thickness = 0.12
    for p in me.polygons: p.use_smooth = True
    x, y, z = loc
    piv = Vector((x, y, z + rd * 0.9))
    d.location = piv
    d.rotation_euler = (math.radians(90 - el), 0, math.radians(az))
    cyl(name + 'Ped', (x, y, z), (x, y, z + rd * 0.85), rd * 0.12, white, 24)
    boxm(name + 'Base', (x, y, z + 0.6), (rd * 0.5, rd * 0.5, 1.2), white, 0.05)
    # feed horn on a quadripod
    from mathutils import Euler
    MW = Matrix.Translation(piv) @ Euler(d.rotation_euler).to_matrix().to_4x4()
    ax = MW.to_3x3() @ Vector((0, 0, 1))
    fz = piv + ax * (0.42 * rd * 1.0)
    for k in range(4):
        t = 2 * math.pi * k / 4 + 0.785
        rim = MW @ Vector((rd * 0.95 * math.cos(t), rd * 0.95 * math.sin(t), (rd * 0.95) ** 2 / (4 * 0.42 * rd)))
        cyl(name + 'Strut%d' % k, rim, fz, 0.06, steel, 8)
    cyl(name + 'Feed', fz - ax * 0.4, fz + ax * 0.3, 0.35, white, 16)
dish('Dish1', (0, 0, 0), 7.0, 38, 25)
dish('Dish2', (-38, 30, 0), 4.0, 30, 15)
dish('Dish3', (34, 44, 0), 3.2, 45, 35)
hut = M.principled('Hut', base=(0.55, 0.55, 0.52), rough=0.7, grime=0.3)
boxm('Hut', (16, 10, 1.6), (9, 5, 3.2), hut, 0.04)
wm = M.emission('HutWin', (1.0, 0.8, 0.55), 6.0)
boxm('HutWin', (16, 7.48, 1.9), (2.0, 0.04, 0.9), wm)
Wd.point('HutLamp', (16, 6.6, 3.4), color=(1.0, 0.75, 0.45), power=900, radius=0.2)
fm = M.principled('Fence', base=(0.3, 0.3, 0.32), rough=0.4, metal=0.8)
for k in range(14):
    x = -45 + k * 7
    cyl('Post%d' % k, (x, -26, 0), (x, -26, 2.0), 0.05, fm, 8)
curve_poly('Wire1', [(-45, -26, 1.2), (46, -26, 1.2)], bevel=0.01, mat=fm)
curve_poly('Wire2', [(-45, -26, 1.9), (46, -26, 1.9)], bevel=0.01, mat=fm)
Wd.fog(center=(0, 0, 8), size=(400, 400, 16), density=0.0012, color=(0.75, 0.8, 0.9), anisotropy=0.3, height_falloff=0.6)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.orbit((0, 4, 0), r=48, a0=258, a1=273, h=(5.5, 6.5), look_h=9.0), lens=28, fstop=8, focus=Vector((0, 0, 6)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
