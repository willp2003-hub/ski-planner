const formatDate = (date) => date.toISOString().split("T")[0];

const getSnowfallData = async (mountains) => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const todayStr = formatDate(today);
  const weekAgoStr = formatDate(weekAgo);

  const updatedMountains = await Promise.all(
    mountains.map(async (mountain) => {
      try {
        // 7-day snowfall
        const recentUrl = `https://api.open-meteo.com/v1/forecast?latitude=${mountain.latitude}&longitude=${mountain.longitude}&daily=snowfall_sum&start_date=${weekAgoStr}&end_date=${todayStr}&timezone=America/New_York`;
        const recentRes = await fetch(recentUrl);
        const recentData = await recentRes.json();
        const recentCm = recentData.daily?.snowfall_sum?.reduce((sum, val) => sum + (val || 0), 0) || 0;
        const recentInches = (recentCm * 0.393701).toFixed(1);

        // Current base depth (snow on ground today)
        const depthUrl = `https://api.open-meteo.com/v1/forecast?latitude=${mountain.latitude}&longitude=${mountain.longitude}&hourly=snow_depth&forecast_days=1&timezone=America/New_York`;
        const depthRes = await fetch(depthUrl);
        const depthData = await depthRes.json();
        const depthValues = depthData.hourly?.snow_depth?.filter((v) => v != null) || [];
        const currentDepthCm = depthValues.length > 0 ? depthValues[depthValues.length - 1] : 0;
        const currentDepthInches = (currentDepthCm * 0.393701).toFixed(0);

        // 10-year historical average base depth for same date
        const currentYear = today.getFullYear();
        const todayMonthDay = todayStr.slice(5);
        let historicalDepths = [];

        for (let i = 1; i <= 10; i++) {
          const histYear = currentYear - i;
          const histDate = `${histYear}-${todayMonthDay}`;
          try {
            const histUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${mountain.latitude}&longitude=${mountain.longitude}&hourly=snow_depth&start_date=${histDate}&end_date=${histDate}&timezone=America/New_York`;
            const histRes = await fetch(histUrl);
            const histData = await histRes.json();
            const histValues = histData.hourly?.snow_depth?.filter((v) => v != null) || [];
            if (histValues.length > 0) {
              const maxDepth = Math.max(...histValues);
              historicalDepths.push(maxDepth);
            }
          } catch {
            // skip failed years
          }
        }

        const avgHistoricalCm = historicalDepths.length > 0
          ? historicalDepths.reduce((sum, val) => sum + val, 0) / historicalDepths.length
          : 0;

        const snowVsAvg = avgHistoricalCm > 0
          ? Math.round((currentDepthCm / avgHistoricalCm) * 100)
          : null;

        return {
          ...mountain,
          snowfallPast7Days: `${recentInches}"`,
          currentBase: `${currentDepthInches}"`,
          snowVsAverage: snowVsAvg,
        };
      } catch (error) {
        console.error(`Error fetching snow for ${mountain.name}:`, error);
        return {
          ...mountain,
          snowfallPast7Days: "N/A",
          currentBase: "N/A",
          snowVsAverage: null,
        };
      }
    })
  );
  return updatedMountains;
};

export const fetchWeekForecast = async (latitude, longitude) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America/New_York&forecast_days=7`;
    const res = await fetch(url);
    const data = await res.json();
    const d = data.daily;
    return d.time.map((date, i) => ({
      date,
      high: Math.round(d.temperature_2m_max[i]),
      low: Math.round(d.temperature_2m_min[i]),
      precip: d.precipitation_sum[i]?.toFixed(2) || "0.00",
      snowfall: (d.snowfall_sum[i] ? (d.snowfall_sum[i] * 0.393701).toFixed(1) : "0.0"),
      wind: Math.round(d.wind_speed_10m_max[i]),
      weatherCode: d.weather_code?.[i] ?? 0,
    }));
  } catch (err) {
    console.error("Forecast fetch failed:", err);
    return null;
  }
};

export const fetchSeasonSnowfall = async (latitude, longitude) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const todayStr = formatDate(today);
    const weekAgoStr = formatDate(weekAgo);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=snowfall_sum&start_date=${weekAgoStr}&end_date=${todayStr}&timezone=America/New_York`;
    const res = await fetch(url);
    const data = await res.json();
    const dates = data.daily?.time || [];
    const dailyCm = data.daily?.snowfall_sum || [];
    let cumulative = 0;
    return dates.map((date, i) => {
      const dailyInches = (dailyCm[i] || 0) * 0.393701;
      cumulative += dailyInches;
      return { date, daily: parseFloat(dailyInches.toFixed(1)), total: parseFloat(cumulative.toFixed(1)) };
    });
  } catch (err) {
    console.error("Snowfall fetch failed:", err);
    return null;
  }
};

export const fetchBaseAndAverage = async (latitude, longitude) => {
  try {
    const today = new Date();
    const todayStr = formatDate(today);
    const todayMonthDay = todayStr.slice(5);
    const currentYear = today.getFullYear();

    // Current base depth
    const depthUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=snow_depth&forecast_days=1&timezone=America/New_York`;
    const depthRes = await fetch(depthUrl);
    const depthData = await depthRes.json();
    const depthValues = depthData.hourly?.snow_depth?.filter((v) => v != null) || [];
    const currentDepthCm = depthValues.length > 0 ? depthValues[depthValues.length - 1] : 0;
    const currentBase = Math.round(currentDepthCm * 0.393701);

    // 10-year historical average
    let historicalDepths = [];
    for (let i = 1; i <= 10; i++) {
      const histYear = currentYear - i;
      const histDate = `${histYear}-${todayMonthDay}`;
      try {
        const histUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&hourly=snow_depth&start_date=${histDate}&end_date=${histDate}&timezone=America/New_York`;
        const histRes = await fetch(histUrl);
        const histData = await histRes.json();
        const histValues = histData.hourly?.snow_depth?.filter((v) => v != null) || [];
        if (histValues.length > 0) {
          historicalDepths.push(Math.max(...histValues));
        }
      } catch {
        // skip failed years
      }
    }

    const avgHistoricalCm = historicalDepths.length > 0
      ? historicalDepths.reduce((sum, val) => sum + val, 0) / historicalDepths.length
      : 0;
    const avgBase = Math.round(avgHistoricalCm * 0.393701);
    const snowVsAverage = avgHistoricalCm > 0
      ? Math.round((currentDepthCm / avgHistoricalCm) * 100)
      : null;

    return { currentBase, avgBase, snowVsAverage };
  } catch (err) {
    console.error("Base/average fetch failed:", err);
    return null;
  }
};

export const fetchForecastSnowfall = async (latitude, longitude, startDate, endDate) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=snowfall_sum,precipitation_sum&start_date=${startDate}&end_date=${endDate}&timezone=America/New_York&forecast_days=16`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) return null;
    const snowCm = (data.daily?.snowfall_sum || []).reduce((s, v) => s + (v || 0), 0);
    const precipIn = (data.daily?.precipitation_sum || []).reduce((s, v) => s + (v || 0), 0);
    return {
      snowfall: parseFloat((snowCm * 0.393701).toFixed(1)),
      precip: parseFloat(precipIn.toFixed(2)),
    };
  } catch {
    return null;
  }
};

export default getSnowfallData;