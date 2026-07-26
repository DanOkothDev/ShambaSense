import { useEffect, useMemo, useState } from "react";
import { fetchForecast } from "./api";
import "./App.css";

const ACTION_META = {
  plant: { label: "Plant", color: "var(--c-plant)", detail: "Good conditions to plant" },
  wait: { label: "Wait", color: "var(--c-wait)", detail: "Hold off — conditions unclear" },
  irrigate: { label: "Irrigate", color: "var(--c-irrigate)", detail: "Fields need water today" },
  harvest: { label: "Harvest", color: "var(--c-harvest)", detail: "Good window to harvest" },
};

function dayLabel(dateStr, isToday) {
  if (isToday) return "Today";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-KE", { weekday: "short" });
}

function useStars(count = 50) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 55,
      left: Math.random() * 100,
      size: Math.random() * 1.6 + 0.6,
      delay: Math.random() * 6,
      duration: Math.random() * 3 + 2.5,
    }));
  }, [count]);
}

function buildSmoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = (p1.x - p0.x) / 2;
    d += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function transitionCaption(prev, next) {
  const nextMeta = ACTION_META[next.action] || ACTION_META.wait;
  const rainDelta = next.rainfall_pct - prev.rainfall_pct;

  if (prev.action !== next.action) {
    const pairs = {
      "wait->plant": "conditions clear enough to plant",
      "plant->wait": "a pause sets in before the next move",
      "irrigate->plant": "watered ground is ready for planting",
      "wait->irrigate": "the dry stretch calls for irrigation",
      "plant->irrigate": "growth stage needs a top-up of water",
      "wait->harvest": "a harvest window finally opens",
      "harvest->wait": "harvest closes out, next steps on hold",
      "irrigate->wait": "watering done — conditions now uncertain",
      "harvest->plant": "fresh ground goes back in for planting",
      "plant->harvest": "the crop is ready to bring in",
    };
    const key = `${prev.action}->${next.action}`;
    return pairs[key] || `shifts to ${nextMeta.label.toLowerCase()}`;
  }

  if (rainDelta >= 15) return "rain builds through the day";
  if (rainDelta <= -15) return "skies clear up again";
  return "conditions hold steady";
}

