import React from "react";

function StatsSummaryBar({ posts, mountains }) {
  const totalDays = posts.length;

  // Find most visited resort
  let favoriteResort = null;
  if (posts.length > 0) {
    const counts = {};
    posts.forEach((p) => {
      counts[p.resortId] = (counts[p.resortId] || 0) + 1;
    });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const mtn = mountains.find((m) => String(m.id) === String(topId));
    favoriteResort = mtn?.name || posts.find((p) => String(p.resortId) === String(topId))?.resortName;
  }

  const uniqueResorts = new Set(posts.map((p) => p.resortId)).size;

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-value">{totalDays}</span>
        <span className="stat-label">Ski Days</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{uniqueResorts}</span>
        <span className="stat-label">Resorts</span>
      </div>
      {favoriteResort && (
        <div className="stat-item">
          <span className="stat-value">{favoriteResort}</span>
          <span className="stat-label">Favorite</span>
        </div>
      )}
    </div>
  );
}

export default StatsSummaryBar;
