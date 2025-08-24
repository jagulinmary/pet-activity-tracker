import express from "express";
import cors from "cors";
import morgan from "morgan";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 4000;

// --- In-memory stores ---
const activities = []; 
const chats = []; 

app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

const ActivitySchema = z.object({
  petName: z.string().min(1, "Pet name is required").max(50),
  type: z.enum(["walk", "meal", "medication"]),
  amount: z.number().positive("Must be > 0"),
  isoDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Invalid date/time",
  }),
});

// Health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Create activity
app.post("/api/activities", (req, res) => {
  try {
   
    if (typeof req.body.amount === "string") {
      req.body.amount = Number(req.body.amount);
    }
    const parsed = ActivitySchema.parse(req.body);

    const when = new Date(parsed.isoDate);
    const now = new Date();
    if (when.getTime() - now.getTime() > 60 * 1000) {
      
      return res
        .status(400)
        .json({ error: "Date/time cannot be in the future." });
    }

    const item = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...parsed,
    };
    activities.push(item);
    res.status(201).json(item);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors[0].message });
    }
    console.error(e);
    res.status(500).json({ error: "Unexpected error" });
  }
});


app.get("/api/activities", (req, res) => {
  const { date } = req.query;
  if (!date) return res.json(activities);

  const start = new Date(date + "T00:00:00");
  const end = new Date(date + "T23:59:59.999");
  const filtered = activities.filter((a) => {
    const t = new Date(a.isoDate);
    return t >= start && t <= end;
  });
  res.json(filtered);
});

// Today's summary
app.get("/api/summary/today", (req, res) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const start = new Date(dateStr + "T00:00:00");
  const end = new Date(dateStr + "T23:59:59.999");

  let totalWalkMins = 0;
  let meals = 0;
  let meds = 0;

  const todays = activities.filter((a) => {
    const t = new Date(a.isoDate);
    return t >= start && t <= end;
  });

  todays.forEach((a) => {
    if (a.type === "walk") totalWalkMins += a.amount;
    if (a.type === "meal") meals += a.amount;
    if (a.type === "medication") meds += a.amount;
  });

  res.json({
    date: dateStr,
    totals: { walkMinutes: totalWalkMins, meals, meds },
    activities: todays,
  });
});

app.post("/api/chat", (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  const now = new Date();
  chats.push({ timestamp: now.toISOString(), role: "user", message });

  // Build a lightweight context string from today's summary + last 5 messages
  const nowY = now.getFullYear();
  const nowM = String(now.getMonth() + 1).padStart(2, "0");
  const nowD = String(now.getDate()).padStart(2, "0");
  const start = new Date(`${nowY}-${nowM}-${nowD}T00:00:00`);
  const end = new Date(`${nowY}-${nowM}-${nowD}T23:59:59.999`);

  let totalWalkMins = 0, meals = 0, meds = 0;
  const todays = activities.filter((a) => {
    const t = new Date(a.isoDate);
    return t >= start && t <= end;
  });
  todays.forEach((a) => {
    if (a.type === "walk") totalWalkMins += a.amount;
    if (a.type === "meal") meals += a.amount;
    if (a.type === "medication") meds += a.amount;
  });

  const lastMsgs = chats.slice(-5).map(c => `${c.role}: ${c.message}`).join(" | ");

  
  let ai = "";
  if (/walk/i.test(message) && totalWalkMins === 0) {
    ai = "No walks logged yet today. A 20–30 minute walk would be great.";
  } else if (/walk/i.test(message)) {
    ai = `Today's total walk time is ${totalWalkMins} min.`;
  } else if (/meal|food/i.test(message)) {
    ai = `Meals recorded today: ${meals}.`;
  } else if (/med|pill|medicine/i.test(message)) {
    ai = `Medication doses recorded today: ${meds}.`;
  } else if (/summary|today/i.test(message)) {
    ai = `Today: walk ${totalWalkMins} min, meals ${meals}, meds ${meds}.`;
  } else {
    ai = "I'm tracking activities and can answer about walks, meals, meds, or give you today's summary.";
  }

  const assistantMessage = `Context-aware reply → ${ai}`;
  chats.push({ timestamp: now.toISOString(), role: "assistant", message: assistantMessage });

  res.json({
    reply: assistantMessage,
    memory: {
      today: { walkMinutes: totalWalkMins, meals, meds },
      lastMessages: lastMsgs
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
