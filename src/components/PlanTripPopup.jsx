import React, { useState, useEffect } from "react";
import { fetchWeekForecast } from "../services/weather.js";
import { createTrip } from "../services/firestore.js";
import { useAuth } from "../contexts/AuthContext.jsx";

const TICKET_URLS = {
  1: "https://www.sugarloaf.com/lift-tickets",
  2: "https://www.sundayriver.com/lift-tickets",
  3: "https://www.saddlebackmaine.com/lift-tickets/",
  4: "https://www.pleasantmountain.com/lift-tickets",
  5: "https://store.brettonwoods.com/s/tickets",
  6: "https://estore.cannonmt.com/products/1day-lift-tickets",
  7: "https://www.loonmtn.com/lift-tickets",
  8: "https://www.skiwildcat.com/plan-your-trip/lift-access/discover-passes.aspx",
  9: "https://www.attitash.com/plan-your-trip/lift-access/tickets.aspx",
  10: "https://cranmore.com/tickets",
  11: "https://www.waterville.com/lift-tickets",
  12: "https://estore.gunstock.com/all-day-tickets?orderby=10",
  13: "https://www.raggedmountainresort.com/all-tickets/",
  14: "https://www.mountsunapee.com/plan-your-trip/lift-access/passes.aspx",
  15: "https://www.crotchedmtn.com/plan-your-trip/lift-access/tickets.aspx",
  16: "https://www.killington.com/tickets-passes/winter-tickets/lift-ticket/",
  17: "https://www.stowe.com/plan-your-trip/lift-access/tickets.aspx",
  18: "https://jaypeakresort.com/skiing-riding/tickets-passes",
  19: "https://www.sugarbush.com/plan-your-trip/lift-tickets",
  20: "https://www.mountsnow.com/plan-your-trip/lift-access/tickets.aspx",
  21: "https://www.okemo.com/plan-your-trip/lift-access/tickets.aspx",
  22: "https://www.smuggs.com/tickets-passes/lift-tickets/",
  23: "https://www.stratton.com/plan-your-trip/lift-tickets-season-pass",
  24: "https://www.bromley.com/lift-tickets",
  25: "https://www.madriverglen.com/lift-tickets/",
  26: "https://www.boltonvalley.com/winter/tickets-passes/lift-tickets/",
  27: "https://skiburke.com/tickets-passes/winter-day-tickets",
  28: "https://www.picomountain.com/tickets-passes/winter-tickets/lift-ticket/",
  29: "https://www.magicmtn.com/lift-ticket-info",
  30: "https://whiteface.com/tickets-passes/lift-tickets/",
  31: "https://goremountain.com/tickets-passes/winter-lift-tickets/",
  32: "https://www.huntermtn.com/plan-your-trip/lift-access/lift-ticket-faqs.aspx",
  33: "https://www.windhammountainclub.com/lift-tickets/",
  34: "https://www.belleayre.com/tickets/lift-tickets/",
  35: "https://www.holidayvalley.com/lift-tickets/",
  36: "https://www.greekpeak.net/lift-tickets/",
  37: "https://www.bristolmountain.com/lift-tickets/",
  38: "https://www.titusmountain.com/rates",
  39: "https://westmountain.com/lift-tickets/",
  40: "https://thunderridgeski.com/plan-your-trip/lift-tickets/",
  41: "https://shop.mtpeter.com/lifttickets",
  42: "https://www.jiminypeak.com/skiing-riding/tickets-passes/lift-tickets/",
  43: "https://skibutternut.com/tickets-passes/lift-tickets",
  44: "https://berkshireeast.com/winter/lift-tickets",
  45: "https://catamountski.com/winter/tickets-passes/lift-tickets",
  46: "https://www.wachusett.com/tickets-passes/lift-tickets/daily-lift-tickets/",
  47: "https://bousquetmountain.com/tickets/",
  48: "https://www.camelbackresort.com/lift-tickets-and-passes",
  49: "https://www.skibluemt.com/lift-ticket-deals/",
  50: "https://www.jfbb.com/plan-your-trip/lift-access/lift-ticket-faqs.aspx",
  51: "https://www.montagemountainresorts.com/winterhome/lift-tickets/",
  52: "https://www.bcmountainresort.com/activities/ski-snowboarding/lift-tickets-packages/",
  53: "https://www.elkskier.com/lift-ticket/",
  54: "https://shawneemt.com/tickets-rentals/lift-tickets/",
  55: "https://mountaincreek.com/skiing-riding/tickets-passes/day-tickets/",
  56: "https://www.skicampgaw.com/ticket-rates",
};