function StoryTimeline({ forecast, todayStr }) {
  const n = forecast.length;
  const width = 1000;
  const height = 160;
  const top = 20;
  const bottom = 140;

  const points = forecast.map((entry, i) => ({
    x: n > 1 ? 40 + i * ((width - 80) / (n - 1)) : width / 2,
    y: bottom - (entry.rainfall_pct / 100) * (bottom - top),
    entry,
  }));

  const linePath = buildSmoothPath(points);
  const areaPath =
    linePath +
    ` L ${points[n - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <section className="card timeline-card">
      <p className="card__label">This week's story</p>

      <div className="timeline">
        <svg
          className="timeline__svg"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="riverFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(82,169,232,0.35)" />
              <stop offset="100%" stopColor="rgba(82,169,232,0)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#riverFill)" />
          <path d={linePath} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          {points.map(({ x, y, entry }) => {
            const meta = ACTION_META[entry.action] || ACTION_META.wait;
            const isToday = entry.date === todayStr;
            return (
              <circle
                key={entry.date}
                cx={x}
                cy={y}
                r={isToday ? 8 : 6}
                style={{ fill: meta.color }}
                stroke={isToday ? "#fff" : "none"}
                strokeWidth={isToday ? 2 : 0}
              />
            );
          })}
        </svg>

        <div className="timeline__labels">
          {forecast.map((entry) => {
            const isToday = entry.date === todayStr;
            return (
              <div className={`timeline__label ${isToday ? "timeline__label--active" : ""}`} key={entry.date}>
                <span className="timeline__day">{dayLabel(entry.date, isToday)}</span>
                <span className="timeline__temp">{entry.temp_c}°</span>
              </div>
            );
          })}
        </div>
      </div>

      <ol className="beats">
        {points.slice(0, -1).map((p, i) => {
          const next = points[i + 1].entry;
          const nextMeta = ACTION_META[next.action] || ACTION_META.wait;
          return (
            <li className="beats__item" key={p.entry.date}>
              <span className="beats__dot" style={{ background: nextMeta.color }} />
              <span className="beats__text">
                <strong>{dayLabel(p.entry.date, p.entry.date === todayStr)} → {dayLabel(next.date, next.date === todayStr)}:</strong>{" "}
                {transitionCaption(p.entry, next)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function RadialGauge({ value, label, sub }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100);
  const offset = c - (pct / 100) * c;

  return (
    <div className="gauge">
      <svg viewBox="0 0 140 140" className="gauge__svg">
        <circle cx="70" cy="70" r={r} className="gauge__track" />
        <circle
          cx="70" cy="70" r={r}
          className="gauge__fill"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge__center">
        <span className="gauge__value">{Math.round(value)}%</span>
      </div>
      <p className="gauge__label">{label}</p>
      {sub && <p className="gauge__sub">{sub}</p>}
    </div>
  );
}

function ArcWindow({ startLabel, endLabel, startTime, endTime }) {
  return (
    <div className="arc-card">
      <svg viewBox="0 0 320 130" className="arc-card__svg" aria-hidden="true">
        <path d="M 20 120 A 140 140 0 0 1 300 120" className="arc-card__track" />
        <path d="M 20 120 A 140 140 0 0 1 300 120" className="arc-card__fill" />
      </svg>
      <div className="arc-card__labels">
        <div>
          <p className="arc-card__label">{startLabel}</p>
          <p className="arc-card__time">{startTime}</p>
        </div>
        <div>
          <p className="arc-card__label">{endLabel}</p>
          <p className="arc-card__time">{endTime}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [forecast, setForecast] = useState([]);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const stars = useStars();

  useEffect(() => {
    fetchForecast().then(({ data, source }) => {
      setForecast(data);
      setSource(source);
      setLoading(false);
    });
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = forecast.find((f) => f.date === todayStr) || forecast[0];
  const meta = today ? ACTION_META[today.action] || ACTION_META.wait : null;

  const maxTemp = forecast.length ? Math.max(...forecast.map((f) => f.temp_c)) : null;
  const minTemp = forecast.length ? Math.min(...forecast.map((f) => f.temp_c)) : null;

  return (
    <div className="app">
      {/* Photo banner — top of the page only, fades into the solid page
          background where it meets the card zone below. */}
      <header className="hero-banner">
        <div className="hero-banner__photo" aria-hidden="true" />
        <div className="hero-banner__fade" aria-hidden="true" />
        {stars.map((s) => (
          <span
            key={s.id}
            className="star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}

        <div className="hero-banner__content">
          <span className="pill">
            <i className="pill__pin" aria-hidden="true" />
            Juja · Conduit Station
          </span>

          {loading || !today ? (
            <p className="hero__loading">Reading the field…</p>
          ) : (
            <>
              <h1 className="hero__action" style={{ color: meta.color }}>{meta.label}</h1>
              <p className="hero__status">{meta.detail}</p>

              <p className="hero__range">
                <span>↑ {maxTemp}°</span> / <span>↓ {minTemp}°</span>
                <span className="hero__range-sep">·</span>
                Humidity {today.humidity_pct}%
              </p>

              <p className="hero__desc">{today.reason}</p>
            </>
          )}

          {source && (
            <span className={`badge badge--${source}`}>
              {source === "live" ? "Live Conduit data" : "Preview data — backend not connected"}
            </span>
          )}
        </div>
      </header>

      {/* Solid page body — everything below the photo lives on plain
          dark background, no photo here. */}
      <div className="page">
        <div className="page__glow page__glow--a" />
        <div className="page__glow page__glow--b" />

        {!loading && forecast.length > 0 && (
          <div className="content">
            <div className="card-grid">
              <StoryTimeline forecast={forecast} todayStr={todayStr} />

              <section className="card advisory-card">
                <p className="advisory-card__eyebrow">Today's advisory</p>
                <h2 className="advisory-card__title">{meta.label} — {today.reason}</h2>
              </section>

              <div className="row">
                <section className="card">
                  <p className="card__label">Rainfall risk</p>
                  <p className="card__big">{today.rainfall_pct}%</p>
                  <div className="bar">
                    <div className="bar__fill bar__fill--rain" style={{ width: `${today.rainfall_pct}%` }} />
                  </div>
                </section>
                <section className="card">
                  <p className="card__label">Humidity</p>
                  <p className="card__big">{today.humidity_pct}%</p>
                  <div className="bar">
                    <div className="bar__fill bar__fill--humidity" style={{ width: `${today.humidity_pct}%` }} />
                  </div>
                </section>
              </div>

              <div className="row">
                <section className="card gauge-card">
                  <RadialGauge value={today.rainfall_pct} label="Rain probability" sub="Next 24 hours" />
                </section>
                <section className="card">
                  <p className="card__label">Temperature</p>
                  <p className="card__big">{today.temp_c}°C</p>
                  <p className="card__sub">
                    {today.temp_c >= (maxTemp + minTemp) / 2 ? "Warmer" : "Cooler"} than the week's average
                  </p>
                </section>
              </div>

              <section className="card window-card">
                <p className="card__label">Best planting window</p>
                <ArcWindow
                  startLabel="Opens"
                  endLabel="Closes"
                  startTime="06:30"
                  endTime="10:00"
                />
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}