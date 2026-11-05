"""b12 (CLOSE accent 50 mm, VO 'metal shine'): sunlit white crust of hardened coral sand on dark timber, sparkling glints. Slow push."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 106, int)
sc = core.reset(); look(sc, vol=False, glare=0.5, glare_thr=0.9, vignette=0.3)
dawn_world(sun_az=232, elev=11, strength=7.0, hdri_strength=1.0)
CN.ground('Sand', 'damp_beach_sand', (30, 30), center=(0, 0, 0), tile_m=1.5, tint=(1.5, 1.45, 1.3))
wm = driftwood_mat('CrustWood', crust=1.7, bump_scale=70)
trunk('MacroLog', (-3.2, 0.0, 0.34), (3.2, 0.25, 0.4), 0.34, 0.3, wm, root_end=False)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.dolly((-0.1, -1.25, 0.62), (0.15, -0.85, 0.52), look=(0.3, 0.0, 0.42), look1=(0.4, 0.0, 0.42)), lens=50, fstop=4.0, focus=Vector((0.3, -0.3, 0.4)))
go(cam, NF, a, sc, meter=NF // 2, target=0.28)
