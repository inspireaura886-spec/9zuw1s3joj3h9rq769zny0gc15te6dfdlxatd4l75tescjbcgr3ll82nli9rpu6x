"""s17 WIDE 28 mm LOOP 'Nobody explained it.' Dead Horse Camp at night: embers only, the dark tent; push-in to the tent for the
dissolve into the s01 portrait."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=5, n_trees=55, n_palms=10, area=(-90, 90, -40, 140), lane=lambda x, y: x * x + y * y < 30 * 30, sun_elev=15, az=230, warmth='blue', haze=0.008, under=False)
bpy.data.objects['CineSun'].data.energy = 0.25
tentc = M.principled('TentC', base=(0.55, 0.50, 0.40), rough=0.9, grime=0.3)
Md.mesh_obj('Tent', [(-1.1, -1.5, 0), (1.1, -1.5, 0), (0, -1.5, 1.6), (-1.1, 1.5, 0), (1.1, 1.5, 0), (0, 1.5, 1.6)],
            [(0, 1, 2), (3, 5, 4), (0, 2, 5, 3), (1, 4, 5, 2)], smooth=False, mats=(tentc,))
campfire('Embers', (3.2, -2.5, 0), NF, power=120)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((6, -14, 1.6), (0, 0, 0.9), amount=0.3), lens=28, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
