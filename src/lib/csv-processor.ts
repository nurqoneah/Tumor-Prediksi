import crypto from 'crypto';

export interface CsvRow {
  Frequency: number;
  dB: number;
  Antenna?: string;
  [key: string]: string | number | undefined;
}

export interface ParsedCsv {
  rows: CsvRow[];
  headers: string[];
  rowCount: number;
  hash: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: ParsedCsv;
}

/**
 * Parse CSV content into structured data
 */
export function parseCsv(content: string): ParsedCsv {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const row: CsvRow = {} as CsvRow;
    headers.forEach((header, index) => {
      const value = values[index];
      // Try to parse as number
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        (row as Record<string, number | string>)[header] = numValue;
      } else {
        (row as Record<string, number | string>)[header] = value;
      }
    });
    rows.push(row);
  }

  // Create hash from the data
  const hash = createDataHash(rows);

  return {
    rows,
    headers,
    rowCount: rows.length,
    hash
  };
}

/**
 * Validate CSV structure - must have Frequency and dB columns
 */
export function validateCsv(content: string): ValidationResult {
  try {
    const parsed = parseCsv(content);

    if (!parsed.headers.includes('Frequency')) {
      return { valid: false, error: 'Data Frequency tidak ditemukan' };
    }

    if (!parsed.headers.includes('dB')) {
      return { valid: false, error: 'Data dB tidak ditemukan' };
    }

    if (parsed.rowCount === 0) {
      return { valid: false, error: 'CSV file has no data rows' };
    }

    return { valid: true, data: parsed };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

/**
 * Create a hash from CSV data for comparison
 */
export function createDataHash(rows: CsvRow[]): string {
  // Create a normalized string representation for hashing
  const normalizedData = rows.map(row => {
    const freq = row.Frequency?.toString() || '0';
    const db = row.dB?.toString() || '0';
    return `${freq}:${db}`;
  }).join('|');

  return crypto.createHash('sha256').update(normalizedData).digest('hex');
}

/**
 * Compare two CSV hashes
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}
