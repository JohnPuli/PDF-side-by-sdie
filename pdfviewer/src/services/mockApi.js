// src/services/mockApi.js
const MOCK_CHUNKS_TEMPLATE = [
  {
    chunk_id: "doc1_p1_c1",
    page: 1,
    bbox_normalized: [0.10, 0.12, 0.85, 0.18],
    text: "Introduction: This document explains the pump inspection procedure."
  },
  {
    chunk_id: "doc1_p2_c1",
    page: 2,
    bbox_normalized: [0.10, 0.22, 0.88, 0.28],
    text: "Step 1: Shut down the pump and record the serial number."
  },
  {
    chunk_id: "doc1_p3_c1",
    page: 3,
    bbox_normalized: [0.12, 0.45, 0.64, 0.52],
    text: "Check the gasket and seals for visible leakage."
  },
  {
    chunk_id: "doc1_p4_c1",
    page: 4,
    bbox_normalized: [0.10, 0.35, 0.80, 0.41],
    text: "Measure and record the pump temperature (°C)."
  }
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function fetchMetadata(docId = "doc1") {
  await sleep(200);
  const chunks = MOCK_CHUNKS_TEMPLATE.map(c => ({ ...c }));
  return { doc_id: docId, chunks };
}

export async function search(query = "") {
  await sleep(150);
  const q = (query || "").toLowerCase().trim();
  const results = MOCK_CHUNKS_TEMPLATE
    .filter(c => q === "" || c.text.toLowerCase().includes(q))
    .map((c, i) => ({ ...c, score: Math.max(0, 1 - i * 0.15) }));
  return { query, results };
}

export async function extractMock(file) {
  await sleep(600);
  if (!file) {
    return { doc_id: "unknown", chunks: MOCK_CHUNKS_TEMPLATE.map(c => ({ ...c })) };
  }

  const safeName = (file.name || "uploaded.pdf").replace(/\s+/g, "_").replace(/[^\w\-_\.]/g, "");
  const docId = `doc_${safeName}_${Date.now()}`;

  const defaultChunkCount = 4;
  const sizeKb = Math.max(1, Math.round((file.size || 0) / 1024));
  const extra = Math.min(6, Math.floor(sizeKb / 50));
  const count = Math.max(1, defaultChunkCount + extra);

  const generated = [];
  for (let i = 0; i < count; i++) {
    const page = i + 1;
    const nx0 = 0.08 + (i % 3) * 0.02;
    const ny0 = 0.10 + (i * 0.08) % 0.6;
    const nx1 = Math.min(0.96, nx0 + 0.8 - (i % 2) * 0.1);
    const ny1 = Math.min(0.92, ny0 + 0.06 + ((i % 2) * 0.02));
    const text = `Extracted chunk ${i+1} from ${file.name} (simulated) — summary text for UI testing.`;

    generated.push({
      chunk_id: `${docId}_p${page}_c${i+1}`,
      page,
      bbox_normalized: [Number(nx0.toFixed(3)), Number(ny0.toFixed(3)), Number(nx1.toFixed(3)), Number(ny1.toFixed(3))],
      text
    });
  }

  return { doc_id: docId, chunks: generated };
}

export default {
  fetchMetadata,
  search,
  extractMock
};
