"""s13 CLOSE 35 mm REVEAL 'Two decades after the fire, an envelope came from Kentucky with no return address.' A kitchen table
in window light: a stamped envelope, postmark ring 'CENTRAL CITY KY', blank corner where a return address would be. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); sod_mats()
room(size=(5, 4, 3.0), wood_walls=False, window=True, sun_power=1100, seed=13)
boxm('Table', (0, 0, 0.74), (1.2, 0.8, 0.04), M.texture_set('TableW', 'wood_table_worn', scale=1.0, box=True))
env = boxm('Envelope', (0, 0, 0.7615), (0.24, 0.105, 0.002), bpy.data.materials['Paper'])
env.rotation_euler[2] = math.radians(8)
torus('Postmark', (0.07, 0.025, 0.763), 0.022, 0.0012, bpy.data.materials['Ink'], rot=(0, 0, 0))
text_obj('PM', 'CENTRAL CITY KY', (0.07, 0.025, 0.7632), size=0.0055, mat=bpy.data.materials['Ink'])
boxm('Stamp', (0.1, 0.035, 0.7628), (0.022, 0.026, 0.0004), M.principled('StampP', base=(0.5, 0.1, 0.1), rough=0.7))
handwriting('Addr', ['Mrs. Jennie Sodder', 'Fayetteville, W. Va.'], (-0.01, -0.01, 0.7632), size=0.008)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((0.02, -0.34, 1.05), (0, 0, 0.762), amount=0.28), lens=35, fstop=3.5, focus=Vector((0, 0, 0.762)))
go(cam, NF, a, sc, meter=NF // 2)
