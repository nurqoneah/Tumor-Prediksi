import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCsv, createDataHash } from '@/lib/csv-processor';
import * as fs from 'fs';
import * as path from 'path';

// Scenario definitions with tumor positions based on medical quadrant anatomy
// 
// Breast quadrants (viewed from front - patient perspective):
// - Kuadran I: Upper Outer (Superolateral) - towards armpit, upper area
// - Kuadran II: Upper Inner (Superomedial) - towards sternum, upper area
// - Kuadran III: Lower Inner (Inferomedial) - towards sternum, lower area
// - Kuadran IV: Lower Outer (Inferolateral) - towards armpit, lower area
//
// Coordinate system:
// X: horizontal (-1 = inner/center, +1 = outer/side)
// Y: vertical (-1 = lower, +1 = upper)
// Z: depth (0 = on surface, 0.5 = middle, 1 = deep inside)

const SCENARIO_DEFINITIONS = [
  {
    name: 'tanpa_tumor',
    displayName: 'Tanpa Tumor',
    description: 'Baseline - model payudara tanpa tumor',
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0,
    hasTumor: false,
    fileName: 'simulasi_9_antena_tanpa_tumor.csv'
  },
  {
    name: 'dengan_tumor',
    displayName: 'Dengan Tumor',
    description: 'Tumor di posisi tengah payudara',
    offsetX: 0,
    offsetY: 0,
    offsetZ: 0.5,
    hasTumor: true,
    fileName: 'simulasi_9_antena_dengan_tumor.csv'
  },
  {
    name: 'kuadran_I',
    displayName: 'Kuadran I',
    description: 'Tumor di Kuadran I - Area kanan',
    offsetX: 0.7,
    offsetY: 0,
    offsetZ: 0.5,
    hasTumor: true,
    fileName: 'simulasi_kuadran_I.csv'
  },
  {
    name: 'kuadran_II',
    displayName: 'Kuadran II',
    description: 'Tumor di Kuadran II - Area atas',
    offsetX: 0,
    offsetY: 0.7,
    offsetZ: 0.5,
    hasTumor: true,
    fileName: 'simulasi_kuadran_II.csv'
  },
  {
    name: 'kuadran_III',
    displayName: 'Kuadran III',
    description: 'Tumor di Kuadran III - Area kiri',
    offsetX: -0.7,
    offsetY: 0,
    offsetZ: 0.5,
    hasTumor: true,
    fileName: 'simulasi_kuadran_III.csv'
  },
  {
    name: 'kuadran_IV',
    displayName: 'Kuadran IV',
    description: 'Tumor di Kuadran IV - Area bawah',
    offsetX: 0,
    offsetY: -0.7,
    offsetZ: 0.5,
    hasTumor: true,
    fileName: 'simulasi_kuadran_IV.csv'
  }
];

// Initialize scenarios from CSV files
async function initializeScenarios() {
  const uploadDir = path.join(process.cwd(), 'upload');

  for (const def of SCENARIO_DEFINITIONS) {
    const filePath = path.join(uploadDir, def.fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`CSV file not found: ${def.fileName}`);
      continue;
    }

    // Read and parse CSV
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseCsv(content);

    // Check if scenario already exists
    const existing = await db.scenario.findUnique({
      where: { name: def.name }
    });

    if (existing) {
      // Update if needed
      await db.scenario.update({
        where: { name: def.name },
        data: {
          displayName: def.displayName,
          description: def.description,
          offsetX: def.offsetX,
          offsetY: def.offsetY,
          offsetZ: def.offsetZ,
          hasTumor: def.hasTumor,
          dataHash: parsed.hash
        }
      });
    } else {
      // Create new scenario
      await db.scenario.create({
        data: {
          name: def.name,
          displayName: def.displayName,
          description: def.description,
          offsetX: def.offsetX,
          offsetY: def.offsetY,
          offsetZ: def.offsetZ,
          hasTumor: def.hasTumor,
          dataHash: parsed.hash
        }
      });
    }
  }
}

export async function GET() {
  try {
    // Initialize scenarios on first load
    await initializeScenarios();

    const scenarios = await db.scenario.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      scenarios: scenarios.map(s => ({
        id: s.id,
        name: s.name,
        displayName: s.displayName,
        description: s.description,
        offsetX: s.offsetX,
        offsetY: s.offsetY,
        offsetZ: s.offsetZ,
        hasTumor: s.hasTumor,
        dataHash: s.dataHash
      }))
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}
