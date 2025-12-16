import { BACKEND_URL } from "../config";

export async function fetchMetadata(docId) {
  const res = await fetch(`${BACKEND_URL}/metadata/${docId}`);
  if (!res.ok) throw new Error("Metadata fetch failed");
  return res.json();
}
