"""s12 CLOSE 35 mm REVEAL 'Whoever shot him left his copper axe behind.' Reconstruction copper axe (yew haft, copper blade
lashed in the fork) on rock and old snow in low sun. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
alps(NF, seed=12, sun_elev=16, az=200, warmth='late', gully=False, haze=0.0)
rock = M.texture_set('Slab', 'rocky_terrain_02', scale=1.5, tint=(0.45, 0.43, 0.40), box=True)
boxm('Slab', (0, 0, 0.1), (1.2, 0.9, 0.2), rock)
copper_axe('Axe', (0, 0, 0.205), rot_z=math.radians(25))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0.35, -0.6, 0.55), (0.02, 0.05, 0.22), amount=0.3), lens=35, fstop=4, focus=Vector((0.03, 0.08, 0.23)))
go(cam, NF, a, sc, meter=NF // 2)
