"""edmund-fitzgerald-1975 plate b4 (VO 'The Navy found it five hundred thirty feet down. Torn in two. The stern, upside
down.'): ROV lights in black-green water: the upright bow section nosed into the mud (torn aft end first), then the stern
section lying upside down beyond it (NTSB sketch: bow 276 ft upright, stern 253 ft capsized, 170 ft apart).
Slow glides only; the ROV lamps ride with the camera."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args(); sc = core.reset()
NF = arg(a, '--nf', 140, int)
rnd = random.Random(11)
setup(sc, exposure=arg(a, '--exp', 1.5, float), vol=True, glare=0.5, vignette=0.5, sat=0.85)
w = bpy.data.worlds.new('Deep'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.0, 0.004, 0.005, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
# lakebed: displaced mud
bpy.ops.mesh.primitive_grid_add(x_subdivisions=220, y_subdivisions=220, size=700, location=(0, 0, 0))
bed = bpy.context.active_object; bed.name = 'Bed'
tx = bpy.data.textures.new('BedN', 'CLOUDS'); tx.noise_scale = 18.0; tx.noise_depth = 4
dm = bed.modifiers.new('Disp', 'DISPLACE'); dm.texture = tx; dm.strength = 2.2; dm.mid_level = 0.5
bed.data.materials.append(M.principled('Mud', base=(0.09, 0.085, 0.07), rough=0.95, grime=0.4, rough_noise=0.05,
                                       bump=0.5, bump_scale=3))
bpy.ops.object.shade_smooth()
# bow section (y 27..111), upright, nosed down a little, heading 125 deg; stern section (y -111..-34) capsized
bow = freighter('Bow', y_range=(27.0, L2), lights=False, ragged='aft', seed=3)
bow.location = (0, 0, 6.0); bow.rotation_euler = (math.radians(-2.5), math.radians(2.0), 0)
st = freighter('Stern', y_range=(-L2, -34.0), lights=False, ragged='fwd', seed=8)
st.location = (-10.0, -10.0, 4.0); st.rotation_euler = (0, math.radians(178.0), math.radians(-90))
# taconite + torn plates in the debris field between them
pel = M.principled('Taconite', base=(0.05, 0.045, 0.045), rough=0.7, metal=0.2)
for i in range(70):
    x, y = rnd.uniform(-45, 5), rnd.uniform(-35, 15)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=rnd.uniform(0.6, 1.8), location=(x, y, 0.6))
    o = bpy.context.active_object; o.scale = (1, 1, 0.35); o.data.materials.append(pel)
plate_m = bpy.data.materials['FitzHull']
for i in range(14):
    o = Wd.box('Plate%d' % i, (rnd.uniform(-40, 8), rnd.uniform(-30, 14), 1.0), (rnd.uniform(3, 9), rnd.uniform(2, 6), 0.3))
    o.rotation_euler = (rnd.uniform(-0.6, 0.6), rnd.uniform(-0.8, 0.8), rnd.uniform(0, 3.1)); o.data.materials.append(plate_m)
# murky water (cheap box volume around the site) + faint cold light from far above
Wd.fog(center=(-20, 0, 30), size=(420, 420, 80), density=arg(a, '--fog', 0.022, float), color=(0.35, 0.6, 0.55),
       anisotropy=0.6, noise=0.35, noise_scale=0.01)
top = Wd.area('Above', (0, 0, 75), (0, 0, 0), color=(0.4, 0.7, 0.65), power=6.0e4, size=200)
cam = C.Cam(clip_end=2000)
# ROV lamps ride with the camera (two spots, slightly apart)
for s in (-1, 1):
    L = Wd.spot('ROV%d' % s, (0, 0, 0), (0, 0, -1), color=(0.85, 0.95, 1.0), power=9000, size_deg=48, blend=0.6, radius=0.15)
    L.parent = cam.obj; L.location = (s * 1.2, -0.6, 0.3); L.rotation_euler = (0, 0, 0)
h = int(NF * 0.5)
cam.shot(0, h, C.dolly((17, 16, 12), (19, 44, 14), look=(0, 30, 6), look1=(0, 72, 8)), lens=(22, 24), fstop=5.6)
cam.shot(h, NF, C.dolly((-8, 28, 21), (-18, 20, 19), look=(-55, -10, 6), look1=(-72, -10, 6)), lens=(22, 24), fstop=5.6)
finish_cam(cam, NF, a, sc)
