"""nazca-lines-peru-2024 b11_doubled (24 mm, orbit; VO 'Nearly doubling the count.'): Wide orbit: old figures pale, new ones outlined by soft teal glows, the count visibly doubled.
NF default 60 = 4 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 60, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
pampa(NF, sun_az=70, elev=30)
rr = random.Random(5)
for k in range(8):
    p = (rr.uniform(-450, 450), rr.uniform(-450, 450), 0)
    [hummingbird, monkey, spider][k % 3]('Old%d' % k, loc=p, scale=0.6, w=1.0)
for k in range(8):
    p = (rr.uniform(-450, 450), rr.uniform(-450, 450), 0)
    slope_figure('NewF%d' % k, ['orca', 'human', 'llama'][k % 3], p, scale=1.4, tilt=0, w=0.6)
    m = glow_mat('Halo%d' % k, (0.6, 0.95, 0.9), 2.0)
    o = ring_mesh('HaloR%d' % k, 18.0, 1.0, 64)
    o.location = (p[0], p[1], 1.0)
    o.data.materials.append(m)
    key_fac(m, [(int(NF * 0.1 + k * 4), 0.0), (int(NF * 0.1 + k * 4 + 6), 1.0)])
cam = C.Cam(clip_end=30000)
ease_cam(cam, NF, C.orbit((0, 0, 0), r=760, a0=300, a1=322, h=(560, 540), look_h=0), 24, fstop=11, focus=900.0)
go(cam, NF, a, sc, meter=NF // 2)
