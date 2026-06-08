import requests
import json

url = 'http://localhost:3000/api/upload-csv'
filepath = 'upload/simulasi_kuadran_I.csv'

print(f"Uploading {filepath} to {url}...")
with open(filepath, 'rb') as f:
    files = {'file': (filepath, f, 'text/csv')}
    r = requests.post(url, files=files)
    
print("Status Code:", r.status_code)
try:
    print("Response JSON:")
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print("Response Text:", r.text)
