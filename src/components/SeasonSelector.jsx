import React from "react";
import { getAvailableSeasons, getCurrentSeasonYear, formatSeasonLabel } from "../utils/seasons.js";

function SeasonSelector({ posts, selectedSeason, onSeasonChange }) {
  const seasons = getAvailableSeasons(posts);
  const current = getCurrentSeasonYear();

  // Always include current season even if no posts
  if (!seasons.includes(current)) {
    seasons.unshift(current);
  }

  return (
    <select
      className="season-select"
      value={selectedSeason}
      onChange={(e) => onSeasonChange(Number(e.target.value))}
    >
      {seasons.map((y) => (
        <option key={y} value={y}>
          {formatSeasonLabel(y)}
        </option>
      ))}
    </select>
  );
}

export default SeasonSelector;
