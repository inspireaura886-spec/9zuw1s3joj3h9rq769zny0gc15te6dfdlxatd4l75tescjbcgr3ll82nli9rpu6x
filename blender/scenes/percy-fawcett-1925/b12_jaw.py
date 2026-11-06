"""s12 CLOSE 35 mm REVEAL 'Scientists checked the jaw against his spare false teeth. Not him.' 1951 lab bench: a plaster cast
of an upper jaw beside a spare upper denture (pink plate + teeth) and a magnifying glass under a desk lamp. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); jungle_mats()
room(size=(5, 4, 3.0), wood_walls=False, window=True, sun_power=600, seed=2)
desk('Bench', (0, 0, 0))
def arch(name, c, mat, teeth_mat):
    objs = [torus(name + 'Arch', c, 0.028, 0.008, mat, rot=(0, 0, 0))]
    for k in range(12):
        t = math.pi * (0.1 + 0.8 * k / 11)
        objs.append(sphere(name + 'T%d' % k, (c[0] + 0.028 * math.cos(t), c[1] + 0.028 * math.sin(t), c[2] + 0.006), 0.0055, teeth_mat, 10, scale=(1, 0.8, 1.3)))
    return objs
plaster = M.principled('Plaster', base=(0.85, 0.84, 0.80), rough=0.8)
arch('Cast', (-0.07, 0.0, 0.775), plaster, plaster)
arch('Denture', (0.07, 0.0, 0.775), bpy.data.materials['Pink'], M.principled('Porcelain', base=(0.92, 0.9, 0.84), rough=0.25, coat=0.4))
P.instance(P.gltf('magnifying_glass_01'), (0.02, -0.12, 0.76), 0.4, 1.0)
P.instance(P.gltf('desk_lamp_arm_01'), (-0.45, 0.25, 0.76), 0.9, 1.0)
CN.practical('Key', (-0.3, 0.15, 1.3), (0, 0, 0.77), power=60, cone=50)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((0.0, -0.36, 1.0), (0, 0, 0.775), amount=0.3), lens=35, fstop=3.5, focus=Vector((0, 0, 0.775)))
go(cam, NF, a, sc, meter=NF // 2)
