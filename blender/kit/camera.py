"""Cinematic camera keys (ideas from claude-animated-shorts' CAMS system, MIT): every shot is a function of local time
t in [0,1] returning pos / look / lens / roll / focus; the kit bakes one key per frame (so Cycles motion blur sees the
real move) with smootherstep easing, slow creep on holds and optional decaying impact kicks + subtle handheld drift.

Usage:
    cam = Cam()                                     # 1080x1920 camera, DOF on
    cam.shot(0, 90, dolly((0,-30,2), (0,-18,3), look=(0,0,2)), lens=(35, 40), fstop=2.8, focus='Airliner')
    cam.shot(90, 180, orbit(center, r=20, a0=200, a1=240, h=(2,4)), lens=50)
    cam.kick(150, amp=0.6)                          # impact shake on a word
    cam.bake()
"""
import bpy, math
from mathutils import Vector, Euler, Quaternion, noise


def smooth(t):  # smootherstep
    t = max(0.0, min(1.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)


def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ease_in(t):
    t = max(0.0, min(1.0, t))
    return t ** 3


def lerp(a, b, t):
    if isinstance(a, (tuple, list, Vector)):
        return Vector(a).lerp(Vector(b), t)
    return a + (b - a) * t


def _v(x):
    return Vector(x) if x is not None else None


# ---------- moves: each returns f(t) -> dict(pos, look) ----------
def dolly(p0, p1, look=None, look1=None, ease=smooth):
    """Straight move p0 -> p1. look (and optional look1) are world targets."""
    def f(t):
        e = ease(t)
        lk = look if look1 is None else lerp(look, look1, e)
        return {'pos': lerp(p0, p1, e), 'look': _v(lk)}
    return f


def push_in(pos, look, amount=0.25, ease=smooth):
    """Moves `amount` of the way from pos toward look (classic slow push)."""
    p0, lk = Vector(pos), Vector(look)
    return dolly(p0, p0.lerp(lk, amount), look=lk, ease=ease)


def orbit(center, r=10, a0=0, a1=30, h=2, r1=None, look_h=0.0, ease=smooth):
    """Orbit around center (degrees, CCW seen from above). h / r may be (start, end) tuples."""
    c = Vector(center)
    def f(t):
        e = ease(t)
        a = math.radians(lerp(a0, a1, e))
        rr = lerp(r, r1, e) if r1 is not None else r
        hh = lerp(h[0], h[1], e) if isinstance(h, (tuple, list)) else h
        return {'pos': c + Vector((math.cos(a) * rr, math.sin(a) * rr, hh)), 'look': c + Vector((0, 0, look_h))}
    return f


def crane(pos, look, dz=4.0, dlook=0.0, ease=smooth):
    """Rise (dz > 0) or descend while looking at a target that may also rise."""
    p, lk = Vector(pos), Vector(look)
    return dolly(p, p + Vector((0, 0, dz)), look=lk, look1=lk + Vector((0, 0, dlook)), ease=ease)


def track(obj_name, offset=(0, -10, 2), offset1=None, look_offset=(0, 0, 0), ease=smooth):
    """Follow an animated object (camera rig attached in world space; offset may move)."""
    def f(t, frame=None):
        o = bpy.data.objects[obj_name]
        m = o.matrix_world
        e = ease(t)
        off = Vector(offset) if offset1 is None else lerp(offset, offset1, e)
        base = m.translation
        return {'pos': base + off, 'look': base + Vector(look_offset)}
    f.needs_frame = True
    return f


def path(points, look, ease=smooth):
    """Catmull-Rom through points (crane/fly-through)."""
    P = [Vector(p) for p in points]
    def cr(t):
        n = len(P) - 1
        x = t * n
        i = min(int(x), n - 1)
        u = x - i
        p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, n)]
        return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u ** 3)
    def f(t):
        e = ease(t)
        lk = look(e) if callable(look) else Vector(look)
        return {'pos': cr(e), 'look': lk}
    return f


