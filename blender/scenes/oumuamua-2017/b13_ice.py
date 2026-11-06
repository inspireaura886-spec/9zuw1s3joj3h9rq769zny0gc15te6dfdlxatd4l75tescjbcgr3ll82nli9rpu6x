"""s13 MEDIUM 35 mm "Others proposed hydrogen escaping from ice. Critics say that can't push hard enough." The rock with a
frosty sheen and a barely visible shimmer on its sunward side (chips BERGNER & SELIGMAN, NATURE 2023; LIGTERINK, NATURE
2023). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
space(NF, seed=13)
o = oumuamua('Oumu', (0, 0, 0), L=40, NF=NF)
o.data.materials.clear()
o.data.materials.append(M.principled('Frost', base=(0.52, 0.42, 0.40), rough=0.3, sss=0.1, coat=0.4))
Wd.fog(center=(-14, 0, 0), size=(14, 16, 16), density=0.008, color=(0.8, 0.9, 1.0), anisotropy=0.6, noise=0.6,
       noise_scale=0.2)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.push_in((-30, -85, 14), (0, 0, 0), amount=0.25), lens=35, fstop=16, focus='Oumu')
go(cam, NF, a, sc, meter=NF // 2)
