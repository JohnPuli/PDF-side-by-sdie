import fitz
from pdf2image import convert_from_path
import pytesseract

def ocr_page(pdf_path, page_index, dpi=200):
    images = convert_from_path(
        pdf_path,
        dpi=dpi,
        first_page=page_index + 1,
        last_page=page_index + 1
    )
    if not images:
        return []

    data = pytesseract.image_to_data(images[0], output_type=pytesseract.Output.DICT)
    blocks = []

    for i, text in enumerate(data["text"]):
        if not text.strip():
            continue
        x, y, w, h = (
            data["left"][i],
            data["top"][i],
            data["width"][i],
            data["height"][i],
        )
        blocks.append({
            "text": text,
            "rect": fitz.Rect(x, y, x + w, y + h),
            "img_size": images[0].size,
        })

    return blocks
