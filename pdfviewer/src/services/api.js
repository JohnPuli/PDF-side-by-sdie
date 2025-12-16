const API_BASE = "http://127.0.0.1:8000";

export async function extractPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/extract`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Extraction failed");
  }

  return res.json();
}

export async function fetchMetadata(docId) {
  const res = await fetch(`${API_BASE}/metadata/${docId}`);
  return res.json();
}
