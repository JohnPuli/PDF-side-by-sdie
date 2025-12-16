import fitz

def highlight_pdf(input_pdf, chunks, output_pdf):
    doc = fitz.open(input_pdf)

    for ch in chunks:
        page = doc[ch["page"] - 1]
        x0, y0, x1, y1 = ch["bbox_abs"]
        rect = fitz.Rect(x0, y0, x1, y1)
        annot = page.add_highlight_annot(rect)
        annot.update()

    doc.save(output_pdf)
