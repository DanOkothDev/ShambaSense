// Mock forecast data — matches the contract agreed with backend (Elsie).
// Swap this out once GET /api/forecast is live; shape stays identical.

export const mockForecast = [
  {
    date: "2026-07-20",
    action: "irrigate",
    reason: "Low humidity and no rainfall forecast — irrigate today",
    temp_c: 24,
    rainfall_pct: 8,
    humidity_pct: 34,
  },
  {
    date: "2026-07-21",
    action: "plant",
    reason: "Good soil moisture, low rain risk — safe to plant",
    temp_c: 22,
    rainfall_pct: 15,
    humidity_pct: 64,
  },
  {
    date: "2026-07-22",
    action: "wait",
    reason: "High rainfall expected — delay planting to avoid waterlog",
    temp_c: 19,
    rainfall_pct: 72,
    humidity_pct: 81,
  },
  {
    date: "2026-07-23",
    action: "wait",
    reason: "Conditions unclear — monitor before acting",
    temp_c: 21,
    rainfall_pct: 45,
    humidity_pct: 55,
  },
  {
    date: "2026-07-24",
    action: "harvest",
    reason: "Dry, stable conditions — good window to harvest",
    temp_c: 25,
    rainfall_pct: 5,
    humidity_pct: 41,
  },
  {
    date: "2026-07-25",
    action: "irrigate",
    reason: "Low humidity trend continuing — irrigate to compensate",
    temp_c: 26,
    rainfall_pct: 3,
    humidity_pct: 29,
  },
  {
    date: "2026-07-26",
    action: "plant",
    reason: "Moisture recovering, rain risk low — safe to plant",
    temp_c: 23,
    rainfall_pct: 18,
    humidity_pct: 58,
  },
];
