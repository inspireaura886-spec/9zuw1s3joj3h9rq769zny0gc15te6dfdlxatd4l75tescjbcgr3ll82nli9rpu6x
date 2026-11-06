"""s02 WIDE 28 mm "What's inside it shouldn't exist yet." Dark Athens gallery, one lit vitrine on a plinth, the green lump
inside on black felt. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
museum(seed=1)
boxm('Felt', (0, 0, 1.015), (0.7, 0.5, 0.01), bpy.data.materials['Felt'])
lump('FragA', (0, 0, 1.03), seed=1)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((1.6, -4.2, 1.7), (0, 0, 1.1), amount=0.22), lens=28, fstop=5.6, focus='FragA')
go(cam, NF, a, sc, meter=NF // 2)
