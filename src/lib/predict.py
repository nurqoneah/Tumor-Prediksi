import sys
import os
import json
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
        first_line_str = lines[0]
        delimiter = ';' if ';' in first_line_str else ','
        first_line = first_line_str.split(delimiter)
        has_header = False
        try:
            float(first_line[0].replace('"', '').strip())
        except ValueError:
            has_header = True
            
        start_idx = 1 if has_header else 0
        
        for line in lines[start_idx:]:
            row = line.split(delimiter)
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

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided"}))
        sys.exit(1)
        
    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(json.dumps({"success": False, "error": f"File does not exist: {filepath}"}))
        sys.exit(1)
        
    # Load model
    # Script runs from process.cwd() which is project root, so path is src/lib/tumor_model.joblib
    # But let's build absolute path based on script location to make it bulletproof!
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'tumor_model.joblib')
    
    if not os.path.exists(model_path):
        print(json.dumps({"success": False, "error": f"Model file not found: {model_path}"}))
        sys.exit(1)
        
    try:
        model = joblib.load(model_path)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Failed to load model: {str(e)}"}))
        sys.exit(1)
        
    # Parse CSV
    try:
        parsed = parse_csv_file(filepath)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Failed to parse CSV file: {str(e)}"}))
        sys.exit(1)
        
    if parsed is None:
        print(json.dumps({"success": False, "error": "CSV file does not contain valid frequency and dB data"}))
        sys.exit(1)
        
    freqs, dbs = parsed
    
    # Preprocess
    try:
        db_interp = np.interp(TARGET_FREQS, freqs, dbs)
        features = db_interp.reshape(1, -1)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Failed to preprocess features: {str(e)}"}))
        sys.exit(1)
        
    # Predict
    try:
        pred_idx = model.predict(features)[0]
        probs = model.predict_proba(features)[0]
        confidence = float(probs[pred_idx])
        classification = CLASSES[pred_idx]
        
        # Return success response
        print(json.dumps({
            "success": True,
            "prediction": classification,
            "confidence": confidence
        }))
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Inference failed: {str(e)}"}))
        sys.exit(1)

if __name__ == '__main__':
    main()
