"""s08 WIDE 28 mm 'A month later, a second ship found the third man, and a tin box of film.' A second sealer slides out of
thick fog off the island (chip 5 SEP 1930, Isbjorn). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
kvitoya(NF, seed=6)
Wd.fog(center=(0, -200, 40), size=(3000, 1200, 80), density=0.006, color=(0.85, 0.88, 0.95), anisotropy=0.4, noise=0.5, noise_scale=0.01)
s = sealer('Isbjorn', (-120, -260, 0.3), yaw=80)
fly_line(s, NF, (-140, -260, 0.3), (0.35, 0.04, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-60, -420, 6), (-25, -425, 6.5), look=(-120, -260, 6), look1=(-100, -258, 6)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