const STATE_SLUGS = {
  ME: "maine", NH: "new-hampshire", VT: "vermont", NY: "new-york",
  NJ: "new-jersey", MA: "massachusetts", PA: "pennsylvania",
};

const SLUG_OVERRIDES = {
  "Smugglers' Notch": "smugglers-notch", "Ski Butternut": "butternut",
  "Mount Peter": "mount-peter", "Mount Snow": "mount-snow",
  "Mount Sunapee": "mount-sunapee", "Gore Mountain": "gore-mountain",
  "Hunter Mountain": "hunter-mountain", "Windham Mountain": "windham-mountain",
  "Ragged Mountain": "ragged-mountain", "Magic Mountain": "magic-mountain",
  "Titus Mountain": "titus-mountain", "West Mountain": "west-mountain",
  "Thunder Ridge": "thunder-ridge", "Bristol Mountain": "bristol-mountain",
  "Crotched Mountain": "crotched-mountain", "Blue Mountain": "blue-mountain-resort",
  "Montage Mountain": "montage-mountain", "Bear Creek": "bear-creek-mountain-resort",
  "Elk Mountain": "elk-mountain", "Shawnee Mountain": "shawnee-mountain",
  "Mountain Creek": "mountain-creek", "Jack Frost": "jack-frost",
  "Camelback": "camelback-mountain-resort", "Waterville Valley": "waterville-valley",
  "Holiday Valley": "holiday-valley", "Greek Peak": "greek-peak",
  "Mad River Glen": "mad-river-glen", "Bolton Valley": "bolton-valley",
  "Berkshire East": "berkshire-east", "Bretton Woods": "bretton-woods",
  "Shawnee Peak": "shawnee-peak",
};

function getTrailMapUrl(mountain) {
  const stateSlug = STATE_SLUGS[mountain.state];
  const nameSlug = SLUG_OVERRIDES[mountain.name] ||
    mountain.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `https://www.onthesnow.com/${stateSlug}/${nameSlug}/trail-maps`;
}

function parseDollars(str) {
  if (!str) return 0;
  const match = String(str).match(/\$?([\d,.]+)/);
  return match ? parseFloat(match[1].replace(",", "")) : 0;
}

function WeatherIcon({ code }) {
  const s = 28;
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "#555", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };
  if (code === 0) return <svg {...p}><circle cx="12" cy="12" r="4" fill="#f5a623" stroke="#e8961e" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>;
  if (code <= 3) return <svg {...p}><circle cx="9" cy="9" r="3" fill="#f5a623" stroke="#e8961e" /><path d="M13 15.5A3.5 3.5 0 0 0 9.5 12H9a4 4 0 0 0-4 4h0a2.5 2.5 0 0 0 2.5 2.5h7A2.5 2.5 0 0 0 17 16h0a3 3 0 0 0-3-3h-.5" fill="#ccc" stroke="#999" /></svg>;
  if (code <= 48) return <svg {...p}><path d="M17 18H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 11h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" /></svg>;
  if (code <= 67) return <svg {...p}><path d="M17 15H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 8h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" /><path d="M8 19v2M12 19v2M16 19v2" stroke="#5b9bd5" /></svg>;
  if (code <= 77) return <svg {...p}><path d="M17 14H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 7h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" /><circle cx="8" cy="18" r="1" fill="#5b9bd5" /><circle cx="12" cy="20" r="1" fill="#5b9bd5" /><circle cx="16" cy="18" r="1" fill="#5b9bd5" /></svg>;
  if (code <= 86) return <svg {...p}><path d="M17 14H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 7h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" /><circle cx="8" cy="18" r="1" fill="#5b9bd5" /><circle cx="12" cy="20" r="1" fill="#5b9bd5" /><circle cx="16" cy="18" r="1" fill="#5b9bd5" /></svg>;
  if (code >= 95) return <svg {...p}><path d="M17 15H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 8h.5a3.5 3.5 0 0 1 0 7H17z" fill="#999" stroke="#777" /><path d="M13 16l-2 4h3l-2 4" stroke="#f5a623" strokeWidth="2" fill="none" /></svg>;
  return <svg {...p}><path d="M17 18H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 11h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" /></svg>;
}

