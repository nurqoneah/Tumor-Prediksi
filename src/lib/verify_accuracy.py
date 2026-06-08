import os
import glob
import numpy as np
import joblib

CLASSES = ['tanpa_tumor', 'dengan_tumor', 'kuadran_I', 'kuadran_II', 'kuadran_III', 'kuadran_IV']
TARGET_FREQS = np.linspace(1.5, 4.4, 30)

def parse_csv_file(filepath):
    freqs = []
    dbs = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.strip().split('\n')
        if not lines:
            return None
        
        # Check if first line contains header
        first_line = lines[0].split(',')
        has_header = False
        try:
            float(first_line[0].replace('"', '').strip())
        except ValueError:
            has_header = True
            
        start_idx = 1 if has_header else 0
        
        for line in lines[start_idx:]:
            row = line.split(',')
            if len(row) < 2:
                continue
            try:
                freq = float(row[0].replace('"', '').strip())
                db = float(row[1].replace('"', '').strip())
                freqs.append(freq)
                dbs.append(db)
            except ValueError:
                pass
                
    if len(freqs) == 0:
        return None
        
    return np.array(freqs), np.array(dbs)

def label_from_path(root, filename):
    # Combine root and filename to check labels
    path_lower = os.path.join(root, filename).replace('\\', '/').lower()
    
    # Check if 'tanpa'/'baseline' is in the path or filename
    if 'tanpa' in path_lower or 'tanpa_tumor' in path_lower:
        return 'tanpa_tumor'
        
    # Check if 'tumor di tengah' or 'dengan tumor' is in path/filename
    if 'tumor di tengah' in path_lower or 'dengan_tumor' in path_lower or 'dengan tumor' in path_lower:
        return 'dengan_tumor'
    
    # Check for specific quadrants in reverse order (IV, III, II, I) to avoid substring matches
    if 'kuadran iv' in path_lower or 'kuadran_iv' in path_lower or 'kuadaran iv' in path_lower:
        if 'tumor di kuadran iv' in path_lower or 'kuadran_iv.csv' in path_lower or 'kuadran  iv.csv' in path_lower:
            return 'kuadran_IV'
        elif '2 tumor' in path_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'

    if 'kuadran iii' in path_lower or 'kuadran_iii' in path_lower:
        if 'tumor di kuadran iii' in path_lower or 'kuadran_iii.csv' in path_lower:
            return 'kuadran_III'
        elif '2 tumor' in path_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'

    if 'kuadran ii' in path_lower or 'kuadran_ii' in path_lower or 'kuadaran ii' in path_lower:
        if 'tumor di kuadran ii' in path_lower or 'kuadran_ii.csv' in path_lower:
            return 'kuadran_II'
        elif '2 tumor' in path_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'

    if 'kuadran i' in path_lower or 'kuadran_i' in path_lower:
        if 'tumor di kuadran i' in path_lower or 'kuadran_i.csv' in path_lower:
            return 'kuadran_I'
        elif '2 tumor' in path_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'
            
    return 'tanpa_tumor'

def verify():
    model_path = os.path.join('src', 'lib', 'tumor_model.joblib')
    if not os.path.exists(model_path):
        print(f"Model file not found: {model_path}")
        return
        
    model = joblib.load(model_path)
    print("Loaded model. Running verification on upload/*.csv files...")
    
    total = 0
    correct = 0
    
    for filepath in sorted(glob.glob('upload/*.csv')):
        filename = os.path.basename(filepath)
        if 'simulasi' not in filename.lower():
            continue
            
        expected_label = label_from_path('upload', filename)
        parsed = parse_csv_file(filepath)
        if parsed is None:
            print(f"Failed to parse {filename}")
            continue
            
        freqs, dbs = parsed
        db_interp = np.interp(TARGET_FREQS, freqs, dbs)
        
        # Predict
        features = db_interp.reshape(1, -1)
        pred_idx = model.predict(features)[0]
        pred_label = CLASSES[pred_idx]
        probs = model.predict_proba(features)[0]
        conf = probs[pred_idx]
        
        is_correct = (pred_label == expected_label)
        total += 1
        if is_correct:
            correct += 1
            
        status = "PASSED" if is_correct else "FAILED"
        print(f"File: {filename:35} | Expected: {expected_label:12} | Predicted: {pred_label:12} | Conf: {conf*100:5.1f}% | {status}")
        
    print(f"\nVerification accuracy: {correct}/{total} ({correct/total*100:.2f}%)")

if __name__ == '__main__':
    verify()
