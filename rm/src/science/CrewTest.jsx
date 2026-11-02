// 2D turnaround / pose board for the v2 crew (design checks only). Each cell = one card drawn straight to a DOM canvas.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {DRAW, CARD} from './cast.js';
const Card = ({who, w = 360, pose = {}, bg = 'transparent'}) => {
  const h = w * CARD.H / CARD.W; const R = 2;
  return <canvas width={CARD.W * R} height={CARD.H * R} style={{width: w, height: h, background: bg}} ref={(c) => { if (!c) return; const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.scale(R, R); g.translate(CARD.PAD, 0); DRAW[who](g, pose); }} />;
};
export const CrewBoard = () => {
  const rows = [
    ['PIP', [{expr: 'happy'}, {expr: 'smug', mouth: 0.6, armR: 70}, {shrug: 1}, {expr: 'shock', blink: 0}, {hairColor: ['#2fbfb3', '#ff6fae']}]],
    ['BOLT', [{expr: 'deadpan'}, {narrow: 1}, {expr: 'shock', armL: 10, armR: 120}, {mouth: 0.7}, {expr: 'smug', hips: 0.5}]],
    ['ZIB', [{expr: 'happy', item: 'remote', armR: 60}, {expr: 'shock'}, {squish: 1}, {squish: -1, expr: 'smug'}, {mouth: 0.7, expr: 'worry'}]],
  ];
  return <AbsoluteFill style={{background: 'linear-gradient(#26305a,#121630)', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
    {rows.map(([who, poses]) => <div key={who} style={{display: 'flex', justifyContent: 'center', marginLeft: -40}}>{poses.map((p, i) => <div key={i} style={{marginLeft: i ? -240 : 0}}><Card who={who} w={520} pose={p} /></div>)}</div>)}
  </AbsoluteFill>;
};
