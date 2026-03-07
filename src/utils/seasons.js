// Season runs Oct 1 → Sep 30. "2025" means the 2025-26 season.

export function getSeasonRange(year) {
  return {
    start: `${year}-10-01`,
    end: `${year + 1}-09-30`,
  };
}

export function getSeasonForDate(dateStr) {
  const d = new Date(dateStr);
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();
  // Oct–Dec belong to that year's season; Jan–Sep belong to previous year's season
  return month >= 9 ? year : year - 1;
}

export function getAvailableSeasons(posts) {
  const seasons = new Set();
  posts.forEach((p) => {
    if (p.date) seasons.add(getSeasonForDate(p.date));
  });
  return Array.from(seasons).sort((a, b) => b - a);
}

export function getCurrentSeasonYear() {
  const now = new Date();
  return now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
}

export function formatSeasonLabel(year) {
  return `${year}-${String(year + 1).slice(2)}`;
}
