# Pet Activity Tracker — Server

Simple Node + Express API with in-memory storage.

## Endpoints
- `GET /api/health` — healthcheck
- `POST /api/activities` — create activity
  - body: `{ petName, type: "walk"|"meal"|"medication", amount:number, isoDate:string }`
- `GET /api/activities?date=YYYY-MM-DD` — list activities (optional date filter)
- `GET /api/summary/today` — totals + today's activities
- `POST /api/chat` — very simple contextual "AI" based on chat + activities

> Note: Data is in-memory and resets when the server restarts.

## Run
bash
npm i
npm run start

