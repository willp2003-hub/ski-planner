const EMPIRE_STATE = [-74.006, 40.7484];
const DRIVE_TIME_CALIBRATION = 0.88;

const roundTo5Min = (totalMinutes) => {
  const rounded = Math.round(totalMinutes / 5) * 5;
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (mins === 0) return `${hours}h 00m`;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
};

const getDriveTime = async (mountain, origin = EMPIRE_STATE) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${mountain.longitude},${mountain.latitude}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const durationMinutes = data.routes[0].duration / 60;
      const calibratedMinutes = durationMinutes * DRIVE_TIME_CALIBRATION;
      return roundTo5Min(calibratedMinutes);
    }
    return mountain.driveFromNYC;
  } catch (error) {
    console.error(`Error fetching drive time for ${mountain.name}:`, error);
    return mountain.driveFromNYC;
  }
};

const getDriveTimes = async (mountains, origin = EMPIRE_STATE) => {
  const results = [];
  for (let i = 0; i < mountains.length; i += 5) {
    const batch = mountains.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(async (mountain) => {
        const driveTime = await getDriveTime(mountain, origin);
        return { ...mountain, driveFromNYC: driveTime };
      })
    );
    results.push(...batchResults);
  }
  return results;
};

export default getDriveTimes;
