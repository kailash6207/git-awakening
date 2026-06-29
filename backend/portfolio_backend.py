from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="SoloLevelingConstellationAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_lang_color(lang: str, repo_name: str) -> str:
    # Anchor custom neon profiles by core tech stack classification
    name_lower = repo_name.lower()
    if 'lockup' in name_lower:
        return '#38bdf8'  # Neon Cyber Blue
    elif 'xfinance' in name_lower or 'xpense' in name_lower:
        return '#22c55e'  # Emerald Cash Green
    elif 'guardian' in name_lower:
        return '#ef4444'  # Alert Crimson
    
    if not lang: return '#94a3b8'
    lang_lower = lang.lower()
    if 'python' in lang_lower: return '#38bdf8'
    if 'javascript' in lang_lower or 'typescript' in lang_lower: return '#f59e0b'
    if 'kotlin' in lang_lower or 'java' in lang_lower: return '#a855f7'
    if 'html' in lang_lower or 'css' in lang_lower: return '#ef4444'
    return '#22c55e'

@app.get("/")
def read_root():
    return {"status": "ONLINE", "system": "Solo Leveling Core Matrix Gateway Active"}

@app.get("/api/portfolio")
def get_global_portfolio():
    username = "kailash6207"
    url = f"https://api.github.com/users/{username}/repos?per_page=100&sort=created"
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="GitHub Gateway Offline.")
        repos_data = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    nodes = []
    links = []
    lang_groups = {}
    
    for repo in repos_data:
        name = repo['name']
        name_lower = name.lower()
        lang = repo.get('language') or 'Code'
        
        # SIZES FORCED TO MATCH ASSIGNED TIERS DEFINED IN FRONTEND
        # > 5000 is S-Rank, 501 to 5000 is A-Rank, <= 500 is B-Rank
        if any(x in name_lower for x in ['lockup', 'xpense-vault', 'digital-twin', 'voice-assistant', 'aerompc']):
            size = 2500  # Sets up Elite A-Rank Raid parameters
        elif any(x in name_lower for x in ['xfinance', 'guardian', 'spatialhand', 'arduino']):
            size = 120   # Sets up Standard B-Rank Vault parameters
        else:
            size = repo.get('size', 100)
            
        color = generate_lang_color(lang, name)
        
        if lang not in lang_groups:
            lang_groups[lang] = []
        lang_groups[lang].append(repo['html_url'])
        
        nodes.append({
            "id": repo['html_url'],
            "label": name,
            "description": repo.get('description') or "No description provided for this active dungeon artifact.",
            "language": lang,
            "color": color,
            "stars": repo.get('stargazers_count', 0),
            "watchers": repo.get('watchers_count', 0),
            "size": size,
            "created_at": repo.get('created_at')
        })
        
    for lang, repo_urls in lang_groups.items():
        for i in range(len(repo_urls) - 1):
            links.append({
                "source": repo_urls[i],
                "target": repo_urls[i+1]
            })
            
    return {"nodes": nodes, "links": links}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8585)