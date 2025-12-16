// src/components/PdfPane.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";

export default function PdfPane({
  fileUrl,
  chunks = [],
  selectedChunk = null,
  onReady
}) {
  const containerRef = useRef(null);
  const rafPending = useRef(false);
  const latestSelected = useRef(selectedChunk);

  const [pageViews, setPageViews] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* keep latest selected chunk */
  useEffect(() => {
    latestSelected.current = selectedChunk;
  }, [selectedChunk]);

  /* ---------------- PDF LOAD ---------------- */
  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);

        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjsLib.getDocument(fileUrl).promise;
        if (cancelled) return;

        const container = containerRef.current;
        container.innerHTML = "";

        const views = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport
          }).promise;

          const wrapper = document.createElement("div");
          wrapper.style.position = "relative";
          wrapper.style.marginBottom = "12px";
          wrapper.dataset.pageNumber = i;
          wrapper.appendChild(canvas);

          container.appendChild(wrapper);
          views.push({ pageNumber: i, el: wrapper });
        }

        setPageViews(views);
        setLoading(false);
        onReady?.({ numPages: pdf.numPages });
      } catch (err) {
        console.error(err);
        setError(String(err));
        setLoading(false);
      }
    }

    loadPdf();
    return () => (cancelled = true);
  }, [fileUrl, onReady]);

  /* ------------- BBOX → SCREEN RECT ------------- */
  const rectFromChunk = useCallback(
    (chunk) => {
      if (!containerRef.current) return null;

      const view = pageViews.find(v => v.pageNumber === chunk.page);
      if (!view) return null;

      const containerRect = containerRef.current.getBoundingClientRect();
      const pageRect = view.el.getBoundingClientRect();
      const [x0, y0, x1, y1] = chunk.bbox_normalized;

      return {
        id: chunk.chunk_id,
        page: chunk.page,
        left: pageRect.left - containerRect.left + x0 * pageRect.width,
        top: pageRect.top - containerRect.top + y0 * pageRect.height,
        width: Math.max(2, (x1 - x0) * pageRect.width),
        height: Math.max(2, (y1 - y0) * pageRect.height),
        selected: chunk === latestSelected.current
      };
    },
    [pageViews]
  );

  /* ------------- HIGHLIGHTS ------------- */
  useEffect(() => {
    if (!pageViews.length) return;

    const rects = chunks.map(rectFromChunk).filter(Boolean);
    setHighlights(rects);
  }, [chunks, rectFromChunk, pageViews]);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="pdf-card">
      <div className="pdf-toolbar">
        <div className="title">PDF Viewer</div>
        <div className="controls">
          <div className="small">
            {loading ? "Loading…" : error ? "Error" : "Ready"}
          </div>
        </div>
      </div>

      {!fileUrl ? (
        <div style={{ padding: 16, color: "#6b7280" }}>
          Upload a PDF to begin
        </div>
      ) : (
        <div className="pdf-viewer" style={{ position: "relative" }}>
          {error && (
            <div
              style={{
                padding: 12,
                background: "#fee",
                border: "1px solid #fbb",
                borderRadius: 6,
                margin: 12,
                color: "#600",
                zIndex: 10
              }}
            >
              {error}
            </div>
          )}

          <div
            ref={containerRef}
            style={{
              position: "relative",
              height: "calc(70vh - 48px)",
              overflow: "auto",
              padding: 12
            }}
          />

          {/* highlight overlay */}
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 48,
              right: 12,
              bottom: 12,
              pointerEvents: "none"
            }}
          >
            {highlights.map(h => (
              <div
                key={h.id}
                className="highlight"
                style={{
                  position: "absolute",
                  left: `${h.left}px`,
                  top: `${h.top}px`,
                  width: `${h.width}px`,
                  height: `${h.height}px`,
                  background: h.selected
                    ? "rgba(255,140,0,0.35)"
                    : "rgba(255,255,0,0.25)",
                  border: h.selected ? "2px solid orange" : "none"
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
