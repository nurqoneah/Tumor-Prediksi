import os
import csv
import glob

def inspect_file(filepath):
    frequencies = []
    db_values = []
    with open(filepath, 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        # Clean headers
        header = [h.strip().replace('"', '') for h in header]
        
        for row in reader:
            if len(row) < 2:
                continue
            try:
                frequencies.append(float(row[0]))
                db_values.append(float(row[1]))
            except ValueError:
                # In case there's headers or bad data
                pass
    return header, len(frequencies), frequencies[:3], frequencies[-3:]

print("--- Upload Folder Files ---")
for p in glob.glob("upload/*.csv"):
    if "simulasi" in p.lower():
        try:
            h, l, start, end = inspect_file(p)
            print(f"{os.path.basename(p)}: rows={l}, headers={h}, start={start}, end={end}")
        except Exception as e:
            print(f"Error {p}: {e}")

print("--- Hasil Simulasi Folder Files ---")
for root, dirs, files in os.walk("Data/Hasil Simulasi"):
    for file in files:
        if file.endswith('.csv'):
            path = os.path.join(root, file)
            try:
                h, l, start, end = inspect_file(path)
                print(f"{path}: rows={l}, headers={h}, start={start}, end={end}")
                break # Only inspect one file per directory
            except Exception as e:
                print(f"Error {path}: {e}")
