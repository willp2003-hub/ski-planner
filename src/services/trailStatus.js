const ON_THE_SNOW_SLUGS = {
  "Sugarloaf": "maine/sugarloaf",
  "Sunday River": "maine/sunday-river",
  "Saddleback": "maine/saddleback-inc",
  "Shawnee Peak": "maine/pleasant-mountain",
  "Bretton Woods": "new-hampshire/bretton-woods",
  "Cannon": "new-hampshire/cannon-mountain",
  "Loon": "new-hampshire/loon-mountain",
  "Wildcat": "new-hampshire/wildcat-mountain",
  "Attitash": "new-hampshire/attitash",
  "Cranmore": "new-hampshire/cranmore-mountain-resort",
  "Waterville Valley": "new-hampshire/waterville-valley",
  "Gunstock": "new-hampshire/gunstock",
  "Ragged Mountain": "new-hampshire/ragged-mountain-resort",
  "Mount Sunapee": "new-hampshire/mount-sunapee",
  "Crotched Mountain": "new-hampshire/crotched-mountain",
  "Killington": "vermont/killington-resort",
  "Stowe": "vermont/stowe-mountain-resort",
  "Jay Peak": "vermont/jay-peak",
  "Sugarbush": "vermont/sugarbush",
  "Mount Snow": "vermont/mount-snow",
  "Okemo": "vermont/okemo-mountain-resort",
  "Smugglers' Notch": "vermont/smugglers-notch-resort",
  "Stratton": "vermont/stratton-mountain",
  "Bromley": "vermont/bromley-mountain",
  "Mad River Glen": "vermont/mad-river-glen",
  "Bolton Valley": "vermont/bolton-valley",
  "Burke": "vermont/burke-mountain",
  "Pico": "vermont/pico-mountain-at-killington",
  "Magic Mountain": "vermont/magic-mountain",
  "Whiteface": "new-york/whiteface-mountain-resort",
  "Gore Mountain": "new-york/gore-mountain",
  "Hunter Mountain": "new-york/hunter-mountain",
  "Windham Mountain": "new-york/windham-mountain",
  "Belleayre": "new-york/belleayre",
  "Holiday Valley": "new-york/holiday-valley",
  "Greek Peak": "new-york/greek-peak",
  "Bristol Mountain": "new-york/bristol-mountain",
  "Titus Mountain": "new-york/titus-mountain",
  "West Mountain": "new-york/west-mountain",
  "Thunder Ridge": "new-york/thunder-ridge",
  "Mount Peter": "new-york/mount-peter",
  "Jiminy Peak": "massachusetts/jiminy-peak",
  "Ski Butternut": "massachusetts/ski-butternut",
  "Berkshire East": "massachusetts/berkshire-east",
  "Catamount": "new-york/catamount-ski-ride-area",
  "Wachusett": "massachusetts/wachusett-mountain-ski-area",
  "Bousquet": "massachusetts/bousquet-ski-area",
  "Camelback": "pennsylvania/camelback-mountain-resort",
  "Blue Mountain": "pennsylvania/blue-mountain-ski-area",
  "Jack Frost": "pennsylvania/jack-frost",
  "Montage Mountain": "pennsylvania/montage-mountain",
  "Bear Creek": "pennsylvania/bear-creek-mountain-resort",
  "Elk Mountain": "pennsylvania/elk-mountain-ski-resort",
  "Shawnee Mountain": "pennsylvania/shawnee-mountain-ski-area",
  "Mountain Creek": "new-jersey/mountain-creek-resort",
  "Campgaw": "new-jersey/campgaw-mountain",
};

function parseTrailData(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let trailsOpen = null;
  let trailsTotal = null;
  let liftsOpen = null;
  let liftsTotal = null;

  // Extract from __NEXT_DATA__ JSON (primary method)
  const nextDataScript = doc.getElementById("__NEXT_DATA__");
  if (nextDataScript) {
    try {
      const data = JSON.parse(nextDataScript.textContent);
      const terrain = data?.props?.pageProps?.fullResort?.terrain;
      if (terrain) {
        trailsOpen = terrain.runs?.open ?? terrain.runs?.openNum ?? null;
        trailsTotal = terrain.runs?.total ?? null;
        liftsOpen = terrain.lifts?.open ?? terrain.lifts?.openNum ?? null;
        liftsTotal = terrain.lifts?.total ?? null;
      }
    } catch {
      // fall through to regex parsing
    }
  }

  // Fallback: parse from page text
  if (trailsOpen === null) {
    const text = doc.body?.textContent || "";
    const trailMatch = text.match(/(\d+)\s*(?:of|\/)\s*(\d+)\s*(?:trails|runs)/i);
    if (trailMatch) {
      trailsOpen = parseInt(trailMatch[1]);
      trailsTotal = parseInt(trailMatch[2]);
    }
    const liftMatch = text.match(/(\d+)\s*(?:of|\/)\s*(\d+)\s*(?:lifts)/i);
    if (liftMatch) {
      liftsOpen = parseInt(liftMatch[1]);
      liftsTotal = parseInt(liftMatch[2]);
    }
  }

  return { trailsOpen, trailsTotal, liftsOpen, liftsTotal };
}

function parseTicketData(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const nextDataScript = doc.getElementById("__NEXT_DATA__");
  if (nextDataScript) {
    try {
      const data = JSON.parse(nextDataScript.textContent);
      const pageProps = data?.props?.pageProps;
      const weekday = parseFloat(pageProps?.adultWeekdayPrice);
      const weekend = parseFloat(pageProps?.adultWeekendPrice);
      const price = weekend || weekday || null;
      return price ? `$${Math.round(price)}` : null;
    } catch {
      // fall through
    }
  }
  return null;
}

export async function fetchTrailStatus(mountainName) {
  const slug = ON_THE_SNOW_SLUGS[mountainName];
  if (!slug) return null;

  try {
    const [resortRes, ticketRes] = await Promise.all([
      fetch(`/api/onthesnow/${slug}/ski-resort`),
      fetch(`/api/onthesnow/${slug}/lift-tickets`),
    ]);

    let trailData = { trailsOpen: null, trailsTotal: null, liftsOpen: null, liftsTotal: null };
    if (resortRes.ok) {
      trailData = parseTrailData(await resortRes.text());
    }

    let liftTicket = null;
    if (ticketRes.ok) {
      liftTicket = parseTicketData(await ticketRes.text());
    }

    return { ...trailData, liftTicket };
  } catch (err) {
    console.error(`Failed to fetch data for ${mountainName}:`, err);
    return null;
  }
}

export async function fetchAllTrailStatus(mountains, onProgress) {
  const results = {};
  const BATCH_SIZE = 5;

  for (let i = 0; i < mountains.length; i += BATCH_SIZE) {
    const batch = mountains.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (m) => {
      const data = await fetchTrailStatus(m.name);
      if (data) results[m.name] = data;
      if (onProgress) onProgress(Object.keys(results).length, mountains.length);
    });
    await Promise.all(promises);
  }

  return results;
}
