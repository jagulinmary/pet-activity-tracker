import React, { useEffect, useRef } from "react";

export default function BarChart({ rows }) {
  return (
    <div className="bars" role="img" aria-label="Activity bars visualization">
      {rows.map((row) => {
        const pct = Math.min(100, Math.round((row.value / (row.max || 1)) * 100));
        return (
          <Bar key={row.label} label={row.label} pct={pct} value={row.value} unit={row.unit} />
        );
      })}
    </div>
  );
}

function Bar({ label, pct, value, unit }) {
  const barRef = useRef(null);
  useEffect(() => {
    // trigger animation by setting width after mount
    const el = barRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.style.width = pct + "%";
      });
    }
  }, [pct]);
  return (
    <div className="bar">
      <div className="bar-label">
        <span>{label}</span>
        <span className="bar-value">{value}{unit}</span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" ref={barRef} />
      </div>
    </div>
  );
}
