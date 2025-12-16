import React from "react";

export default function OverlayHighlight({ highlights = [] }) {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      {highlights.map(h => (
        <div key={h.id} style={{
          position: "absolute",
          left: `${h.left}px`,
          top: `${h.top}px`,
          width: `${h.width}px`,
          height: `${h.height}px`,
          border: "2px solid rgba(11,103,255,0.95)",
          background: "rgba(11,103,255,0.12)",
          borderRadius: 6
        }} />
      ))}
    </div>
  );
}
