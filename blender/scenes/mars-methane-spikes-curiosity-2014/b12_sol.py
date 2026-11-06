"""mars b12_sol (WIDE 24 mm, crane up; VO 'Then one test across one Martian day: Curiosity sampled the air at night, then twice by day.'). One Martian day as a time-lapse over the crater floor: night -> sunrise -> day (sun keyed). Crane up.
NF default 202 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 202, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.22)
mars_world('dusk', sun_elev=-6, sun_az=90, sun_strength=4.0, haze_density=0.0007)
crater('Gale', size=9000, res=240)
rover('Rover', loc=on_floor(0, -1500), yaw=60, NF=NF)
sun = bpy.data.objects['CineSun']
for f, el, en in ((0, -8.0, 0.2), (int(NF * 0.4), 2.0, 2.0), (NF, 28.0, 4.5)):
    e, z = math.radians(el), math.radians(90)
    dvec = Vector((math.cos(e) * math.cos(z), math.cos(e) * math.sin(z), math.sin(e)))
    sun.rotation_euler = (-dvec).to_track_quat('-Z', 'Y').to_euler()
    sun.keyframe_insert('rotation_euler', frame=f)
    sun.data.energy = en
    sun.data.keyframe_insert('energy', frame=f)
cam = C.Cam(clip_end=40000)
cam.shot(0, NF, C.crane(on_floor(-120, -1900, 18), on_floor(0, -1450, 2), dz=30, dlook=0), lens=26, fstop=11, focus=420.0)
go(cam, NF, a, sc, meter=int(NF * 0.7), target=0.22)
