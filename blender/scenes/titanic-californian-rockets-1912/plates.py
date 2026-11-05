"""All plates of titanic-californian-rockets-1912. Run: scene plates.py ... --plate <name> --nf <frames>.
One plate = one camera shot (smooth eased moves only, no shake)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tc import *

a = core.args()
PLATE = arg(a, '--plate', 'b01_bridge')
NF = arg(a, '--nf', 100, int)
sc = core.reset()
D = mats()
SEA = -14.0          # sea level below the bridge wing
DIST = 3000.0        # distance of the 'other steamer' (reconstruction; no mileage on screen)
K = DIST / 3000.0
cam = C.Cam(clip_end=90000)
METER = None
TARGET = 0.22


def far_steamer(x=300.0, sea_z=SEA, y=DIST, k=K):
    return distant_lights((x, y, sea_z), sea_z, length=240.0, k=k, yaw_deg=0.0)


def bridge_scene(lamp=True):
    look(sc, vol=False)
    night(sea_z=SEA, NF=NF)
    bridge_set(SEA, D, lamp=lamp)
    ice_field(90, (-900, 900, 40, 1200), SEA, seed=4, size=(3, 16), avoid=lambda x, y: abs(x) < 10 and y < 90)
    far_steamer()


# ----------------------------------------------------------------------------------------------------------------
def b01_bridge():
    bridge_scene()
    rocket((300, DIST, SEA + 12), (330, DIST, SEA + 360), 6, 24, k=K, seed=2, flash_power=3.0e6)
    cam.shot(0, NF, C.dolly((0.05, -2.2, 1.52), (0.0, -1.25, 1.48), look=(130, 900, 62), look1=(115, 900, 70)), lens=28,
             fstop=9, focus=28.0)


def b02_horizon():
    look(sc, vol=False)
    night(sea_z=0.0, NF=NF)
    ice_field(70, (-700, 700, 25, 900), 0.0, seed=7, size=(3, 14))
    far_steamer(x=120.0, sea_z=0.0, y=DIST)
    cam.shot(0, NF, C.crane((0, 0, 2.6), (120, DIST, 14), dz=7.0, dlook=3.0), lens=28, fstop=9, focus=60.0)


def b03_sky():
    look(sc, vol=False)
    night(sea_z=0.0, NF=NF)
    ice_field(70, (-700, 700, 25, 900), 0.0, seed=8, size=(3, 14))
    far_steamer(x=0.0, sea_z=0.0, y=DIST)
    rocket((-40, DIST, 12), (-10, DIST - 40, 330), 6, 26, k=K, seed=3, flash_power=3.0e6, tag='A')
    rocket((10, DIST, 12), (60, DIST - 20, 400), 36, 26, k=K, seed=4, flash_power=3.0e6, tag='B')
    rocket((50, DIST, 12), (-90, DIST - 30, 360), 64, 26, k=K, seed=5, flash_power=3.0e6, tag='C')
    cam.shot(0, NF, C.dolly((0, 0, 2.8), (0, 0, 2.8), look=(0, DIST, 60), look1=(0, DIST * 0.7, 520)), lens=24, fstop=9, focus=80.0)


def b04_steamer_ice():
    global TARGET
    look(sc, vol=False)
    night(sea_z=0.0, NF=NF, key=0.16)
    steamer('Steamer', (0, 0, 0), yaw_deg=90.0, NF=NF)
    ice_field(230, (-260, 120, -260, 260), 0.0, seed=9, size=(2.5, 12), avoid=lambda x, y: abs(x) < 11 and abs(y) < 72, berg=4)
    cam.shot(0, NF, C.dolly((-95, -52, 2.0), (-48, -56, 2.0), look=(0, 0, 9), look1=(10, 0, 9)), lens=26, fstop=8, focus=90.0)
    TARGET = 0.2


def b05_iceaerial():
    look(sc, vol=False)
    night(sea_z=0.0, NF=NF, key=0.22, key_dir=(-0.45, -0.2, 0.55))
    steamer('Steamer', (0, 0, 0), yaw_deg=90.0, NF=NF, roll=False)
    ice_field(900, (-1400, 1400, -1400, 1400), 0.0, seed=12, size=(8, 46), avoid=lambda x, y: abs(x) < 20 and abs(y) < 80, berg=10)
    cam.shot(0, NF, C.crane((0, -200, 520), (0, 0, 0), dz=-170.0, dlook=0), lens=24, fstop=8, focus=500.0)


def b09_eight():
    look(sc, vol=False)
    night(sea_z=0.0, NF=NF)
    ice_field(60, (-600, 600, 25, 800), 0.0, seed=10, size=(3, 14))
    far_steamer(x=0.0, sea_z=0.0, y=DIST)
    xs = [-170, 120, -60, 190, -110, 30, 150, -20]
    for i in range(8):
        fl = 2 + i * 6
        rocket((xs[i] * 0.5, DIST, 12), (xs[i], DIST, 280 + 25 * (i % 3)), fl, 12, k=K, seed=20 + i, flash_power=2.0e6, tag='E%d' % i,
               life_f=24, n_star=26, spread=110.0, star_r=4.0, trail_w=3.0)
    cam.shot(0, NF, C.dolly((0, 0, 2.8), (0, 0, 2.8), look=(-260, DIST, 70), look1=(260, DIST, 70)), lens=32, fstop=9, focus=80.0)


def b06_cabin():
    look(sc, vol=False, glare=0.35)
    # wireless cabin 3.0 x 2.4 x 2.3, camera at the door looking at the desk on the +Y wall
    wall = M.texture_set('CabWall', 'wood_table_worn', scale=2.0, tint=(0.30, 0.18, 0.10))
    floor = M.principled('CabFloor', base=(0.05, 0.035, 0.025), rough=0.5)
    ceil = M.principled('CabCeil', base=(0.35, 0.33, 0.28), rough=0.9)
    room_shell(3.0, 2.6, 2.3, (0, 0, 0), wall, floor, ceil, open_side='WFront')
    Wd.hdri('qwantani_night_puresky', strength=0.02, bg_strength=0.02)
    # desk
    boxm('Desk', (0, 0.88, 0.74), (1.9, 0.75, 0.05), D['wood_l'], 0.01)
    for sx in (-0.9, 0.9):
        for sy in (0.58, 1.2):
            boxm('DeskLeg', (sx, sy, 0.36), (0.06, 0.06, 0.72), D['wood'])
    ebon = M.principled('Ebonite', base=(0.01, 0.01, 0.012), rough=0.15, coat=0.6)
    boxm('SetBase', (-0.2, 0.95, 0.80), (0.62, 0.34, 0.06), ebon, 0.01)
    boxm('SetPanel', (-0.2, 1.1, 0.97), (0.62, 0.04, 0.30), ebon, 0.01)
    for i in range(5):
        sph('SetKnob%d' % i, (-0.42 + 0.11 * i, 1.065, 0.99), 0.027, D['brass'], 10, 6)
        cyl('SetDial%d' % i, (-0.42 + 0.11 * i, 1.08, 0.93), (-0.42 + 0.11 * i, 1.055, 0.93), 0.02, D['brass'], 12)
    cyl('Coil', (-0.55, 0.95, 0.89), (-0.05, 0.95, 0.89), 0.075, D['brass'], 24)
    boxm('Key', (0.12, 0.62, 0.80), (0.12, 0.08, 0.03), ebon, 0.004)
    boxm('KeyArm', (0.12, 0.62, 0.84), (0.015, 0.14, 0.012), D['brass'])
    sph('KeyKnob', (0.12, 0.54, 0.86), 0.02, ebon, 10, 6)
    # headphones set down on the desk (headband + two ear cups + cable)
    torus('PhBand', (0.55, 0.75, 0.86), 0.085, 0.006, D['iron'], rot=(math.radians(80), 0, math.radians(15)))
    cyl('PhCupL', (0.46, 0.72, 0.8), (0.46, 0.70, 0.83), 0.034, D['iron'], 14)
    cyl('PhCupR', (0.64, 0.78, 0.8), (0.64, 0.76, 0.83), 0.034, D['iron'], 14)
    curve_poly('PhCable', [(0.55, 0.8, 0.78), (0.6, 0.85, 0.77), (0.7, 0.92, 0.77), (0.8, 1.05, 0.77)], 0.004, D['iron'])
    paper_stack('Log', (0.3, 0.5, 0.77), 12, 2, D)
    # stool + lamp + clock
    cyl('StoolTop', (0.0, 0.1, 0.56), (0.0, 0.1, 0.6), 0.2, D['wood'], 20)
    for sx, sy in ((0.12, 0.0), (-0.12, 0.0), (0.0, 0.2), (0.0, -0.0)):
        cyl('StoolLeg', (sx * 0.3, 0.1 + sy * 0.3, 0.0), (sx * 0.3, 0.1 + sy * 0.3, 0.56), 0.02, D['wood'], 8)
    cyl('LampBase', (0.82, 1.1, 0.77), (0.82, 1.1, 0.79), 0.07, D['brass'], 16)
    cyl('LampStem', (0.82, 1.1, 0.79), (0.82, 1.1, 1.02), 0.013, D['brass'], 8)
    sph('LampBulb', (0.82, 1.1, 1.05), 0.03, M.emission('LampBulb', (1.0, 0.8, 0.5), 20.0), 10, 6)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.1, radius2=0.035, depth=0.11, location=(0.82, 1.1, 1.1))
    sh = bpy.context.active_object
    M.assign(sh, D['brass'])
    Wd.spot('LampKey', (0.8, 1.0, 1.12), (0.3, 0.8, 0.78), color=(1.0, 0.72, 0.4), power=90, size_deg=85, blend=0.7, radius=0.04)
    Wd.point('LampFill', (0.8, 1.0, 1.1), color=(1.0, 0.7, 0.4), power=22, radius=0.1)
    clock('Clk', (-0.9, 1.245, 1.62), 11, 35, r=0.17, d=D, lit=True)
    Wd.spot('ClkLight', (-0.9, 0.6, 1.9), (-0.9, 1.24, 1.62), color=(1.0, 0.75, 0.45), power=18, size_deg=40, blend=0.6, radius=0.04)
    sph('Porthole', (1.45, 0.4, 1.5), 0.02, ebon, 8, 6)
    cam.shot(0, NF, C.dolly((0.05, -1.0, 1.3), (0.38, 0.1, 1.06), look=(0.1, 1.1, 0.95), look1=(0.55, 0.78, 0.82)), lens=32, fstop=4.5,
             focus=Vector((0.55, 0.78, 0.82)))


def b07_bunk():
    look(sc, vol=False, glare=0.3)
    wall = M.texture_set('BunkWall', 'wood_table_worn', scale=2.0, tint=(0.22, 0.14, 0.08))
    floor = M.principled('BunkFloor', base=(0.04, 0.03, 0.02), rough=0.55)
    ceil = M.principled('BunkCeil', base=(0.25, 0.24, 0.2), rough=0.9)
    room_shell(2.2, 2.8, 2.2, (0, 0, 0), wall, floor, ceil, open_side='WFront')
    Wd.hdri('qwantani_night_puresky', strength=0.02, bg_strength=0.02)
    cloth = M.principled('Blanket', base=(0.10, 0.12, 0.16), rough=0.95, bump=0.3, bump_scale=80)
    sheet = M.principled('Sheet', base=(0.55, 0.55, 0.52), rough=0.9)
    boxm('BunkFrame', (-0.55, 0.45, 0.28), (0.86, 1.95, 0.30), D['wood'], 0.02)
    boxm('Mattress', (-0.55, 0.45, 0.47), (0.8, 1.9, 0.14), sheet, 0.05)
    sph('Pillow', (-0.55, 1.2, 0.6), 0.2, sheet, 16, 10, scale=(1.1, 1.4, 0.55))
    body = sph('SleeperUnderBlanket', (-0.55, 0.28, 0.64), 0.26, cloth, 24, 12, scale=(1.35, 3.4, 0.62))
    sph('BlanketHump', (-0.55, 0.5, 0.58), 0.3, cloth, 20, 10, scale=(1.5, 2.8, 0.55))
    # window / porthole, cold starlight
    cyl('Port', (1.04, 0.2, 1.4), (1.1, 0.2, 1.4), 0.18, D['brass'], 24)
    pg = M.emission('PortGlow', (0.45, 0.6, 1.0), 0.8)
    cyl('PortGlass', (1.0, 0.2, 1.4), (1.04, 0.2, 1.4), 0.14, pg, 24)
    Wd.spot('PortLight', (0.95, 0.2, 1.4), (-0.4, 0.5, 0.5), color=(0.5, 0.65, 1.0), power=70, size_deg=70, blend=0.7, radius=0.1)
    # door ajar with a warm strip of corridor light
    boxm('DoorLeaf', (0.55, -1.3, 1.0), (0.8, 0.05, 2.0), D['wood_l'], 0.01, rot=(0, 0, math.radians(-38)))
    Wd.area('CorridorLight', (1.3, -2.2, 1.6), (0.4, -1.0, 0.5), color=(1.0, 0.7, 0.4), power=130, size=0.5)
    Wd.point('ShelfLamp', (-1.0, 1.2, 1.5), color=(1.0, 0.7, 0.4), power=0.8, radius=0.05)
    cam.shot(0, NF, C.dolly((-0.2, -0.2, 1.25), (0.4, -1.05, 1.3), look=(-0.55, 0.7, 0.6), look1=(-0.5, 0.7, 0.6)), lens=28, fstop=5.6,
             focus=Vector((-0.55, 0.5, 0.6)))


def b08_bridge2():
    bridge_scene()
    officer('OffA', (-0.5, 1.75, 0.0), yaw_deg=0.0, binoc=True, d=D)
    officer('OffB', (0.85, 1.7, 0.0), yaw_deg=8.0, binoc=False, d=D)
    rocket((300, DIST, SEA + 12), (260, DIST, SEA + 330), 70, 24, k=K, seed=6, flash_power=3.0e6, tag='X')
    cam.shot(0, NF, C.dolly((2.0, -1.5, 1.7), (0.7, 0.0, 1.62), look=(-0.3, 40, 2.4), look1=(0.2, 40, 4.0)), lens=28, fstop=8, focus=12.0)


def b10_lamp():
    look(sc, vol=True)
    night(sea_z=SEA, NF=NF)
    bridge_set(SEA, D, lamp=False, telegraph=False)
    morse_lamp((0.0, 2.05, 1.2), aim=(0, 400, 30), NF=NF, power=2500.0, d=D)
    Wd.fog(center=(0, 20, 1.5), size=(16, 40, 8), density=0.03, color=(0.8, 0.88, 1.0), anisotropy=0.5)
    cam.shot(0, NF, C.orbit((0.0, 2.1, 1.2), r=1.5, a0=20, a1=78, h=0.25, look_h=0.0), lens=50, fstop=4.0,
             focus=Vector((0, 2.1, 1.2)))


def b11_bridge_lamp():
    look(sc, vol=True)
    night(sea_z=SEA, NF=NF)
    bridge_set(SEA, D, lamp=False)
    morse_lamp((0.0, 2.05, 1.2), aim=(0, 400, 30), NF=NF, power=2500.0, d=D, pattern=[(x + 4, y + 4) for x, y in MORSE])
    Wd.fog(center=(0, 20, 1.5), size=(16, 40, 8), density=0.025, color=(0.8, 0.88, 1.0), anisotropy=0.5)
    boxm('DarkWinBelow', (0, 2.0, -1.4), (1.2, 0.04, 0.8), M.principled('DarkGlass', base=(0.003, 0.004, 0.006), rough=0.05), 0.0)
    far_steamer()
    cam.shot(0, NF, C.dolly((-3.1, -1.6, 1.65), (3.0, -1.6, 1.65), look=(-0.3, 14, 1.2), look1=(0.3, 14, 1.2)), lens=28, fstop=8,
             focus=14.0)


def b12_corridor():
    look(sc, vol=True, glare=0.3)
    wall = M.texture_set('CorWall', 'wood_table_worn', scale=1.5, tint=(0.26, 0.15, 0.08))
    floor = M.principled('CorFloor', base=(0.03, 0.025, 0.02), rough=0.4, coat=0.2)
    ceil = M.principled('CorCeil', base=(0.30, 0.29, 0.25), rough=0.9)
    room_shell(1.7, 15.0, 2.4, (0, 6.5, 0), wall, floor, ceil, open_side='WFront')
    Wd.hdri('qwantani_night_puresky', strength=0.02, bg_strength=0.02)
    for i, y in enumerate((1.5, 4.0, 6.5, 9.0)):
        boxm('DoorL%d' % i, (-0.78, y, 1.0), (0.03, 0.9, 2.0), D['wood_l'], 0.01)
        boxm('DoorLTrim%d' % i, (-0.785, y, 1.0), (0.02, 1.0, 2.1), D['brass'])
        sph('KnobL%d' % i, (-0.74, y + 0.35, 1.0), 0.03, D['brass'], 8, 6)
        sc_ = M.emission('Sconce%d' % i, (1.0, 0.72, 0.4), 3.0)
        sph('SconceG%d' % i, (0.78, y + 1.25, 1.85), 0.07, sc_, 10, 6)
        Wd.point('SconceL%d' % i, (0.72, y + 1.25, 1.85), color=(1.0, 0.7, 0.38), power=9, radius=0.05)
    # end door (wireless cabin), shut, dark; brass plate and a clock above
    boxm('EndDoor', (0.0, 13.9, 1.0), (0.95, 0.05, 2.0), D['wood_l'], 0.01)
    boxm('EndPlate', (0.0, 13.86, 1.55), (0.3, 0.01, 0.1), D['brass'])
    boxm('EndGap', (0.0, 13.86, 0.02), (0.9, 0.01, 0.015), D['warm'])
    clock('EndClk', (0.0, 13.9, 2.15), 4, 15, r=0.15, d=D, lit=True, hour_end=(4, 30), min_end=30, f0=0, f1=NF - 2)
    Wd.fog(center=(0, 6.5, 1.2), size=(1.6, 14.6, 2.3), density=0.05, color=(1.0, 0.85, 0.65), anisotropy=0.5)
    cam.shot(0, NF, C.dolly((0.05, -0.8, 1.45), (0.05, 6.5, 1.4), look=(0.0, 13.9, 1.3)), lens=28, fstop=5.6, focus=10.0)


def b13_dawn():
    global TARGET
    look(sc, vol=False)
    CN.hdri_sun('qwantani_dawn_puresky', sun_az=70, strength=0.5, bg_strength=0.8)
    Wd.sea_plane(size=90000, z=0.0, color=(0.004, 0.008, 0.012), rough=0.05, wave=0.1, frames=max(NF, 60))
    CN.sun(elev=2.0, az=70, warmth=(0.9, 0.78, 0.7), strength=0.8, angle=1.0, check=False)
    rnd = random.Random(31)
    wood = D['wood']
    for i in range(22):
        x, y = rnd.uniform(-70, 70), rnd.uniform(14, 150)
        boxm('Plank%d' % i, (x, y, 0.0), (rnd.uniform(0.1, 0.22), rnd.uniform(1.5, 4.5), 0.05), wood,
             rot=(rnd.uniform(-0.1, 0.1), rnd.uniform(-0.1, 0.1), rnd.uniform(0, 6.28)))
    for i in range(5):
        boxm('Crate%d' % i, (rnd.uniform(-35, 35), rnd.uniform(20, 90), 0.0), (0.6, 0.6, 0.5), D['wood_l'], 0.03, rot=(0.1, 0.1, rnd.uniform(0, 6)))
    for i in range(3):
        torus('Belt%d' % i, (rnd.uniform(-25, 25), rnd.uniform(22, 70), 0.02), 0.28, 0.07, D['paint_w'], rot=(0, 0, 0))
    ice_field(26, (-500, 500, 160, 900), 0.0, seed=14, size=(5, 22), berg=3)
    cam.shot(0, NF, C.dolly((0, -6, 3.2), (0, 6, 2.8), look=(0, 400, 14)), lens=24, fstop=9, focus=70.0)
    TARGET = 0.25


def b14_room():
    look(sc, vol=True, glare=0.3)
    wood = M.texture_set('InqWall', 'wood_table_worn', scale=3.0, tint=(0.16, 0.09, 0.05))
    floor = M.texture_set('InqFloor', 'wood_table_worn', scale=4.0, tint=(0.14, 0.09, 0.06))
    ceil = M.principled('InqCeil', base=(0.42, 0.4, 0.36), rough=0.9)
    room_shell(9.0, 13.0, 5.0, (0, 5.0, 0), wood, floor, ceil, open_side='WFront')
    Wd.hdri('qwantani_night_puresky', strength=0.02, bg_strength=0.02)
    baize = M.principled('Baize', base=(0.02, 0.07, 0.04), rough=0.95, bump=0.2, bump_scale=300)
    boxm('Table', (0, 5.0, 0.76), (1.7, 7.2, 0.06), baize, 0.01)
    boxm('TableEdge', (0, 5.0, 0.72), (1.76, 7.26, 0.04), D['wood'], 0.01)
    for sx in (-0.78, 0.78):
        for sy in (1.6, 8.4):
            boxm('TLeg', (sx, sy, 0.36), (0.1, 0.1, 0.72), D['wood'])
    for i in range(5):
        for sgn in (-1, 1):
            chair('Ch%d_%d' % (i, sgn), (sgn * 1.2, 2.5 + i * 1.3, 0.0), yaw=90 * sgn if sgn > 0 else -90, d=D)
    chair('ChHead', (0.0, 9.0, 0.0), yaw=180, d=D)
    rnd = random.Random(2)
    for i in range(14):
        paper_stack('Pp%d' % i, (rnd.uniform(-0.55, 0.55), rnd.uniform(2.0, 8.0), 0.79), rnd.uniform(-20, 20), rnd.choice((1, 2, 3)), D)
    for i, y in enumerate((3.0, 5.0, 7.0)):
        boxm('Plate%d' % i, (0.0, y, 0.815), (0.22, 0.05, 0.03), D['brass'], 0.003)
        cyl('Ink%d' % i, (0.35, y + 0.3, 0.79), (0.35, y + 0.3, 0.85), 0.03, M.principled('InkGlass', base=(0.01, 0.01, 0.015), rough=0.05, coat=1.0), 12)
    for i, y in enumerate((3.2, 6.8)):
        cyl('BLStem%d' % i, (0.0, y, 0.79), (0.0, y, 0.98), 0.012, D['brass'], 8)
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.13, radius2=0.04, depth=0.1, location=(0.0, y, 1.02))
        M.assign(bpy.context.active_object, M.principled('GreenShade', base=(0.02, 0.2, 0.09), rough=0.3, coat=0.5))
        Wd.spot('BL%d' % i, (0.0, y, 0.98), (0.0, y, 0.78), color=(1.0, 0.82, 0.55), power=40, size_deg=100, blend=0.8, radius=0.03)
    # tall windows on the left wall, cold overcast daylight
    for i, y in enumerate((2.5, 5.0, 7.5, 10.0)):
        boxm('Win%d' % i, (-4.44, y, 2.5), (0.04, 1.2, 2.8), M.emission('WinSky%d' % i, (0.78, 0.86, 1.0), 4.0))
        for sy in (-0.6, 0.6):
            boxm('Mullion', (-4.42, y + sy, 2.5), (0.05, 0.05, 2.8), D['wood'])
        boxm('MullionH', (-4.42, y, 2.5), (0.05, 1.2, 0.05), D['wood'])
    Wd.area('WinKey', (-4.3, 6.0, 3.2), (1.5, 5.5, 0.8), color=(0.7, 0.82, 1.0), power=900, size=5.0)
    Wd.area('RoomFill', (0, 6.0, 4.8), (0, 6.0, 0.0), color=(1.0, 0.85, 0.65), power=160, size=5.0)
    Wd.fog(center=(0, 5.0, 2.5), size=(8.6, 12.6, 4.8), density=0.008, color=(0.85, 0.9, 1.0), anisotropy=0.6)
    cam.shot(0, NF, C.dolly((0.15, -0.9, 1.35), (0.1, 1.9, 1.25), look=(0.0, 6.5, 0.9)), lens=32, fstop=5.6, focus=7.0)


def chart_scene(NF):
    look(sc, vol=False, glare=0.3)
    Wd.hdri('qwantani_night_puresky', strength=0.02, bg_strength=0.02)
    tab = M.texture_set('ChartTable', 'wood_table_worn', scale=2.0, tint=(0.18, 0.1, 0.06))
    boxm('ChTable', (0, 0, -0.03), (3.0, 2.2, 0.06), tab)
    sea = M.principled('ChartSea', base=(0.03, 0.07, 0.10), rough=0.9, bump=0.1, bump_scale=200)
    boxm('Chart', (0, 0, 0.004), (1.7, 1.15, 0.006), sea, 0.0)
    land = M.principled('ChartLand', base=(0.20, 0.17, 0.11), rough=0.9)
    boxm('Coast', (-0.76, 0.25, 0.009), (0.22, 0.9, 0.006), land, 0.02)
    line = M.principled('ChartLine', base=(0.55, 0.52, 0.42), rough=0.8)
    for i in range(-3, 4):
        curve_poly('LatL%d' % i, [(-0.8, i * 0.15, 0.011), (0.8, i * 0.15, 0.011)], 0.0014, line)
        curve_poly('LonL%d' % i, [(i * 0.23, -0.55, 0.011), (i * 0.23, 0.55, 0.011)], 0.0014, line)
    # ship markers: two small steamer silhouettes
    for nm, p, col in (('ShipA', (-0.12, -0.05, 0.0), (0.8, 0.8, 0.75)), ('ShipB', (0.22, 0.12, 0.0), (0.8, 0.45, 0.2))):
        m_ = M.principled(nm + 'M', base=col, rough=0.4, metal=0.3)
        boxm(nm + 'Hull', (p[0], p[1], 0.016), (0.07, 0.022, 0.02), m_, 0.004)
        boxm(nm + 'House', (p[0], p[1], 0.03), (0.022, 0.016, 0.014), m_, 0.002)
        cyl(nm + 'Fun', (p[0] - 0.012, p[1], 0.03), (p[0] - 0.012, p[1], 0.05), 0.007, m_, 10)
    # brass dividers, pencil, lamp
    cyl('DivA', (0.55, -0.35, 0.0), (0.42, -0.1, 0.04), 0.006, D['brass'], 8)
    cyl('DivB', (0.55, -0.35, 0.0), (0.62, -0.1, 0.04), 0.006, D['brass'], 8)
    cyl('Pencil', (-0.5, -0.5, 0.012), (-0.3, -0.45, 0.012), 0.005, D['wood_l'], 8)
    Wd.spot('ChartLamp', (0.4, -0.3, 1.1), (0.0, 0.0, 0.0), color=(1.0, 0.8, 0.52), power=240, size_deg=75, blend=0.8, radius=0.05)
    Wd.area('ChartFill', (0, -1.0, 1.6), (0, 0, 0), color=(0.7, 0.8, 1.0), power=22, size=2.0)
    return D['brass']


def b15a_chart():
    chart_scene(NF)
    dm = M.emission('DashAmber', (1.0, 0.65, 0.25), 3.5)
    dashed_ring('Third', (0.32, 0.22, 0), 0.19, n=26, mat=dm, f_on=(10, 80), z=0.014)
    cam.shot(0, NF, C.crane((0.0, -0.6, 1.15), (0.1, 0.05, 0.0), dz=-0.4, dlook=0.0), lens=35, fstop=5.6, focus=1.0)


def b15b_empty():
    chart_scene(NF)
    dm = M.emission('DashAmber', (1.0, 0.65, 0.25), 3.5)
    objs = dashed_ring('Third', (0.38, 0.14, 0), 0.19, n=26, mat=dm, f_on=None, z=0.014)
    # the outline holds over blank water, then fades away (no third ship found)
    for i, o in enumerate(objs):
        o.scale = (1, 1, 1)
        o.keyframe_insert('scale', frame=int(NF * 0.45) + i // 2)
        o.scale = (0, 0, 0)
        o.keyframe_insert('scale', frame=int(NF * 0.45) + 14 + i // 2)
        lin(o)
    cam.shot(0, NF, C.crane((0.3, 0.05, 0.9), (0.38, 0.14, 0.0), dz=-0.28, dlook=0.0), lens=35, fstop=4.0, focus=Vector((0.38, 0.14, 0.0)))


PL = dict(b01_bridge=b01_bridge, b02_horizon=b02_horizon, b03_sky=b03_sky, b04_steamer_ice=b04_steamer_ice,
          b05_iceaerial=b05_iceaerial, b06_cabin=b06_cabin, b07_bunk=b07_bunk, b08_bridge2=b08_bridge2, b09_eight=b09_eight,
          b10_lamp=b10_lamp, b11_bridge_lamp=b11_bridge_lamp, b12_corridor=b12_corridor, b13_dawn=b13_dawn, b14_room=b14_room,
          b15a_chart=b15a_chart, b15b_empty=b15b_empty)
PL[PLATE]()
go(cam, NF, a, sc, meter=NF // 2, target=TARGET)
