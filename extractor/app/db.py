import json
from pathlib import Path

DATA_DIR = Path("data/outputs")
INDEX = DATA_DIR / "index.json"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def load_index():
    if INDEX.exists():
        return json.loads(INDEX.read_text())
    return {}

def save_index(idx):
    INDEX.write_text(json.dumps(idx, indent=2))

def save_doc_metadata(result):
    idx = load_index()
    idx[result["doc_id"]] = {
        "chunks": len(result["chunks"]),
        "json": result["json"],
        "parquet": result["parquet"]
    }
    save_index(idx)

def get_metadata(doc_id):
    idx = load_index()
    return idx.get(doc_id)

def simple_search(q):
    q = q.lower()
    results = []
    for f in DATA_DIR.glob("*.json"):
        data = json.loads(f.read_text())
        for c in data:
            if q in c["text"].lower():
                results.append(c)
    return results[:20]
