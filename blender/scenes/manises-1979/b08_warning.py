"""manises-1979 plate 8 (70 f, VO 30.96-32.64 'Then his own warning systems went off.'): cockpit at night, a bank
of red warning lamps lights up on the glareshield; the red light glows beyond the glass. Lamps switch on cleanly
(no strobe, no camera shake), slow push only."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 70
setup(sc, exposure=1.1, vol=False, glare=0.75, vignette=0.42, streaks=0.08)
Wd.hdri('kloppenheim_02_puresky', strength=0.25, bg_strength=0.5, rot=200, tint=(0.75, 0.85, 1.1))
Wd.moon(direction=(0.4, 0.7, 0.3), strength=1.0, color=(0.62, 0.72, 1.0))
Wd.city_lights('Valencia', center=(-1500, 6000, -1480), radius=3500, count=5000, seed=51, strength=10, size=1.6)
ck = I.cockpit(panel_glow=0.9)
orb = Md.orb('BigRed', (180, 900, 60), strength=700, power=8e6, radius=26, halo=2.0, pulse=0.0, f1=NF, seed=3)
# warning lamp bank on the glareshield: 2 rows x 4 lamps, switching on at f 6 (lamps 'went off' = alarms sounded)
import bpy
lamps = []
for r in range(2):
    for c in range(4):
        b = Wd.box('Warn%d%d' % (r, c), (-0.21 + c * 0.14, 1.02, 0.315 + r * 0.055), (0.11, 0.02, 0.04))
        m = M.emission('WarnM%d%d' % (r, c), (1.0, 0.08, 0.03), 0.0)
        b.data.materials.append(m)
        s = m.node_tree.nodes['Emission'].inputs['Strength']
        on = 6 + (r * 4 + c) % 3
        # on, then a slow steady pulse (period 20 f) - an alarm, not a strobe
        keys = [(0, 0.0), (on, 0.0), (on + 2, 40.0)]
        f = on + 2
        while f < NF:
            keys += [(f + 10, 18.0), (f + 20, 40.0)]
            f += 20
        M.animate(s, 'default_value', keys)
lamp_light = Wd.point('WarnGlow', (0, 0.95, 0.40), color=(1.0, 0.1, 0.04), power=0.0, radius=0.1)
for f, v in [(0, 0), (6, 0), (8, 18), (NF, 18)]:
    lamp_light.data.energy = v
    lamp_light.data.keyframe_insert('energy', frame=f)
cam = C.Cam()
cam.shot(0, NF, C.dolly((0.18, 0.05, 0.52), (0.10, 0.42, 0.44), look=(-0.02, 1.03, 0.34)), lens=(32, 38),
         fstop=2.0, focus=(-0.02, 1.03, 0.34))
finish_cam(cam, NF, a, sc)
