"""oak-island-money-pit shared helpers (REAL3D, 2026-11-05). Smooth eased camera only. Objects/places, no people."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from rc import *
from kit import cine as CN

SOIL = 'forest_ground_04'
def cyl(name, p0, p1, r, mat, seg=24):
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    for p in o.data.polygons: p.use_smooth = True
    M.assign(o, mat)
    return o

def wood_mat():
    return M.texture_set('OakM', 'wood_table_worn', scale=2.0, tint=(0.34, 0.27, 0.2), rough_mul=1.0, box=True)

def soil_mat(tint=(0.42, 0.36, 0.3)):
    return M.texture_set('SoilM', SOIL, scale=1.1, tint=tint, box=True)

def shaft(depth=24.0, w=3.0, z_top=0.0, tint=(0.42, 0.36, 0.3)):
    """Open-top square shaft walls, floor at z_top-depth. Returns floor z."""
    sm = soil_mat(tint)
    zc = z_top - depth / 2
    for nm, c, s in (('WN', (0, w / 2, zc), (w + 0.4, 0.4, depth)), ('WS', (0, -w / 2, zc), (w + 0.4, 0.4, depth)),
                     ('WE', (w / 2, 0, zc), (0.4, w, depth)), ('WW', (-w / 2, 0, zc), (0.4, w, depth))):
        o = Wd.box(nm, c, s); M.assign(o, sm)
    fl = Wd.box('Floor', (0, 0, z_top - depth - 0.2), (w + 0.8, w + 0.8, 0.4)); M.assign(fl, sm)
    return z_top - depth

def platform(z, w=3.0, n=3, name='Log', axis=0):
    wm = wood_mat()
    r = 0.15
    for i in range(n):
        y = -w / 2 + 0.35 + i * (w - 0.7) / (n - 1)
        a, b = ((-w / 2 - 0.15, y, z), (w / 2 + 0.15, y, z)) if axis == 0 else ((y, -w / 2 - 0.15, z), (y, w / 2 + 0.15, z))
        cyl('%s%.1f_%d' % (name, z, i), a, b, r, wm)

def lantern_light(loc, power=260, rgb=(1.0, 0.62, 0.3)):
    Wd.point('Lantern', loc, color=rgb, power=power, radius=0.12)
