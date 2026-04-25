const DEFAULT_WEIGHTS = {
  snow: 30,
  terrain: 25,
  drive: 20,
  value: 10,
  size: 10,
  trailsOpen: 5,
};

function parseDriveMinutes(driveStr) {
  if (!driveStr) return null;
  const match = driveStr.match(/(\d+)h\s*(\d+)?m?/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
}

function parseDollars(str) {
  if (!str) return null;
  const match = String(str).match(/\$?([\d,.]+)/);
  return match ? parseFloat(match[1].replace(",", "")) : null;
}

function parseInches(str) {
  if (!str) return 0;
  const match = String(str).match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function normalize(value, min, max) {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function recommendMountains(mountains, preferences, weights = DEFAULT_WEIGHTS) {
  const { passTypes, maxDrive, ticketBudget, lodgingCost, difficulty, sizePrefs } = preferences;

  // --- Stage 1: Hard Filters ---
  let filtered = [...mountains];

  if (passTypes && passTypes.length > 0) {
    filtered = filtered.filter((m) => passTypes.includes(m.pass));
  }

  if (sizePrefs && sizePrefs.length > 0) {
    filtered = filtered.filter((m) => sizePrefs.includes(m.size));
  }

  const maxDriveMin = (maxDrive || 8) * 60;
  filtered = filtered.filter((m) => {
    const mins = parseDriveMinutes(m.driveFromNYC);
    return mins == null || mins <= maxDriveMin;
  });

  if (ticketBudget > 0) {
    filtered = filtered.filter((m) => {
      const price = parseDollars(m.liftTicket);
      return price == null || price <= ticketBudget;
    });
  }

  if (lodgingCost > 0) {
    filtered = filtered.filter((m) => {
      const price = parseDollars(m.costPerNight);
      return price == null || price <= lodgingCost;
    });
  }

  if (filtered.length === 0) return [];

  // --- Stage 2: Scoring ---
  // Pre-compute ranges for normalization
  const snowfalls = filtered.map((m) => parseInches(m.snowfallPast7Days));
  const maxSnow = Math.max(...snowfalls);
  const minSnow = Math.min(...snowfalls);

  const vsAvgs = filtered.map((m) => m.snowVsAverage ?? 100);
  const maxVsAvg = Math.max(...vsAvgs);
  const minVsAvg = Math.min(...vsAvgs);

  const driveMins = filtered.map((m) => parseDriveMinutes(m.driveFromNYC) ?? maxDriveMin);
  const maxDriveActual = Math.max(...driveMins);
  const minDriveActual = Math.min(...driveMins);

  const sizes = filtered.map((m) => (m.skiableAcres || 0) + (m.verticalDrop || 0) + (m.runs || 0));
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);

  // Normalize weights to sum to 1
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const w = {};
  for (const key in weights) {
    w[key] = totalWeight > 0 ? weights[key] / totalWeight : 0;
  }

  const scored = filtered.map((m, i) => {
    // Snow score: 7-day at 2x weight vs 10yr average
    const recentSnow = normalize(snowfalls[i], minSnow, maxSnow);
    const vsAvg = normalize(vsAvgs[i], minVsAvg, maxVsAvg);
    const snowScore = recentSnow * 0.67 + vsAvg * 0.33;

    // Terrain match: compare user difficulty pref to mountain's breakdown
    const mDifficulty = (m.difficulty?.blue || 0) * 0.5 + (m.difficulty?.black || 0);
    const userDiff = difficulty * 0.7; // scale to similar range
    const terrainScore = Math.max(0, 100 - Math.abs(userDiff - mDifficulty) * 2);

    // Drive: shorter is better
    const driveScore = normalize(driveMins[i], maxDriveActual, minDriveActual); // inverted

    // Value: how much under budget (higher savings = higher score)
    let valueScore = 50; // neutral if no budget set
    const ticketPrice = parseDollars(m.liftTicket);
    const lodgingPrice = parseDollars(m.costPerNight);
    const scores = [];
    if (ticketBudget > 0 && ticketPrice != null) {
      scores.push(normalize(ticketPrice, ticketBudget, 0)); // cheaper = higher
    }
    if (lodgingCost > 0 && lodgingPrice != null) {
      scores.push(normalize(lodgingPrice, lodgingCost, 0));
    }
    if (scores.length > 0) {
      valueScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    // Size score
    const sizeScore = normalize(sizes[i], minSize, maxSize);

    // Trails open
    let trailScore = 50;
    if (m.openTrails != null && m.runs > 0) {
      trailScore = (m.openTrails / m.runs) * 100;
    }

    const total =
      snowScore * w.snow +
      terrainScore * w.terrain +
      driveScore * w.drive +
      valueScore * w.value +
      sizeScore * w.size +
      trailScore * w.trailsOpen;

    return {
      ...m,
      score: Math.round(total),
      breakdown: {
        snow: Math.round(snowScore),
        terrain: Math.round(terrainScore),
        drive: Math.round(driveScore),
        value: Math.round(valueScore),
        size: Math.round(sizeScore),
        trailsOpen: Math.round(trailScore),
      },
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export { DEFAULT_WEIGHTS };
