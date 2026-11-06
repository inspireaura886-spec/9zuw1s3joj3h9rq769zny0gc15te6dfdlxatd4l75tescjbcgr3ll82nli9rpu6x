"""s13 CLOSE 35 mm 'His signet ring turned up in a city shop, decades later.' A gold signet ring on a dim shop's glass
counter among odds and ends; slow orbit catches the gold."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); jungle_mats()
room(size=(5, 4, 3.0), wood_walls=True, window=True, sun_power=900, seed=3)
boxm('Counter', (0, 0, 0.45), (1.6, 0.6, 0.9), M.texture_set('CounterW', 'wood_table_worn', scale=1.0, box=True))
boxm('Glass', (0, 0, 0.905), (1.5, 0.55, 0.01), M.glass('CounterG'))
torus('Ring', (0, 0, 0.918), 0.0095, 0.0022, bpy.data.materials['Gold'], rot=(math.radians(80), 0, 0.3))
boxm('Bezel', (0, -0.002, 0.928), (0.009, 0.004, 0.011), bpy.data.materials['Gold'], bev=0.001)
P.instance(P.gltf('round_spectacles'), (0.18, 0.08, 0.912), 1.2, 1.0)
P.instance(P.gltf('stationery_supplies'), (-0.35, 0.12, 0.912), 0.5, 1.0)
CN.practical('Key', (0.4, -0.3, 1.5), (0, 0, 0.92), power=40, cone=40)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.orbit((0, 0, 0.92), r=0.16, a0=-110, a1=-70, h=0.07, look_h=0.0), lens=35, fstop=3.2, focus=Vector((0, 0, 0.92)))
go(cam, NF, a, sc, meter=NF // 2)
