import React, { useState } from "react";
import { createTrip, updateTrip } from "../services/firestore.js";

function TripForm({ userId, trip, onSave, onClose, onLocationChange }) {
  const isEdit = !!trip;
  const [skiStart, setSkiStart] = useState(trip?.skiingDates?.start || "");
  const [skiEnd, setSkiEnd] = useState(trip?.skiingDates?.end || "");
  const [lodgeStart, setLodgeStart] = useState(trip?.lodgingDates?.start || "");
  const [lodgeEnd, setLodgeEnd] = useState(trip?.lodgingDates?.end || "");
  const [groupText, setGroupText] = useState(trip?.groupMembers?.join(", ") || "");
  const [cost, setCost] = useState(trip?.lodgingCost || "");
  const [notes, setNotes] = useState(trip?.notes || "");
  const [saving, setSaving] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResolved, setLocationResolved] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        userId,
        skiingDates: { start: skiStart, end: skiEnd },
        lodgingDates: { start: lodgeStart, end: lodgeEnd },
        groupMembers: groupText.split(",").map((s) => s.trim()).filter(Boolean),
        lodgingCost: Number(cost) || 0,
        notes,
      };

      if (isEdit) {
        await updateTrip(trip.id, data);
        onSave({ ...trip, ...data });
      } else {
        const id = await createTrip(data);
        onSave({ id, ...data });
      }
    } catch (err) {
      console.error("Failed to save trip:", err);
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? "Edit Trip" : "Where to Ski"}</h3>
        <form onSubmit={handleSubmit}>
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
          <label>
            Skiing Start
            <input type="date" value={skiStart} onChange={(e) => setSkiStart(e.target.value)} required />
          </label>
          <label>
            Skiing End
            <input type="date" value={skiEnd} onChange={(e) => setSkiEnd(e.target.value)} required />
          </label>
          <label>
            Lodging Start
            <input type="date" value={lodgeStart} onChange={(e) => setLodgeStart(e.target.value)} />
          </label>
          <label>
            Lodging End
            <input type="date" value={lodgeEnd} onChange={(e) => setLodgeEnd(e.target.value)} />
          </label>
          <label>
            Group Members
            <textarea
              value={groupText}
              onChange={(e) => setGroupText(e.target.value)}
              rows={2}
              placeholder="Comma-separated names..."
            />
          </label>
          <label>
            Lodging Cost ($)
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} min="0" />
          </label>
          <label>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </label>
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TripForm;
