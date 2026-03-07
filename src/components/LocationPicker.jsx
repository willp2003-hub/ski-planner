import React, { useState } from "react";

export default function LocationPicker({ onLocationChange }) {
  const [query, setQuery] = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.length === 0) {
        setError("Location not found");
        setLoading(false);
        return;
      }
      const { lon, lat, display_name } = data[0];
      const shortName = display_name.split(",").slice(0, 2).join(",").trim();
      setResolvedName(shortName);
      setQuery("");
      onLocationChange({ name: shortName, coords: [parseFloat(lon), parseFloat(lat)] });
    } catch {
      setError("Geocode failed");
    }
    setLoading(false);
  };

  return (
    <div className="location-picker">
      <span className="location-label">Location</span>
      <form onSubmit={handleSubmit} className="location-form">
        <input
          type="text"
          className="location-input"
          placeholder="New York, NY"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="location-btn" disabled={loading || !query.trim()}>
          {loading ? "..." : "Go"}
        </button>
      </form>
      {resolvedName && !error && (
        <span className="location-resolved">{resolvedName}</span>
      )}
      {error && <span className="location-error">{error}</span>}
    </div>
  );
}
