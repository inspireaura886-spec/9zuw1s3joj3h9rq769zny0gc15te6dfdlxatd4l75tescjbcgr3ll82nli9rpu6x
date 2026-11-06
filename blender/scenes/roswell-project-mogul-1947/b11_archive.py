"""s11 WIDE 28 mm 'So the Air Force reopened its files.' Records archive aisle, steel shelves of document boxes,
pools of lamp light; a few boxes stand pulled out. Dolly down the aisle."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
Wd.hdri('fireplace', strength=0.02, bg_strength=0.0)
archive('Arch', length=24)
cam = C.Cam()
wide(cam, NF, C.dolly((0, -1.5, 1.5), (0, 3.5, 1.45), look=(0, 22, 1.2)), lens=28, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
