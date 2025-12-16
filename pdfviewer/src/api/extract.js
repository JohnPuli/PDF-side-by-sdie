import { BACKEND_URL } from "../config";

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
