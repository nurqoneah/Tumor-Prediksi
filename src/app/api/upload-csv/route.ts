import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCsv, validateCsv, createDataHash } from '@/lib/csv-processor';
import * as xlsx from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let content: string;
    
    // Check file type
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Handle Excel file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to CSV format
      content = xlsx.utils.sheet_to_csv(sheet);
    } else if (fileName.endsWith('.csv')) {
      // Handle CSV file
      content = await file.text();
    } else {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls' },
        { status: 400 }
      );
    }

    // Validate CSV structure
    const validation = validateCsv(content);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const parsed = validation.data!;

    // Compare with all scenarios
    const scenarios = await db.scenario.findMany();
    let matchedScenario = null;

    for (const scenario of scenarios) {
      if (scenario.dataHash === parsed.hash) {
        matchedScenario = scenario;
        break;
      }
    }

    // Store the uploaded CSV
    const uploaded = await db.uploadedCsv.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        rowCount: parsed.rowCount,
        dataHash: parsed.hash,
        matched: matchedScenario !== null,
        matchedScenario: matchedScenario?.name || null
      }
    });

    return NextResponse.json({
      success: true,
      uploaded: {
        id: uploaded.id,
        fileName: uploaded.fileName,
        rowCount: uploaded.rowCount,
        matched: uploaded.matched
      },
      match: matchedScenario ? {
        id: matchedScenario.id,
        name: matchedScenario.name,
        displayName: matchedScenario.displayName,
        description: matchedScenario.description,
        offsetX: matchedScenario.offsetX,
        offsetY: matchedScenario.offsetY,
        offsetZ: matchedScenario.offsetZ,
        hasTumor: matchedScenario.hasTumor
      } : null,
      message: matchedScenario
        ? `Skenario: ${matchedScenario.displayName}`
        : 'File tidak cocok dengan skenario manapun'
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses file' },
      { status: 500 }
    );
  }
}
