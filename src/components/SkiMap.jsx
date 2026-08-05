import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, CircleMarker, useMap, Pane } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import allMountains from "../data/mountains.js";

const createMountainIcon = (size, pass) => {
  const sizes = {
    large: { w: 44, h: 38, body: "22,3 38,34 6,34", cap: "22,3 28,15 24,12 20,16 15,13" },
    medium: { w: 36, h: 30, body: "18,3 32,28 4,28", cap: "18,3 23,12 20,10 17,13 12,11" },
    small: { w: 28, h: 24, body: "14,3 25,22 3,22", cap: "14,3 18,10 16,8 13,11 10,9" },
  };
  const passColors = {
    ikon: { body: "#1A1A4E", stroke: "rgba(18,18,58,0.3)" },
    epic: { body: "#F26522", stroke: "rgba(212,85,26,0.3)" },
    independent: { body: "#4a6d8a", stroke: "rgba(58,90,115,0.3)" },
  };
  const s = sizes[size] || sizes.small;
  const c = passColors[pass] || passColors.independent;
  return L.divIcon({
    html: `<svg width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${s.body}" fill="${c.body}" stroke="${c.stroke}" stroke-width="1" stroke-linejoin="round"/>
      <polygon points="${s.cap}" fill="white" stroke="#c0d4e0" stroke-width="0.5" stroke-linejoin="round"/>
    </svg>`,
    className: "mountain-marker",
    iconSize: [s.w, s.h],
    iconAnchor: [s.w / 2, s.h],
  });
};

const DEFAULT_CENTER = [43.0, -73.5];
const DEFAULT_ZOOM = 6;
const TOMORROW_KEY = import.meta.env.VITE_TOMORROW_API_KEY;

// Generate hourly timestamps from now through +6h
function getForecastTimestamps(n = 6) {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return Array.from({ length: n + 1 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getHours() + i);
    return d.toISOString();
  });
}

