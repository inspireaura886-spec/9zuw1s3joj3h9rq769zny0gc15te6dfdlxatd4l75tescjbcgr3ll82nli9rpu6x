"""s07 WIDE 28 mm 'Otzi, as scientists named him, had been shot from behind.' Reconstruction: the traveller far up the ridge,
seen from behind; in the soft foreground a bow stave held level by an unseen archer. Cut before any hit. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
alps(NF, seed=7, sun_elev=16, az=230, warmth='late', gully=False)
t = traveller('Traveller', (2, 60, 3.0), yaw=0)
key_loc(t, [(0, (2, 60, 3.0)), (NF, (2, 64, 3.4))], interp='LINEAR')
bow = curve_poly('Bow', [(-0.75, 1.0, 1.45), (0.0, 1.35, 1.5), (0.75, 1.0, 1.45)], bevel=0.018, mat=bpy.data.materials['Yew'])
string = curve_poly('String', [(-0.75, 1.0, 1.45), (0.0, 0.7, 1.48), (0.75, 1.0, 1.45)], bevel=0.002, mat=M.principled('Sinew', base=(0.6, 0.55, 0.45), rough=0.6))
cyl('Arrow', (0.0, 0.7, 1.48), (0.0, 1.55, 1.49), 0.006, bpy.data.materials['Yew'], 6)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0.15, -1.2, 1.55), (2, 60, 4.0), amount=0.05), lens=28, fstop=4, focus='Traveller')
go(cam, NF, a, sc, meter=NF // 2)
