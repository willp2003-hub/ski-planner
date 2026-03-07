const getSeasonStart = () => {
  const today = new Date();
  const year = today.getMonth() >= 10 ? today.getFullYear() : today.getFullYear() - 1;
  return `${year}-11-01`;
};

const formatDate = (date) => date.toISOString().split("T")[0];

const getSnowfallData = async (mountains) => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const seasonStart = getSeasonStart();
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

        // Season total
        const seasonUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${mountain.latitude}&longitude=${mountain.longitude}&daily=snowfall_sum&start_date=${seasonStart}&end_date=${todayStr}&timezone=America/New_York`;
        const seasonRes = await fetch(seasonUrl);
        const seasonData = await seasonRes.json();
        const seasonCm = seasonData.daily?.snowfall_sum?.reduce((sum, val) => sum + (val || 0), 0) || 0;
        const seasonInches = (seasonCm * 0.393701).toFixed(0);

        // 10-year historical average for same period
        const currentYear = today.getFullYear();
        const seasonStartMonth = "11-01";
        const todayMonthDay = todayStr.slice(5);
        let historicalTotals = [];

        for (let i = 1; i <= 10; i++) {
          const histYear = currentYear - i;
          const histSeasonYear = today.getMonth() >= 10 ? histYear : histYear - 1;
          const histStart = `${histSeasonYear}-${seasonStartMonth}`;
          const histEnd = `${histYear}-${todayMonthDay}`;

          try {
            const histUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${mountain.latitude}&longitude=${mountain.longitude}&daily=snowfall_sum&start_date=${histStart}&end_date=${histEnd}&timezone=America/New_York`;
            const histRes = await fetch(histUrl);
            const histData = await histRes.json();
            const histCm = histData.daily?.snowfall_sum?.reduce((sum, val) => sum + (val || 0), 0) || 0;
            historicalTotals.push(histCm);
          } catch {
            // skip failed years
          }
        }

        const avgHistoricalCm = historicalTotals.length > 0
          ? historicalTotals.reduce((sum, val) => sum + val, 0) / historicalTotals.length
          : 0;

        const snowVsAvg = avgHistoricalCm > 0
          ? Math.round((seasonCm / avgHistoricalCm) * 100)
          : null;

        return {
          ...mountain,
          snowfallPast7Days: `${recentInches}"`,
          seasonSnowTotal: `${seasonInches}"`,
          snowVsAverage: snowVsAvg,
        };
      } catch (error) {
        console.error(`Error fetching snow for ${mountain.name}:`, error);
        return {
          ...mountain,
          snowfallPast7Days: "N/A",
          seasonSnowTotal: "N/A",
          snowVsAverage: null,
        };
      }
    })
  );
  return updatedMountains;
};

export default getSnowfallData;