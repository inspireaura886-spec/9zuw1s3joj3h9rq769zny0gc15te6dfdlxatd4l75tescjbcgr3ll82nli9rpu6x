"""mccormick b04 (L4 'FBI codebreakers crack almost every cipher. This one stopped them at step two.'):
dim desk, warm lamp pool, paper copy of note 1 (real PD scan as texture) + note 2 beside it, magnifying glass on the
lines, slow 20-degree eased orbit. 'STUCK AT STEP 2' card is added in Remotion."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 172, int)
sc = core.reset()
setup(sc, exposure=0.9, vol=True, glare=0.5, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.015, bg_strength=0.0)
dark_room()
top = desk(loc=(0, 0, 0))
N1 = Vector((0.0, 0.0, top + 0.0005))
paper('Note1', os.path.join(HERE, 'note1.jpg'), N1, rot=(0, 0, math.radians(-6)), curl=0.003)
paper('Note2', os.path.join(HERE, 'note2.jpg'), (0.24, 0.07, top + 0.0011), rot=(0, 0, math.radians(9)), curl=0.004)
paper('Blank', None, (-0.26, 0.12, top + 0.0003), rot=(0, 0, math.radians(-14)), base=(0.80, 0.80, 0.76))
# magnifier LIES FLAT on note 1 with its lens over the cipher lines (look r1: it stood upright on its handle)
col = P.gltf('magnifying_glass_01')
mg = place_col(col, (0, 0, 0), ground=True, name='Magnifier')
sx, sy, sz = mg['size']
h = sz - sx / 2                      # handle end -> lens centre (model stands handle-down)
phi = math.radians(150)              # handle points away-right from camera
LENS = Vector((0.0, 0.045, 0))       # lens centre over the upper cipher lines
mg.rotation_euler = (math.radians(90), 0, phi)
mg.location = (LENS.x - h * math.sin(phi), LENS.y + h * math.cos(phi), top + sy / 2 + 0.0012)
print('IA3D magnifier size', sx, sy, sz)
model('desk_lamp_arm_01', (-0.55, 0.28, top), rot_z=math.radians(-35))
lamp_light((0.0, 0.02, top), loc=(-0.42, 0.18, top + 0.48), power=38)
Wd.area('Rim', (0.6, 0.9, top + 0.9), (0, 0, top), color=(0.55, 0.65, 0.9), power=25, size=1.2)
Wd.area('Ceiling', (0.0, -0.35, top + 1.3), (0, 0.03, top), color=(0.85, 0.88, 0.95), power=12, size=1.6)  # look r2: lens read too dark (reflected black room)
haze(center=(0, 0.4, 1.4), size=(5, 5, 2.8), density=0.012)
TGT = (0.0, 0.03, top)
cam = C.Cam()
cam.shot(0, NF, C.orbit((0.0, 0.03, top), r=0.52, a0=-100, a1=-80, h=0.40, r1=0.44, look_h=0.0),
         lens=(48, 52), fstop=2.8, focus=TGT)
finish_cam(cam, NF, a, sc)
