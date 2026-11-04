"""mccormick b04 (L4 'FBI codebreakers crack almost every cipher. This one stopped them at step two.'):
dim desk, warm lamp pool, paper copy of note 1 (real PD scan as texture) + note 2 beside it, magnifying glass on the
lines, slow 20-degree eased orbit. 'STUCK AT STEP 2' card is added in Remotion."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 135, int)
sc = core.reset()
setup(sc, exposure=0.9, vol=True, glare=0.5, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.015, bg_strength=0.0)
dark_room()
top = desk(loc=(0, 0, 0))
N1 = Vector((0.0, 0.0, top + 0.0005))
paper('Note1', os.path.join(HERE, 'note1.jpg'), N1, rot=(0, 0, math.radians(-6)), curl=0.003)
paper('Note2', os.path.join(HERE, 'note2.jpg'), (0.24, 0.07, top + 0.0011), rot=(0, 0, math.radians(9)), curl=0.004)
paper('Blank', None, (-0.26, 0.12, top + 0.0003), rot=(0, 0, math.radians(-14)), base=(0.80, 0.80, 0.76))
mg = model('magnifying_glass_01', (0.02, 0.035, top + 0.002), rot_z=math.radians(35))
model('desk_lamp_arm_01', (-0.55, 0.28, top), rot_z=math.radians(-35))
lamp_light((0.0, 0.02, top), loc=(-0.42, 0.18, top + 0.48), power=38)
Wd.area('Rim', (0.6, 0.9, top + 0.9), (0, 0, top), color=(0.55, 0.65, 0.9), power=25, size=1.2)
haze(center=(0, 0.4, 1.4), size=(5, 5, 2.8), density=0.012)
TGT = (0.0, 0.03, top)
cam = C.Cam()
cam.shot(0, NF, C.orbit((0.0, 0.03, top), r=0.52, a0=-100, a1=-80, h=0.40, r1=0.44, look_h=0.0),
         lens=(48, 52), fstop=2.8, focus=TGT)
finish_cam(cam, NF, a, sc)
