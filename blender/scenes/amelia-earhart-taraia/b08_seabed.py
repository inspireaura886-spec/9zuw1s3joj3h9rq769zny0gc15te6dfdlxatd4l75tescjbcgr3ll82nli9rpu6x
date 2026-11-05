"""b08 (MEDIUM-WIDE 35 mm, VO 'magnetometer that detects steel'): a yellow sensor sled glides over the sandy lagoon floor, ring ripples spread on the seabed beneath it. Forward track."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 133, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.26, lift=(0.97, 1.0, 1.04))
underwater_world(strength=1.8, density=0.03)
CN.sun(elev=64, az=210, warmth='noon', strength=7.0, check=False)
lagoon_floor(NF, depth=-4.0)
sled = sensor_sled('Sled', (0, -9, -2.3), scale=1.25)
for fr in range(0, NF + 1, 3):
    sled.location = (0.5 * math.sin(fr / 40.0), -9 + 0.12 * fr, -2.3 + 0.05 * math.sin(fr / 20.0)); sled.keyframe_insert('location', frame=fr)
for k, f0 in enumerate((8, 48, 88)):
    rm = glow_mat('RipM%d' % k, (0.55, 0.95, 1.0), 3.2)
    ro = ring_mesh('Rip%d' % k, r=1.0, w=0.06, n=160)
    ro.data.materials.append(rm); ro.visible_shadow = False
    ro.location = (0.5 * math.sin(f0 / 40.0), -9 + 0.12 * f0, -3.9)
    ro.scale = (0.3, 0.3, 0.3); ro.keyframe_insert('scale', frame=f0 - 1)
    ro.scale = (11, 11, 11); ro.keyframe_insert('scale', frame=f0 + 30)
    key_fac(rm, [(0, 0.0), (f0 - 1, 0.0), (f0, 1.0), (f0 + 30, 0.0)])
cam = C.Cam(clip_end=2000)
cam.shot(0, NF, C.track('Sled', offset=(4.2, -5.2, 0.9), offset1=(3.4, -4.2, 0.6), look_offset=(0, 0.9, 0.1)), lens=35, fstop=8, focus='Sled')
go(cam, NF, a, sc, meter=NF // 2, target=0.24)
