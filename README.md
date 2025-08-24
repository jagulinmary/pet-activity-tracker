# Pet Activity Tracker

A lightweight micro‑app for logging pet activities. The goal was to keep it fast, simple, and mobile‑first without adding a database.

**Stack choice:**  
- React (via Vite) for a quick, responsive UI with clean component structure.  
- Node + Express on the backend with in‑memory arrays for data.  
- CSS for accessible, pet‑friendly visuals and a tiny animated bar chart.  

**How to run:**  
1. Start the server  
   bash
   cd server
   npm install
   npm start
     
   Runs on http://localhost:4000

2. Start the client  
   bash
   cd client
   npm install
   npm run dev
    
   Open the given localhost URL (usually http://localhost:5173).

**Trade‑offs:**  
- Data lives only in memory, so it resets on refresh/server restart. This keeps setup simple but isn’t persistent.  
- “AI” chatbot is heuristic, not a true model — it reads today’s logs + chat history for context. This avoids external dependencies but limits sophistication.  
- Reminder is time‑based (18:00 local), so testing requires adjusting system clock or waiting.

The app balances clarity and UX polish with minimal overhead, ideal for a small demo or assignment.
