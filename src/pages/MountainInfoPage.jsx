import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import mountains from "../data/mountains.js";
import MountainIcon from "../components/MountainIcon.jsx";
import { fetchTrailStatus } from "../services/trailStatus.js";
import { fetchWeekForecast, fetchSeasonSnowfall, fetchBaseAndAverage } from "../services/weather.js";
import SnowChart from "../components/SnowChart.jsx";

const STATE_NAMES = {
  ME: "Maine",
  NH: "New Hampshire",
  VT: "Vermont",
  NY: "New York",
  NJ: "New Jersey",
  MA: "Massachusetts",
  PA: "Pennsylvania",
};

const STATE_SLUGS = {
  ME: "maine",
  NH: "new-hampshire",
  VT: "vermont",
  NY: "new-york",
  NJ: "new-jersey",
  MA: "massachusetts",
  PA: "pennsylvania",
};

const SLUG_OVERRIDES = {
  "Smugglers' Notch": "smugglers-notch",
  "Ski Butternut": "butternut",
  "Mount Peter": "mount-peter",
  "Mount Snow": "mount-snow",
  "Mount Sunapee": "mount-sunapee",
  "Gore Mountain": "gore-mountain",
  "Hunter Mountain": "hunter-mountain",
  "Windham Mountain": "windham-mountain",
  "Ragged Mountain": "ragged-mountain",
  "Magic Mountain": "magic-mountain",
  "Titus Mountain": "titus-mountain",
  "West Mountain": "west-mountain",
  "Thunder Ridge": "thunder-ridge",
  "Bristol Mountain": "bristol-mountain",
  "Crotched Mountain": "crotched-mountain",
  "Blue Mountain": "blue-mountain-resort",
  "Montage Mountain": "montage-mountain",
  "Bear Creek": "bear-creek-mountain-resort",
  "Elk Mountain": "elk-mountain",
  "Shawnee Mountain": "shawnee-mountain",
  "Mountain Creek": "mountain-creek",
  "Jack Frost": "jack-frost",
  "Camelback": "camelback-mountain-resort",
  "Waterville Valley": "waterville-valley",
  "Holiday Valley": "holiday-valley",
  "Greek Peak": "greek-peak",
  "Mad River Glen": "mad-river-glen",
  "Bolton Valley": "bolton-valley",
  "Berkshire East": "berkshire-east",
  "Bretton Woods": "bretton-woods",
  "Shawnee Peak": "shawnee-peak",
};

const MOUNTAIN_WEBSITES = {
  "Sugarloaf": "https://www.sugarloaf.com",
  "Sunday River": "https://www.sundayriver.com",
  "Saddleback": "https://www.saddlebackmaine.com",
  "Shawnee Peak": "https://www.shawneepeak.com",
  "Bretton Woods": "https://www.brettonwoods.com",
  "Cannon": "https://www.cannonmt.com",
  "Loon": "https://www.loonmtn.com",
  "Wildcat": "https://www.skiwildcat.com",
  "Attitash": "https://www.attitash.com",
  "Cranmore": "https://www.cranmore.com",
  "Waterville Valley": "https://www.waterville.com",
  "Gunstock": "https://www.gunstock.com",
  "Ragged Mountain": "https://www.raggedmountainresort.com",
  "Mount Sunapee": "https://www.mountsunapee.com",
  "Crotched Mountain": "https://www.crotchedmtn.com",
  "Killington": "https://www.killington.com",
  "Stowe": "https://www.stowe.com",
  "Jay Peak": "https://www.jaypeakresort.com",
  "Sugarbush": "https://www.sugarbush.com",
  "Mount Snow": "https://www.mountsnow.com",
  "Okemo": "https://www.okemo.com",
  "Smugglers' Notch": "https://www.smuggs.com",
  "Stratton": "https://www.stratton.com",
  "Bromley": "https://www.bromley.com",
  "Mad River Glen": "https://www.madriverglen.com",
  "Bolton Valley": "https://www.boltonvalley.com",
  "Burke": "https://www.burkemountain.com",
  "Pico": "https://www.picomountain.com",
  "Magic Mountain": "https://www.magicmtn.com",
  "Whiteface": "https://www.whiteface.com",
  "Gore Mountain": "https://www.goremountain.com",
  "Hunter Mountain": "https://www.huntermtn.com",
  "Windham Mountain": "https://www.windhammountain.com",
  "Belleayre": "https://www.belleayre.com",
  "Holiday Valley": "https://www.holidayvalley.com",
  "Greek Peak": "https://www.greekpeak.net",
  "Bristol Mountain": "https://www.bristolmountain.com",
  "Titus Mountain": "https://www.titusmountain.com",
  "West Mountain": "https://www.westmtn.net",
  "Thunder Ridge": "https://www.thunderridgeski.com",
  "Mount Peter": "https://www.mtpeter.com",
  "Jiminy Peak": "https://www.jiminypeak.com",
  "Ski Butternut": "https://www.skibutternut.com",
  "Berkshire East": "https://www.berkshireeast.com",
  "Catamount": "https://www.catamountski.com",
  "Wachusett": "https://www.wachusett.com",
  "Bousquet": "https://www.bousquets.com",
  "Camelback": "https://www.camelbackresort.com",
  "Blue Mountain": "https://www.skibluemt.com",
  "Jack Frost": "https://www.jfrbbresort.com",
  "Montage Mountain": "https://www.montagemountainresorts.com",
  "Bear Creek": "https://www.bcmountainresort.com",
  "Elk Mountain": "https://www.elkskier.com",
  "Shawnee Mountain": "https://www.shawneemt.com",
  "Mountain Creek": "https://www.mountaincreek.com",
  "Campgaw": "https://www.campgaw.com",
};

