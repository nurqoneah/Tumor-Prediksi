'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChartIcon } from 'lucide-react';

interface CsvRow {
  Frequency: number;
  dB: number;
  Antenna?: string;
}

interface DataChartProps {
  data: CsvRow[];
  title?: string;
}

export function DataChart({ data, title = 'Signal Data Visualization' }: DataChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Tidak ada data untuk ditampilkan</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Upload CSV untuk melihat visualisasi data</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = data.map((row, index) => ({
    name: `${row.Frequency?.toFixed(1) || index}`,
    frequency: row.Frequency,
    dB: row.dB,
    antenna: row.Antenna || `A${(index % 9) + 1}`
  }));

  // Calculate statistics
  const avgDb = data.reduce((sum, row) => sum + (row.dB || 0), 0) / data.length;
  const minDb = Math.min(...data.map(row => row.dB || 0));
  const maxDb = Math.max(...data.map(row => row.dB || 0));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {data.length} data points | Range: {minDb.toFixed(1)} to {maxDb.toFixed(1)} dB | Avg: {avgDb.toFixed(1)} dB
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <TabsList className="mb-4">
            <TabsTrigger value="line" className="flex items-center gap-1">
              <LineChartIcon className="h-4 w-4" />
              Line
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Bar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="line">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Frequency (GHz)', position: 'bottom', offset: -5, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  domain={[minDb - 5, maxDb + 5]}
                  label={{ value: 'dB', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} dB`, 'dB']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="dB"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Signal (dB)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bar">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="antenna"
                  tick={{ fontSize: 10 }}
                  label={{ value: 'Antenna', position: 'bottom', offset: -5, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  domain={[minDb - 5, maxDb + 5]}
                  label={{ value: 'dB', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} dB`, 'dB']}
                />
                <Legend />
                <Bar
                  dataKey="dB"
                  fill="hsl(var(--chart-2))"
                  name="Signal (dB)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
