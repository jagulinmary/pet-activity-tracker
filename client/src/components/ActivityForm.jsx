import React, { useState } from "react";

const nowLocalISOString = () => {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0,16); // yyyy-mm-ddThh:mm
};

export default function ActivityForm({ onSaved }) {
  const [petName, setPetName] = useState("");
  const [type, setType] = useState("walk");
  const [amount, setAmount] = useState("");
  const [when, setWhen] = useState(nowLocalISOString());
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!petName.trim()) e.petName = "Pet name is required";
    if (!amount || Number(amount) <= 0) e.amount = "Enter a number > 0";
    if (!when) e.when = "Date/time is required";
    // Future date check (allow up to +1 minute skew)
    const inputDate = new Date(when);
    const now = new Date();
    if (inputDate.getTime() - now.getTime() > 60 * 1000) e.when = "Date/time cannot be in the future";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isoDate = new Date(when).toISOString();
    const body = { petName: petName.trim(), type, amount: Number(amount), isoDate };

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPetName("");
      setAmount("");
      setWhen(nowLocalISOString());
      setType("walk");
      onSaved?.();
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message }));
    }
  };

  const label = type === "walk" ? "Duration (minutes)" : (type === "meal" ? "Quantity (meals)" : "Quantity (doses)");

  return (
    <section className="card">
      <h2>Log an Activity</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        {errors.form && <p role="alert" className="error">{errors.form}</p>}

        <div className="field">
          <label htmlFor="petName">Pet name</label>
          <input
            id="petName"
            placeholder="e.g., Rex"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            aria-invalid={!!errors.petName}
            aria-describedby={errors.petName ? "petName-err" : undefined}
          />
          {errors.petName && <span className="hint" id="petName-err">{errors.petName}</span>}
        </div>

        <div className="field">
          <label htmlFor="type">Activity type</label>
          <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="walk">Walk</option>
            <option value="meal">Meal</option>
            <option value="medication">Medication</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="amount">{label}</label>
          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="e.g., 30"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-err" : undefined}
          />
          {errors.amount && <span className="hint" id="amount-err">{errors.amount}</span>}
        </div>

        <div className="field">
          <label htmlFor="when">Date & time</label>
          <input
            id="when"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            aria-invalid={!!errors.when}
            aria-describedby={errors.when ? "when-err" : undefined}
          />
          {errors.when && <span className="hint" id="when-err">{errors.when}</span>}
        </div>

        <button className="btn" type="submit">Save activity</button>
      </form>
    </section>
  );
}
