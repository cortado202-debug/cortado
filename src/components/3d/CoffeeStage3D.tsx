import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import { CoffeeCup3D } from './CoffeeCup3D';
import { Product } from '../../types';

interface CoffeeStage3DProps {
  product?: Product;
}

const LoadingFallback = () => (
  <mesh position={[0, 0, 0]}>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#D4A373" wireframe />
  </mesh>
);

export const CoffeeStage3D: React.FC<CoffeeStage3DProps> = ({ product }) => {
  return (
    <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#1E1B18] via-[#26201B] to-[#181512] border border-[#2D2721] gold-border-glow">
      {/* Background Stage Warm Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,163,115,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      {/* 3D Canvas */}
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 1.2, 3.2]} fov={45} />
        
        {/* Lights */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[3, 5, 2]} 
          intensity={1.8} 
          color="#FFE9D0" 
          castShadow 
        />
        <pointLight position={[-2, 3, -1]} intensity={0.9} color="#D4A373" />
        <pointLight position={[0, -1, 1]} intensity={0.5} color="#F4A261" />

        {/* Floating 3D Model Showcase */}
        <Suspense fallback={<LoadingFallback />}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <CoffeeCup3D product={product} />
          </Float>
        </Suspense>

        {/* Orbit Controls with bounded angles */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.1} 
          minPolarAngle={Math.PI / 3}
          autoRotate={false}
        />
      </Canvas>

      {/* Interactive Helper Badge */}
      <div className="absolute bottom-3 right-3 bg-[#181512]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#D4A373]/30 text-xs text-[#D4A373] flex items-center gap-1.5 pointer-events-none shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#D4A373] animate-ping" />
        <span>اسحب أو در للتحكم بزاوية الرؤية 3D</span>
      </div>
    </div>
  );
};
