# Shamba Sense — Frontend

React (Vite) frontend for Shamba Sense. Shows a 7-day farm calendar with
plant / wait / irrigate / harvest recommendations, driven by Conduit
weather station data.

## Running it

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Connecting to the backend

By default this looks for the Flask backend at `http://localhost:5000`.
If Elsie's backend runs elsewhere, create a `.env` file in this folder:

```
VITE_API_BASE=http://<her-ip-or-host>:5000
```

**If the backend isn't running yet, or Conduit access isn't live**, the app
automatically falls back to realistic mock data (see `src/mockData.js`) so
the UI is always demoable. You'll see a "Preview data" badge in the header
when this happens, and "Live Conduit data" once the real backend responds.

## Data contract expected from the backend

`GET /api/forecast` should return a JSON array like:

```json
[
  {
    "date": "2026-07-21",
    "action": "irrigate",
    "reason": "Low humidity, no rainfall forecast in next 48 hours",
    "temp_c": 24,
    "rainfall_pct": 12,
    "humidity_pct": 38
  }
]
```

`action` must be one of: `plant`, `wait`, `irrigate`, `harvest` — the UI
colors and icons are keyed off these exact strings.

## Files that matter

- `src/App.jsx` — main calendar view
- `src/App.css` — all styling (design tokens at the top)
- `src/api.js` — fetch logic + mock fallback
- `src/mockData.js` — placeholder data matching the agreed contract

## Building for the demo

```bash
npm run build
```

Outputs a production build to `dist/` — not needed for the hackathon demo
itself (dev server is fine to present from), but useful if you want to
host it somewhere.
