import React, { useEffect, useMemo, useState } from "react";
import ActivityForm from "./components/ActivityForm.jsx";
import Summary from "./components/Summary.jsx";
import Chatbot from "./components/Chatbot.jsx";
import ReminderBanner from "./components/ReminderBanner.jsx";

export default function App() {
  const [summary, setSummary] = useState({ totals: { walkMinutes: 0, meals: 0, meds: 0 }, activities: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/summary/today");
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      setError("Unable to load summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const hasWalkToday = useMemo(() => (summary?.totals?.walkMinutes || 0) > 0, [summary]);

  return (
    <div className="app">
      <header className="header">
        <span className="logo">🐾</span>
        <h1>Pet Activity Tracker</h1>
      </header>

      <main className="container">
        <ReminderBanner hasWalkToday={hasWalkToday} />

        <ActivityForm onSaved={fetchSummary} />

        <section aria-live="polite" className="card">
          <h2>Today’s Summary</h2>
          {loading ? <p>Loading…</p> : error ? <p role="alert" className="error">{error}</p> : (
            <Summary totals={summary.totals} />
          )}
        </section>

        <Chatbot />
      </main>

      <footer className="footer">
        <small>All data stored in-memory — resets on refresh/server restart.</small>
      </footer>
    </div>
  );
}
