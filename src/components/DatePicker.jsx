import React, { useState } from "react";

function SingleDatePicker({ label, onDatesChange }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    if (startDate && endDate) {
      onDatesChange({ startDate, endDate });
      setIsOpen(false);
    }
  };

  const formatDisplay = () => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end = new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${start} → ${end}`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative" }}>
      <span style={{ color: "#1a1a2e", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>{label}</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: "6px 10px", borderRadius: "8px", border: "1.5px solid rgba(26,26,46,0.2)", background: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600", cursor: "pointer", color: "#1a1a2e", display: "flex", alignItems: "center", gap: "6px", minWidth: "80px" }}
      >
        📅 {formatDisplay() || "Select"}
      </button>

      {isOpen && (
        <div style={{ position: "absolute", top: "44px", left: 0, background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", zIndex: 2000, minWidth: "280px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e" }}>{label} Dates</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "#f0f0f0", border: "none", width: "28px", height: "28px", borderRadius: "50%", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}
            >
              ✕
            </button>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Check In</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #ddd", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Check Out</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1.5px solid #ddd", fontSize: "14px" }}
            />
          </div>

          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            style={{ width: "100%", padding: "12px", background: startDate && endDate ? "#1a1a2e" : "#ccc", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: startDate && endDate ? "pointer" : "default" }}
          >
            Apply Dates
          </button>
        </div>
      )}
    </div>
  );
}

export default function DatePicker({ onLodgingDatesChange, onSkiingDatesChange }) {
  return (
    <>
      <SingleDatePicker label="Lodging Dates" onDatesChange={onLodgingDatesChange} />
      <SingleDatePicker label="Skiing Dates" onDatesChange={onSkiingDatesChange} />
    </>
  );
}