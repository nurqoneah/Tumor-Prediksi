'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BreastModelProps {
  position: [number, number, number];
  side: 'left' | 'right';
}

export function BreastModel({ position, side }: BreastModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
      meshRef.current.scale.z = 1 + breathe;
    }
  });
  
  return (
    <group position={position}>
      {/* Breast hemisphere */}
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f5d5c8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Areola */}
      <mesh position={[0, 0, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial color="#c9837a" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Nipple */}
      <mesh position={[0, 0, 0.74]}>
        <cylinderGeometry args={[0.03, 0.05, 0.08, 16]} />
        <meshStandardMaterial color="#9a5a4a" />
      </mesh>
      
      {/* Grid lines on surface */}
      <group position={[0, 0, 0.02]}>
        {/* Horizontal line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.006, 0.006]} />
          <meshBasicMaterial color="#d4a090" transparent opacity={0.4} />
        </mesh>
        {/* Vertical line */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.006, 0.6, 0.006]} />
          <meshBasicMaterial color="#d4a090" transparent opacity={0.4} />
        </mesh>
        
        {/* Q1 - Kanan (Right) */}
        <mesh position={[0.2, 0, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
        {/* Q2 - Atas (Top) */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#ffd93d" />
        </mesh>
        {/* Q3 - Kiri (Left) */}
        <mesh position={[-0.2, 0, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#6bcb77" />
        </mesh>
        {/* Q4 - Bawah (Bottom) */}
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshBasicMaterial color="#4d96ff" />
        </mesh>
      </group>
    </group>
  );
}

export function TumorMarker({ position, visible, scenarioName }: { 
  position: [number, number, number]; 
  visible: boolean;
  scenarioName?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && visible) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.15);
    }
  });
  
  if (!visible) return null;
  
  const color = {
    'kuadran_I': '#ff6b6b',
    'kuadran_II': '#ffd93d', 
    'kuadran_III': '#6bcb77',
    'kuadran_IV': '#4d96ff'
  }[scenarioName || ''] || '#ff3344';
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.008, 0.2, 0.008]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.008, 0.2, 0.008]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
