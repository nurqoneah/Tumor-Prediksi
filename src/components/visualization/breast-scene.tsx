'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Suspense } from 'react';
import { BreastModel, TumorMarker } from './breast-model';

type BreastMode = 'left' | 'right' | 'both';

interface BreastSceneProps {
  breastMode: BreastMode;
  showTumor: boolean;
  tumorPosition: [number, number, number];
  scenarioName?: string;
}

const LEFT_POS: [number, number, number] = [-0.9, 0, 0];
const RIGHT_POS: [number, number, number] = [0.9, 0, 0];

// Tumor positions ON the breast surface
// Q1: Kanan, Q2: Atas, Q3: Kiri, Q4: Bawah
const QUADRANT_POSITIONS: Record<string, [number, number, number]> = {
  'kuadran_I': [0.35, 0, 0.5],     // Kanan
  'kuadran_II': [0, 0.35, 0.5],    // Atas
  'kuadran_III': [-0.35, 0, 0.5],  // Kiri
  'kuadran_IV': [0, -0.35, 0.5],   // Bawah
  'dengan_tumor': [0, 0, 0.55]     // Center
};

function QuadrantLegend() {
  return (
    <group position={[0, 1.8, 1]}>
      <mesh>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      
      {/* Q1 - Kanan */}
      <mesh position={[0.2, 0.1, 0.02]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#ff6b6b" />
      </mesh>
      <Text position={[0.32, 0.1, 0.02]} fontSize={0.06} color="#333" anchorX="left">I</Text>
      
      {/* Q2 - Atas */}
      <mesh position={[-0.2, 0.1, 0.02]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#ffd93d" />
      </mesh>
      <Text position={[-0.08, 0.1, 0.02]} fontSize={0.06} color="#333" anchorX="left">II</Text>
      
      {/* Q3 - Kiri */}
      <mesh position={[-0.2, -0.1, 0.02]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#6bcb77" />
      </mesh>
      <Text position={[-0.08, -0.1, 0.02]} fontSize={0.06} color="#333" anchorX="left">III</Text>
      
      {/* Q4 - Bawah */}
      <mesh position={[0.2, -0.1, 0.02]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial color="#4d96ff" />
      </mesh>
      <Text position={[0.32, -0.1, 0.02]} fontSize={0.06} color="#333" anchorX="left">IV</Text>
    </group>
  );
}

export default function BreastScene({ breastMode, showTumor, tumorPosition, scenarioName }: BreastSceneProps) {
  const showLeft = breastMode === 'left' || breastMode === 'both';
  const showRight = breastMode === 'right' || breastMode === 'both';

  const getTumorPos = (breastPos: [number, number, number]): [number, number, number] => {
    if (scenarioName && QUADRANT_POSITIONS[scenarioName]) {
      const [qx, qy, qz] = QUADRANT_POSITIONS[scenarioName];
      return [breastPos[0] + qx, breastPos[1] + qy, qz];
    }
    return [
      breastPos[0] + tumorPosition[0] * 0.35,
      breastPos[1] + tumorPosition[1] * 0.35,
      0.5 + tumorPosition[2] * 0.15
    ];
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={8} target={[0, 0, 0]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-2, 3, 3]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <QuadrantLegend />
          {showLeft && (
            <>
              <BreastModel position={LEFT_POS} side="left" />
              <TumorMarker position={getTumorPos(LEFT_POS)} visible={showTumor} scenarioName={scenarioName} />
            </>
          )}
          {showRight && (
            <>
              <BreastModel position={RIGHT_POS} side="right" />
              <TumorMarker position={getTumorPos(RIGHT_POS)} visible={showTumor} scenarioName={scenarioName} />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