function getTrailMapUrl(mountain) {
  const stateSlug = STATE_SLUGS[mountain.state];
  const nameSlug = SLUG_OVERRIDES[mountain.name] ||
    mountain.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `https://www.onthesnow.com/${stateSlug}/${nameSlug}/trail-maps`;
}

function WeatherIcon({ code }) {
  const size = 26;
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "#555", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };

  // clear
  if (code === 0) return (
    <svg {...props}>
      <circle cx="12" cy="12" r="4" fill="#f5a623" stroke="#e8961e" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
  // partly cloudy
  if (code <= 3) return (
    <svg {...props}>
      <circle cx="9" cy="9" r="3" fill="#f5a623" stroke="#e8961e" />
      <path d="M9 3v1.5M9 13.5V15M3 9h1.5M13.5 9H15M5.1 5.1l1.06 1.06M11.84 11.84l1.06 1.06M5.1 12.9l1.06-1.06M11.84 6.16l1.06-1.06" />
      <path d="M13 15.5A3.5 3.5 0 0 0 9.5 12H9a4 4 0 0 0-4 4h0a2.5 2.5 0 0 0 2.5 2.5h7A2.5 2.5 0 0 0 17 16h0a3 3 0 0 0-3-3h-.5" fill="#ccc" stroke="#999" />
    </svg>
  );
  // cloudy/fog
  if (code <= 48) return (
    <svg {...props}>
      <path d="M17 18H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 11h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" />
    </svg>
  );
  // drizzle/rain
  if (code <= 67) return (
    <svg {...props}>
      <path d="M17 15H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 8h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" />
      <path d="M8 19v2M12 19v2M16 19v2" stroke="#5b9bd5" />
    </svg>
  );
  // snow
  if (code <= 77) return (
    <svg {...props}>
      <path d="M17 14H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 7h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" />
      <circle cx="8" cy="18" r="1" fill="#5b9bd5" /><circle cx="12" cy="20" r="1" fill="#5b9bd5" /><circle cx="16" cy="18" r="1" fill="#5b9bd5" />
    </svg>
  );
  // rain showers
  if (code <= 82) return (
    <svg {...props}>
      <path d="M17 15H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 8h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" />
      <path d="M8 19v2M12 19v2M16 19v2" stroke="#5b9bd5" />
    </svg>
  );
  // snow showers
  if (code <= 86) return (
    <svg {...props}>
      <path d="M17 14H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 7h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" />
      <circle cx="8" cy="18" r="1" fill="#5b9bd5" /><circle cx="12" cy="20" r="1" fill="#5b9bd5" /><circle cx="16" cy="18" r="1" fill="#5b9bd5" />
    </svg>
  );
  // thunderstorm
  if (code >= 95) return (
    <svg {...props}>
      <path d="M17 15H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 8h.5a3.5 3.5 0 0 1 0 7H17z" fill="#999" stroke="#777" />
      <path d="M13 16l-2 4h3l-2 4" stroke="#f5a623" strokeWidth="2" fill="none" />
    </svg>
  );
  // default cloudy
  return (
    <svg {...props}>
      <path d="M17 18H7a4 4 0 0 1-.8-7.9A5.5 5.5 0 0 1 17 11h.5a3.5 3.5 0 0 1 0 7H17z" fill="#ccc" stroke="#999" />
    </svg>
  );
}

