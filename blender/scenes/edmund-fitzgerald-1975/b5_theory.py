"""edmund-fitzgerald-1975 plate b5 (VO 'Others blamed a shoal, or three rogue waves.'):
--variant shoal: underwater, looking up: the loaded hull slides over a rocky shoal, keel a few metres above the rocks.
--variant wave: water-level camera, a huge swell crest rises between us and the listing freighter."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

a = core.args(); sc = core.reset()
NF = arg(a, '--nf', 60, int)
VAR = arg(a, '--variant', 'shoal')
rnd = random.Random(5)
if VAR == 'shoal':
    setup(sc, exposure=arg(a, '--exp', 1.6, float), vol=True, glare=0.5, vignette=0.5, sat=0.85)
    w = bpy.data.worlds.new('Deep'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.0, 0.006, 0.007, 1)
    surf = Wd.box('Surface', (0, 0, 0.0), (900, 900, 0.05))
    surf.data.materials.append(M.principled('SurfUnder', base=(0.02, 0.05, 0.05), rough=0.15, ior=1.33, spec=0.8, bump=0.6, bump_scale=0.05))
    rock = M.principled('Rock', base=(0.07, 0.07, 0.065), rough=0.9, grime=0.5, bump=0.8, bump_scale=0.8)
    for i in range(46):
        x, y = rnd.uniform(-35, 35), rnd.uniform(-60, 60)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=rnd.uniform(2, 6), location=(x, y, -12.5 + rnd.uniform(-1.5, 0.8)))
        o = bpy.context.active_object; o.scale = (rnd.uniform(0.8, 1.6), rnd.uniform(0.8, 1.6), rnd.uniform(0.4, 0.8))
        o.rotation_euler = (rnd.uniform(0, 1), rnd.uniform(0, 1), rnd.uniform(0, 3)); o.data.materials.append(rock)
        tx = bpy.data.textures.new('R%d' % i, 'VORONOI'); tx.noise_scale = 1.2
        dm = o.modifiers.new('D', 'DISPLACE'); dm.texture = tx; dm.strength = 0.8
    bed = Wd.box('Bed', (0, 0, -16), (900, 900, 1)); bed.data.materials.append(rock)
    ship = freighter('Ship', lights=False)
    ship.location = (0, -40, 0)
    ship.keyframe_insert('location', frame=0); ship.location = (0, -40 + 0.35 * NF, 0); ship.keyframe_insert('location', frame=NF)
    M.set_interp(ship, 'LINEAR')
    Wd.area('Sky', (0, 0, 40), (0, 0, 0), color=(0.5, 0.7, 0.75), power=8.0e4, size=300)
    Wd.fog(center=(0, 0, -8), size=(400, 400, 17), density=arg(a, '--fog', 0.03, float), color=(0.35, 0.6, 0.55), anisotropy=0.7, noise=0.3, noise_scale=0.02)
    cam = C.Cam(clip_end=2000)
    cam.shot(0, NF, C.dolly((14, 10, -11.5), (13, 2, -11.0), look=(0, 30, -5), look1=(0, 24, -4)), lens=(20, 22), fstop=6)
else:
    setup(sc, exposure=arg(a, '--exp', 1.7, float), vol=True)
    storm_lake(NF, wave_scale=arg(a, '--ws', 4.2, float), wind=26.0, crest=2.0, crest1=4.5)
    ship = freighter('Ship')
    ship_motion(ship, NF, speed=0.10, list_deg=(5.0, 6.0), roll_amp=2.2, y0=0.0)
    cam = C.Cam(clip_end=20000)
    cam.shot(0, NF, C.dolly((-175, -40, 3.2), (-165, -20, 4.2), look=(0, 10, 8), look1=(0, 20, 9)), lens=(30, 33), fstop=8,
             focus='Ship_Pilot')
finish_cam(cam, NF, a, sc)
