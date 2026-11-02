"""HUMANS test plate 2 (90 f, 3 s): the PILOT in the 1970s cockpit (kit/interiors.cockpit) gripping the yoke; his
head comes up from the instruments and turns to his left toward two red lights closing in through the left pane.
Seated pose = CMU 143_18 hold + CMU 137_28 neck/head + CMU 111_28 spine breathing; hands pinned to the yoke by IK.
Camera: behind his left shoulder, slow cruise push (no shake). Writes motion_qa.json into --out."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'manises-1979'))
from common import *                      # core, C, Wd, Md, M, I, setup, night_air, finish_cam
from kit import humans as Hm, retarget as RT
import bpy
import numpy as np

a = core.args()
sc = core.reset()
NF = 90
setup(sc, exposure=1.1, glare=0.65, vignette=0.42, streaks=0.08)
sc.cycles.volume_max_steps = 32  # clouds only seen through the glass
sc.cycles.volume_step_rate = 8.0
night_air(NF, moon_dir=(0.5, 0.6, 0.35), moon=1.4, hdri_rot=60)
Wd.city_lights('Coast', center=(-1800, 9000, -2430), radius=1500, count=2000, seed=5, strength=18, size=1.6)
ck = I.cockpit(panel_glow=1.0)
FLOOR = -0.72

# --- the pilot: rig on the floor under the captain's seat, facing +Y (out of the windshield) ---
pl = Hm.pilot(loc=(0, 0, FLOOR), yaw=180)
hips_w = Vector((0.0, -0.05, -0.22))
print('IA3D pilot head', tuple(round(x, 3) for x in pl.to_world(pl.def_.head[pl.def_.idx['Head']])))
# grips from the seated base pose: ~0.40 m ahead of and 0.30 m below each shoulder, slightly inward
base = pl.mocap('seat_base', t0=0.0, frames=2, hold=0.3)
off = pl.to_arm(hips_w) - base.root[0]
grips = {}
for s, inward in (('Left', -0.06), ('Right', 0.06)):
    shp = base.H[0, base.bone(s + 'Arm')] + off
    grips[s] = pl.to_world(shp + np.array([inward, -0.40, -0.30]))
pose = Hm.seat_pilot(pl, NF, hips_w, grip_l=grips['Left'], grip_r=grips['Right'], floor_z=FLOOR, head_t0=0.0)
pl.apply(pose)
os.makedirs(a.out, exist_ok=True)
Hm.qa_json(os.path.join(a.out, 'motion_qa.json'), pilot_seated=pose)

# --- move the kit yoke to his hands (horn centres = grips), column down to the floor ---
gl, gr = grips['Left'], grips['Right']
mid = (gl + gr) / 2
horns = sorted([o for o in bpy.data.objects if o.name.startswith('YokeHorn')], key=lambda o: o.location.x)
for o, g in zip(horns, sorted([gl, gr], key=lambda v: v.x)):
    o.location = g
bar = bpy.data.objects['Yoke']
bar.location = mid + Vector((0, 0, 0.075))
bar.scale.x = max(0.2, abs(gl.x - gr.x) + 0.05) / 0.42
colm = bpy.data.objects['YokeColumn']
colm.location = mid + Vector((0, 0.17, -0.30))
colm.scale.z = 1.25

# --- captain's seat (cushion + backrest + headrest) under/behind him ---
seat = M.principled('SeatLeather', base=(0.035, 0.03, 0.028), rough=0.55, bump=0.2, bump_scale=90)
cz = hips_w.z - 0.10  # cushion top just under the pelvis
for nm, c, sz, rx in (('SeatCushion', (0, 0.06, cz - 0.04), (0.52, 0.5, 0.09), 0),
                      ('SeatBack', (0, -0.25, cz + 0.27), (0.52, 0.1, 0.55), -10),
                      ('SeatBase', (0, 0.0, (cz + FLOOR) / 2 - 0.06), (0.3, 0.35, (cz - FLOOR) - 0.12), 0)):
    o = Wd.box(nm, c, sz)
    o.rotation_euler = (math.radians(rx), 0, 0)
    o.data.materials.append(seat)
    I.bevel(o, 0.03, 3)

# --- the red lights, ahead-left (where he turns), closing in ---
r1 = Md.orb('Red1', (0, 0, 0), strength=700, power=8e5, radius=3.5, halo=2.5, pulse=0.08, f1=NF, seed=1)
r2 = Md.orb('Red2', (0, 0, 0), strength=700, power=8e5, radius=3.5, halo=2.5, pulse=0.08, f1=NF, seed=2)
Md.fly(r1, [(0, (-200, 1250, 70), None), (NF, (-150, 950, 52), None)], interp='LINEAR')
Md.fly(r2, [(0, (-265, 1300, 50), None), (NF, (-200, 1000, 35), None)], interp='LINEAR')

# --- light on him: warm instrument glow from below the glareshield + faint cool moon spill from the panes ---
Wd.area('GaugeGlow', (0.0, 0.75, -0.05), tuple(Vector(pl.joint(pose, 0, 'Head')) + Vector((0, 0, -0.1))),
        color=(1.0, 0.78, 0.55), power=2.5, size=0.7)
Wd.area('MoonSpill', (-0.6, 1.2, 0.9), tuple(Vector(pl.joint(pose, 0, 'Head'))), color=(0.6, 0.7, 1.0), power=6, size=1.2)

# --- camera: high over his left shoulder (above the seat back), slow push; head lower-centre, lights upper-left ---
head0 = Vector(pl.joint(pose, 0, 'Head'))
cam = C.Cam()
cam.shot(0, NF, C.dolly((-0.18, -0.62, 0.68), (-0.16, -0.54, 0.665), look=(0.0, 1.3, 0.25), look1=(-0.02, 1.3, 0.26)),
         lens=(20, 21), fstop=2.4, focus=tuple(head0 + Vector((0, 0, 0.08))))
finish_cam(cam, NF, a, sc)
