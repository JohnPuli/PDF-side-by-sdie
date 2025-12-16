import fitz

def normalize_bbox(rect: fitz.Rect, page_rect: fitz.Rect):
    return [
        round((rect.x0 - page_rect.x0) / page_rect.width, 6),
        round((rect.y0 - page_rect.y0) / page_rect.height, 6),
        round((rect.x1 - page_rect.x0) / page_rect.width, 6),
        round((rect.y1 - page_rect.y0) / page_rect.height, 6),
    ]
