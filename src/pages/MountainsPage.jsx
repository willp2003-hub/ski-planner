import React from "react";
import { Link } from "react-router-dom";
import mountains from "../data/mountains.js";
import MountainIcon from "../components/MountainIcon.jsx";

const STATE_ORDER = ["ME", "NH", "VT", "NY", "NJ", "MA", "PA"];
const STATE_NAMES = {
  ME: "Maine",
  NH: "New Hampshire",
  VT: "Vermont",
  NY: "New York",
  NJ: "New Jersey",
  MA: "Massachusetts",
  PA: "Pennsylvania",
};

function MountainsPage() {
  const grouped = {};
  for (const m of mountains) {
    if (!grouped[m.state]) grouped[m.state] = [];
    grouped[m.state].push(m);
  }

  return (
    <div className="mountains-page">
      <h1>All Mountains</h1>
      {STATE_ORDER.filter((s) => grouped[s]).map((state) => (
        <div key={state} className="state-group">
          <h2>{STATE_NAMES[state]}</h2>
          <div className="mountain-list">
            {grouped[state].map((m) => (
              <Link
                key={m.id}
                to={`/mountains/${m.id}`}
                className="mountain-list-item"
              >
                <span className="mountain-list-name">
                  <MountainIcon pass={m.pass} />
                  {m.name}
                </span>
                <span className="mountain-list-meta">
                  <span className={`pass-badge ${m.pass}`}>{m.pass}</span>
                  <span className="mountain-list-runs">{m.skiableAcres.toLocaleString()} acres</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MountainsPage;
