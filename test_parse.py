import os

def test_parse():
    filepath = 'upload/Simulasi Kuadran III.csv'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    print("Content length:", len(content))
    content_stripped = content.strip()
    
    # split by \n
    lines = content_stripped.split('\n')
    print("Number of lines:", len(lines))
    
    if len(lines) < 2:
        print("Less than 2 lines!")
        return
        
    first_line = lines[0]
    delimiter = ';' if ';' in first_line else ','
    print("Detected delimiter:", repr(delimiter))
    
    headers = [h.strip().replace('"', '') for h in first_line.split(delimiter)]
    print("Headers:", headers)
    
    # Normalize headers
    normalized_headers = []
    for h in headers:
        hl = h.toLowerCase() if hasattr(h, 'toLowerCase') else h.lower()
        if hl == 'frequency' or hl.startswith('freq'):
            normalized_headers.append('Frequency')
        elif hl == 'db' or hl.startswith('db('):
            normalized_headers.append('dB')
        else:
            normalized_headers.append(h)
    print("Normalized headers:", normalized_headers)
    
    rows = []
    skipped = 0
    for i in range(1, len(lines)):
        line = lines[i]
        values = [v.strip().replace('"', '') for v in line.split(delimiter)]
        if len(values) != len(headers):
            skipped += 1
            if skipped <= 5:
                print(f"Skipped line {i}: {repr(line)} (values len {len(values)} != headers len {len(headers)})")
            continue
            
        row = {}
        for index, header in enumerate(normalized_headers):
            val = values[index]
            try:
                row[header] = float(val)
            except ValueError:
                row[header] = val
        rows.append(row)
        
    print("Parsed rows count:", len(rows))
    print("Skipped rows count:", skipped)

if __name__ == '__main__':
    test_parse()
