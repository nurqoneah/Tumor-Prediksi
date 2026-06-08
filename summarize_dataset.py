import os
import glob

def summarize():
    output = []
    output.append("=== Summary of Dataset directories ===")
    
    # Walk Hasil Simulasi
    output.append("\n--- Hasil Simulasi ---")
    if os.path.exists("Data/Hasil Simulasi"):
        for d in sorted(os.listdir("Data/Hasil Simulasi")):
            dpath = os.path.join("Data/Hasil Simulasi", d)
            if os.path.isdir(dpath):
                csvs = glob.glob(os.path.join(dpath, "*.csv"))
                output.append(f"  {d}: {len(csvs)} files")
                
    # Walk Simulasi Tanpa Tumor
    output.append("\n--- Simulasi Tanpa Tumor ---")
    if os.path.exists("Data/Simulasi Tanpa Tumor"):
        for root, dirs, files in os.walk("Data/Simulasi Tanpa Tumor"):
            csvs = [f for f in files if f.endswith('.csv')]
            if csvs:
                rel_path = os.path.relpath(root, "Data/Simulasi Tanpa Tumor")
                output.append(f"  {rel_path}: {len(csvs)} files")
                
    result = "\n".join(output)
    print(result)
    with open("dataset_summary.txt", "w", encoding="utf-8") as f:
        f.write(result)

if __name__ == '__main__':
    summarize()
