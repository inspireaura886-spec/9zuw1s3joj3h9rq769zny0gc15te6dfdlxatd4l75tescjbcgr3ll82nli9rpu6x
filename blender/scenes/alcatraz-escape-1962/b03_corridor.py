"""b03 (WIDE 28 mm, 'in their beds'): cellhouse tier, a row of cells, three adjacent ones with a lumpy blanket and a head; lights-out shadows. Eased dolly down the walkway."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 50, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.28)
Wd.hdri('moonless_golf', strength=0.03)
cellhouse_corridor(n=9, heads=(3, 4, 5))
CN.haze(center=(0, -1.0, 1.8), size=(15, 2.6, 3.4), density=0.012, color=(0.85, 0.85, 0.8), anisotropy=0.5, noise=0.35, noise_scale=0.2)
Wd.area('WalkFill', (-3, -1.3, 3.4), (3, 0.5, 0.8), color=(0.55, 0.65, 1.0), power=140, size=3.0)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.dolly((-7.2, -1.55, 1.05), (-5.0, -1.55, 1.1), look=(5.0, 0.2, 0.9), look1=(5.0, 0.3, 0.9)), lens=28, fstop=5.6, focus=Vector((0, 0.5, 0.8)))
go(cam, NF, a, sc, meter=NF // 2, target=0.19)
