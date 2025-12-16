import React, { useState } from "react";
import PdfPane from "./components/PdfPane";
import Sidebar from "./components/Sidebar";
import ChatPane from "./components/ChatPane";

export default function App() {
  const [fileUrl, setFileUrl] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1️⃣ Show PDF immediately
    setFileUrl(URL.createObjectURL(file));
    setChunks([]);
    setSelectedChunk(null);

    // 2️⃣ Upload to backend
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/extract", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Backend extraction failed");
      }

      const data = await res.json();

      // 3️⃣ Load chunks from backend
      setChunks(Array.isArray(data.chunks) ? data.chunks : []);
    } catch (err) {
      console.error(err);
      alert("Extraction failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      {/* LEFT COLUMN */}
      <div className="left-col">
        <div style={{ marginBottom: 12 }}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
          />
          {loading && (
            <div className="small" style={{ marginTop: 6 }}>
              Extracting…
            </div>
          )}
        </div>

        <PdfPane
          fileUrl={fileUrl}
          chunks={chunks}
          selectedChunk={selectedChunk}
          onReady={() => {}}
        />

        {/* Chunks BELOW PDF */}
        <Sidebar
          chunks={chunks}
          onSelectChunk={setSelectedChunk}
          onSearch={() => {}}
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="right-col">
        <ChatPane />
      </div>
    </div>
  );
}
