import React, { useState } from "react";
import { updateTrip } from "../services/firestore.js";
import { recommendMountains, DEFAULT_WEIGHTS } from "../services/recommend.js";
import ResultMiniMap from "./ResultMiniMap.jsx";

const WEIGHT_LABELS = {
  snow: { label: "Snow Conditions", icon: "❄️" },
  terrain: { label: "Terrain Match", icon: "⛷️" },
  drive: { label: "Drive Time", icon: "🚗" },
  value: { label: "Value", icon: "💰" },
  size: { label: "Mountain Size", icon: "🏔️" },
  trailsOpen: { label: "Trails Open", icon: "🎿" },
};

function TripForm({ userId, trip, onSave, onClose, onLocationChange, mountainData, origin, onSelectMountain, onClearMountain }) {
  const isEdit = !!trip;
  const [skiStart, setSkiStart] = useState(trip?.skiingDates?.start || "");
  const initDays = () => {
    if (trip?.skiingDates?.start && trip?.skiingDates?.end) {
      const diff = (new Date(trip.skiingDates.end) - new Date(trip.skiingDates.start)) / 86400000 + 1;
      return diff > 0 ? diff : 1;
    }
    return 1;
  };
  const [skiDays, setSkiDays] = useState(initDays());
  const [lodgeStart, setLodgeStart] = useState(trip?.lodgingDates?.start || "");
  const [lodgeEnd, setLodgeEnd] = useState(trip?.lodgingDates?.end || "");
  const [groupText, setGroupText] = useState(trip?.groupMembers?.join(", ") || "");
  const [cost, setCost] = useState(trip?.lodgingCost || "");
  const [passTypes, setPassTypes] = useState(trip?.passTypes || []);
  const [difficulty, setDifficulty] = useState(trip?.difficulty ?? 50);
  const [ticketBudget, setTicketBudget] = useState(trip?.ticketBudget || "");
  const [maxDrive, setMaxDrive] = useState(trip?.maxDrive ?? 8);
  const [sizePrefs, setSizePrefs] = useState(trip?.sizePrefs || []);
  const [saving, setSaving] = useState(false);
  const [needsLodging, setNeedsLodging] = useState(!!(lodgeStart || lodgeEnd || cost));
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResolved, setLocationResolved] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [results, setResults] = useState(null);
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [showWeights, setShowWeights] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [weightsError, setWeightsError] = useState("");
  const [refreshPhase, setRefreshPhase] = useState(null); // "exit" | "enter" | null
  const [visibleCount, setVisibleCount] = useState(10);

  const handleGeocode = async () => {
    const trimmed = locationQuery.trim();
    if (!trimmed) return;
    setLocationLoading(true);
    setLocationError("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.length === 0) {
        setLocationError("Location not found");
        setLocationLoading(false);
        return;
      }
      const { lon, lat, display_name } = data[0];
      const shortName = display_name.split(",").slice(0, 2).join(",").trim();
      setLocationResolved(shortName);
      setLocationQuery("");
      if (onLocationChange) {
        onLocationChange({ name: shortName, coords: [parseFloat(lon), parseFloat(lat)] });
      }
    } catch {
      setLocationError("Geocode failed");
    }
    setLocationLoading(false);
  };

  const getPreferences = () => ({
    passTypes,
    maxDrive,
    ticketBudget: Number(ticketBudget) || 0,
    lodgingCost: Number(cost) || 0,
    difficulty,
    sizePrefs,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      setSaving(true);
      try {
        const data = {
          userId,
          skiingDates: { start: skiStart, end: (() => { const d = new Date(skiStart + "T00:00:00"); d.setDate(d.getDate() + skiDays - 1); return d.toISOString().split("T")[0]; })() },
          lodgingDates: { start: lodgeStart, end: lodgeEnd },
          groupMembers: groupText.split(",").map((s) => s.trim()).filter(Boolean),
          lodgingCost: Number(cost) || 0,
          ticketBudget: Number(ticketBudget) || 0,
          maxDrive,
          passTypes,
          difficulty,
        };
        await updateTrip(trip.id, data);
        onSave({ ...trip, ...data });
      } catch (err) {
        console.error("Failed to save trip:", err);
      }
      setSaving(false);
    } else {
      const ranked = recommendMountains(mountainData || [], getPreferences(), weights);
      setResults(ranked);
    }
  };

  const weightsTotal = Object.values(weights).reduce((s, v) => s + v, 0);

  const handleWeightChange = (key, value) => {
    setWeights({ ...weights, [key]: value });
    setWeightsError("");
  };

  const handleRefresh = () => {
    if (weightsTotal !== 100) {
      setWeightsError(`Weights must sum to 100 (currently ${weightsTotal})`);
      return;
    }
    if (refreshPhase) return;
    setWeightsError("");

    const count = Math.min((results || []).length, 10);
    const delay = 60;

    // Phase 1: cascade out (hide cards one by one from bottom)
    setRefreshPhase("exit");
    let step = 0;
    const exitInterval = setInterval(() => {
      step++;
      setVisibleCount(count - step);
      if (step >= count) {
        clearInterval(exitInterval);
        // Phase 2: swap in new results, then cascade in
        const ranked = recommendMountains(mountainData || [], getPreferences(), weights);
        setResults(ranked);
        const newCount = Math.min(ranked.length, 10);
        setRefreshPhase("enter");
        setVisibleCount(0);
        let enterStep = 0;
        const enterInterval = setInterval(() => {
          enterStep++;
          setVisibleCount(enterStep);
          if (enterStep >= newCount) {
            clearInterval(enterInterval);
            setRefreshPhase(null);
          }
        }, delay);
      }
    }, delay);
  };

  const handleSelectMountain = (mountain) => {
    setSelectedId(mountain.id);
    setMinimized(true);
    if (onSelectMountain) {
      onSelectMountain(mountain);
    }
  };

  const passColors = { ikon: "#1a1a4e", epic: "#f26522", independent: "#4a6d8a" };

  // --- Minimized Results Panel ---
  if (results && minimized) {
    return (
      <div className="results-mini-panel">
        <div className="results-mini-header">
          <span className="results-mini-title">Top Picks</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button type="button" className="results-mini-btn" onClick={handleRefresh}>↻</button>
            <button type="button" className="results-mini-btn" onClick={() => { setMinimized(false); if (onClearMountain) onClearMountain(); }}>Expand</button>
            <button type="button" className="results-mini-btn" onClick={onClose}>&times;</button>
          </div>
        </div>
        <div className="results-mini-list">
          {results.slice(0, 10).map((m, i) => (
            <button
              key={m.id}
              className={`results-mini-item${m.id === selectedId ? " active" : ""}`}
              onClick={() => handleSelectMountain(m)}
            >
              <span className="results-mini-rank">#{i + 1}</span>
              <span className="results-mini-name">{m.name}</span>
              <span className="results-mini-state">{m.state}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Results View ---
  if (results) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content results-modal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
          <div className="results-header">
            <button type="button" className="results-back-btn" onClick={() => setResults(null)}>&larr; Back</button>
            <h3>Top Picks</h3>
          </div>

          <button
            type="button"
            className="weights-toggle"
            onClick={() => setShowWeights(!showWeights)}
          >
            Adjust Weights {showWeights ? "▲" : "▼"}
          </button>

          {showWeights && (
            <div className="weights-panel">
              {Object.entries(WEIGHT_LABELS).map(([key, { label, icon }]) => (
                <div key={key} className="weight-row">
                  <span className="weight-label">{icon} {label}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                    className="weight-range"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={(e) => handleWeightChange(key, Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                    className="weight-value weight-value-input"
                  />
                </div>
              ))}
              <div className="weights-total">Total: {weightsTotal}/100</div>
              {weightsError && <div className="weights-error">{weightsError}</div>}
              <button type="button" className="results-refresh-btn" onClick={handleRefresh}>↻ Refresh</button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="no-results">
              <p>No mountains match your filters.</p>
              <p style={{ fontSize: 12, color: "#888" }}>Try increasing your drive time or budget.</p>
            </div>
          ) : (
            <div className="results-list">
              {results.slice(0, 10).map((m, i) => (
                <div
                  key={m.id}
                  className={`result-card${refreshPhase && i >= visibleCount ? " result-card-hidden" : ""}`}
                  onClick={() => handleSelectMountain(m)}
                >
                  <div className="result-card-top">
                    <div className="result-rank">#{i + 1}</div>
                    <div className="result-info">
                      <div className="result-name">
                        {m.name}
                        <span className="result-state">{m.state}</span>
                        <span className="result-pass" style={{ color: passColors[m.pass] }}>
                          {m.pass === "ikon" ? "Ikon" : m.pass === "epic" ? "Epic" : "Indie"}
                        </span>
                      </div>
                      <div className="result-stats">
                        <span>🚗 {m.driveFromNYC}</span>
                        <span>❄️ {m.snowfallPast7Days}</span>
                        <span>🎟️ {m.liftTicket || "—"}</span>
                        <span>🏨 {m.costPerNight}</span>
                      </div>
                    </div>
                  </div>
                  {!refreshPhase && <ResultMiniMap mountain={m} originCoords={origin?.coords || [-74.006, 40.7484]} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>{isEdit ? "Edit Trip" : "Where to Shred"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="pass-type-selector">
            <span className="pass-type-label">Pass Type</span>
            <div className="pass-type-options">
              {["Ikon", "Epic", "Independent"].map((p) => {
                const val = p.toLowerCase();
                const active = passTypes.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    className={`pass-type-btn ${val}${active ? " active" : ""}`}
                    onClick={() => setPassTypes(active ? passTypes.filter((t) => t !== val) : [...passTypes, val])}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
          <label style={{ position: "relative" }}>
            Lift Ticket Budget ($)
            <input type="number" value={ticketBudget} onChange={(e) => setTicketBudget(e.target.value)} min="0" placeholder="" />
            {ticketBudget && (
              <button
                type="button"
                onClick={() => setTicketBudget("")}
                style={{ position: "absolute", right: 8, top: 30, background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#888", padding: "2px 6px" }}
              >
                &times;
              </button>
            )}
          </label>
          <label>
            Travel From
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input
                type="text"
                placeholder="New York, NY"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                disabled={locationLoading}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={locationLoading || !locationQuery.trim()}
                className="location-btn"
              >
                {locationLoading ? "..." : "Go"}
              </button>
            </div>
            {locationResolved && !locationError && (
              <span style={{ color: "#888", fontSize: 11, marginTop: 2, display: "block" }}>{locationResolved}</span>
            )}
            {locationError && (
              <span style={{ color: "#d32f2f", fontSize: 11, marginTop: 2, display: "block" }}>{locationError}</span>
            )}
          </label>
          <div className="difficulty-slider-group">
            <span className="difficulty-slider-label">Max Drive Time: {maxDrive}h</span>
            <div className="difficulty-slider-row">
              <span className="drive-slider-label">1h</span>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={maxDrive}
                onChange={(e) => setMaxDrive(Number(e.target.value))}
                className="difficulty-range"
              />
              <span className="drive-slider-label">8h</span>
            </div>
          </div>
          <label>
            Skiing Start
            <input type="date" value={skiStart} onChange={(e) => setSkiStart(e.target.value)} />
          </label>
          <label>
            Days
            <select value={skiDays} onChange={(e) => setSkiDays(Number(e.target.value))} required>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <div className="difficulty-slider-group">
            <span className="difficulty-slider-label">Terrain</span>
            <div className="difficulty-slider-row">
              <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#4caf50" /></svg>
              <input
                type="range"
                min="0"
                max="100"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="difficulty-range"
              />
              <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 15,8 8,15 1,8" fill="#1a1a2e" /></svg>
            </div>
          </div>
          <div className="size-selector">
            <span className="size-selector-label">Resort Size</span>
            <div className="size-options">
              {["small", "medium", "large"].map((s) => {
                const active = sizePrefs.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`size-btn${active ? " active" : ""}`}
                    onClick={() => setSizePrefs(active ? sizePrefs.filter((x) => x !== s) : [...sizePrefs, s])}
                  >
                    {s === "small" && <svg width="20" height="18" viewBox="0 0 20 18"><polygon points="10,4 17,16 3,16" fill={active ? "white" : "#888"} /><polygon points="10,4 12,8 11,7 9,9 7,7" fill={active ? "#1a1a2e" : "#ccc"} /></svg>}
                    {s === "medium" && <svg width="24" height="20" viewBox="0 0 24 20"><polygon points="12,3 21,18 3,18" fill={active ? "white" : "#888"} /><polygon points="12,3 15,8 13,7 11,9 9,7" fill={active ? "#1a1a2e" : "#ccc"} /></svg>}
                    {s === "large" && <svg width="28" height="22" viewBox="0 0 28 22"><polygon points="14,2 26,20 2,20" fill={active ? "white" : "#888"} /><polygon points="14,2 17,8 15,7 13,9 11,7" fill={active ? "#1a1a2e" : "#ccc"} /></svg>}
                    <span className="size-btn-label">{s}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lodging-toggle">
            <span className="lodging-toggle-label">Lodging Needed?</span>
            <div className="toggle-btns">
              <button type="button" className={`toggle-btn${needsLodging ? " active" : ""}`} onClick={() => setNeedsLodging(true)}>Yes</button>
              <button type="button" className={`toggle-btn${!needsLodging ? " active" : ""}`} onClick={() => { setNeedsLodging(false); setLodgeStart(""); setLodgeEnd(""); setCost(""); }}>No</button>
            </div>
          </div>
          {needsLodging && (
            <>
              <label>
                Lodging Start
                <input type="date" value={lodgeStart} onChange={(e) => setLodgeStart(e.target.value)} />
              </label>
              <label>
                Lodging End
                <input type="date" value={lodgeEnd} onChange={(e) => setLodgeEnd(e.target.value)} />
              </label>
              <label>
                Nightly Budget ($)
                <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} min="0" />
              </label>
            </>
          )}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update" : "Find your Mountain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TripForm;
