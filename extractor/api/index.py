from fastapi import FastAPI, UploadFile, File
import os
import shutil

app = FastAPI(title="PDF Extraction Backend")

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # TODO: call your real extraction logic here
    return {
        "filename": file.filename,
        "chunks": []  # replace with real chunks later
    }

@app.get("/health")
def health():
    return {"status": "ok"}
