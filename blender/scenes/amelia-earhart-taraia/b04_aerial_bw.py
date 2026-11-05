"""b04 (WIDE 35 mm, VO 'aerial photos from 1938'): the same atoll as a grainy black-and-white high-altitude aerial (3D reconstruction, not the real photos); the pale patch glows once. Slow push."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 173, int)
sc = core.reset(); look(sc, vol=False, glare=0.25, vignette=0.34, sat=0.03, lift=(1.0, 0.99, 0.96), gain=(1.05, 1.0, 0.93))
day_world(sun_az=200, elev=50, strength=5.0)
at = Atoll(); at.build(NF=NF, palm_n=900)
lx, ly = at.spit_center()
taraia_shape((lx + 6, ly), rot_deg=18, scale=1.6, glow_keys=[(0, 0.0), (NF * 0.40, 0.0), (NF * 0.55, 7.0), (NF * 0.75, 0.5), (NF, 0.0)], z=1.05)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.dolly((lx - 640, ly - 760, 820), (lx - 470, ly - 560, 640), look=(lx - 40, ly, 0), look1=(lx - 10, ly, 0)), lens=35, fstop=11, focus=Vector((lx, ly, 1.0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.28)
