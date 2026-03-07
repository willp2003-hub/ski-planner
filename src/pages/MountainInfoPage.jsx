import React from "react";
import { useParams, Link } from "react-router-dom";
import mountains from "../data/mountains.js";

const STATE_NAMES = {
  ME: "Maine",
  NH: "New Hampshire",
  VT: "Vermont",
  NY: "New York",
  NJ: "New Jersey",
  MA: "Massachusetts",
  PA: "Pennsylvania",
};

function MountainInfoPage() {
  const { mountainId } = useParams();
  const mountain = mountains.find((m) => String(m.id) === mountainId);

  if (!mountain) {
    return (
      <div className="mountains-page">
        <h1>Mountain not found</h1>
        <Link to="/mountains">Back to all mountains</Link>
      </div>
    );
  }

  const { green, blue, black } = mountain.difficulty;

  return (
    <div className="mountains-page">
      <Link to="/mountains" className="back-link">&larr; All Mountains</Link>
      <h1>{mountain.name}</h1>
      <p className="mountain-info-subtitle">
        {STATE_NAMES[mountain.state] || mountain.state} &middot;{" "}
        <span className={`pass-badge ${mountain.pass}`}>{mountain.pass}</span>
        &nbsp;&middot;&nbsp;
        <span className="mountain-info-size">{mountain.size}</span>
      </p>

      <div className="mountain-info-grid">
        <div className="info-card">
          <h3>Getting There</h3>
          <div className="info-row">
            <span className="info-label">Drive from NYC</span>
            <span className="info-value">{mountain.driveFromNYC}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Coordinates</span>
            <span className="info-value">{mountain.latitude.toFixed(2)}°N, {Math.abs(mountain.longitude).toFixed(2)}°W</span>
          </div>
        </div>

        <div className="info-card">
          <h3>Terrain</h3>
          <div className="info-row">
            <span className="info-label">Runs</span>
            <span className="info-value">{mountain.runs}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Vertical Drop</span>
            <span className="info-value">{mountain.verticalDrop.toLocaleString()} ft</span>
          </div>
          <div className="info-row">
            <span className="info-label">Skiable Acres</span>
            <span className="info-value">{mountain.skiableAcres.toLocaleString()}</span>
          </div>
          <div className="difficulty-bar-container">
            <div className="difficulty-bar">
              <div className="difficulty-segment green" style={{ width: `${green}%` }}>{green}%</div>
              <div className="difficulty-segment blue" style={{ width: `${blue}%` }}>{blue}%</div>
              <div className="difficulty-segment black" style={{ width: `${black}%` }}>{black}%</div>
            </div>
            <div className="difficulty-legend">
              <span className="legend-item"><span className="legend-dot green"></span>Beginner</span>
              <span className="legend-item"><span className="legend-dot blue"></span>Intermediate</span>
              <span className="legend-item"><span className="legend-dot black"></span>Advanced</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Pricing</h3>
          <div className="info-row">
            <span className="info-label">Lift Ticket</span>
            <span className="info-value">{mountain.liftTicket}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Lodging / Night</span>
            <span className="info-value">{mountain.costPerNight}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>Snow</h3>
          <div className="info-row">
            <span className="info-label">Past 7 Days</span>
            <span className="info-value">{mountain.snowfallPast7Days}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MountainInfoPage;
