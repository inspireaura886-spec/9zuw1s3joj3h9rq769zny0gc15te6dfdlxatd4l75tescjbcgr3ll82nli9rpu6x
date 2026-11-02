"""manises-1979 plate 10 (216 f, VO 37.82-44.98 'The official answer: flares from a refinery a hundred miles away,
plus stars and planets. Camara never accepted it.'): a coastal refinery at night: gas flares burning on tall stacks,
tank farm, sodium lights; stars and one bright planet above. Shot A: far across the sea, flares on the horizon.
Shot B: closer, slow orbit past the flare stacks. Flames breathe smoothly (no flicker)."""
import sys, os, math, bpy; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 216
setup(sc, exposure=1.15, vol=True, glare=0.75, vignette=0.4)
Wd.hdri('qwantani_night', strength=0.3, bg_strength=0.7, rot=80, tint=(0.8, 0.88, 1.08))
Wd.moon(direction=(-0.5, -0.4, 0.25), strength=0.8, color=(0.62, 0.72, 1.0))
Wd.sea_plane(size=60000, z=-0.5, color=(0.004, 0.007, 0.012), rough=0.55, wave=0.15, frames=NF)
ground = Wd.box('Ground', (0, -2600, 0.0), (8000, 5000, 1.0))
ground.data.materials.append(M.principled('GroundR', base=(0.03, 0.03, 0.03), rough=0.9, bump=0.1))
steel = M.principled('Steel', base=(0.22, 0.22, 0.21), rough=0.4, metal=0.7, grime=0.6, rough_noise=0.3)
import random
rnd = random.Random(5)
for i in range(26):  # tank farm
    x, y = -500 + (i % 7) * 70 + rnd.uniform(-8, 8), -400 - (i // 7) * 70
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=rnd.uniform(16, 26), depth=rnd.uniform(14, 20),
                                        location=(x, y, 9))
    bpy.context.object.data.materials.append(steel)
for i in range(7):  # columns / towers
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=rnd.uniform(2.5, 4.5), depth=rnd.uniform(35, 60),
                                        location=(80 + i * 22, -260 - (i % 3) * 30, 25))
    bpy.context.object.data.materials.append(steel)
flames = []
for i, (x, y, h) in enumerate([(220, -160, 85), (262, -205, 70), (190, -235, 95)]):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=1.6, depth=h, location=(x, y, h / 2))
    bpy.context.object.data.materials.append(steel)
    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=4.0, radius2=0.2, depth=16, location=(x, y, h + 8))
    fl = bpy.context.object
    fm = M.emission('Flare%d' % i, (1.0, 0.42, 0.1), 45)
    fl.data.materials.append(fm)
    fl.visible_shadow = False
    L = Wd.point('FlareL%d' % i, (x, y, h + 6), color=(1.0, 0.5, 0.2), power=3e5, radius=3)
    s = fm.node_tree.nodes['Emission'].inputs['Strength']
    M.animate(s, 'default_value', [(f, 45 * (1 + 0.18 * math.sin(f * 0.11 + i))) for f in range(0, NF + 1, 8)])
    flames.append((x, y, h))
Wd.city_lights('Plant', center=(0, -350, 1.0), radius=500, count=1400, seed=71, strength=16, size=0.9,
               cluster=0.6, color=(1.0, 0.7, 0.35))
Wd.fog(center=(0, 0, 60), size=(12000, 12000, 140), density=0.0006, color=(0.75, 0.75, 0.8), anisotropy=0.5,
       height_falloff=0.01)
planet = Md.orb('Planet', (4680, -54620, 9500), color=(1.0, 0.97, 0.9), strength=2000, power=0.0, radius=60, f1=NF)
cam = C.Cam(clip_end=200000)
c = Vector((220, -200, 70))
# shot A 0-109: far out over the sea, flares glowing on the horizon under the stars
cam.shot(0, 110, C.dolly((-300, 5200, 40), (-260, 4300, 36), look=(150, -200, 140)), lens=(70, 76), fstop=11,
         focus=c)
# shot B 110-215: close slow orbit past the burning stacks, sky + planet above
cam.shot(110, NF, C.orbit((200, -200, 0), r=420, a0=70, a1=95, h=(55, 70), look_h=80), lens=(32, 34), fstop=11,
         focus=c)
finish_cam(cam, NF, a, sc)
