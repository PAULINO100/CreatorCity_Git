import os
import json
import time
import requests
import networkx as nx
import community.community_louvain as community_louvain
import matplotlib.pyplot as plt

# Global stats counters
cache_hits = 0
api_calls = 0
bots_filtered = 0

BOTS = {
    "dependabot", "renovate", "github-actions",
    "snyk-bot", "greenkeeper", "imgbot",
    "allcontributors", "github-actions[bot]"
}

# Cache to avoid duplicate full API calls for identical repos
repo_contributors_cache = {}

def safe_request(url, headers):
    global api_calls
    try:
        api_calls += 1
        resp = requests.get(url, headers=headers)
        time.sleep(1.2)
        
        if resp.status_code == 200:
            return resp.json(), resp.headers
        elif resp.status_code == 401:
            if "Bad credentials" in resp.text:
                print("Bad credentials in GITHUB_TOKEN!")
            return None, resp.headers
        elif resp.status_code in (403, 429):
            print(f"Rate limit hit at {url}")
            time.sleep(2)
            return None, resp.headers
        return None, resp.headers
    except Exception as e:
        print(f"Error requesting {url}: {e}")
        return None, {}

def collect_data():
    global cache_hits, bots_filtered
    
    input_file = "atlas_data.json"
    if not os.path.exists(input_file):
        print(f"File {input_file} not found!")
        return {}
        
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    token = os.environ.get("GITHUB_TOKEN", "")
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "AtlasCity-Cluster-Script"
    }
    if token:
        headers["Authorization"] = f"token {token}"
        
    users_processed = 0
    total_users = len(data)
    
    for username, info in data.items():
        users_processed += 1
        print(f"[{users_processed}/{total_users}] Collecting data for {username}...")
        
        # 1. Get Top 10 repos with most stars
        repos_url = f"https://api.github.com/users/{username}/repos?sort=stars&per_page=10"
        repos_data, _ = safe_request(repos_url, headers)
        
        top_repos = []
        if repos_data:
            for r in repos_data:
                repo_stars = r.get("stargazers_count", 0)
                
                # Rule: THRESHOLD DE STARS
                if repo_stars < 30:
                    continue
                    
                repo_name = r.get("name")
                repo_full_name = r.get("full_name", f"{username}/{repo_name}")
                top_repos.append({"full_name": repo_full_name, "stars": repo_stars})
                
        if "collab_repos" not in info:
            info["collab_repos"] = []
            
        # 2. Get top 10 contributors for each repo
        for repo in top_repos:
            repo_full_name = repo["full_name"]
            repo_stars = repo["stars"]
            
            contributors_url = f"https://api.github.com/repos/{repo_full_name}/contributors?per_page=10"
            
            # Rule: CACHE DE REPOSITÓRIOS
            if repo_full_name in repo_contributors_cache:
                cache_hits += 1
                contributors = repo_contributors_cache[repo_full_name]
            else:
                contributors_data, _ = safe_request(contributors_url, headers)
                if contributors_data:
                    repo_contributors_cache[repo_full_name] = contributors_data
                    contributors = contributors_data
                else:
                    contributors = []
                    
            if contributors:
                for c in contributors:
                    # Rule: FILTRO DE BOTS
                    if c.get("type") != "User":
                        continue
                    login = c.get("login", "")
                    if login.lower() in BOTS or login.endswith("[bot]"):
                        bots_filtered += 1
                        continue
                        
                    contributor_login = login
                    if contributor_login and contributor_login in data and contributor_login != username:
                        # Save mutual collaboration in user info
                        info["collab_repos"].append({
                            "collaborator": contributor_login,
                            "repo": repo_full_name,
                            "stars": repo_stars
                        })
                        
    return data

def build_graph(data):
    G = nx.Graph()
    for u in data.keys():
        G.add_node(u)
        
    users = list(data.keys())
    for i in range(len(users)):
        u1 = users[i]
        info1 = data[u1]
        for j in range(i+1, len(users)):
            u2 = users[j]
            info2 = data[u2]
            
            weight = 0
            
            # V1 Signals
            # 1. Linguagens em comum: peso 3
            langs1 = set(info1.get("languages", []))
            langs2 = set(info2.get("languages", []))
            weight += len(langs1.intersection(langs2)) * 3
            
            # 2. Organizações em comum: peso 5
            orgs1 = set(info1.get("organizations", []))
            orgs2 = set(info2.get("organizations", []))
            weight += len(orgs1.intersection(orgs2)) * 5
            
            # 3. Tópicos em comum: peso 2
            topics1 = set(info1.get("topics", []))
            topics2 = set(info2.get("topics", []))
            weight += len(topics1.intersection(topics2)) * 2
            
            # V2 Signals
            # 4. Colaboração real (peso 8) e stars > 100 (peso 4)
            u1_collabs = info1.get("collab_repos", [])
            for c in u1_collabs:
                if c["collaborator"] == u2:
                    weight += 8
                    if c["stars"] > 100:
                        weight += 4
                        
            u2_collabs = info2.get("collab_repos", [])
            for c in u2_collabs:
                if c["collaborator"] == u1:
                    weight += 8
                    if c["stars"] > 100:
                        weight += 4
            
            if weight > 0:
                G.add_edge(u1, u2, weight=weight)
                
    return G

def main():
    print("Collecting data...")
    try:
        with open("atlas_data.json", "r", encoding="utf-8") as f:
            v1_data = json.load(f)
            v1_clusters = set()
            for k, v in v1_data.items():
                if "cluster" in v:
                    v1_clusters.add(v["cluster"])
            num_v1_clusters = len(v1_clusters)
    except:
        num_v1_clusters = 0

    data = collect_data()
    print("Building graph...")
    G = build_graph(data)
    
    print("Running clustering...")
    try:
        partition = community_louvain.best_partition(G, weight='weight')
        clusters_v2 = set(partition.values())
        num_v2_clusters = len(clusters_v2)
    except Exception as e:
        print(f"Error in louvain clustering: {e}")
        partition = {u: 0 for u in data.keys()}
        num_v2_clusters = 1
    
    for u, cluster_id in partition.items():
        if u in data:
            data[u]["cluster_v2"] = cluster_id
            
    # Save JSON v2
    with open("atlas_data_v2.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
    print("Generating plot...")
    plt.figure(figsize=(12, 12))
    pos = nx.spring_layout(G, k=0.15, iterations=20, weight='weight')
    
    import matplotlib.cm as cm
    cmap = cm.get_cmap('viridis', max(list(partition.values()) + [0]) + 1)
    
    nx.draw_networkx_nodes(G, pos, nodelist=list(partition.keys()), node_size=40,
                           cmap=cmap, node_color=list(partition.values()))
    nx.draw_networkx_edges(G, pos, alpha=0.1)
    plt.axis('off')
    plt.savefig("atlas_clusters_v2.png", dpi=150, bbox_inches='tight')
    plt.close()
    
    print("\n--- RESULTS ---")
    print(f"Cache hits: {cache_hits}")
    print(f"API calls: {api_calls}")
    print(f"Bots filtrados: {bots_filtered}")
    print(f"CLUSTERS_V2: {num_v2_clusters}")
    print(f"CLUSTERS_MUDARAM_AGORA: {'YES' if num_v1_clusters != num_v2_clusters else 'NO'}")
    
if __name__ == "__main__":
    main()
