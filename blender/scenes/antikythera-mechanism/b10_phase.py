"""s10 CLOSE 50 mm accent "turn a ball to show the Moon's phase," The half-silvered moon-phase ball turning in its window on
the dial, the Sun pointer passing behind. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.03, bg_strength=0.0)
root, crank, (sp, mp) = mechanism('Mech', (0, 0, 0), scale=4.0, crank_keys=[(0, 0.0), (NF, 0.25)], NF=NF)
ball = bpy.data.objects['MechMoonBall']
half = sphere('Shadow', (0, -0.0081 * 4 * 0.2, 0), 0.0082 * 4, M.principled('MoonDark', base=(0.02, 0.02, 0.02), rough=0.6), 24,
              scale=(1.0, 0.55, 1.0))
half.parent = ball
ball.rotation_euler = (0, 0, 0)
ball.keyframe_insert('rotation_euler', frame=0)
ball.rotation_euler = (0, 0, math.radians(120))
ball.keyframe_insert('rotation_euler', frame=NF)
Wd.spot('Key', (-0.6, -1.4, 1.6), (0, -0.2, 1.0), color=(1.0, 0.85, 0.65), power=200, size_deg=30)
cam = C.Cam(clip_end=20)
wide(cam, NF, C.push_in((0.12, -0.75, 1.05), (0, -0.22, 1.02), amount=0.2), lens=50, fstop=5.6, focus='MechMoonBall')
go(cam, NF, a, sc, meter=NF // 2)
