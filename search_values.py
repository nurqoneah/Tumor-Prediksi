
import os
import csv
import glob

targets = [-32.4, -38.2, -42.3]

for root, dirs, files in os.walk('Data'):
    for file in files:
        if file.endswith('.csv'):
            path = os.path.join(root, file)
            with open(path, 'r') as f_csv:
                reader = csv.reader(f_csv)
                header = next(reader)
                for r_idx, row in enumerate(reader):
                    for c_idx, val in enumerate(row):
                        try:
                            fval = float(val)
                            for target in targets:
                                if abs(fval - target) < 0.05:
                                    print(f'Match: {path} | Row {r_idx} | Col {c_idx} | Header: {header} | Val: {val}')
                        except ValueError:
                            pass
