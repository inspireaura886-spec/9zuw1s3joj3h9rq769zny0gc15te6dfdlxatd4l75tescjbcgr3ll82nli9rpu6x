// Spline camera: Catmull-Rom through points, arc-length param, eased; look-at its own spline.
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {interpolate, Easing} from 'remotion';
export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export function CamPath({frame, start, end, points, looks, fov = 38, ease = easeIO, roll = 0}) {
  const {camera} = useThree();
  const p = new THREE.CatmullRomCurve3(points.map((v) => new THREE.Vector3(...v)), false, 'centripetal');
  const l = new THREE.CatmullRomCurve3(looks.map((v) => new THREE.Vector3(...v)), false, 'centripetal');
  const t = ease(interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  camera.position.copy(p.getPointAt(t));
  camera.lookAt(l.getPointAt(t));
  camera.rotateZ(roll * Math.sin(t * Math.PI));
  camera.fov = fov; camera.updateProjectionMatrix();
  return null;
}
