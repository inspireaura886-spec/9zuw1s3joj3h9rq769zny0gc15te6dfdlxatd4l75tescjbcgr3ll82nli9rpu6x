"""s06 CLOSE 35 mm TWIST 'It ended: You need have no fear of any failure.' Field table at night: the folded letter, a pen,
a hurricane lantern; the last line legible. Push-in (accent close-up)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
jungle_mats()
Wd.hdri('moonless_golf', strength=0.05, bg_strength=0.05)
boxm('Table', (0, 0, 0.72), (1.0, 0.7, 0.04), M.texture_set('TableW', 'wood_table_worn', scale=1.0, box=True))
letter('Letter', (0, 0, 0.7405), ['Dead Horse Camp, 29 May', 'Jack is well and fit', '...', 'You need have no fear', 'of any failure.'], size=0.014, rot=(0, 0, 0.08))
cyl('Pen', (0.16, -0.05, 0.75), (0.28, 0.06, 0.75), 0.005, bpy.data.materials['Ink'], 10)
lamp = P.gltf('vintage_oil_lamp')
P.instance(lamp, (-0.32, 0.2, 0.74), 0.3, 1.0)
Wd.point('LampL', (-0.32, 0.2, 0.92), color=(1.0, 0.62, 0.3), power=18, radius=0.04)
dust((0, 0, 1.0), (0.8, 0.6, 0.5), n=200, seed=6, color=(1.0, 0.8, 0.6), strength=0.4)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((0.05, -0.42, 1.12), (0, -0.02, 0.74), amount=0.25), lens=35, fstop=3.2, focus=Vector((0, -0.04, 0.742)))
go(cam, NF, a, sc, meter=NF // 2)
