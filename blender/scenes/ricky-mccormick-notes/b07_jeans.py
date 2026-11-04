"""mccormick b07 (L7 re-hook 'So who wrote the code he carried?'): folded worn jeans on a wooden chair in the dim room;
camera cranes down to the back pocket, where the edge of a folded note shows. No person."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 62, int)
sc = core.reset()
setup(sc, exposure=0.95, vol=True, glare=0.45, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.015, bg_strength=0.0)
dark_room()
model('painted_wooden_chair_01', (0, 0, 0), rot_z=0.0)   # backrest AWAY from camera (look r1: 180 put it in front)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
hit, loc, nrm, idx, ob, mtx = sc.ray_cast(dg, Vector((0, 0.05, 2.0)), Vector((0, 0, -1)))
seat = loc.z if hit else 0.46
print('IA3D seat z', seat, ob.name if hit else None)
# folded jeans: bevelled slab, denim texture, two fold layers
dm = M.texture_set('Denim', 'denim_fabric', scale=5.0, tint=(0.55, 0.62, 0.8), box=True)
wr = bpy.data.textures.new('Wrinkle', 'CLOUDS'); wr.noise_scale = 0.06
for k, (sx, sy, sz, dz) in enumerate(((0.40, 0.31, 0.045, 0.0), (0.38, 0.29, 0.04, 0.042))):
    j = Wd.box('Jeans%d' % k, (0, 0.02, seat + sz / 2 + dz + 0.001), (sx, sy, sz))
    bv = j.modifiers.new('bv', 'BEVEL'); bv.width = 0.014; bv.segments = 4
    ss = j.modifiers.new('ss', 'SUBSURF'); ss.levels = 4; ss.render_levels = 4
    dp = j.modifiers.new('dp', 'DISPLACE'); dp.texture = wr; dp.strength = 0.009; dp.mid_level = 0.5
    M.assign(j, dm)
    for p in j.data.polygons:
        p.use_smooth = True
jt = seat + 0.0865 + 0.006   # + wrinkle displacement headroom
# back pocket patch (raised 2 mm: no z-fighting) + stitching
pk = grid('Pocket', 0.14, 0.15, 12, 12, lambda u, v: 0.0)
pk.location = (0.05, 0.02, jt + 0.002)
M.assign(pk, M.texture_set('Denim2', 'denim_fabric', scale=5.0, tint=(0.45, 0.52, 0.70), box=True))
st = M.principled('Stitch', base=(0.75, 0.45, 0.15), rough=0.6)
for name, pts in (('StitchA', [(-0.068, 0.072), (-0.068, -0.04), (0.0, -0.075), (0.068, -0.04), (0.068, 0.072)]),):
    o = ink_curve([(0.05 + x, 0.02 + y, jt + 0.0032) for x, y in pts], name=name, bevel=0.0008)
    M.assign(o, st)
# folded note edge sticking out of the pocket mouth (note 2 scan as texture)
nt = paper('NoteEdge', os.path.join(HERE, 'note2.jpg'), (0.045, 0.095, jt + 0.0045), w=0.10, h=0.05,
           rot=(math.radians(8), 0, math.radians(4)), curl=0.002)
lamp_light((0.05, 0.03, jt), loc=(-0.7, 0.35, 1.5), power=55, size_deg=55)
Wd.area('Rim', (0.6, 0.8, 1.2), (0, 0, seat), color=(0.55, 0.65, 0.9), power=30, size=1.0)
haze(center=(0, 0.5, 1.3), size=(5, 5, 2.6), density=0.012)
P0 = (0.05, 0.045, jt)
cam = C.Cam()
cam.shot(0, NF, C.crane((0.10, -0.62, jt + 0.62), P0, dz=-0.40, dlook=0.0), lens=(40, 46), fstop=2.8, focus=P0)
finish_cam(cam, NF, a, sc)
