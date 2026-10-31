// Frame-deterministic GLB loading + skeletal animation for Remotion ThreeCanvas.
import {useEffect, useMemo, useState} from 'react';
import {delayRender, continueRender, staticFile} from 'remotion';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as skClone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';

const cache = new Map();
// Preload every GLB a comp uses BEFORE mounting ThreeCanvas (one delayRender, released after React commits).
export function usePreload(paths) {
  const [ready, setReady] = useState(paths.every((p) => cache.get(p)));
  const [h] = useState(() => (ready ? null : delayRender('preload glbs')));
  useEffect(() => {
    if (ready) return;
    Promise.all(paths.map((p) => cache.get(p) ? 0 : new Promise((res) => new GLTFLoader().load(staticFile(p), (g) => { prep(g); cache.set(p, g); res(); }, undefined, (e) => { console.error('GLB fail', p, e); res(); }))))
      .then(() => setReady(true));
  }, []);
  useEffect(() => { if (ready && h !== null) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))); }, [ready]);
  return ready;
}
function prep(g) {
  g.scene.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = o.receiveShadow = true;
      const m = o.material;
      if (m && m.map) { m.map.magFilter = THREE.NearestFilter; m.map.minFilter = THREE.NearestFilter; m.map.needsUpdate = true; }
    }
  });
}
export function useGLB(path) {
  const [gltf, setG] = useState(cache.get(path) || null);
  useEffect(() => {
    if (cache.get(path)) return;
    const h = delayRender('glb ' + path);
    new GLTFLoader().load(staticFile(path), (g) => {
      g.scene.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = o.receiveShadow = true;
          const m = o.material;
          if (m && m.map) { m.map.magFilter = THREE.NearestFilter; m.map.minFilter = THREE.NearestFilter; m.map.needsUpdate = true; }
        }
      });
      cache.set(path, g); setG(g); continueRender(h);
    }, undefined, (e) => { console.error(e); continueRender(h); });
  }, [path]);
  return gltf;
}

// Static prop (cloned so it can be placed many times)
export const Prop = ({path, ...props}) => {
  const g = useGLB(path);
  const obj = useMemo(() => (g ? g.scene.clone(true) : null), [g]);
  return obj ? <primitive object={obj} {...props} /> : null;
};

// Rigged character: clip + time in seconds -> pose. Pure function of `time` (no clocks).
// clips: [{name, from(sec), speed, loop}] picks the last clip whose `from` <= time; crossfades over `blend` sec.
export const Rigged = ({path, time, clips, blend = 0.2, ...props}) => {
  const g = useGLB(path);
  const rig = useMemo(() => {
    if (!g) return null;
    const scene = skClone(g.scene);
    const mixer = new THREE.AnimationMixer(scene);
    const actions = Object.fromEntries(g.animations.map((a) => [a.name, mixer.clipAction(a)]));
    return {scene, mixer, actions};
  }, [g]);
  if (rig) {
    const {mixer, actions} = rig;
    mixer.stopAllAction();
    let i = 0;
    clips.forEach((c, k) => { if (time >= c.from) i = k; });
    const cur = clips[i], prev = clips[i - 1];
    const w = prev ? Math.min(1, (time - cur.from) / blend) : 1;
    const setA = (c, weight) => {
      const a = actions[c.name]; if (!a) return;
      const d = a.getClip().duration;
      let t = (time - c.from) * (c.speed ?? 1);
      t = c.loop === false ? Math.min(t, d - 1e-3) : ((t % d) + d) % d;
      a.reset(); a.play(); a.setEffectiveWeight(weight); a.time = Math.max(0, t);
    };
    setA(cur, w);
    if (prev && w < 1) setA(prev, 1 - w);
    mixer.update(0);
  }
  return rig ? <primitive object={rig.scene} {...props} /> : null;
};
