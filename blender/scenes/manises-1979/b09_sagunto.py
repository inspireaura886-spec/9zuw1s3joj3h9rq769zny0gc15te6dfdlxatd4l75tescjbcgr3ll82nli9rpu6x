"""manises-1979 plate 9 (134 f, VO 33.00-37.46 'A second light, over Sagunto, did the same. Low on fuel, he had to
turn back.'): a second, white disc-shaped light hangs over the coastal town lights; the fighter banks away and turns
back. Smooth bank, no shake."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
sc = core.reset()
NF = 134
setup(sc, exposure=1.2, vol=True, glare=0.7)
Wd.hdri('kloppenheim_02_puresky', strength=0.35, bg_strength=0.6, rot=250, tint=(0.75, 0.85, 1.1))
Wd.moon(direction=(0.4, 0.85, 0.3), strength=2.2, color=(0.62, 0.72, 1.0))
Wd.sea_plane(size=80000, z=-1500, color=(0.004, 0.007, 0.012), rough=0.75, wave=0.1, frames=NF)
Wd.terrain('Coast', size=30000, res=80, height=120, scale=0.0004, center=(-15500, 4000, -1500), seed=12,
           mat=M.principled('LandS', base=(0.03, 0.033, 0.03), rough=0.9))
Wd.city_lights('Sagunto', center=(-1400, 2600, -1480), radius=900, count=2200, seed=61, strength=12, size=1.6,
               cluster=0.85)
Wd.city_lights('CoastRoad', center=(-1700, 2000, -1480), radius=200, count=700, seed=62, strength=9, size=1.4,
               shape='line', length=12000)
Wd.fog(center=(0, 3000, -900), size=(40000, 40000, 1400), density=0.00004, color=(0.7, 0.78, 0.95), anisotropy=0.3)
disc = Md.orb('WhiteDisc', (-900, 2300, 80), color=(0.85, 0.92, 1.0), strength=500, power=2e7, radius=24, halo=1.6,
              pulse=0.05, f1=NF, seed=4)
disc.scale = (1.0, 1.0, 0.32)
jet = Md.fighter('Fighter', f1=NF, burner=0.5)
Md.fly(jet, [(0, (0, 0, 0), (0, 0, 0)), (60, (0, 360, 0), (0, 0, 0)), (100, (40, 560, 10), (0, 40, -25)),
             (NF, (160, 700, 20), (0, 48, -60))], interp='BEZIER')
cam = C.Cam(clip_end=90000)
# shot A 0-65: behind the fighter; the white disc over the town lights ahead-left
cam.shot(0, 66, C.track('Fighter', offset=(10, -34, 6), offset1=(8, -28, 5), look_offset=(-90, 300, -10)),
         lens=(36, 40), fstop=8, focus='Fighter')
# shot B 66-133: ahead-right, the fighter rolls into the turn and heads back toward camera, disc beyond it
cam.shot(66, NF, C.follow('Fighter', (170, 260, 4), (190, 300, 6), look_offset=(0, 0, 2)),
         lens=(40, 44), fstop=8, focus='Fighter')
finish_cam(cam, NF, a, sc)
