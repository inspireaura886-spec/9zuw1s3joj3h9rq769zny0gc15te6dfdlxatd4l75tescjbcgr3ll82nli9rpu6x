"""manises-1979 plate 7 (206 f, VO 23.80-30.60 'Captain Fernando Camara found a huge red light hanging over the
airport. When he closed in, it kept pace with him.'): fighter at night over Valencia; a huge red light hangs above
the airport ahead; as he closes in it starts to move and paces him. Clear sky (no cloud deck), thin haze."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 206
VF = 6.0  # fighter m per frame (~180 m/s)
setup(sc, exposure=1.2, vol=True, glare=0.7)
Wd.hdri('kloppenheim_02_puresky', strength=0.35, bg_strength=0.6, rot=200, tint=(0.75, 0.85, 1.1))
Wd.moon(direction=(0.3, 0.9, 0.3), strength=2.0, color=(0.62, 0.72, 1.0))
Wd.sea_plane(size=80000, z=-1500, color=(0.004, 0.007, 0.012), rough=0.75, wave=0.1, frames=NF)
Wd.terrain('Land', size=30000, res=80, height=60, scale=0.0003, center=(-12000, 6000, -1500), seed=9,
           mat=M.principled('LandV', base=(0.03, 0.033, 0.03), rough=0.9))
Wd.city_lights('Valencia', center=(-2500, 2500, -1480), radius=3500, count=7000, seed=51, strength=10, size=1.6,
               cluster=0.85)
Wd.city_lights('Runway', center=(400, 1900, -1480), radius=40, count=300, seed=52, strength=30, size=1.8,
               shape='line', length=2700, color=(1.0, 0.85, 0.6))
Wd.fog(center=(0, 3000, -900), size=(40000, 40000, 1400), density=0.00004, color=(0.7, 0.78, 0.95), anisotropy=0.3)
jet = Md.fighter('Fighter', f1=NF, burner=0.35)
Md.fly(jet, [(0, (0, 0, 0), (0, 0, 0)), (NF, (0, VF * NF, 0), (0, 0, 0))], interp='LINEAR')
orb = Md.orb('BigRed', (0, 0, 0), strength=700, power=3e7, radius=26, halo=2.2, pulse=0.06, f1=NF, seed=3)
# hangs still over the airport, then (as he closes in) slides back and matches his speed 500 m ahead-right
Md.fly(orb, [(0, (300, 1500, 60), None), (100, (300, 1500, 60), None), (130, (220, VF * 130 + 520, 50), None),
             (NF, (220, VF * NF + 520, 50), None)], interp='LINEAR')
cam = C.Cam(clip_end=90000)
# shot A 0-99: chase behind the fighter; the huge red light ahead, airport lights below it
cam.shot(0, 100, C.track('Fighter', offset=(-5, -30, 5), offset1=(-4, -24, 4), look_offset=(80, 400, 30)),
         lens=(42, 46), fstop=8, focus='Fighter')
# shot B 100-205: left side of the fighter; the light keeps pace beyond it
cam.shot(100, NF, C.track('Fighter', offset=(-30, -16, 4), offset1=(-28, -8, 3.5), look_offset=(60, 200, 12)),
         lens=(38, 40), fstop=8, focus='Fighter')
finish_cam(cam, NF, a, sc)
