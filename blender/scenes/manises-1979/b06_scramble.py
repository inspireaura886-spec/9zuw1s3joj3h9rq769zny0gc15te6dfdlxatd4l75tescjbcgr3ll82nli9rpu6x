"""manises-1979 plate 6 (177 f, VO 17.91-23.44 'But the Air Force wasn't done. Just after midnight, it scrambled a
Mirage fighter from Albacete.'): night air base, a swept-wing fighter lights its afterburner, rolls and lifts off.
Generic fighter, no national marks. Smooth tracking only."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 177
setup(sc, exposure=1.2, vol=True, glare=0.7, vignette=0.4)
Wd.hdri('qwantani_night', strength=0.35, bg_strength=0.6, rot=30, tint=(0.8, 0.88, 1.08))
Wd.moon(direction=(-0.3, 0.8, 0.35), strength=1.6, color=(0.62, 0.72, 1.0))
runway()
Wd.city_lights('Base', center=(-900, 600, 0.3), radius=500, count=500, seed=41, strength=10, size=1.2, cluster=0.7)
Wd.city_lights('Albacete', center=(2500, 6000, 0.3), radius=2500, count=2500, seed=42, strength=6, size=1.4)
for i, (x, y) in enumerate([(-70, -60), (-70, 60), (-70, 180)]):
    Wd.spot('Apron%d' % i, (x, y, 22), (0, y + 20, 0), color=(1.0, 0.72, 0.42), power=60000, size_deg=55, blend=0.6)
Wd.fog(center=(0, 1000, 15), size=(6000, 6000, 30), density=0.0012, color=(0.75, 0.8, 0.9), anisotropy=0.4,
       height_falloff=0.08)
jet = Md.fighter('Fighter', f1=NF, burner=1.0, gear=True)
Md.fly(jet, accel_keys(NF, a=0.015, lift_f=135, climb=0.006), interp='LINEAR')
burner_ramp('Fighter', [(0, 0.15), (24, 1.0), (NF, 1.0)])
cam = C.Cam(clip_end=40000)
# shot A 0-74: low at the runway edge ahead-left; the burner lights and the jet rolls toward camera
cam.shot(0, 75, C.follow('Fighter', (-16, 58, 1.4), (-15, 54, 1.5), look_offset=(0, 2, 0.8)),
         lens=(40, 46), fstop=4, focus='Fighter')
# shot B 75-176: side tracking at speed as it rotates and lifts off
cam.shot(75, NF, C.track('Fighter', offset=(-24, -4, 2.5), offset1=(-26, 8, 5), look_offset=(0, 6, 1)),
         lens=(45, 42), fstop=4, focus='Fighter')
finish_cam(cam, NF, a, sc)
