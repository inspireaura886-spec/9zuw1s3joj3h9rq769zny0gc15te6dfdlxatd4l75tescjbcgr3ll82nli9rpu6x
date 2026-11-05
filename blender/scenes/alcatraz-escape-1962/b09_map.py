"""b09 (WIDE 35 mm, TWIST 'Delft University tide model'): glowing 3D hydrographic map of San Francisco Bay (stylised, labelled, not to scale), cyan tide vectors. Orbital crane."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 125, int)
sc = core.reset(); look(sc, vol=False, glare=0.6, glare_thr=0.9, vignette=0.3)
map_light()
mp = hydro_map(NF, flow=True)
key_strength(mp['arr'], [(0, 2.2), (NF // 2, 5.0), (NF, 2.4)])
key_strength(mp['hm'], [(0, 5.0), (NF // 2, 9.0), (NF, 5.0)])
cam = C.Cam(clip_end=300)
cam.shot(0, NF, C.orbit((3.2, 0.9, 0), r=15, a0=-125, a1=-82, h=(10.5, 8.0), look_h=0.0), lens=35, fstop=9, focus=Vector((3.2, 0.9, 0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
