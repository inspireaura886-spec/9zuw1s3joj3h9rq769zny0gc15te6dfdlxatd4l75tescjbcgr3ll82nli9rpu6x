"""mh370 b15a (WIDE 28 mm, VO 'Searches swept over 120,000 square kilometres'): a generic deep-sea survey ship on
the southern-ocean swell at dawn, towed-sonar cable running from the stern A-frame into the sea. Eased dolly past the
stern. No names or marks. NF default 84."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 84, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.22)
dawn_world(sun_az=20, elev=9, strength=3.8, hdri_strength=0.9)
swell_ocean(NF, half=4000, wave_scale=2.0, wind=14, color=(0.006, 0.016, 0.024))
L2, B, DECK, KEEL = 42.0, 16.0, 3.2, -5.2
def hb(y):
    u = y / L2
    return B / 2 * ((1 - u ** 2.3) ** 0.5 if u > 0 else (1 - abs(u) ** 6) ** 0.5) if abs(u) < 1 else 0.05
rings = []
for k in range(41):
    y = -L2 + 2 * L2 * k / 40
    w = max(0.15, hb(y))
    sec = [(w, DECK + 0.6 * max(0, y / L2) ** 2 * 3), (w * 0.98, 0.0), (w * 0.9, -3.0), (w * 0.55, -4.8), (0.0, KEEL)]
    pts = sec + [(-x, z) for x, z in reversed(sec[:-1])]
    rings.append([(x, y, z) for x, z in pts])
v, f = Md.loft(rings, cap_start=True, cap_end=True)
hull_m = M.principled('Hull', base=(0.32, 0.06, 0.03), rough=0.35, grime=0.35, rough_noise=0.1)
white = M.principled('Super', base=(0.82, 0.82, 0.8), rough=0.45, grime=0.25)
deck_m = M.principled('Deck', base=(0.22, 0.26, 0.24), rough=0.7, grime=0.3)
steel = M.principled('Steel', base=(0.85, 0.36, 0.06), rough=0.45, metal=0.2)
win = M.principled('Win', base=(0.01, 0.012, 0.015), rough=0.05, coat=1.0)
ship = Md.empty('Ship')
hull = Md.mesh_obj('HullMesh', v, f, parent=ship, smooth=True, mats=(hull_m,))
parts = [boxm('DeckPlate', (0, -6, DECK + 0.05), (B * 0.94, 2 * L2 * 0.7, 0.1), deck_m)]
for i, (y, w, h, z) in enumerate(((16, 13, 3.0, DECK + 1.5), (18, 11, 2.8, DECK + 4.4), (20, 9, 2.6, DECK + 7.1))):
    parts.append(boxm('Super%d' % i, (0, y, z), (w, 12 - i * 2, h), white, 0.08))
parts.append(boxm('Bridge', (0, 21.5, DECK + 9.4), (10, 5.5, 2.0), white, 0.06))
parts.append(boxm('BridgeWin', (0, 18.7, DECK + 9.6), (9.6, 0.1, 1.0), win))
parts.append(cyl('Mast', (0, 22, DECK + 10.4), (0, 22, DECK + 17), 0.25, white, 12))
parts.append(boxm('Funnel', (0, 10, DECK + 4.5), (3, 4, 6), white, 0.1))
# stern A-frame + winch
for s in (1, -1):
    parts.append(cyl('AF%d' % s, (s * 5.5, -L2 + 2.5, DECK), (s * 2.0, -L2 - 1.5, DECK + 9.0), 0.35, steel, 12))
parts.append(cyl('AFtop', (-2.2, -L2 - 1.4, DECK + 9.0), (2.2, -L2 - 1.4, DECK + 9.0), 0.4, steel, 12))
parts.append(cyl('Winch', (-2.5, -L2 + 9, DECK + 1.6), (2.5, -L2 + 9, DECK + 1.6), 1.4, steel, 24))
for p in parts: p.parent = ship
cable_m = M.principled('Cable', base=(0.05, 0.05, 0.05), rough=0.4, metal=0.5)
cab = curve_poly('Cable', [(0, -L2 - 1.4, DECK + 8.6), (0, -L2 - 5, DECK + 4), (0, -L2 - 11, 0.5), (0, -L2 - 22, -8)], bevel=0.07,
                 mat=cable_m)
cab.parent = ship
for fr in range(0, NF + 1, 2):
    t = fr / 30.0
    ship.location = (0, 0.06 * fr, 0.35 * math.sin(t * 0.9))
    ship.rotation_euler = (math.radians(1.2 * math.sin(t * 0.7)), math.radians(2.2 * math.sin(t * 0.55 + 0.6)), 0)
    ship.keyframe_insert('location', frame=fr); ship.keyframe_insert('rotation_euler', frame=fr)
Wd.point('DeckLamp', (0, -L2 + 4, DECK + 8), color=(1.0, 0.8, 0.55), power=3000, radius=0.3)
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.dolly((92, -128, 19), (74, -104, 16), look=(0, -14, 5), look1=(0, -8, 5)), lens=28, fstop=8,
         focus=Vector((0, -42, 6)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
