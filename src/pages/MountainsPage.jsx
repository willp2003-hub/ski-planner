import React, { useState } from "react";
import { Link } from "react-router-dom";
import mountains from "../data/mountains.js";
import MountainIcon from "../components/MountainIcon.jsx";

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
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? mountains.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        STATE_NAMES[m.state]?.toLowerCase().includes(query.toLowerCase())
      )
    : mountains;

  const grouped = {};
  for (const m of filtered) {
    if (!grouped[m.state]) grouped[m.state] = [];
    grouped[m.state].push(m);
  }

  // Sort mountains within each state alphabetically
  for (const state of Object.keys(grouped)) {
    grouped[state].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Sort states alphabetically by full name
  const sortedStates = Object.keys(grouped).sort((a, b) =>
    (STATE_NAMES[a] || a).localeCompare(STATE_NAMES[b] || b)
  );

  return (
    <div className="mountains-page">
      <h1>All Mountains</h1>
      <div className="mountains-search-wrap">
        <input
          className="mountains-search"
          type="text"
          placeholder="Search mountains or states…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="mountains-search-clear" onClick={() => setQuery("")}>
            ✕
          </button>
        )}
      </div>
      {sortedStates.map((state) => (
        <div key={state} className="state-group">
          <h2>{STATE_NAMES[state] || state}</h2>
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
      {filtered.length === 0 && (
        <p className="mountains-no-results">No mountains found for "{query}"</p>
      )}
    </div>
  );
}

export default MountainsPage;
