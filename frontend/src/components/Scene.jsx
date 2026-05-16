import { Canvas } from '@react-three/fiber';
import { Particles } from './Particles';
import { Suspense, useRef } from 'react';

export const Scene = ({ containerRef }) => {
  const sceneGroupRef = useRef();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#FAFAFA]" id="scene-bg">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ alpha: true, antialias: true }}>
        <fog attach="fog" args={['#FAFAFA', 2, 9]} />
        <ambientLight intensity={0.8} />
        <group ref={sceneGroupRef}>
            <Suspense fallback={null}>
            <Particles />
            </Suspense>
        </group>
      </Canvas>
      
      {/* Light gradient overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60 pointer-events-none" />
    </div>
  );
};