export default function PlanTripPopup({ mountain, onClose, origin: originProp, onLocationChange }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skiStart, setSkiStart] = useState("");
  const [skiDays, setSkiDays] = useState(1);
  const [lodgingNights, setLodgingNights] = useState(0);
  const [numPeople, setNumPeople] = useState(1);
  const [gasPrice, setGasPrice] = useState(3.50);
  const [mpg, setMpg] = useState(25);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [includeRentals, setIncludeRentals] = useState(false);
  const [rentalSkis, setRentalSkis] = useState(false);
  const [rentalBoots, setRentalBoots] = useState(false);
  const [rentalHelmet, setRentalHelmet] = useState(false);
  const [needsLiftTicket, setNeedsLiftTicket] = useState(true);
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  useEffect(() => {
    if (!mountain) return;
    setForecastLoading(true);
    setForecast(null);
    fetchWeekForecast(mountain.latitude, mountain.longitude).then((data) => {
      setForecast(data);
      setForecastLoading(false);
    });
  }, [mountain?.id]);

  useEffect(() => {
    setSaved(false);
  }, [mountain?.id]);

  if (!mountain) return null;

  const originCoords = originProp?.coords || [-74.006, 40.7484];
  const originName = originProp?.name || "New York, NY";

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
      setLocationQuery("");
      if (onLocationChange) {
        onLocationChange({ name: shortName, coords: [parseFloat(lon), parseFloat(lat)] });
      }
    } catch {
      setLocationError("Geocode failed");
    }
    setLocationLoading(false);
  };

  const passName = mountain.pass === "ikon" ? "Ikon" : mountain.pass === "epic" ? "Epic" : "Independent";
  const passColors = { ikon: "#1a1a4e", epic: "#f26522", independent: "#7a8a96" };

  const iconSizes = {
    large: { w: 44, h: 38, body: "22,3 38,34 6,34", cap: "22,3 28,15 24,12 20,16 15,13" },
    medium: { w: 36, h: 30, body: "18,3 32,28 4,28", cap: "18,3 23,12 20,10 17,13 12,11" },
    small: { w: 28, h: 24, body: "14,3 25,22 3,22", cap: "14,3 18,10 16,8 13,11 10,9" },
  };
  const iconColors = { ikon: "#1A1A4E", epic: "#F26522", independent: "#4a6d8a" };
  const s = iconSizes[mountain.size] || iconSizes.small;
  const c = iconColors[mountain.pass] || iconColors.independent;

  const ticketPrice = parseDollars(mountain.liftTicket);
  const lodgingPrice = parseDollars(mountain.costPerNight);

  const liftTotal = needsLiftTicket ? ticketPrice * skiDays * numPeople : 0;
  const roomsNeeded = Math.ceil(numPeople / 2);
  const lodgingTotal = lodgingPrice * lodgingNights * roomsNeeded;
  const driveHours = mountain.driveFromNYC ? parseFloat(mountain.driveFromNYC) : 0;
  const estMilesOneWay = Math.round(driveHours * 55);
  const gasEstimate = mpg > 0 ? Math.round((estMilesOneWay * 2 / mpg) * gasPrice) : 0;
  const rentalSkisPrice = 60;
  const rentalBootsPrice = 40;
  const rentalHelmetPrice = 20;
  const rentalPerDay = (rentalSkis ? rentalSkisPrice : 0) + (rentalBoots ? rentalBootsPrice : 0) + (rentalHelmet ? rentalHelmetPrice : 0);
  const rentalTotal = includeRentals ? rentalPerDay * skiDays * numPeople : 0;
  const grandTotal = liftTotal + lodgingTotal + gasEstimate + rentalTotal;

  // Compute check-in/check-out dates for Airbnb
  let checkin = "";
  let checkout = "";
  if (skiStart && lodgingNights > 0) {
    checkin = skiStart;
    const d = new Date(skiStart + "T00:00:00");
    d.setDate(d.getDate() + lodgingNights);
    checkout = d.toISOString().split("T")[0];
  }

  const handleSaveTrip = async () => {
    if (!user || !mountain) return;
    setSaving(true);
    try {
      const skiEnd = skiStart ? (() => { const d = new Date(skiStart + "T00:00:00"); d.setDate(d.getDate() + skiDays - 1); return d.toISOString().split("T")[0]; })() : "";
      const data = {
        userId: user.uid,
        resortName: mountain.name,
        skiingDates: { start: skiStart, end: skiEnd },
        lodgingDates: lodgingNights > 0 && checkin ? { start: checkin, end: checkout } : { start: "", end: "" },
        lodgingCost: lodgingTotal,
        groupMembers: numPeople > 1 ? [`${numPeople} people`] : [],
        notes: [
          needsLiftTicket ? `Lift tickets: $${liftTotal}` : "Lift ticket not needed",
          includeRentals && rentalTotal > 0 ? `Rentals: $${rentalTotal}` : "",
          gasEstimate > 0 ? `Gas: ~$${gasEstimate}` : "",
          `Estimated total: $${grandTotal}`,
        ].filter(Boolean).join(" | "),
      };
      await createTrip(data);
      setSaved(true);
    } catch (err) {
      console.error("Failed to save trip:", err);
    }
    setSaving(false);
  };

  const directionsUrl = `https://www.google.com/maps/dir/${originCoords[1]},${originCoords[0]}/${mountain.latitude},${mountain.longitude}`;
  const ticketUrl = TICKET_URLS[mountain.id];
  const lodgingParams = new URLSearchParams({ query: mountain.name + " " + mountain.state });
  if (checkin) { lodgingParams.set("checkin", checkin); lodgingParams.set("checkout", checkout); }
  const lodgingUrl = `https://www.airbnb.com/s/${encodeURIComponent(mountain.name + " " + mountain.state)}/homes?${lodgingParams.toString()}`;
  const trailMapUrl = getTrailMapUrl(mountain);
  const resortUrl = `https://www.google.com/search?q=${encodeURIComponent(mountain.name + " ski resort " + mountain.state + " official site")}&btnI`;

  const linkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    background: "#f8f9fa",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#1a1a2e",
    fontSize: "13px",
    fontWeight: 600,
    border: "1.5px solid #e8e8e8",
  };

  const subtextStyle = { fontSize: "10px", color: "#888", fontWeight: 400 };

  const labelStyle = { fontSize: "11px", color: "#555", fontWeight: 600, marginBottom: "3px", display: "block" };

  const inputStyle = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#333",
  };

  const costRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    padding: "4px 0",
  };

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 9999, pointerEvents: "none" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "16px 16px 0 0", padding: "14px 16px", width: "100%", boxShadow: "0 -4px 20px rgba(0,0,0,0.15)", pointerEvents: "auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`}>
              <polygon points={s.body} fill={c} stroke={`${c}4d`} strokeWidth="1" strokeLinejoin="round" />
              <polygon points={s.cap} fill="white" stroke="#c0d4e0" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#1a1a2e" }}>{mountain.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <span style={{ background: "#e8f4f8", color: "#2d6a7a", padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 600 }}>{mountain.state}</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: passColors[mountain.pass] }}>{passName}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {user && (
              <button
                onClick={handleSaveTrip}
                disabled={saving || saved}
                style={{
                  background: saved ? "#4caf50" : "#1a1a2e",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: saving || saved ? "default" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {saved ? "Saved!" : saving ? "Saving..." : "Save This Trip"}
              </button>
            )}
            <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", width: "28px", height: "28px", borderRadius: "50%", fontSize: "14px", cursor: "pointer", flexShrink: 0 }}>✕</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px" }}>

          {/* Left side: Cost Estimator */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#1a1a2e" }}>Cost Estimator</h3>

            <div style={{ marginBottom: "8px" }}>
              <span style={labelStyle}>Travel From</span>
              <div style={{ display: "flex", gap: "4px" }}>
                <input
                  type="text"
                  placeholder={originName}
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleGeocode(); }}
                  disabled={locationLoading}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={locationLoading || !locationQuery.trim()}
                  style={{ padding: "6px 10px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", opacity: locationLoading || !locationQuery.trim() ? 0.5 : 1 }}
                >
                  {locationLoading ? "..." : "Go"}
                </button>
              </div>
              {originName !== "New York, NY" && !locationQuery && (
                <span style={{ fontSize: "10px", color: "#888", marginTop: "2px", display: "block" }}>{originName}</span>
              )}
              {locationError && (
                <span style={{ fontSize: "10px", color: "#d32f2f", marginTop: "2px", display: "block" }}>{locationError}</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <div style={{ flex: 1 }}>
                <span style={{ ...labelStyle, color: gasPrice !== 3.50 ? "#1a1a2e" : "#888" }}>Gas Price ($/gal)</span>
                <input type="number" min="0" step="0.10" value={gasPrice} onChange={(e) => setGasPrice(Number(e.target.value) || 0)} style={{ ...inputStyle, color: gasPrice !== 3.50 ? "#1a1a2e" : "#888" }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ ...labelStyle, color: mpg !== 25 ? "#1a1a2e" : "#888" }}>Your MPG</span>
                <input type="number" min="1" step="1" value={mpg} onChange={(e) => setMpg(Number(e.target.value) || 1)} style={{ ...inputStyle, color: mpg !== 25 ? "#1a1a2e" : "#888" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Ski Start Date</span>
                <input type="date" value={skiStart} onChange={(e) => setSkiStart(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Ski Days</span>
                <select value={skiDays} onChange={(e) => setSkiDays(Number(e.target.value))} style={inputStyle}>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>Lodging Nights</span>
                <select value={lodgingNights} onChange={(e) => setLodgingNights(Number(e.target.value))} style={inputStyle}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <span style={labelStyle}>People</span>
                <select value={numPeople} onChange={(e) => setNumPeople(Number(e.target.value))} style={inputStyle}>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <button
                type="button"
                onClick={() => setNeedsLiftTicket(!needsLiftTicket)}
                style={{ flex: 1, padding: "6px 8px", background: needsLiftTicket ? "#1a1a2e" : "#f8f9fa", color: needsLiftTicket ? "white" : "#1a1a2e", border: "1.5px solid #1a1a2e", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
              >
                {needsLiftTicket ? "🎟️ Lift Ticket Included" : "🎟️ Lift Ticket Needed?"}
              </button>
              <button
                type="button"
                onClick={() => { const next = !includeRentals; setIncludeRentals(next); if (!next) { setRentalSkis(false); setRentalBoots(false); setRentalHelmet(false); } }}
                style={{ flex: 1, padding: "6px 8px", background: includeRentals ? "#1a1a2e" : "#f8f9fa", color: includeRentals ? "white" : "#1a1a2e", border: "1.5px solid #1a1a2e", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
              >
                {includeRentals ? "Rentals Included" : "Add Rentals"}
              </button>
            </div>

            {includeRentals && (
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                {[
                  { label: "Skis", price: rentalSkisPrice, active: rentalSkis, set: setRentalSkis },
                  { label: "Boots", price: rentalBootsPrice, active: rentalBoots, set: setRentalBoots },
                  { label: "Helmet", price: rentalHelmetPrice, active: rentalHelmet, set: setRentalHelmet },
                ].map(({ label, price, active, set }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set(!active)}
                    style={{ flex: 1, padding: "5px 4px", background: active ? "#1a1a2e" : "#f8f9fa", color: active ? "white" : "#555", border: active ? "1.5px solid #1a1a2e" : "1.5px solid #ddd", borderRadius: "6px", fontSize: "10px", fontWeight: 600, cursor: "pointer", textAlign: "center" }}
                  >
                    {label}<br /><span style={{ fontSize: "9px", fontWeight: 400 }}>${price}/day</span>
                  </button>
                ))}
              </div>
            )}



            <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", border: "1px solid #e8e8e8" }}>
              {needsLiftTicket && (
                <div style={costRowStyle}>
                  <span style={{ color: "#555" }}>Lift Tickets ({mountain.liftTicket} x {skiDays}d x {numPeople}p)</span>
                  <span style={{ fontWeight: 700 }}>${liftTotal}</span>
                </div>
              )}
              {lodgingNights > 0 && (
                <div style={costRowStyle}>
                  <span style={{ color: "#555" }}>Lodging ({mountain.costPerNight} x {lodgingNights}n{roomsNeeded > 1 ? ` x ${roomsNeeded} rooms` : ""})</span>
                  <span style={{ fontWeight: 700 }}>${lodgingTotal}</span>
                </div>
              )}
              {includeRentals && (
                <div style={costRowStyle}>
                  <span style={{ color: "#555" }}>Rentals (${rentalPerDay} x {skiDays}d x {numPeople}p)</span>
                  <span style={{ fontWeight: 700 }}>${rentalTotal}</span>
                </div>
              )}
              <div style={costRowStyle}>
                <span style={{ color: "#555" }}>Gas (~{estMilesOneWay * 2} mi roundtrip)</span>
                <span style={{ fontWeight: 700 }}>${gasEstimate}</span>
              </div>
              <div style={{ ...costRowStyle, borderTop: "1.5px solid #ddd", paddingTop: "8px", marginTop: "4px", fontSize: "15px" }}>
                <span style={{ fontWeight: 700, color: "#1a1a2e" }}>Estimated Total</span>
                <span style={{ fontWeight: 700, color: "#1a1a2e" }}>${grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Right side: Quick Links */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "14px", color: "#1a1a2e" }}>Quick Links</h3>

            <a href={ticketUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ fontSize: "16px" }}>🎟️</span>
              <div>
                Buy Lift Tickets
                <div style={subtextStyle}>{mountain.liftTicket} · {mountain.name}</div>
              </div>
            </a>

            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ fontSize: "16px" }}>🚗</span>
              <div>
                Get Directions
                <div style={subtextStyle}>From {originName.split(",")[0]} · Google Maps</div>
              </div>
            </a>

            <a href={lodgingUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ fontSize: "16px" }}>🏨</span>
              <div>
                Book Lodging
                <div style={subtextStyle}>{mountain.costPerNight}/night · Airbnb</div>
              </div>
            </a>

            <a href={trailMapUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ fontSize: "16px" }}>🗺️</span>
              <div>
                Trail Map
                <div style={subtextStyle}>{mountain.runs} runs · OnTheSnow</div>
              </div>
            </a>

            <a href={resortUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              <span style={{ fontSize: "16px" }}>🏔️</span>
              <div>
                Visit Resort Website
                <div style={subtextStyle}>{mountain.name} official site</div>
              </div>
            </a>

            {/* 3-Day Forecast */}
            {(() => {
              if (forecastLoading) return <div style={{ fontSize: "12px", color: "#999", padding: "8px 0", textAlign: "center" }}>Loading forecast...</div>;
              if (!forecast) return null;

              let forecastDays;
              if (skiStart) {
                const startIdx = forecast.findIndex((d) => d.date === skiStart);
                if (startIdx === -1) {
                  return (
                    <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px", marginTop: "4px", textAlign: "center", border: "1px solid #e8e8e8" }}>
                      <div style={{ fontSize: "12px", color: "#888", fontWeight: 600 }}>Forecast Unavailable</div>
                      <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>Selected dates are outside the 7-day forecast window</div>
                    </div>
                  );
                }
                forecastDays = forecast.slice(startIdx, startIdx + 3);
              } else {
                forecastDays = forecast.slice(0, 3);
              }

              return (
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  {forecastDays.map((day) => {
                    const d = new Date(day.date + "T00:00:00");
                    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
                    const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const hasSnow = parseFloat(day.snowfall) > 0;
                    return (
                      <div key={day.date} style={{ flex: 1, display: "flex", gap: "6px", background: hasSnow ? "#f0f7ff" : "#f8f9fa", borderRadius: "8px", padding: "6px", border: "1px solid #e8e8e8" }}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minWidth: "34px" }}>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>{dayLabel}</div>
                          <div style={{ fontSize: "13px", color: "#888" }}>{dateLabel}</div>
                        </div>
                        <div style={{ width: "1px", background: "#1a1a2e", alignSelf: "center", height: "60%", borderRadius: "1px", marginLeft: "11px" }} />
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                          <WeatherIcon code={day.weatherCode} />
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1a1a2e" }}>{day.high}°/{day.low}°</div>
                          <div style={{ fontSize: "9px", color: "#2196f3", fontWeight: 700 }}>❄️ {day.snowfall}"</div>
                          <div style={{ fontSize: "9px", color: "#555" }}>💨 {day.wind}mph</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>

      </div>
    </div>
  );
}
