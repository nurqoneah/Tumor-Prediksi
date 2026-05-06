'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info, Activity, MapPin, Stethoscope } from 'lucide-react';
import type { Scenario } from './control-panel';

interface InfoPanelProps {
  currentScenario: Scenario | null;
  showTumor: boolean;
  breastMode: 'left' | 'right' | 'both';
  manualPosition: [number, number, number];
  isManualMode: boolean;
}

export function InfoPanel({
  currentScenario,
  showTumor,
  breastMode,
  manualPosition,
  isManualMode
}: InfoPanelProps) {
  const getBreastModeLabel = () => {
    switch (breastMode) {
      case 'left': return 'Payudara Kiri';
      case 'right': return 'Payudara Kanan';
      case 'both': return 'Kedua Payudara';
    }
  };

  const getTumorStatus = () => {
    if (!showTumor) return { label: 'Tidak Terlihat', variant: 'secondary' as const };
    if (isManualMode) return { label: 'Posisi Manual', variant: 'default' as const };
    if (currentScenario?.hasTumor) return { label: 'Terdeteksi', variant: 'destructive' as const };
    return { label: 'Tidak Ada Tumor', variant: 'secondary' as const };
  };

  const tumorStatus = getTumorStatus();

  const getQuadrantInfo = () => {
    if (!currentScenario?.hasTumor) return null;

    const quadrantNames: Record<string, { name: string; description: string }> = {
      'kuadran_I': {
        name: 'Kuadran I (Kanan)',
        description: 'Area kanan payudara'
      },
      'kuadran_II': {
        name: 'Kuadran II (Atas)',
        description: 'Area atas payudara'
      },
      'kuadran_III': {
        name: 'Kuadran III (Kiri)',
        description: 'Area kiri payudara'
      },
      'kuadran_IV': {
        name: 'Kuadran IV (Bawah)',
        description: 'Area bawah payudara'
      },
      'dengan_tumor': {
        name: 'Posisi Tengah',
        description: 'Tumor di posisi tengah payudara'
      }
    };

    return quadrantNames[currentScenario.name] || null;
  };

  const quadrantInfo = getQuadrantInfo();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Informasi Medis
        </CardTitle>
        <CardDescription>
          Detail visualisasi dan status tumor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Skenario Aktif</span>
            <Badge variant={currentScenario ? 'default' : 'secondary'}>
              {currentScenario?.displayName || 'Tidak Ada'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mode Tampilan</span>
            <Badge variant="outline">{getBreastModeLabel()}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status Tumor</span>
            <Badge variant={tumorStatus.variant}>{tumorStatus.label}</Badge>
          </div>
        </div>

        <Separator />

        {/* Position Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Posisi Tumor</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground">X</div>
                <div className="font-mono font-bold">
                  {isManualMode ? manualPosition[0].toFixed(2) : (currentScenario?.offsetX?.toFixed(2) || '0.00')}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Y</div>
                <div className="font-mono font-bold">
                  {isManualMode ? manualPosition[1].toFixed(2) : (currentScenario?.offsetY?.toFixed(2) || '0.00')}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Z</div>
                <div className="font-mono font-bold">
                  {isManualMode ? manualPosition[2].toFixed(2) : (currentScenario?.offsetZ?.toFixed(2) || '0.00')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quadrant Information */}
        {quadrantInfo && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Lokasi Anatomi</span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/20 rounded-lg p-3 border border-rose-200 dark:border-rose-800">
                <div className="font-medium text-rose-700 dark:text-rose-400">
                  {quadrantInfo.name}
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-500 mt-1">
                  {quadrantInfo.description}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Medical Quadrant Reference */}
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Referensi Kuadran</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div></div>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded p-2 text-center border border-yellow-300">
                <div className="font-semibold text-yellow-700">II</div>
                <div className="text-muted-foreground text-xs">Atas</div>
              </div>
              <div></div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded p-2 text-center border border-green-300">
                <div className="font-semibold text-green-700">III</div>
                <div className="text-muted-foreground text-xs">Kiri</div>
              </div>
              <div className="bg-gray-100 rounded p-2 text-center">
                <div className="font-semibold text-gray-500">•</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 rounded p-2 text-center border border-red-300">
                <div className="font-semibold text-red-700">I</div>
                <div className="text-muted-foreground text-xs">Kanan</div>
              </div>
              <div></div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-2 text-center border border-blue-300">
                <div className="font-semibold text-blue-700">IV</div>
                <div className="text-muted-foreground text-xs">Bawah</div>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
