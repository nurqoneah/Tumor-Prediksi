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

  const firstLine = lines[0].trim();
  const delimiter = firstLine.includes(';') ? ';' : ',';
  
  const idx = firstLine.indexOf(delimiter);
  if (idx === -1) {
    throw new Error('CSV delimiter not found in header');
  }

  const rawHeader1 = firstLine.substring(0, idx).trim().replace(/^"|"$/g, '');
  const rawHeader2 = firstLine.substring(idx + 1).trim().replace(/^"|"$/g, '');

  const normHeader1 = (rawHeader1.toLowerCase().startsWith('freq') || rawHeader1.toLowerCase() === 'frequency') 
    ? 'Frequency' 
    : rawHeader1;
  const normHeader2 = (rawHeader2.toLowerCase().startsWith('db') || rawHeader2.toLowerCase().startsWith('"db')) 
    ? 'dB' 
    : rawHeader2;

  const normalizedHeaders = [normHeader1, normHeader2];
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lineIdx = line.indexOf(delimiter);
    if (lineIdx === -1) continue;

    const val1 = line.substring(0, lineIdx).trim().replace(/^"|"$/g, '');
    const val2 = line.substring(lineIdx + 1).trim().replace(/^"|"$/g, '');

    const numVal1 = parseFloat(val1);
    const numVal2 = parseFloat(val2);

    if (isNaN(numVal1) || isNaN(numVal2)) continue;

    const row: CsvRow = {
      Frequency: numVal1,
      dB: numVal2
    } as CsvRow;

    rows.push(row);
  }

  // Create hash from the data
  const hash = createDataHash(rows);

  return {
    rows,
    headers: normalizedHeaders,
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