function fmt24(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtForecastHour(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleString("en-US", { weekday: "short", hour: "numeric", hour12: true });
}

// Snowfall (cm/hr) → circle color
function snowColor(cm) {
  if (cm >= 3) return "#5b21b6";   // purple — heavy
  if (cm >= 1.5) return "#1d4ed8"; // dark blue — moderate-heavy
  if (cm >= 0.5) return "#38bdf8"; // sky blue — light-moderate
  return "#bae6fd";                // pale blue — trace
}

// ── Radar overlay (RainViewer tiles) ────────────────────────────────────────
function RainViewerOverlay({ frames, frameIndex }) {
  if (frames.length === 0) return null;
  return (
    <Pane name="radar" style={{ zIndex: 250 }}>
      {frames.map((frame, i) => (
        <TileLayer
          key={frame.path}
          url={`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`}
          opacity={i === frameIndex ? 0.65 : 0}
          attribution={i === frameIndex ? "RainViewer" : ""}
          pane="radar"
        />
      ))}
    </Pane>
  );
}

// ── Forecast overlay (Open-Meteo circles) ───────────────────────────────────
function ForecastOverlay({ forecastData, hourIndex }) {
  return (
    <>
      {forecastData.map((m) => {
        const cm = m.hourly[hourIndex] ?? 0;
        if (cm < 0.1) return null;
        const inches = cm * 0.393701;
        const radius = Math.min(8 + inches * 10, 32);
        const color = snowColor(cm);
        return (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 1 }}
          >
            <Tooltip direction="top">
              <strong>{m.name}</strong><br />
              {inches.toFixed(2)}" expected this hour
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}

// ── Radar timeline bar ───────────────────────────────────────────────────────
function RadarTimeline({ frames, frameIndex, setFrameIndex, isPlaying, setIsPlaying, pastCount }) {
  if (frames.length === 0) return null;
  const isLive = frameIndex >= pastCount;
  const currentTime = fmt24(frames[frameIndex].time);

  return (
    <div className="radar-timeline">
      <button className="radar-play-btn" onClick={() => setIsPlaying((p) => !p)} title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <input
        type="range"
        className="radar-scrubber"
        min={0}
        max={frames.length - 1}
        value={frameIndex}
        onChange={(e) => { setIsPlaying(false); setFrameIndex(Number(e.target.value)); }}
      />
      <span className="radar-timeline-time">{currentTime}</span>
      {isLive && <span className="radar-live-badge">LIVE</span>}
    </div>
  );
}

// ── Forecast timeline bar ────────────────────────────────────────────────────
function ForecastTimeline({ hours, hourIndex, setHourIndex, loading }) {
  if (loading) return <div className="radar-timeline"><span className="radar-timeline-time">Loading forecast…</span></div>;
  if (!hours.length) return null;

  return (
    <div className="radar-timeline">
      <span className="radar-timeline-label">24h Snow</span>
      <input
        type="range"
        className="radar-scrubber"
        min={0}
        max={hours.length - 1}
        value={hourIndex}
        onChange={(e) => setHourIndex(Number(e.target.value))}
      />
      <span className="radar-timeline-time">{fmtForecastHour(hours[hourIndex])}</span>
    </div>
  );
}

// ── Tomorrow.io forecast radar overlay ──────────────────────────────────────
function TomorrowRadarOverlay({ timestamps, tsIndex }) {
  if (!TOMORROW_KEY || timestamps.length === 0) return null;
  return (
    <Pane name="tomorrow-radar" style={{ zIndex: 250 }}>
      {timestamps.map((ts, i) => (
        <TileLayer
          key={ts}
          url={`https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}.png?apikey=${TOMORROW_KEY}&layer=precipitationIntensity&timestepMins=60&time=${ts}`}
          opacity={i === tsIndex ? 0.7 : 0}
          pane="tomorrow-radar"
        />
      ))}
    </Pane>
  );
}

function TomorrowTimeline({ timestamps, tsIndex, setTsIndex, isPlaying, setIsPlaying }) {
  if (timestamps.length === 0) return null;
  const label = new Date(timestamps[tsIndex]).toLocaleString("en-US", {
    weekday: "short", hour: "numeric", hour12: true,
  });
  return (
    <div className="radar-timeline">
      <button className="radar-play-btn" onClick={() => setIsPlaying((p) => !p)}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <input
        type="range"
        className="radar-scrubber"
        min={0}
        max={timestamps.length - 1}
        value={tsIndex}
        onChange={(e) => { setIsPlaying(false); setTsIndex(Number(e.target.value)); }}
      />
      <span className="radar-timeline-time">{label}</span>
      {tsIndex === 0 && <span className="radar-live-badge">NOW</span>}
    </div>
  );
}

function FlyToMountain({ mountain, suppressReset }) {
  const map = useMap();
  useEffect(() => {
    if (mountain) {
      const targetZoom = Math.max(map.getZoom(), 8);
      const mapSize = map.getSize();
      const targetPoint = map.project([mountain.latitude, mountain.longitude], targetZoom);
      const offsetPoint = L.point(targetPoint.x, targetPoint.y + mapSize.y * 0.15);
      const offsetLatLng = map.unproject(offsetPoint, targetZoom);
      map.flyTo(offsetLatLng, targetZoom, { duration: 0.8 });
    } else if (!suppressReset) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    }
  }, [mountain, suppressReset, map]);
  return null;
}

// Fetch hourly snowfall for all mountains, slice to next 24 hours
async function fetchForecast() {
  const now = new Date();
  // ISO hour string like "2026-05-24T14" to find current hour in response
  const nowHourStr = now.toISOString().slice(0, 13);

  const BATCH = 8;
  const results = [];
  for (let i = 0; i < allMountains.length; i += BATCH) {
    const batch = allMountains.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      batch.map(async (m) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${m.latitude}&longitude=${m.longitude}&hourly=snowfall&forecast_days=2&timezone=America/New_York`;
          const res = await fetch(url);
          const data = await res.json();
          const times = data.hourly?.time || [];
          const snowfall = data.hourly?.snowfall || [];
          // Find start index = current hour (convert Open-Meteo local time to match)
          let startIdx = times.findIndex((t) => t >= nowHourStr.replace("T", "T").slice(0, 13));
          if (startIdx < 0) startIdx = 0;
          return {
            id: m.id,
            name: m.name,
            lat: m.latitude,
            lng: m.longitude,
            hourly: snowfall.slice(startIdx, startIdx + 24),
            times: times.slice(startIdx, startIdx + 24),
          };
        } catch {
          return { id: m.id, name: m.name, lat: m.latitude, lng: m.longitude, hourly: [], times: [] };
        }
      })
    );
    results.push(...batchResults);
  }
  return results;
}

// ── Main map component ───────────────────────────────────────────────────────
export default function SkiMap({ mountains, onMountainClick, selectedMountain, suppressReset }) {
  // Radar state
  const [showRadar, setShowRadar] = useState(false);
  const [frames, setFrames] = useState([]);
  const [pastCount, setPastCount] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Open-Meteo snowfall circles state
  const [showForecast, setShowForecast] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [forecastHours, setForecastHours] = useState([]);
  const [hourIndex, setHourIndex] = useState(0);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Tomorrow.io forecast radar state
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [tomorrowTimestamps, setTomorrowTimestamps] = useState([]);
  const [tomorrowIndex, setTomorrowIndex] = useState(0);
  const [tomorrowPlaying, setTomorrowPlaying] = useState(false);

  // Load RainViewer radar
  useEffect(() => {
    if (!showRadar || frames.length > 0) return;
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((data) => {
        const past = data.radar?.past || [];
        const nowcast = data.radar?.nowcast || [];
        setFrames([...past, ...nowcast]);
        setPastCount(past.length);
        setFrameIndex(0);
        setIsPlaying(true);
      })
      .catch(() => {});
  }, [showRadar]);

  // Animate radar
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const id = setInterval(() => setFrameIndex((i) => (i + 1) % frames.length), 500);
    return () => clearInterval(id);
  }, [isPlaying, frames]);

  // Load 24h forecast
  useEffect(() => {
    if (!showForecast || forecastData.length > 0) return;
    setForecastLoading(true);
    fetchForecast().then((results) => {
      setForecastData(results);
      setForecastHours(results[0]?.times || []);
      setHourIndex(0);
      setForecastLoading(false);
    });
  }, [showForecast]);

  // Initialize Tomorrow.io timestamps when toggled on
  useEffect(() => {
    if (!showTomorrow) return;
    setTomorrowTimestamps(getForecastTimestamps(6));
    setTomorrowIndex(0);
    setTomorrowPlaying(true);
  }, [showTomorrow]);

  // Animate Tomorrow.io scrubber
  useEffect(() => {
    if (!tomorrowPlaying || tomorrowTimestamps.length === 0) return;
    const id = setInterval(
      () => setTomorrowIndex((i) => (i + 1) % tomorrowTimestamps.length),
      800
    );
    return () => clearInterval(id);
  }, [tomorrowPlaying, tomorrowTimestamps]);

  const toggleRadar = () => {
    setShowForecast(false);
    setShowTomorrow(false);
    setShowRadar((v) => !v);
  };

  const toggleForecast = () => {
    setShowRadar(false);
    setShowTomorrow(false);
    setShowForecast((v) => !v);
  };

  const toggleTomorrow = () => {
    setShowRadar(false);
    setShowForecast(false);
    setShowTomorrow((v) => !v);
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {showRadar && <RainViewerOverlay frames={frames} frameIndex={frameIndex} />}
        {showForecast && forecastData.length > 0 && (
          <ForecastOverlay forecastData={forecastData} hourIndex={hourIndex} />
        )}
        {showTomorrow && (
          <TomorrowRadarOverlay timestamps={tomorrowTimestamps} tsIndex={tomorrowIndex} />
        )}
        <FlyToMountain mountain={selectedMountain} suppressReset={suppressReset} />
        {mountains.map((mountain) => (
          <Marker
            key={mountain.id}
            position={[mountain.latitude, mountain.longitude]}
            icon={createMountainIcon(mountain.size, mountain.pass)}
            eventHandlers={{ click: () => onMountainClick(mountain) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <strong>{mountain.name}</strong><br />
              {mountain.state} · {mountain.pass === "ikon" ? "Ikon" : mountain.pass === "epic" ? "Epic" : "Independent"}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Toggle buttons */}
      <div className="map-overlay-btns">
        <button className={`radar-toggle-btn${showRadar ? " active" : ""}`} onClick={toggleRadar}>
          🌨 Radar
        </button>
        <button className={`radar-toggle-btn${showForecast ? " active" : ""}`} onClick={toggleForecast}>
          ⛅ 24h Snow
        </button>
        {TOMORROW_KEY && (
          <button className={`radar-toggle-btn${showTomorrow ? " active" : ""}`} onClick={toggleTomorrow}>
            🌧 Forecast
          </button>
        )}
      </div>

      {/* Timelines */}
      {showRadar && (
        <RadarTimeline
          frames={frames}
          frameIndex={frameIndex}
          setFrameIndex={setFrameIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          pastCount={pastCount}
        />
      )}
      {showForecast && (
        <ForecastTimeline
          hours={forecastHours}
          hourIndex={hourIndex}
          setHourIndex={setHourIndex}
          loading={forecastLoading}
        />
      )}
      {showTomorrow && (
        <TomorrowTimeline
          timestamps={tomorrowTimestamps}
          tsIndex={tomorrowIndex}
          setTsIndex={setTomorrowIndex}
          isPlaying={tomorrowPlaying}
          setIsPlaying={setTomorrowPlaying}
        />
      )}
    </div>
  );
}
