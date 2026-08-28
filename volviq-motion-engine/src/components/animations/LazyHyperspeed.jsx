import dynamic from 'next/dynamic';
import { useInView } from '../../hooks/useInView';
import { usePerformanceProfile } from '../../hooks/usePerformanceProfile';
import HeroAmbient from './HeroAmbient';

const Hyperspeed = dynamic(() => import('./Hyperspeed'), { ssr: false });

/** Lighter WebGL settings for integrated / weak GPUs */
const LITE_EFFECT_OPTIONS = {
  length: 280,
  totalSideLightSticks: 10,
  lightPairsPerRoadWay: 16,
  carLightsFade: 0.5,
  fov: 85,
  fovSpeedUp: 120,
  speedUp: 1.5,
};

const FULL_EFFECT_OPTIONS = {
  length: 360,
  totalSideLightSticks: 16,
  lightPairsPerRoadWay: 28,
};

export default function LazyHyperspeed() {
  const { ref, inView } = useInView({ rootMargin: '0px' });
  const { lite } = usePerformanceProfile();

  const effectOptions = lite ? LITE_EFFECT_OPTIONS : FULL_EFFECT_OPTIONS;

  return (
    <div ref={ref} className="absolute inset-0 z-0 opacity-90" aria-hidden="true">
      <HeroAmbient />
      {inView && (
        <div className="absolute inset-0">
          <Hyperspeed effectOptions={effectOptions} />
        </div>
      )}
    </div>
  );
}
