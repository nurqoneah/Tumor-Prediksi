'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ControlPanel, type Scenario } from '@/components/visualization/control-panel';
import { InfoPanel } from '@/components/visualization/info-panel';
import { DataChart } from '@/components/visualization/data-chart';
import { ClientOnly } from '@/components/client-only';
import { 
  Activity, 
  AlertTriangle, 
  Heart, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move3d
} from 'lucide-react';

type BreastMode = 'left' | 'right' | 'both';

// Import BreastScene dynamically to avoid SSR issues
import BreastScene from '@/components/visualization/breast-scene';

export default function Home() {
  // State
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [breastMode, setBreastMode] = useState<BreastMode>('both');
  const [showTumor, setShowTumor] = useState(false);
  const [manualPosition, setManualPosition] = useState<[number, number, number]>([0, 0, 0.5]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ Frequency: number; dB: number }[]>([]);

  // Fetch scenarios on mount
  useEffect(() => {
    async function fetchScenarios() {
      try {
        const response = await fetch('/api/scenarios');
        const data = await response.json();

        if (data.success) {
          setScenarios(data.scenarios);
          // Set default scenario (tanpa tumor)
          const defaultScenario = data.scenarios.find((s: Scenario) => s.name === 'tanpa_tumor');
          if (defaultScenario) {
            setCurrentScenario(defaultScenario);
          }
        } else {
          setError(data.error || 'Failed to load scenarios');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }

    fetchScenarios();
  }, []);

  // Handle scenario selection
  const handleScenarioSelect = useCallback((scenario: Scenario) => {
    setCurrentScenario(scenario);
    setIsManualMode(false);
    setShowTumor(scenario.hasTumor);
    generateChartData(scenario);
  }, []);

  // Handle manual position change
  const handleManualPositionChange = useCallback((position: [number, number, number]) => {
    setManualPosition(position);
    setIsManualMode(true);
    setShowTumor(true);
  }, []);

  // Handle breast mode change
  const handleBreastModeChange = useCallback((mode: BreastMode) => {
    setBreastMode(mode);
  }, []);

  // Handle tumor visibility toggle
  const handleToggleTumor = useCallback((show: boolean) => {
    setShowTumor(show);
  }, []);

  // Generate sample chart data
  const generateChartData = (scenario: Scenario) => {
    const baseDb = scenario.hasTumor ? -30 : -42;
    const variance = scenario.hasTumor ? 5 : 1.5;

    const data = [];
    for (let freq = 1.5; freq <= 4.5; freq += 0.1) {
      const db = baseDb + (Math.random() - 0.5) * variance * 2;
      data.push({
        Frequency: parseFloat(freq.toFixed(1)),
        dB: parseFloat(db.toFixed(1))
      });
    }
    setChartData(data);
  };

  // Reset view
  const handleReset = useCallback(() => {
    const defaultScenario = scenarios.find(s => s.name === 'tanpa_tumor');
    if (defaultScenario) {
      setCurrentScenario(defaultScenario);
      setShowTumor(false);
      setBreastMode('both');
      setManualPosition([0, 0, 0.5]);
      setIsManualMode(false);
      generateChartData(defaultScenario);
    }
  }, [scenarios]);

  // Get tumor position
  const getTumorPosition = (): [number, number, number] => {
    if (isManualMode) {
      return manualPosition;
    }
    if (currentScenario?.hasTumor) {
      return [
        currentScenario.offsetX,
        currentScenario.offsetY,
        currentScenario.offsetZ
      ];
    }
    return [0, 0, 0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="h-16 w-16 animate-pulse text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold">Breast Anatomy Medical Visualization</h1>
          <p className="text-muted-foreground">Loading visualization system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
                <Heart className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Breast Anatomy Visualization</h1>
                <p className="text-sm text-muted-foreground">
                  Medical Visualization System for Tumor Prediction & Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Control Panel - Left */}
          <div className="lg:col-span-1">
            <ControlPanel
              scenarios={scenarios}
              currentScenario={currentScenario}
              onScenarioSelect={handleScenarioSelect}
              onManualPositionChange={handleManualPositionChange}
              onBreastModeChange={handleBreastModeChange}
              breastMode={breastMode}
              showTumor={showTumor}
              onToggleTumor={handleToggleTumor}
              manualPosition={manualPosition}
            />
          </div>

          {/* 3D Visualization - Center */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">3D Breast Anatomy Model</CardTitle>
                    <CardDescription>
                      Interactive visualization with tumor detection
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Zoom In">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Zoom Out">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Pan">
                      <Move3d className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <ClientOnly
                  fallback={
                    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted/20 rounded-xl">
                      <div className="text-center space-y-4">
                        <Activity className="h-12 w-12 animate-pulse text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Loading 3D Visualization...</p>
                      </div>
                    </div>
                  }
                >
                  <BreastScene
                    breastMode={breastMode}
                    showTumor={showTumor}
                    tumorPosition={getTumorPosition()}
                    scenarioName={isManualMode ? 'manual' : currentScenario?.name}
                  />
                </ClientOnly>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel - Right */}
          <div className="lg:col-span-1 space-y-4">
            <InfoPanel
              currentScenario={currentScenario}
              showTumor={showTumor}
              breastMode={breastMode}
              manualPosition={manualPosition}
              isManualMode={isManualMode}
            />
            <DataChart data={chartData} title="Signal Analysis" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Breast Anatomy Medical Visualization System</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>For Research & Educational Purposes</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
