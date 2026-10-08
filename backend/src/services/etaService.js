/**
 * ETA Calculation Service
 * Uses Haversine distance, speed, and campus transit heuristics
 */

// Calculate great-circle distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Calculate estimated arrival time (in minutes) to a destination stop
 * @param {Object} shuttleLocation - { latitude, longitude, speed }
 * @param {Object} stopLocation - { latitude, longitude }
 * @param {Number} [defaultSpeedKmH=20] - Campus shuttle average speed
 * @returns {Object} { minutes, formattedText, distanceKm }
 */
function calculateETA(shuttleLocation, stopLocation, defaultSpeedKmH = 20) {
  if (
    !shuttleLocation ||
    shuttleLocation.latitude == null ||
    !stopLocation ||
    stopLocation.latitude == null
  ) {
    return { minutes: 5, formattedText: '5 min', distanceKm: 0.5 };
  }

  const distanceKm = calculateDistance(
    shuttleLocation.latitude,
    shuttleLocation.longitude,
    stopLocation.latitude,
    stopLocation.longitude
  );

  // Use current speed if moving >= 5 km/h, otherwise fallback to campus average speed
  const effectiveSpeed =
    shuttleLocation.speed && shuttleLocation.speed >= 5
      ? shuttleLocation.speed
      : defaultSpeedKmH;

  // Time in hours -> minutes
  const rawMinutes = (distanceKm / effectiveSpeed) * 60;
  // Add 1 minute dwell time per potential intermediate segment
  const dwellBufferMinutes = distanceKm > 1 ? 2 : 1;
  const totalMinutes = Math.max(1, Math.round(rawMinutes + dwellBufferMinutes));

  let formattedText;
  if (totalMinutes <= 1 || distanceKm < 0.1) {
    formattedText = 'Arriving now';
  } else if (totalMinutes < 60) {
    formattedText = `${totalMinutes} min`;
  } else {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    formattedText = `${hrs} hr ${mins} min`;
  }

  return {
    minutes: totalMinutes,
    formattedText,
    distanceKm: parseFloat(distanceKm.toFixed(2)),
  };
}

module.exports = {
  calculateDistance,
  calculateETA,
};
