import uuid
from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from .extractor import extract_document
from .db import save_doc_metadata, get_metadata, simple_search
from .highlight import highlight_pdf

UPLOADS = Path("/tmp/uploads")
OUTPUTS = Path("/tmp/outputs")
UPLOADS.mkdir(parents=True, exist_ok=True)
OUTPUTS.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="PDF Extraction Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/extract")
async def extract(file: UploadFile = File(...)):
    doc_id = f"{Path(file.filename).stem}-{uuid.uuid4().hex[:8]}"
    pdf_path = UPLOADS / f"{doc_id}.pdf"

    pdf_path.write_bytes(await file.read())

    result = await run_in_threadpool(
        extract_document, str(pdf_path), doc_id, OUTPUTS
    )

    highlight_path = OUTPUTS / f"{doc_id}_highlighted.pdf"
    highlight_pdf(str(pdf_path), result["chunks"], str(highlight_path))

    save_doc_metadata(result)

    return {
        "doc_id": doc_id,
        "chunks_count": len(result["chunks"])
    }

@app.get("/api/metadata/{doc_id}")
def metadata(doc_id: str):
    return get_metadata(doc_id)

@app.get("/api/search")
def search(q: str):
    return {"results": simple_search(q)}

@app.get("/api")
def root():
    return {"status": "running"}
