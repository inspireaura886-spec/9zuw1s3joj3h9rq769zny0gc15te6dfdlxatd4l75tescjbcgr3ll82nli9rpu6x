"""s13 WIDE 28 mm 'Even his radiologist said it's impossible to know if it was war, an accident, or something else.' Museum
gallery at night: the cold-cell viewing window glowing blue, frost on the glass, nothing visible inside. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); alp_mats()
room(size=(8, 6, 3.2), wood_walls=False, window=False, sun_power=0, seed=13)
boxm('CellWall', (0, 2.9, 1.6), (8, 0.2, 3.2), M.principled('MuseumWall', base=(0.08, 0.09, 0.1), rough=0.8))
boxm('CellGlow', (0, 2.78, 1.4), (0.9, 0.02, 0.5), M.emission('ColdBlue', (0.55, 0.8, 1.0), 2.5))
boxm('Frost', (0, 2.76, 1.4), (0.9, 0.005, 0.5), M.principled('FrostG', base=(0.9, 0.95, 1.0), rough=0.9, alpha=0.35))
text_obj('Sign', 'ICEMAN', (0, 2.78, 2.0), size=0.12, mat=M.principled('SignM', base=(0.8, 0.8, 0.8), rough=0.5))
cam = C.Cam(clip_end=200)
wide(cam, NF, C.dolly((-2.2, -2.0, 1.5), (-0.6, -2.0, 1.5), look=(-0.4, 2.8, 1.4), look1=(0, 2.8, 1.4)), lens=28, fstop=4)
go(cam, NF, a, sc, meter=NF // 2)
