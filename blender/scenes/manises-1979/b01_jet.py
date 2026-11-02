"""manises-1979 plates 1 (hook, 132 f, VO 0.00-4.40 'Two red lights chased a jet carrying a hundred and nine people
over Spain.') and 11 (loop, 192 f, VO 45.34-49.22 '... a refinery flare, or two red lights?' + 1.8 s tail).
Frame 0 of the hook = two big red lights mid-chase behind the airliner, fastest push of the Short from frame 0.
The loop plate ENDS on the hook's frame-0 composition (same offsets, lens, light) so the replay has no seam.
--variant hook|loop"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args()
variant = arg(a, '--variant', 'hook')
sc = core.reset()
NF = 132 if variant == 'hook' else 192
setup(sc, exposure=1.05, glare=0.65)
night_air(NF, moon_dir=(-0.25, 0.9, 0.30), moon=2.6)

plane = Md.airliner('Airliner', f1=NF, cabin_glow=2.4)
Md.fly(plane, [(0, (0, 0, 0), (0, 0, 0)), (NF, (0, V_JET * NF, 0), (0.4, 0, 0))], interp='LINEAR')
r1, r2 = red_orbs(NF, parent=plane, radius=3.5, strength=16, halo=1.3)  # cores stay RED (look check 2: 60 clipped white)
# frame-0 offsets (shared by both variants so the loop closes): lights 60-70 m behind-right of the jet
O1, O2 = (60, -104, 6), (56, -100, -4)  # big in the lower right of frame 0, jet centre-left (both read)
CAM0, LOOK0, LENS0 = (70, -150, 14), (33, -36, 2), 40
cam = C.Cam(clip_end=90000)
if variant == 'hook':
    # lights close in on the jet during the hook
    Md.fly(r1, [(0, O1, None), (NF, (26, -28, 7), None)], interp='LINEAR')
    Md.fly(r2, [(0, O2, None), (NF, (36, -22, 1), None)], interp='LINEAR')
    # shot A 0-39: fastest push of the Short, from the frame-0 composition toward the two lights
    cam.shot(0, 40, C.track('Airliner', offset=CAM0, offset1=(60, -128, 12), look_offset=LOOK0),
             lens=(LENS0, 46), fstop=8, focus='Red1')
    # shot B 40-131: wide from the right: the two lights closing on the jet's tail across the frame
    cam.shot(40, NF, C.track('Airliner', offset=(200, -80, 10), offset1=(185, -70, 9), look_offset=(4, -42, 4)),
             lens=(32, 34), fstop=8, focus='Airliner')
else:
    # loop: lights pace the tail closely, then drop back to their frame-0 places while the camera eases back
    Md.fly(r1, [(0, (26, -28, 7), None), (100, (30, -34, 8), None), (NF - 1, O1, None)], interp='LINEAR')
    Md.fly(r2, [(0, (36, -22, 1), None), (100, (40, -28, 1), None), (NF - 1, O2, None)], interp='LINEAR')
    # shot A 0-99: left side, jet crosses frame with the two lights hanging off its tail
    cam.shot(0, 100, C.track('Airliner', offset=(-46, 12, 7), offset1=(-40, -6, 6), look_offset=(40, -24, 4)),
             lens=(32, 34), fstop=8, focus='Airliner')
    # shot B 100-191: eases back to EXACTLY the hook's frame-0 pose (CAM0 / LOOK0 / LENS0)
    cam.shot(100, NF, C.track('Airliner', offset=(52, -112, 10), offset1=CAM0, look_offset=LOOK0,
                              ease=C.ease_out), lens=(46, LENS0), fstop=8, focus='Red1')
finish_cam(cam, NF, a, sc)
