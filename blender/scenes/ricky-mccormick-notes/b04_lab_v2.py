"""mccormick b04 CINE LOOK v2 look test (NOT in the final render plan; b04_lab.py stays the plate).
Hero close-up: the two FBI note scans (public domain) on a scanned worn wooden table (Poly Haven WoodenTable_01),
magnifier lying on note 1, spectacles + pencils + notepads, encyclopedia set and an oil lamp glowing out of focus.
Key = the desk lamp (warm practical, motivated), cool blue-hour window fill from the right, real interior HDRI
(fireplace) as the blurred room. 58 mm f/2.0 slow eased push-in, focus on the cipher lines under the lens."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
from kit import cine as CN

a = core.args(); NF = arg(a, '--nf', 172, int)
sc = core.reset()
CN.setup(sc, samples=arg(a, '--spp', 160, int), exposure=arg(a, '--ev', 0.0, float), glare=0.4, glare_thr=1.0, vignette=0.2, lift=(0.99, 1.0, 1.04),
         gain=(1.04, 1.0, 0.94))
CN.hdri_sun('fireplace', strength=0.55)

# ---- scanned table: long worn-wood bench table, long axis along X
tb = CN.place('WoodenTable_01', (0, 0, 0), rot=(0, 0, 0), name='Table')
sx, sy, sz = tb['size']
if sy > sx:                                  # make the long side run left-right
    tb.rotation_euler = (0, 0, math.radians(90))
top = sz
print('IA3D table size', sx, sy, sz)

# floor under it (seen only as blur at frame bottom edges, if at all)
CN.ground('Floor', 'wood_table_worn', (6, 6), center=(0, 0, 0), tile_m=1.5, tint=(0.35, 0.3, 0.27))

# ---- papers (real scans) + magnifier
N1 = Vector((0.0, 0.0, top + 0.0006))
paper('Note1', os.path.join(HERE, 'note1.jpg'), N1, rot=(0, 0, math.radians(-6)), curl=0.004)
paper('Note2', os.path.join(HERE, 'note2.jpg'), (0.235, 0.085, top + 0.0012), rot=(0, 0, math.radians(9)), curl=0.005)
paper('Blank', None, (-0.26, 0.11, top + 0.0004), rot=(0, 0, math.radians(-14)), curl=0.003, base=(0.82, 0.80, 0.74))

col = CN.model('magnifying_glass_01')
mg = place_col(col, (0, 0, 0), ground=True, name='Magnifier')
mx_, my_, mz_ = mg['size']
h = mz_ - mx_ / 2
phi = math.radians(150)
LENS = Vector((0.0, 0.045, 0))
mg.rotation_euler = (math.radians(90), 0, phi)
mg.location = (LENS.x - h * math.sin(phi), LENS.y + h * math.cos(phi), top + my_ / 2 + 0.0014)

# ---- dressing (scanned props) in the frame's central column: glasses as out-of-focus foreground (lower right),
# pencils + notepads behind note 1, encyclopedia set + glowing oil lamp as background bokeh at the back edge
D = min(sx, sy)                              # table depth (front-back)
BK = D / 2
for aid, loc, rz, s in (('round_spectacles', (0.115, -0.10, top), -0.35, 1.0),
                        ('stationery_supplies', (-0.11, 0.20, top), 0.25, 1.0),
                        ('office_notepads', (0.15, 0.24, top), 0.2, 1.0),
                        ('book_encyclopedia_set_01', (-0.10, BK - 0.09, top), 0.0, 1.0),
                        ('vintage_oil_lamp', (0.08, BK - 0.11, top), 0.4, 1.0)):
    e = CN.place(aid, (loc[0], loc[1], loc[2] + 0.0016), rot=(0, 0, rz), scale=s, name='P_' + aid)
    print('IA3D prop', aid, 'size', tuple(round(v, 3) for v in e['size']))
oil = bpy.data.objects['P_vintage_oil_lamp']
oz = oil['size'][2]
Wd.point('OilFlame', (0.08, BK - 0.11, top + oz * 0.58), color=(1.0, 0.62, 0.3), power=2.5, radius=0.012)

LX, LY = -0.42, BK - 0.12
lampm = CN.place('desk_lamp_arm_01', (LX - 0.12, LY + 0.04, top), rot=(0, 0, math.radians(-35)), name='DeskLamp')
lz = lampm['size'][2]
HZ = top + min(0.5, lz * 0.85)
# lamp head pool: warm practical from where the shade is (upper-left, just out of frame)
CN.practical('LampKey', (LX, LY - 0.08, HZ), (0.0, 0.03, top), kelvin_rgb=(1.0, 0.70, 0.42),
             power=30, cone=75, blend=0.6, radius=0.05)
Wd.point('LampBulb', (LX, LY - 0.08, HZ + 0.02), color=(1.0, 0.72, 0.45), power=4, radius=0.02)
# blue-hour window from camera-right (cool fill, keeps shadows readable, not murky)
Wd.area('Window', (0.95, -0.15, top + 0.55), (0, 0.05, top), color=(0.58, 0.70, 1.0), power=22, size=1.0)
CN.haze(center=(0, 0.1, top + 0.6), size=(2.4, 2.0, 1.4), density=0.05, color=(1.0, 0.95, 0.9), anisotropy=0.5,
        noise=0.4, noise_scale=0.6, height_falloff=0.0)

cam = C.Cam()
FOC = Vector((0.0, 0.045, top))
P0 = Vector((0.03, -0.52, top + 0.31))
P1 = Vector((0.025, -0.45, top + 0.275))
CN.shot(cam, 0, NF, C.dolly(P0, P1, look=Vector((0.0, 0.07, top)), look1=Vector((0.0, 0.06, top))), lens=58,
        fstop=2.0, focus=FOC)
CN.render(cam, NF, a, sc, meter_frame=NF // 2)
