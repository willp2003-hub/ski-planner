import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, CircleMarker, useMap, Pane } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import allMountains from "../data/mountains.js";

const createMountainIcon = (size, pass, isSelected = false) => {
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
  const outline = isSelected
    ? `<polygon points="${s.body}" fill="none" stroke="#d1d5db" stroke-width="5" stroke-linejoin="round"/>`
    : "";
  return L.divIcon({
    html: `<svg width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
      ${outline}
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

function getForecastTimestamps(n = 6) {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return Array.from({ length: n + 1 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getHours() + i);
    return d.toISOString();
  });
}

function fmtForecastHour(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", hour12: true });
}

// Snowfall (cm/hr) → circle color
function snowColor(cm) {
  if (cm >= 3) return "#5b21b6";
  if (cm >= 1.5) return "#1d4ed8";
  if (cm >= 0.5) return "#38bdf8";
  return "#bae6fd";
}

// ── Tomorrow.io radar overlay ────────────────────────────────────────────────
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

// ── Open-Meteo snowfall circles overlay ─────────────────────────────────────
function SnowForecastOverlay({ forecastData, hourIndex }) {
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

function SnowForecastTimeline({ hours, hourIndex, setHourIndex, loading }) {
  if (loading) return <div className="radar-timeline"><span className="radar-timeline-time">Loading forecast…</span></div>;
  if (!hours.length) return null;
  return (
    <div className="radar-timeline">
      <span className="radar-timeline-label">7d Snow</span>
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

// Fetch hourly snowfall for all mountains for the next 7 days
async function fetchSnowForecast() {
  const now = new Date();
  const nowHourStr = now.toISOString().slice(0, 13);
  const BATCH = 8;
  const results = [];
  for (let i = 0; i < allMountains.length; i += BATCH) {
    const batch = allMountains.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      batch.map(async (m) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${m.latitude}&longitude=${m.longitude}&hourly=snowfall&forecast_days=7&timezone=America/New_York`;
          const res = await fetch(url);
          const data = await res.json();
          const times = data.hourly?.time || [];
          const snowfall = data.hourly?.snowfall || [];
          let startIdx = times.findIndex((t) => t.slice(0, 13) >= nowHourStr.slice(0, 13));
          if (startIdx < 0) startIdx = 0;
          return {
            id: m.id,
            name: m.name,
            lat: m.latitude,
            lng: m.longitude,
            hourly: snowfall.slice(startIdx, startIdx + 168),
            times: times.slice(startIdx, startIdx + 168),
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
  // Tomorrow.io radar state
  const [showRadar, setShowRadar] = useState(false);
  const [tomorrowTimestamps, setTomorrowTimestamps] = useState([]);
  const [tomorrowIndex, setTomorrowIndex] = useState(0);
  const [tomorrowPlaying, setTomorrowPlaying] = useState(false);

  // 7-day snowfall circles state
  const [showSnow, setShowSnow] = useState(false);
  const [snowData, setSnowData] = useState([]);
  const [snowHours, setSnowHours] = useState([]);
  const [snowHourIndex, setSnowHourIndex] = useState(0);
  const [snowLoading, setSnowLoading] = useState(false);

  // Initialize Tomorrow.io timestamps when toggled on
  useEffect(() => {
    if (!showRadar) return;
    setTomorrowTimestamps(getForecastTimestamps(6));
    setTomorrowIndex(0);
    setTomorrowPlaying(true);
  }, [showRadar]);

  // Animate Tomorrow.io scrubber
  useEffect(() => {
    if (!tomorrowPlaying || tomorrowTimestamps.length === 0) return;
    const id = setInterval(
      () => setTomorrowIndex((i) => (i + 1) % tomorrowTimestamps.length),
      800
    );
    return () => clearInterval(id);
  }, [tomorrowPlaying, tomorrowTimestamps]);

  // Load 7-day snowfall forecast
  useEffect(() => {
    if (!showSnow || snowData.length > 0) return;
    setSnowLoading(true);
    fetchSnowForecast().then((results) => {
      setSnowData(results);
      setSnowHours(results[0]?.times || []);
      setSnowHourIndex(0);
      setSnowLoading(false);
    });
  }, [showSnow]);

  const toggleRadar = () => {
    setShowSnow(false);
    setShowRadar((v) => !v);
  };

  const toggleSnow = () => {
    setShowRadar(false);
    setShowSnow((v) => !v);
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {showRadar && (
          <TomorrowRadarOverlay timestamps={tomorrowTimestamps} tsIndex={tomorrowIndex} />
        )}
        {showSnow && snowData.length > 0 && (
          <SnowForecastOverlay forecastData={snowData} hourIndex={snowHourIndex} />
        )}
        <FlyToMountain mountain={selectedMountain} suppressReset={suppressReset} />
        {mountains.map((mountain) => (
          <Marker
            key={mountain.id}
            position={[mountain.latitude, mountain.longitude]}
            icon={createMountainIcon(mountain.size, mountain.pass, selectedMountain?.id === mountain.id)}
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
        {TOMORROW_KEY && (
          <button className={`radar-toggle-btn${showRadar ? " active" : ""}`} onClick={toggleRadar}>
            🌨 Radar
          </button>
        )}
        <button className={`radar-toggle-btn${showSnow ? " active" : ""}`} onClick={toggleSnow}>
          ⛅ 7d Snow
        </button>
      </div>

      {/* Timelines */}
      {showRadar && (
        <TomorrowTimeline
          timestamps={tomorrowTimestamps}
          tsIndex={tomorrowIndex}
          setTsIndex={setTomorrowIndex}
          isPlaying={tomorrowPlaying}
          setIsPlaying={setTomorrowPlaying}
        />
      )}
      {showSnow && (
        <SnowForecastTimeline
          hours={snowHours}
          hourIndex={snowHourIndex}
          setHourIndex={setSnowHourIndex}
          loading={snowLoading}
        />
      )}
    </div>
  );
}
