import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseCsv, validateCsv } from '@/lib/csv-processor';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

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

    // Save uploaded content to a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(
      tempDir,
      `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.csv`
    );
    fs.writeFileSync(tempFilePath, content, 'utf-8');

    let predictedScenarioName: string | null = null;
    let confidence = 0;

    try {
      const scriptPath = path.join(process.cwd(), 'src', 'lib', 'predict.py');
      const cmd = `python "${scriptPath}" "${tempFilePath}"`;
      const stdout = execSync(cmd, { encoding: 'utf-8' });
      const result = JSON.parse(stdout.strip ? stdout.strip() : stdout);
      
      if (result.success) {
        predictedScenarioName = result.prediction;
        confidence = result.confidence || 0;
        console.log(`ML prediction class: ${predictedScenarioName} with confidence ${confidence}`);
      } else {
        console.error('Inference script returned error:', result.error);
      }
    } catch (error) {
      console.error('Error executing python inference script:', error);
    } finally {
      // Clean up temporary file
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (err) {
        console.error('Failed to delete temp upload file:', err);
      }
    }

    // Match database scenario based on ML prediction
    let matchedScenario = null;
    if (predictedScenarioName) {
      matchedScenario = await db.scenario.findUnique({
        where: { name: predictedScenarioName }
      });
    }

    // Store the uploaded CSV information in database
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
      confidence: confidence,
      message: matchedScenario
        ? `Skenario Terprediksi: ${matchedScenario.displayName} (Akurasi Model: ${(confidence * 100).toFixed(1)}%)`
        : 'Model tidak dapat mengklasifikasikan skenario data ini'
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses file' },
      { status: 500 }
    );
  }
}

