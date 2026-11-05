"""b10 (WIDE 35 mm, 'thirty-minute launch window'): same tide map, a corridor of vectors between Alcatraz and Horseshoe Bay lights up while the rest dims. Slow push."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 109, int)
sc = core.reset(); look(sc, vol=False, glare=0.6, glare_thr=0.9, vignette=0.3)
map_light()
mp = hydro_map(NF, flow=True, window=True)
key_strength(mp['arr'], [(0, 1.0), (NF, 0.7)])
for o in bpy.data.objects:
    if o.name.startswith('ArS') or o.name.startswith('ArH'):
        pass
key_strength(mp['hm'], [(0, 6.0), (NF // 2, 11.0), (NF, 6.0)])
cam = C.Cam(clip_end=300)
cam.shot(0, NF, C.dolly((8.5, -7.5, 8.0), (5.6, -4.6, 6.0), look=(2.6, 1.0, 0), look1=(2.3, 1.0, 0)), lens=35, fstop=9, focus=Vector((3.0, 1.0, 0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
