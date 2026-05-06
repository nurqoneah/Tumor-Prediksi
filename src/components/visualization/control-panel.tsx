'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Upload,
  Brain,
  Target,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface Scenario {
  id: string;
  name: string;
  displayName: string;
  description: string;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  hasTumor: boolean;
}

export interface UploadResult {
  success: boolean;
  uploaded?: {
    id: string;
    fileName: string;
    rowCount: number;
    matched: boolean;
  };
  match?: Scenario | null;
  message?: string;
  error?: string;
}

interface ControlPanelProps {
  scenarios: Scenario[];
  currentScenario: Scenario | null;
  onScenarioSelect: (scenario: Scenario) => void;
  onManualPositionChange: (position: [number, number, number]) => void;
  onBreastModeChange: (mode: 'left' | 'right' | 'both') => void;
  breastMode: 'left' | 'right' | 'both';
  showTumor: boolean;
  onToggleTumor: (show: boolean) => void;
  manualPosition: [number, number, number];
}

export function ControlPanel({
  scenarios,
  currentScenario,
  onScenarioSelect,
  onManualPositionChange,
  onBreastModeChange,
  breastMode,
  showTumor,
  onToggleTumor,
  manualPosition
}: ControlPanelProps) {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('scenarios');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      setUploadResult(result);

      // If matched, select the scenario
      if (result.success && result.match) {
        onScenarioSelect(result.match);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: 'Failed to upload file'
      });
    } finally {
      setUploading(false);
    }
  }, [onScenarioSelect]);

  const handleManualChange = (axis: number, value: number) => {
    const newPosition: [number, number, number] = [...manualPosition];
    newPosition[axis] = value;
    onManualPositionChange(newPosition);
  };

  const getScenarioButtonVariant = (scenario: Scenario) => {
    return currentScenario?.name === scenario.name ? 'default' : 'outline';
  };

  const getScenarioColor = (scenario: Scenario) => {
    if (!scenario.hasTumor) return 'bg-green-500 hover:bg-green-600';
    switch (scenario.name) {
      case 'kuadran_I': return 'bg-red-500 hover:bg-red-600';       // Kanan - Red
      case 'kuadran_II': return 'bg-yellow-500 hover:bg-yellow-600';  // Atas - Yellow
      case 'kuadran_III': return 'bg-green-500 hover:bg-green-600';   // Kiri - Green
      case 'kuadran_IV': return 'bg-blue-500 hover:bg-blue-600';      // Bawah - Blue
      default: return 'bg-rose-500 hover:bg-rose-600';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Control Panel
        </CardTitle>
        <CardDescription>
          Pilih skenario atau upload data CSV untuk visualisasi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Skenario</TabsTrigger>
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {scenarios.map((scenario) => (
                <Button
                  key={scenario.id}
                  variant={getScenarioButtonVariant(scenario)}
                  className={`h-auto py-3 px-3 flex flex-col items-start gap-1 ${
                    currentScenario?.name === scenario.name ? getScenarioColor(scenario) + ' text-white' : ''
                  }`}
                  onClick={() => onScenarioSelect(scenario)}
                >
                  <span className="font-semibold text-sm">{scenario.displayName}</span>
                  <span className="text-xs opacity-80 truncate w-full text-left">
                    {scenario.hasTumor ? 'Dengan Tumor' : 'Tanpa Tumor'}
                  </span>
                </Button>
              ))}
            </div>

            {currentScenario && (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertTitle>{currentScenario.displayName}</AlertTitle>
                <AlertDescription className="text-sm">
                  {currentScenario.description}
                  {currentScenario.hasTumor && (
                    <div className="mt-2 text-xs">
                      Position: ({currentScenario.offsetX}, {currentScenario.offsetY}, {currentScenario.offsetZ})
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Upload CSV Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={uploading}
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Memproses...' : 'Klik untuk upload CSV'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Format: CSV, XLSX, XLS
                </span>
              </label>
            </div>

            {uploadResult && (
              <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
                {uploadResult.success ? (
                  uploadResult.match ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {uploadResult.success
                    ? uploadResult.match
                      ? 'Match Found!'
                      : 'No Match'
                    : 'Error'}
                </AlertTitle>
                <AlertDescription>
                  {uploadResult.error || uploadResult.message}
                  {uploadResult.match && (
                    <div className="mt-2">
                      <Badge variant="outline">{uploadResult.match.displayName}</Badge>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Position X</Label>
                  <span className="text-sm text-muted-foreground">{manualPosition[0].toFixed(1)}</span>
                </div>
                <Slider
                  value={[manualPosition[0]]}
                  min={-2}
                  max={2}
                  step={0.1}
                  onValueChange={(v) => handleManualChange(0, v[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Position Y</Label>
                  <span className="text-sm text-muted-foreground">{manualPosition[1].toFixed(1)}</span>
                </div>
                <Slider
                  value={[manualPosition[1]]}
                  min={-2}
                  max={2}
                  step={0.1}
                  onValueChange={(v) => handleManualChange(1, v[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Position Z</Label>
                  <span className="text-sm text-muted-foreground">{manualPosition[2].toFixed(1)}</span>
                </div>
                <Slider
                  value={[manualPosition[2]]}
                  min={-2}
                  max={2}
                  step={0.1}
                  onValueChange={(v) => handleManualChange(2, v[0])}
                />
              </div>

              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Manual position: ({manualPosition[0].toFixed(1)}, {manualPosition[1].toFixed(1)}, {manualPosition[2].toFixed(1)})
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        {/* Breast Mode Selection */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Mode Tampilan</Label>
          <RadioGroup
            value={breastMode}
            onValueChange={(v) => onBreastModeChange(v as 'left' | 'right' | 'both')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="left" id="left" />
              <Label htmlFor="left" className="text-sm">Kiri</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="right" id="right" />
              <Label htmlFor="right" className="text-sm">Kanan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="both" />
              <Label htmlFor="both" className="text-sm">Keduanya</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Show/Hide Tumor Toggle */}
        <div className="flex items-center justify-between pt-2">
          <Label>Tampilkan Tumor</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleTumor(!showTumor)}
          >
            {showTumor ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Visible
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hidden
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
