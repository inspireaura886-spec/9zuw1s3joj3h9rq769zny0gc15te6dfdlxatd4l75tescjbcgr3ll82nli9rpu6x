"""s15 WIDE 28 mm 'Who built it, and why did nothing follow?' The gallery at night: the vitrine alone in its pool of
light, the dark room around it. Slow lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
museum(seed=15)
boxm('Felt', (0, 0, 1.015), (0.7, 0.5, 0.01), bpy.data.materials['Felt'])
lump('FragA', (0, 0, 1.03), seed=15)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.dolly((-3.2, -4.6, 1.5), (-1.8, -5.0, 1.5), look=(0, 0, 1.1), look1=(0, 0, 1.1)), lens=28, fstop=5.6,
     focus='FragA')
go(cam, NF, a, sc, meter=NF // 2)
