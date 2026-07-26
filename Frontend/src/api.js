import { mockForecast } from "./mockData";

// Point this at Elsie's Flask backend once it's running.
// Default assumes local Flask dev server.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function fetchForecast() {
  try {
    const res = await fetch(`${API_BASE}/api/forecast`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = await res.json();
    return { data, source: "live" };
  } catch (err) {
    // Backend not up yet, or Conduit access still pending — fall back to mock data
    // so the UI stays fully usable during development.
    console.warn("Falling back to mock forecast data:", err.message);
    return { data: mockForecast, source: "mock" };
  }
}
