"""mh370 b02 (WIDE 28 mm, VO 'Yet the silent jet kept answering a satellite. Seven times.'): generic wide-body twin in
night cruise above a moonlit cloud deck, small in frame, drifting L->R; seven faint ping rings pulse out from it.
NF default 127 (--nf)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 127, int)
sc = core.reset(); look(sc, vol=True, glare=0.45)
night_cruise(NF, moon_dir=(0.85, 0.25, 0.32), moon=2.6)
jet = widebody('Jet', f1=NF, cabin_glow=1.4)
V = 250.0 / 30
fly_line(jet, NF, (0, -V * NF / 2, 0), (0, V, 0))
# seven ping rings, emitted from the jet's position and expanding (pale cyan, transparent fade)
for k in range(7):
    f0 = 4 + k * 17
    rg = ring_mesh('Ping%d' % k, r=1.0, w=0.035)
    m = glow_mat('PingM%d' % k, color=(0.55, 0.88, 1.0), strength=7.0)
    rg.data.materials.append(m)
    rg.location = (0, -V * NF / 2 + V * f0, 0)
    for f, s in ((0, 0.01), (f0, 6.0), (f0 + 28, 150.0)):
        rg.scale = (s, s, s); rg.keyframe_insert('scale', frame=f)
    key_fac(m, [(0, 0.0), (f0 - 1, 0.0), (f0, 0.95), (f0 + 10, 0.6), (f0 + 28, 0.0)])
    rg.visible_shadow = False
cam = C.Cam(clip_end=90000)
def mv(t):
    j = bpy.data.objects['Jet'].matrix_world.translation
    e = C.cruise(t)
    return {'pos': j + Vector((330, C.lerp(40, -30, e), 70)), 'look': j + Vector((0, C.lerp(55, -55, e), -18))}
cam.shot(0, NF, mv, lens=28, fstop=11, focus='Jet')
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
