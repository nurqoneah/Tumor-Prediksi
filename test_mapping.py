import os

def label_from_path(root, filename):
    root_lower = root.replace('\\', '/').lower()
    
    # Check if 'tanpa tumor' is in the path
    if 'tanpa tumor' in root_lower or 'tanpa_tumor' in root_lower:
        return 'tanpa_tumor'
        
    # Check if 'tumor di tengah' or 'dengan tumor' is in path
    if 'tumor di tengah' in root_lower or 'dengan_tumor' in root_lower or 'dengan tumor' in root_lower:
        return 'dengan_tumor'
    
    # Check for specific quadrants in reverse order (IV, III, II, I) to avoid substring match bugs
    if 'kuadran iv' in root_lower or 'kuadran_iv' in root_lower or 'kuadaran iv' in root_lower:
        if 'tumor di kuadran iv' in root_lower:
            return 'kuadran_IV'
        elif '2 tumor' in root_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'

    if 'kuadran iii' in root_lower or 'kuadran_iii' in root_lower:
        if 'tumor di kuadran iii' in root_lower:
            return 'kuadran_III'
        elif '2 tumor' in root_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'

    if 'kuadran ii' in root_lower or 'kuadran_ii' in root_lower or 'kuadaran ii' in root_lower:
        if 'tumor di kuadran ii' in root_lower:
            return 'kuadran_II'
        elif '2 tumor' in root_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'

    if 'kuadran i' in root_lower or 'kuadran_i' in root_lower:
        if 'tumor di kuadran i' in root_lower:
            return 'kuadran_I'
        elif '2 tumor' in root_lower:
            return 'dengan_tumor'
        else:
            return 'tanpa_tumor'
            
    return 'tanpa_tumor'

counts = {}
for root, dirs, files in os.walk('Data'):
    for file in files:
        if file.endswith('.csv'):
            lbl = label_from_path(root, file)
            counts[lbl] = counts.get(lbl, 0) + 1

print("--- Class distributions on Dataset ---")
for k, v in sorted(counts.items()):
    print(f"  {k}: {v} files")
