"""s14 CLOSE 35 mm 'Inside, a photo of a young man. On the back: Louis Sodder.' The snapshot lies FACE DOWN on the table
(the face is never shown); its back carries the handwriting 'Louis Sodder / I love brother Frankie / Ilil Boys / A90132
or 35'. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); sod_mats()
room(size=(5, 4, 3.0), wood_walls=False, window=True, sun_power=1100, seed=14)
boxm('Table', (0, 0, 0.74), (1.2, 0.8, 0.04), M.texture_set('TableW', 'wood_table_worn', scale=1.0, box=True))
ph = boxm('PhotoBack', (0, 0, 0.7612), (0.09, 0.125, 0.0008), M.principled('PhotoPaper', base=(0.86, 0.84, 0.78), rough=0.6))
handwriting('Back', ['Louis Sodder', 'I love brother Frankie', 'Ilil Boys', 'A90132 or 35'], (0, 0.035, 0.7618), size=0.0075)
env = boxm('Envelope', (0.16, 0.08, 0.7615), (0.24, 0.105, 0.002), bpy.data.materials['Paper'])
env.rotation_euler[2] = math.radians(-20)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((0.0, -0.22, 0.98), (0, 0.01, 0.762), amount=0.3), lens=35, fstop=3.2, focus=Vector((0, 0.01, 0.762)))
go(cam, NF, a, sc, meter=NF // 2)
