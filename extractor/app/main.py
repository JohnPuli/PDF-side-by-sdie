import uuid
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool

from .extractor import extract_document
from .db import save_doc_metadata, get_metadata, simple_search
from .highlight import highlight_pdf

UPLOADS = Path("data/uploads")
OUTPUTS = Path("data/outputs")
UPLOADS.mkdir(parents=True, exist_ok=True)
OUTPUTS.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="PDF Extraction Backend")

@app.post("/extract", response_model=None)
async def extract(file: UploadFile = File(...), background: BackgroundTasks = None):
    doc_id = f"{Path(file.filename).stem}-{uuid.uuid4().hex[:8]}"
    pdf_path = UPLOADS / f"{doc_id}.pdf"

    pdf_path.write_bytes(await file.read())

    result = await run_in_threadpool(
        extract_document, str(pdf_path), doc_id, OUTPUTS
    )

    highlight_path = OUTPUTS / f"{doc_id}_highlighted.pdf"
    highlight_pdf(str(pdf_path), result["chunks"], str(highlight_path))

    if background:
        background.add_task(save_doc_metadata, result)
    else:
        save_doc_metadata(result)

    return JSONResponse({
        "doc_id": doc_id,
        "chunks_count": len(result["chunks"]),
        "metadata_url": f"/metadata/{doc_id}",
        "highlighted_pdf": str(highlight_path)
    })

@app.get("/metadata/{doc_id}")
def metadata(doc_id: str):
    return get_metadata(doc_id)

@app.get("/search")
def search(q: str):
    return {"results": simple_search(q)}

@app.get("/")
def root():
    return {
        "service": "PDF Extraction Backend",
        "status": "running",
        "docs": "/docs"
    }

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
