import React, { useMemo } from "react";
import BarChart from "./BarChart.jsx";

export default function Summary({ totals }) {
  const { walkMinutes = 0, meals = 0, meds = 0 } = totals || {};

  const rows = useMemo(() => ([
    { label: "Walk", value: walkMinutes, unit: "min", max: 60 },
    { label: "Meals", value: meals, unit: "", max: 4 },
    { label: "Meds", value: meds, unit: "", max: 4 },
  ]), [walkMinutes, meals, meds]);

  return (
    <>
      <ul className="stats">
        <li><strong>{walkMinutes}</strong><span>min walked</span></li>
        <li><strong>{meals}</strong><span>meals</span></li>
        <li><strong>{meds}</strong><span>meds</span></li>
      </ul>
      <BarChart rows={rows} />
      {walkMinutes + meals + meds === 0 && (
        <p className="muted">No activities yet today. Log the first one above.</p>
      )}
    </>
  );
}
