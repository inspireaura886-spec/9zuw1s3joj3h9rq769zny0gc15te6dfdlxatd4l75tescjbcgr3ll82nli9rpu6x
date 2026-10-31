// Reusable Lottie insert: <LottieClip src="lottie/stick-walk.json" loop playbackRate={1} style={{...}} />
// Files live in public/lottie/ (licences in public/lottie/LICENSES.md).
import {useEffect, useState} from 'react';
import {Lottie} from '@remotion/lottie';
import {continueRender, delayRender, staticFile} from 'remotion';
export const LottieClip = ({src, loop = true, playbackRate = 1, style}) => {
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender('lottie ' + src));
  useEffect(() => {
    fetch(staticFile(src)).then((r) => r.json()).then((j) => { setData(j); continueRender(handle); })
      .catch((e) => { console.error(e); continueRender(handle); });
  }, [src, handle]);
  if (!data) return null;
  return <Lottie animationData={data} loop={loop} playbackRate={playbackRate} style={style} />;
};
