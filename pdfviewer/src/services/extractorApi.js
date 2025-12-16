const BACKEND_URL = "http://localhost:8000";

export async function extractPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BACKEND_URL}/extract`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Extraction failed");
  }

  return res.json();
}

export async function fetchMetadata(docId) {
  const res = await fetch(`${BACKEND_URL}/metadata/${docId}`);
  if (!res.ok) throw new Error("Failed to fetch metadata");
  return res.json();
}