function MountainInfoPage() {
  const { mountainId } = useParams();
  const mountain = mountains.find((m) => String(m.id) === mountainId);
  const [trailStatus, setTrailStatus] = useState(null);
  const [trailLoading, setTrailLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [snowData, setSnowData] = useState(null);
  const [snowLoading, setSnowLoading] = useState(false);
  const [baseData, setBaseData] = useState(null);
  const [baseLoading, setBaseLoading] = useState(false);

  useEffect(() => {
    if (!mountain) return;
    setTrailLoading(true);
    fetchTrailStatus(mountain.name).then((data) => {
      setTrailStatus(data);
      setTrailLoading(false);
    });
    setForecastLoading(true);
    fetchWeekForecast(mountain.latitude, mountain.longitude).then((data) => {
      setForecast(data);
      setForecastLoading(false);
    });
    setSnowLoading(true);
    fetchSeasonSnowfall(mountain.latitude, mountain.longitude).then((data) => {
      setSnowData(data);
      setSnowLoading(false);
    });
    setBaseLoading(true);
    fetchBaseAndAverage(mountain.latitude, mountain.longitude).then((data) => {
      setBaseData(data);
      setBaseLoading(false);
    });
  }, [mountain?.name]);

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
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <MountainIcon pass={mountain.pass} size={32} />
        {mountain.name}
      </h1>
      <p className="mountain-info-subtitle">
        {STATE_NAMES[mountain.state] || mountain.state} &middot;{" "}
        <span className={`pass-badge ${mountain.pass}`}>{mountain.pass}</span>
      </p>

      <div className="mountain-info-grid">
        {MOUNTAIN_WEBSITES[mountain.name] && (
          <div className="info-card trail-map-card">
            <h3>Mountain Site</h3>
            <a
              href={MOUNTAIN_WEBSITES[mountain.name]}
              target="_blank"
              rel="noopener noreferrer"
              className="trail-map-link"
            >
              Visit {mountain.name} Website &rarr;
            </a>
          </div>
        )}

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
          {trailLoading ? (
            <div className="info-row">
              <span className="info-label">Trails Open</span>
              <span className="info-value">Loading...</span>
            </div>
          ) : trailStatus?.trailsOpen != null ? (
            <>
              <div className="info-row">
                <span className="info-label">Trails Open</span>
                <span className="info-value">{trailStatus.trailsOpen} / {trailStatus.trailsTotal}</span>
              </div>
              {trailStatus.liftsOpen != null && (
                <div className="info-row">
                  <span className="info-label">Lifts Open</span>
                  <span className="info-value">{trailStatus.liftsOpen} / {trailStatus.liftsTotal}</span>
                </div>
              )}
            </>
          ) : (
            <div className="info-row">
              <span className="info-label">Runs</span>
              <span className="info-value">{mountain.runs}</span>
            </div>
          )}
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
          {snowLoading ? (
            <p style={{ color: "#999", fontSize: 13 }}>Loading snowfall data...</p>
          ) : snowData ? (
            <SnowChart data={snowData} />
          ) : (
            <div className="info-row">
              <span className="info-label">Past 7 Days</span>
              <span className="info-value">{mountain.snowfallPast7Days}</span>
            </div>
          )}
          {baseLoading ? (
            <p style={{ color: "#999", fontSize: 13, marginTop: 8 }}>Loading base data...</p>
          ) : baseData ? (
            <>
              <div className="info-row" style={{ marginTop: 8 }}>
                <span className="info-label">Current Base</span>
                <span className="info-value">{baseData.currentBase}"</span>
              </div>
<div className="info-row">
                <span className="info-label">vs 10-Year Avg</span>
                <span className="info-value" style={{ color: baseData.snowVsAverage != null ? (baseData.snowVsAverage >= 100 ? "#4caf50" : "#e65100") : undefined }}>
                  {baseData.snowVsAverage != null ? `${baseData.snowVsAverage}%` : "—"}
                </span>
              </div>
            </>
          ) : null}
        </div>

        <div className="info-card">
          <h3>7-Day Forecast</h3>
          {forecastLoading ? (
            <p style={{ color: "#999", fontSize: 13 }}>Loading forecast...</p>
          ) : forecast ? (
            <div className="forecast-table-wrap">
              <table className="forecast-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Day</th>
                    <th>Hi / Lo</th>
                    <th>Wind</th>
                    <th>Precip</th>
                    <th>Snow</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((day) => {
                    const d = new Date(day.date + "T00:00:00");
                    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    return (
                      <tr key={day.date}>
                        <td className="forecast-icon"><WeatherIcon code={day.weatherCode} /></td>
                        <td className="forecast-day">{label}</td>
                        <td>{day.high}° / {day.low}°</td>
                        <td>{day.wind} mph</td>
                        <td>{day.precip}"</td>
                        <td>{day.snowfall}"</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#999", fontSize: 13 }}>Forecast unavailable</p>
          )}
        </div>

        <div className="info-card trail-map-card">
          <h3>Trail Map</h3>
          <a
            href={getTrailMapUrl(mountain)}
            target="_blank"
            rel="noopener noreferrer"
            className="trail-map-link"
          >
            View Trail Map on OnTheSnow &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

export default MountainInfoPage;
