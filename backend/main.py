from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import hashlib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_lang_color(lang: str) -> str:
    """Assigns specific neon colors based on the programming language domain."""
    if not lang:
        return '#94a3b8'
    lang_lower = lang.lower()
    if 'python' in lang_lower:
        return '#38bdf8'  # Neon Blue
    elif 'javascript' in lang_lower or 'typescript' in lang_lower:
        return '#f59e0b'  # Bright Amber
    elif 'kotlin' in lang_lower or 'java' in lang_lower:
        return '#a855f7'  # Shadow Purple
    elif 'html' in lang_lower or 'css' in lang_lower:
        return '#ef4444'  # Crimson Red
    return '#22c55e'      # Emerald Green

# In backend/main.py:
@app.get("/api/portfolio")  # Ensure this matches exactly!
def get_global_portfolio(username: str = "kailash6207"):
    # Query all public repositories directly from GitHub API
    url = f"https://api.github.com/users/{username}/repos?per_page=100&sort=created"
    headers = {"Accept": "application/vnd.github.v3+json"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to query GitHub API platform.")
        repos_data = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    nodes = []
    links = []
    lang_groups = {}
    
    # Process repositories as primary nodes
    for index, repo in enumerate(repos_data):
        lang = repo.get('language', 'Code')
        color = generate_lang_color(lang)
        
        # Keep track of indices to build relational language meshes
        if lang not in lang_groups:
            lang_groups[lang] = []
        lang_groups[lang].append(repo['html_url'])
        
        # Normalize structural impact size using repository storage footprint
        repo_size = repo.get('size', 100)
        nodes.append({
            "id": repo['html_url'],
            "label": repo['name'],
            "description": repo.get('description') or "No description provided for this active dungeon artifact.",
            "language": lang,
            "color": color,
            "stars": repo.get('stargazers_count', 0),
            "watchers": repo.get('watchers_count', 0),
            "size": repo_size,
            "created_at": repo.get('created_at'),
            # Distribute nodes across a wider dimensional 3D field matrix
            "fx": (index % 4) * 60 - 90,
            "fz": -(index * 40)
        })
        
    # Interconnect project nodes that share the same language system core
    for lang, repo_urls in lang_groups.items():
        for i in range(len(repo_urls) - 1):
            links.append({
                "source": repo_urls[i],
                "target": repo_urls[i+1]
            })
            
    return {"nodes": nodes, "links": links}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)