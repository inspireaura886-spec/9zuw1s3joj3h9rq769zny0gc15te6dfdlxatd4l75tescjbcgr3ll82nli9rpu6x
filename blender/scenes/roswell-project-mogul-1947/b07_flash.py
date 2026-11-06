"""s07 MEDIUM 35 mm 'A weather balloon, he said.' Floor-level view across the foil, sticks and brown paper; flashbulbs
pop from off-frame. Low push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(8, 7, 3.1), wood_walls=True, sun_power=700, seed=7)
for k in range(2):
    crumple('Wrap%d' % k, (-0.3 + k * 0.6, 0.2, 0.003), (0.9, 1.2), bpy.data.materials['BrownPaper'], seed=40 + k, amp=0.05)
debris_field((0, 0.2, 0), radius=0.9, n=36, seed=13, scale=0.5, z=0.01)
press_camera('CamA', (-1.6, -1.5, 0), yaw=-30, NF=NF, flashes=(10, 38))
press_camera('CamB', (1.7, -1.3, 0), yaw=35, NF=NF, flashes=(24, 52))
cam = C.Cam()
wide(cam, NF, C.push_in((0.2, -2.2, 0.55), (0, 0.3, 0.05), amount=0.28), lens=35, fstop=4)
go(cam, NF, a, sc, meter=NF // 2)
