"""edmund-fitzgerald-1975 plate b2 (VO 'Ten minutes later, it was gone from radar. No Mayday. Twenty-nine men.'):
the following ship's radar scope: one echo ahead (the freighter) lit on the first sweep, gone on the next.
--gone F = frame after which the echo is gone (between two beam passes). Smooth push-in, no shake."""
import sys, os, functools; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args(); sc = core.reset()
NF = arg(a, '--nf', 135, int)
GONE = arg(a, '--gone', 60, int)
T0 = arg(a, '--t0', 0.6, float)
setup(sc, exposure=0.95, vol=False, glare=0.6, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.02)
I.ppi_material = functools.partial(I.ppi_material, sweep_s=2.2)
blips = [((0.05, 0.40), (0.05, 0.43), 4.0, [(0, 1.0), (GONE - 1, 1.0), (GONE + 1, 0.0)])]
I.radar_room(frames=NF, blips=blips, seed=5, haze=0.025, t0=T0)
tgt = (0.02, 0.06, 1.04)
cam = C.Cam()
h = int(NF * 0.55)
cam.shot(0, h, C.dolly((0.30, -0.92, 1.80), (0.22, -0.74, 1.64), look=tgt), lens=(38, 40), fstop=2.2, focus=tgt)
cam.shot(h, NF, C.dolly((0.10, -0.50, 1.46), (0.07, -0.40, 1.38), look=(0.02, 0.09, 1.04)), lens=(50, 56),
         fstop=1.8, focus=(0.02, 0.09, 1.04))
finish_cam(cam, NF, a, sc)
