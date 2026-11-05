"""mh370 b15b (WIDE 28 mm, VO 'square kilometres of seafloor. Nothing.'): deep seafloor ridges lit only by a search
AUV's lamps gliding over empty terrain, faint sonar swath beneath it. Slow forward dolly behind the AUV. NF default 108."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 108, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.3, lift=(0.97, 1.0, 1.05))
w = bpy.data.worlds.new('Deep'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.002, 0.006, 0.01, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
fl = M.texture_set('Seabed', 'rocky_terrain_02', scale=0.08, tint=(0.42, 0.4, 0.37), box=True)
Wd.terrain('Seafloor', size=700, res=240, height=38, scale=0.0065, center=(0, 120, -40), seed=6, mat=fl)
Wd.fog(center=(0, 120, 0), size=(500, 500, 140), density=0.022, color=(0.25, 0.55, 0.62), anisotropy=0.65)
auv = Md.empty('AUV')
yel = M.principled('AUVY', base=(0.85, 0.55, 0.06), rough=0.35, coat=0.5)
blk = M.principled('AUVK', base=(0.02, 0.02, 0.02), rough=0.4)
body = cyl('AUVBody', (0, -2.6, 0), (0, 2.6, 0), 0.5, yel, 24); body.parent = auv
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.5, location=(0, 2.6, 0))
nose = bpy.context.active_object; nose.scale = (1, 1.4, 1); nose.data.materials.append(yel); nose.parent = auv
for k, rot in enumerate((0, 90, 180, 270)):
    fin = boxm('Fin%d' % k, (0, -2.4, 0), (0.04, 0.6, 0.7), blk); fin.parent = auv
    fin.rotation_euler = (0, math.radians(rot), 0); fin.location = (0.55 * math.sin(math.radians(rot)), -2.4, 0.55 * math.cos(math.radians(rot)))
for s in (1, -1):
    sp = Wd.spot('Lamp%d' % s, (s * 0.35, 3.3, -0.2), (s * 3, 30, -22), color=(0.85, 0.95, 1.0), power=60000, size_deg=46, blend=0.5,
                 radius=0.1)
    sp.parent = auv
sw = glow_mat('SwathM', (0.45, 0.95, 1.0), 2.0)
sv = [(0, 0, -0.5), (-34, 6, -26), (34, 6, -26), (0, 7, -0.5)]
swath = Md.mesh_obj('Swath', [sv[0], sv[1], sv[2]], [(0, 1, 2)], smooth=False, mats=(sw,)); swath.parent = auv
key_fac(sw, [(0, 0.16), (NF // 2, 0.24), (NF, 0.16)])
fly_line(auv, NF, (0, 40, 30), (0, 0.22, 0))
cam = C.Cam(clip_end=4000)
cam.shot(0, NF, C.track('AUV', offset=(11, -24, 9), offset1=(8, -17, 7), look_offset=(0, 18, -9)), lens=28, fstop=5.6,
         focus='AUV')
go(cam, NF, a, sc, meter=NF // 2, target=0.19)
