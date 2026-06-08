'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
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
  'dengan_tumor': [0, 0, 0.67]     // Center (Moved from 0.55 to 0.67 for outer visibility)
};

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
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
      {/* Legend HTML Overlay */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-sm rounded-full px-4 py-1.5 flex items-center justify-center gap-4 z-10 border border-slate-200/80 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]"></span>
          <span>I (Kanan)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffd93d]"></span>
          <span>II (Atas)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6bcb77]"></span>
          <span>III (Kiri)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4d96ff]"></span>
          <span>IV (Bawah)</span>
        </div>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={8} target={[0, 0, 0]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-2, 3, 3]} intensity={0.5} />
        
        <Suspense fallback={null}>
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