class Cam:
    def __init__(self, name='IA_Cam', sensor=36.0, dof=True, clip_end=60000):
        cd = bpy.data.cameras.new(name)
        cd.sensor_fit = 'VERTICAL'
        cd.sensor_height = 36.0  # full-frame body turned portrait: 35 mm = 54 deg vertical FOV
        cd.clip_start = 0.05
        cd.clip_end = clip_end
        cd.dof.use_dof = dof
        cd.dof.aperture_blades = 7
        cd.dof.aperture_ratio = 1.15  # slight anamorphic oval bokeh
        self.obj = bpy.data.objects.new(name, cd)
        self.obj.rotation_mode = 'QUATERNION'
        bpy.context.scene.collection.objects.link(self.obj)
        bpy.context.scene.camera = self.obj
        self.shots, self.kicks, self.events = [], [], []
        self.drift = 0.0

    def shot(self, a, b, move, lens=35, roll=0.0, fstop=4.0, focus=None, creep=0.0, drift=None):
        """Frames a..b (inclusive start, exclusive end). lens/roll/fstop may be (start, end).
        focus: object name, Vector, float distance, or None (focus on the look target)."""
        self.shots.append(dict(a=a, b=b, move=move, lens=lens, roll=roll, fstop=fstop, focus=focus, creep=creep,
                               drift=drift))
        return self

    def kick(self, frame, amp=0.5, decay=7, rot=1.2):
        """Impact flip-shake: sign flips every frame and decays over `decay` frames."""
        self.kicks.append((frame, amp, decay, rot))
        return self

    def handheld(self, amount=0.02):
        """Very slow organic drift (metres); keep tiny, never 'floaty'."""
        self.drift = amount
        return self

    def _sample(self, f):
        sh = None
        for s in self.shots:
            if s['a'] <= f < s['b']:
                sh = s
        if sh is None:
            sh = self.shots[-1] if f >= self.shots[-1]['a'] else self.shots[0]
        n = max(1, sh['b'] - sh['a'] - 1)
        t = max(0.0, min(1.0, (f - sh['a']) / n))
        r = sh['move'](t)
        pos, look = Vector(r['pos']), Vector(r['look'])
        def val(x):
            return lerp(x[0], x[1], smooth(t)) if isinstance(x, (tuple, list)) else x
        lens, roll, fstop = val(sh['lens']), val(sh['roll']), val(sh['fstop'])
        if sh['creep']:
            lens *= 1 + sh['creep'] * t
        d = sh['drift'] if sh['drift'] is not None else self.drift
        if d:
            q = f * 0.035
            pos += Vector((noise.noise(Vector((q, 0.3, 1.7))), noise.noise(Vector((1.1, q, 4.2))),
                           noise.noise(Vector((2.9, 5.1, q))))) * d
            look += Vector((noise.noise(Vector((q, 7.3, 0.7))), 0, noise.noise(Vector((3.3, q, 9.9))))) * d * 0.6
        kroll = 0.0
        for kf, amp, dec, rot in self.kicks:
            k = f - kf
            if 0 <= k < dec:
                s = (1 if k % 2 == 0 else -1) * (1 - k / dec) ** 2
                pos += Vector((s * amp * 0.12, 0, s * amp * 0.08))
                kroll += s * rot * amp
        fo = sh['focus']
        if fo is None:
            fd = (look - pos).length
        elif isinstance(fo, str):
            fd = (bpy.data.objects[fo].matrix_world.translation - pos).length
        elif isinstance(fo, (int, float)):
            fd = float(fo)
        else:
            fd = (Vector(fo) - pos).length
        return pos, look, lens, roll + kroll, fstop, fd

    def bake(self, f0=None, f1=None):
        sc = bpy.context.scene
        f0 = self.shots[0]['a'] if f0 is None else f0
        f1 = max(s['b'] for s in self.shots) if f1 is None else f1
        o, cd = self.obj, self.obj.data
        for f in range(f0, f1 + 1):
            sc.frame_set(f)  # lets track() read animated objects
            pos, look, lens, roll, fstop, fd = self._sample(f)
            d = (look - pos).normalized()
            q = d.to_track_quat('-Z', 'Y')
            q = q @ Quaternion((0, 0, 1), math.radians(roll))
            o.location = pos
            o.rotation_quaternion = q
            cd.lens = lens
            cd.dof.aperture_fstop = fstop
            cd.dof.focus_distance = fd
            o.keyframe_insert('location', frame=f)
            o.keyframe_insert('rotation_quaternion', frame=f)
            cd.keyframe_insert('lens', frame=f)
            cd.dof.keyframe_insert('aperture_fstop', frame=f)
            cd.dof.keyframe_insert('focus_distance', frame=f)
        # hard cuts: constant interpolation at shot boundaries so motion blur never smears across a cut
        cuts = {s['a'] for s in self.shots[1:]}
        for ad in (o.animation_data, cd.animation_data):
            if not ad or not ad.action:
                continue
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'LINEAR'
                    if int(round(kp.co.x)) + 1 in cuts:
                        kp.interpolation = 'CONSTANT'
        sc.frame_start, sc.frame_end = f0, f1
        return self
