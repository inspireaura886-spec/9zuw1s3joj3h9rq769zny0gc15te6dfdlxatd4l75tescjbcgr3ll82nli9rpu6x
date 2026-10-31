import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThickStickMan} from './ThickStickMan.jsx';
const poses=['stand','walk','run','scared','cower','hide','sit','phone','point','lookback','wave','slump'];
export const PoseTest=()=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:'#14161d'}}><svg width={1080} height={1920}>
{poses.map((p,i)=><g key={p}><ThickStickMan x={180+(i%3)*360} y={520+Math.floor(i/3)*440} s={0.75} pose={p} t={f+i*7} facing={i%2?-1:1} look={p==='lookback'?1:0} eyes={p==='scared'||p==='cower'?'wide':'normal'} brow={p==='scared'?1:0} rim="#ff3b3b" mouth={p==='phone'?0.6:0}/><text x={180+(i%3)*360} y={560+Math.floor(i/3)*440} fill="#888" fontSize={30} textAnchor="middle">{p}</text></g>)}
<ThickStickMan x={900} y={1880} s={0.7} variant="shadow" rim="#ff3b3b" pose="stand"/>
</svg></AbsoluteFill>}
