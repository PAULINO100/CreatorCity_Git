import json
import csv
import os

def main():
    if not os.path.exists('atlas_data.json'):
        print("atlas_data.json not found")
        return

    with open('atlas_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    clusters = set()
    exported_count = 0
    with open('atlas_export.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['username', 'cluster', 'total_stars', 'top_language'])
        for username, info in data.items():
            cluster = info.get('cluster', 'N/A')
            clusters.add(cluster)
            total_stars = info.get('total_stars', 0)
            langs = info.get('languages', [])
            top_language = langs[0] if langs else ''
            writer.writerow([username, cluster, total_stars, top_language])
            exported_count += 1

    print(f"USUARIOS_EXPORTADOS: {exported_count}")
    print(f"CLUSTERS_ENCONTRADOS: {sorted(list(clusters))}")
    print(f"ARQUIVO_GERADO: atlas_export.csv {'YES' if os.path.exists('atlas_export.csv') else 'NO'}")

if __name__ == '__main__':
    main()
