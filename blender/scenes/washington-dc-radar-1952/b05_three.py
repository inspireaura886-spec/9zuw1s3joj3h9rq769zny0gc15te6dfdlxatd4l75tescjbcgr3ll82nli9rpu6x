"""dc-radar b05 (L5 'Three radars tracked one target. It vanished from all three at once.'): the radar room wide:
hero scope in the foreground + two consoles beyond, each scope holding ONE blip; all three fade on 'once'."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy
a = core.args(); NF = arg(a, '--nf', 130, int)
fv = arg(a, '--vanish', 105, int)
vis = [(0, 1.0), (fv, 1.0), (fv + 4, 0.0), (NF, 0.0)]
sc = radar_set(NF, [((0.22, -0.10), (0.16, -0.02), 4.0, vis)])
# background scopes 0 and 1 get the same single target (different offsets per site), same vanish frame
for j, (p0, p1) in enumerate((((-0.30, 0.20), (-0.36, 0.26)), ((0.10, 0.30), (0.04, 0.36)))):
    o = bpy.data.objects.get('BgScope%d' % j)
    if o is None:
        continue
    m = I.ppi_material('PPI_t3_%d' % j, frames=NF, blips=[(p0, p1, 4.5, vis)], seed=7 + j, glow=4.5,
                       t0=T0 + 1.3 * j, floor=0.6)
    o.data.materials.clear(); o.data.materials.append(m)
cam = C.Cam()
cam.shot(0, NF, C.dolly((0.75, -1.55, 1.95), (0.35, -1.45, 1.90), look=(-0.5, 2.0, 0.95), look1=(-0.3, 2.2, 0.95)),
         lens=(28, 30), fstop=4.0, focus=(-0.6, 2.4, 1.0))
finish_cam(cam, NF, a, sc)
