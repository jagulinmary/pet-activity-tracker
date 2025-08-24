import React, { useRef, useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Ask me about your pet’s walks, meals, meds, or say 'summary'." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't reply." }]);
    } finally {
      setBusy(false);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <section className="card">
      <h2>AI Chatbot</h2>
      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask about today's activity…"
          aria-label="Chat message"
        />
        <button className="btn" onClick={send} disabled={busy}>{busy ? "…" : "Send"}</button>
      </div>
    </section>
  );
}
