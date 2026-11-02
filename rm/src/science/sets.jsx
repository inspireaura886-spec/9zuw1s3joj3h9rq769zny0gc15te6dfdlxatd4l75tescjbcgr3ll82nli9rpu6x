// Reusable sets for the Science cast: the Orbit Deck (floating lab platform), Earth cutaway, Lab room.
import * as THREE from 'three';
import React from 'react';
import {Box, Cyl, Ball, Toon, InkMat, useTex} from './kit.jsx';

/** floating round deck with rail posts + telescope; top surface at y = 0 */
export const Deck = ({r = 2.6}) => (
  <group>
    <Cyl r={r} r2={r * 0.92} h={0.4} pos={[0, -0.2, 0]} color="#6c6fa8" ink={0.05} seg={56} />
    <Cyl r={r * 0.92} r2={r * 0.35} h={0.9} pos={[0, -0.85, 0]} color="#4b4d7e" ink={0.05} seg={40} />
    <Cyl r={r * 0.97} h={0.05} pos={[0, 0.02, 0]} color="#8f93cf" ink={0} seg={56} />
    {Array.from({length: 9}).map((_, i) => { const a = Math.PI * (0.95 + i * 0.1375); return <Cyl key={i} r={0.04} h={0.6} pos={[Math.cos(a) * r * 0.93, 0.3, Math.sin(a) * r * 0.93]} color="#c7d0d8" ink={0.025} seg={10} />; })}
    <Ball r={0.12} pos={[0, -1.4, 0]} color="#ffb547" emissive="#ff8a2a" glow="#ffb547" glowS={2.2} glowO={0.4} />
  </group>
);

/** Earth sliced in half, cut face toward +z: crust, mantle, outer core, inner core + vertical tunnel */
export const EarthCut = ({R = 3, glowCore = 0, tunnel = true}) => {
  const map = useTex('science/earth_toon.png');
  const layers = [[1, '#8a5a3c'], [0.985, '#e8743b'], [0.55, '#ffb547'], [0.19, '#fff1a8']];
  return (
    <group>
      <mesh rotation={[0, Math.PI, 0]}><sphereGeometry args={[R, 64, 48, 0, Math.PI]} /><Toon map={map} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[0, Math.PI, 0]} scale={[1.025, 1.025, 1.025]}><sphereGeometry args={[R, 48, 32, 0, Math.PI]} /><InkMat /></mesh>
      {layers.map(([k, c], i) => (
        <mesh key={i} position={[0, 0, 0.002 + i * 0.002]}><circleGeometry args={[R * k, 96]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>
      ))}
      {layers.slice(1).map(([k], i) => (
        <mesh key={'l' + i} position={[0, 0, 0.01]}><ringGeometry args={[R * k - 0.025, R * k + 0.025, 96]} /><meshBasicMaterial color="#241726" /></mesh>
      ))}
      {glowCore > 0 && <mesh position={[0, 0, 0.012]}><circleGeometry args={[R * 0.55, 96]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.35 * glowCore} toneMapped={false} /></mesh>}
      {tunnel && <mesh position={[0, 0, 0.014]}><planeGeometry args={[0.16, R * 2 * 1.01]} /><meshBasicMaterial color="#1a1020" /></mesh>}
      <mesh position={[0, 0, 0.0]}><ringGeometry args={[R, R * 1.025, 128]} /><meshBasicMaterial color="#241726" /></mesh>
    </group>
  );
};

/** small lab room: checker floor, pastel wall, chalkboard, table. Floor at y = 0, wall at z = -4 */
export const Lab = ({board = 'star'}) => {
  const floor = React.useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e9e3f5' : '#bdb3dc'; g.fillRect(i * 64, j * 64, 64, 64); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const chalk = React.useMemo(() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#24453c'; g.fillRect(0, 0, 1024, 512); g.strokeStyle = 'rgba(240,255,245,0.85)'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(300, 256, 120, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(300 + Math.cos(a) * 140, 256 + Math.sin(a) * 140); g.lineTo(300 + Math.cos(a) * 185, 256 + Math.sin(a) * 185); g.stroke(); }
    g.beginPath(); g.moveTo(460, 256); g.lineTo(600, 256); g.stroke(); g.beginPath(); g.moveTo(580, 236); g.lineTo(600, 256); g.lineTo(580, 276); g.stroke();
    g.beginPath(); g.arc(700, 256, 22, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(240,255,245,0.85)'; g.font = 'bold 60px sans-serif'; g.fillText('= ?', 760, 276);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[20, 20]} /><Toon map={floor} /></mesh>
      <mesh position={[0, 4, -4]}><planeGeometry args={[20, 8]} /><Toon color="#8fd3c8" /></mesh>
      <mesh position={[0, 0.35, -3.98]}><planeGeometry args={[20, 0.7]} /><Toon color="#5a9e95" /></mesh>
      <Box size={[3.2, 1.6, 0.08]} pos={[0.4, 2.6, -3.9]} color="#6b4a33" ink={0.03} />
      <mesh position={[0.4, 2.6, -3.85]}><planeGeometry args={[2.95, 1.4]} /><meshBasicMaterial map={chalk} toneMapped={false} /></mesh>
      <Box size={[2.2, 0.12, 1.0]} pos={[2.6, 0.95, -2.2]} color="#f08a2c" />
      {[[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].map(([x, z], i) => <Cyl key={i} r={0.05} h={0.9} pos={[2.6 + x, 0.45, -2.2 + z]} color="#3a3f4b" ink={0.02} seg={8} />)}
      <Cyl r={0.12} r2={0.18} h={0.4} pos={[2.2, 1.2, -2.2]} color="#57f2a0" ink={0.025} seg={16} />
      <Cyl r={0.1} h={0.5} pos={[3.0, 1.25, -2.3]} color="#ff8fb1" ink={0.025} seg={16} />
    </group>
  );
};
