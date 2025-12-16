import fitz
import pandas as pd
from datetime import datetime
from pathlib import Path

from .ocr import ocr_page
from .utils import normalize_bbox

def extract_document(pdf_path, doc_id, out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    chunks = []

    for pno in range(len(doc)):
        page = doc[pno]
        page_rect = page.rect

        blocks = []
        text_dict = page.get_text("dict")

        for b in text_dict.get("blocks", []):
            if b["type"] != 0:
                continue
            text = " ".join(span["text"] for line in b["lines"] for span in line["spans"])
            if not text.strip():
                continue
            rect = fitz.Rect(b["bbox"])
            blocks.append({"text": text, "rect": rect})

        if not blocks:
            ocr_blocks = ocr_page(pdf_path, pno)
            for ob in ocr_blocks:
                blocks.append(ob)

        for idx, blk in enumerate(blocks):
            bbox_norm = normalize_bbox(blk["rect"], page_rect)
            chunks.append({
                "chunk_id": f"{doc_id}_p{pno+1}_c{idx+1}",
                "page": pno + 1,
                "bbox_normalized": bbox_norm,
                "bbox_abs": [blk["rect"].x0, blk["rect"].y0, blk["rect"].x1, blk["rect"].y1],
                "text": blk["text"],
                "created_at": datetime.utcnow().isoformat()
            })

    df = pd.DataFrame(chunks)
    parquet = out_dir / f"{doc_id}.parquet"
    jsonf = out_dir / f"{doc_id}.json"

    df.to_parquet(parquet, index=False)
    df.to_json(jsonf, orient="records", indent=2)

    return {
        "doc_id": doc_id,
        "chunks": chunks,
        "json": f"{doc_id}.json",
        "parquet": None
    }
