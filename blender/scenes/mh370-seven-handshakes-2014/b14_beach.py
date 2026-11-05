"""mh370 b14 (MEDIUM-WIDE 35 mm, VO 'In 2015, part of its wing washed up on Reunion Island.'): reconstruction: a
white flaperon-shaped wing panel lying on a black volcanic-sand beach at dawn, surf behind; panel <= 1/3 of frame.
Eased 25 deg orbit. NF default 129. (Label '3D RECONSTRUCTION' in Remotion.)"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 129, int)
sc = core.reset(); look(sc, vol=False, glare=0.35, vignette=0.22)
dawn_world(sun_az=35, elev=10, strength=6.0, hdri_strength=1.2)
sand = CN.ground('Sand', 'damp_beach_sand', (160, 160), center=(0, 2, 0), tile_m=2.5, tint=(0.2, 0.19, 0.18))
sand.rotation_euler = (math.radians(-2.2), 0, 0)      # beach falls toward the sea (+Y)
sea = swell_ocean(NF, half=900, wave_scale=0.5, wind=9, choppy=1.0, color=(0.01, 0.025, 0.03), center=(0, 0, -0.55))
# foam band where the water meets the sand
fm, nb, b, out = M.new('Foam')
tc = nb.n('ShaderNodeTexCoord'); nz = nb.n('ShaderNodeTexNoise', Scale=0.6, Detail=8.0, Roughness=0.7)
nb.l(tc, 'Object', nz, 'Vector')
cr = nb.n('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.5; cr.color_ramp.elements[1].position = 0.62
nb.l(nz, 'Fac', cr, 'Fac'); nb.l(cr, 'Color', b, 'Alpha')
b.inputs['Base Color'].default_value = (0.85, 0.87, 0.88, 1); b.inputs['Roughness'].default_value = 0.6
fm.blend_method = 'HASHED'
fo = Wd.box('FoamBand', (0, 15.8, -0.5), (200, 3.0, 0.01)); fo.data.materials.append(fm)
for f, y in ((0, 15.8), (NF // 2, 14.9), (NF, 16.1)):
    fo.location.y = y; fo.keyframe_insert('location', frame=f)
# flaperon-like panel (generic, ~2.4 m span x 1.0 m chord), white paint with grime, trailing edge torn
bm = bmesh.new(); nx, ny = 24, 10
rnd = random.Random(3)
top, bot = [], []
for j in range(ny + 1):
    rt, rb = [], []
    for i in range(nx + 1):
        x = (i / nx - 0.5) * 2.4
        u = j / ny
        chord = 1.0 - 0.18 * (i / nx)
        y = u * chord
        th = 0.2 * (1 - u) ** 1.3 * (1 - 0.3 * i / nx) + 0.012
        if j == ny:
            y -= rnd.uniform(0, 0.12) if i > nx * 0.45 else 0.0
        rt.append(bm.verts.new((x, y, th / 2))); rb.append(bm.verts.new((x, y, -th / 2)))
    top.append(rt); bot.append(rb)
for j in range(ny):
    for i in range(nx):
        bm.faces.new((top[j][i], top[j][i + 1], top[j + 1][i + 1], top[j + 1][i]))
        bm.faces.new((bot[j][i], bot[j + 1][i], bot[j + 1][i + 1], bot[j][i + 1]))
for i in range(nx):
    bm.faces.new((top[0][i], bot[0][i], bot[0][i + 1], top[0][i + 1]))
    bm.faces.new((top[ny][i], top[ny][i + 1], bot[ny][i + 1], bot[ny][i]))
for j in range(ny):
    for col in (0, nx):
        bm.faces.new((top[j][col], top[j + 1][col], bot[j + 1][col], bot[j][col]))
me = bpy.data.meshes.new('Panel'); bm.normal_update(); bm.to_mesh(me); bm.free()
panel = link(bpy.data.objects.new('Panel', me))
for p in me.polygons: p.use_smooth = True
pm = M.principled('PanelPaint', base=(0.78, 0.78, 0.75), rough=0.5, grime=0.45, bump=0.25, bump_scale=60, rough_noise=0.15)
panel.data.materials.append(pm)
panel.location = (0.0, 2.0, 0.02)
panel.rotation_euler = (math.radians(9), math.radians(-11), math.radians(28))
panel.location = (0.0, 2.0, 0.08)
rk = M.texture_set('Basalt', 'rocky_terrain_02', scale=0.6, tint=(0.25, 0.24, 0.24), box=True)
for k, (x, y, s) in enumerate(((-4.5, 6, 0.9), (5.2, 8, 1.3), (-8, 11, 1.6), (9, 3, 0.7), (2.5, 10, 0.6))):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=s, location=(x, y, s * 0.25 - (y - 2) * 0.0384))
    o = bpy.context.active_object; o.name = 'Rock%d' % k; o.scale = (1.2, 0.9, 0.55)
    d = o.modifiers.new('D', 'DISPLACE'); t = bpy.data.textures.new('RT%d' % k, 'CLOUDS'); t.noise_scale = 0.6; d.texture = t; d.strength = 0.35
    o.data.materials.append(rk)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.orbit((0.0, 2.4, 0), r=7.2, a0=236, a1=261, h=(1.45, 1.75), look_h=0.55), lens=35, fstop=4.0,
         focus='Panel')
go(cam, NF, a, sc, meter=NF // 2, target=0.3)
