import json
import csv
import sys

input_file = r"c:\Users\pauli\OneDrive\Documentos\Google Antigravity\opengravity\atlas_data.json"
output_file = r"c:\Users\pauli\OneDrive\Documentos\Google Antigravity\opengravity\atlas_export.csv"

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

users_exported = 0
clusters_found = set()

with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['username', 'cluster', 'total_stars', 'top_language'])
    
    for username, info in data.items():
        cluster = info.get('cluster', '')
        total_stars = info.get('total_stars', 0)
        languages = info.get('languages', [])
        
        top_language = ""
        if isinstance(languages, list) and len(languages) > 0:
            top_language = languages[0]
            
        writer.writerow([username, cluster, total_stars, top_language])
        
        users_exported += 1
        if cluster != '':
            clusters_found.add(int(cluster))

print(f"USUARIOS_EXPORTADOS: {users_exported}")
print(f"CLUSTERS_ENCONTRADOS: {sorted(list(clusters_found))}")
print(f"ARQUIVO_GERADO: atlas_export.csv YES")
