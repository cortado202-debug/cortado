import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Product } from '../../types';

interface CoffeeCup3DProps {
  product?: Product;
}

export const CoffeeCup3D: React.FC<CoffeeCup3DProps> = ({ product }) => {
  const groupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const steamRef = useRef<THREE.Group>(null);

  const categoryId = product?.categoryId || 'cold';
  const cupColor = product?.cupColor || '#321D12';
  const accentColor = product?.accentColor || '#D4A373';

  // Continuous rotation & floating movement
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
    if (liquidRef.current) {
      liquidRef.current.rotation.y += delta * 0.3;
    }
    if (steamRef.current) {
      steamRef.current.children.forEach((child, i) => {
        child.position.y += delta * (0.3 + i * 0.05);
        if (child.position.y > 1.8) {
          child.position.y = 0.6;
        }
        child.rotation.z += delta * 0.5;
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* --- PODIUM STAND --- */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[1.3, 1.5, 0.25, 32]} />
        <meshStandardMaterial color="#221C16" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Illuminated Gold Podium Ring */}
      <mesh position={[0, -0.47, 0]}>
        <ringGeometry args={[1.15, 1.28, 32]} />
        <meshBasicMaterial color="#D4A373" side={THREE.DoubleSide} />
      </mesh>

      {/* --- CUP / CONTAINER GEOMETRY BASED ON CATEGORY --- */}
      {categoryId === 'hot' && (
        <group position={[0, 0, 0]}>
          {/* Classic Ceramic Cortado Cup Body */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.65, 0.45, 0.9, 32]} />
            <meshStandardMaterial color={cupColor} roughness={0.2} metalness={0.1} />
          </mesh>

          {/* Cup Handle */}
          <mesh position={[0.62, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.22, 0.06, 16, 32, Math.PI]} />
            <meshStandardMaterial color={cupColor} roughness={0.2} />
          </mesh>

          {/* Inner Coffee Surface with Latte Art */}
          <mesh ref={liquidRef} position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.62, 32]} />
            <meshStandardMaterial color={accentColor} roughness={0.4} />
          </mesh>

          {/* Latte Art Center Motif */}
          <mesh position={[0, 0.66, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.25, 16]} />
            <meshBasicMaterial color="#FFF8F0" />
          </mesh>

          {/* Steaming Particles for Hot Coffee */}
          <group ref={steamRef} position={[0, 0.7, 0]}>
            {[0, 1, 2].map((idx) => (
              <mesh key={idx} position={[(idx - 1) * 0.15, 0.6 + idx * 0.2, (idx % 2) * 0.1]}>
                <sphereGeometry args={[0.06 + idx * 0.02, 8, 8]} />
                <meshBasicMaterial color="#FFF" transparent opacity={0.35 - idx * 0.08} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {categoryId === 'cold' && (
        <group position={[0, 0, 0]}>
          {/* Transparent Glass Tumbler */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.6, 0.48, 1.1, 32]} />
            <meshPhysicalMaterial 
              color="#FFFFFF" 
              transmission={0.85} 
              opacity={1} 
              transparent 
              roughness={0.05} 
              ior={1.5} 
            />
          </mesh>

          {/* Cold Coffee Liquid Inner Core */}
          <mesh ref={liquidRef} position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.56, 0.45, 0.98, 32]} />
            <meshStandardMaterial color={cupColor} roughness={0.3} metalness={0.2} />
          </mesh>

          {/* Ice Cubes floating inside */}
          <mesh position={[0.15, 0.65, 0.1]} rotation={[0.4, 0.2, 0.1]}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshPhysicalMaterial color="#E8F4F8" transmission={0.9} transparent roughness={0.1} />
          </mesh>

          <mesh position={[-0.18, 0.58, -0.1]} rotation={[0.1, 0.5, 0.3]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshPhysicalMaterial color="#E8F4F8" transmission={0.9} transparent roughness={0.1} />
          </mesh>

          {/* Straw */}
          <mesh position={[0.1, 0.6, 0.15]} rotation={[0.1, 0, -0.2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.3, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.3} />
          </mesh>
        </group>
      )}

      {categoryId === 'desserts' && (
        <group position={[0, 0, 0]}>
          {/* Cake Plate */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.85, 0.95, 0.1, 32]} />
            <meshStandardMaterial color="#FAF5EE" roughness={0.2} />
          </mesh>

          {/* Tiramisu / San Sebastian Slice */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.8, 0.5, 0.8]} />
            <meshStandardMaterial color={cupColor} roughness={0.5} />
          </mesh>

          {/* Top Cream Layer */}
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[0.82, 0.08, 0.82]} />
            <meshStandardMaterial color="#FFF9EF" roughness={0.3} />
          </mesh>

          {/* Cocoa dusting / Topping accents */}
          <mesh position={[0, 0.67, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.7]} />
            <meshStandardMaterial color={accentColor} roughness={0.9} />
          </mesh>
        </group>
      )}

      {categoryId === 'special' && (
        <group position={[0, 0, 0]}>
          {/* Deluxe Matte Black & Gold Cup */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.65, 0.42, 1.0, 32]} />
            <meshStandardMaterial color="#120E0C" roughness={0.1} metalness={0.9} />
          </mesh>

          {/* Gold Rim */}
          <mesh position={[0, 0.86, 0]}>
            <torusGeometry args={[0.65, 0.03, 16, 32]} />
            <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Gold Infused Shimmer Liquid */}
          <mesh ref={liquidRef} position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.63, 32]} />
            <meshStandardMaterial color="#2E1B10" metalness={0.5} roughness={0.2} />
          </mesh>

          {/* Gold Flakes Sparkle */}
          <mesh position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.4, 16]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}

      {/* Floating Coffee Beans Decor around podium */}
      {[0, 120, 240].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = Math.cos(rad) * 1.1;
        const z = Math.sin(rad) * 1.1;
        return (
          <mesh key={i} position={[x, -0.2, z]} rotation={[0.4, rad, 0.2]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#321B0F" roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
};
