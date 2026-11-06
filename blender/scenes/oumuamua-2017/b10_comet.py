"""s10 WIDE 28 mm 'Comets get that push when gas boils off them.' A small comet nucleus with a glowing coma and a long
gas-and-dust tail streaming away from the Sun (comparison, illustrative). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
space(NF, seed=10, sun_dir=(-1, 0, 0.05))
oumuamua('Nucleus', (0, 0, 0), L=12, ratio=1.6, NF=NF)
Wd.fog(center=(0, 0, 0), size=(30, 30, 30), density=0.03, color=(0.75, 0.88, 1.0), anisotropy=0.6)
Wd.fog(center=(160, 0, 0), size=(300, 40, 40), density=0.012, color=(0.7, 0.85, 1.0), anisotropy=0.7, noise=0.5,
       noise_scale=0.03)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.dolly((-60, -260, 30), (40, -270, 34), look=(60, 0, 0), look1=(90, 0, 0)), lens=28, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
