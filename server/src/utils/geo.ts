const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — returns distance in kilometres between two GPS points
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Estimate travel time in seconds assuming average speed of 60 km/h in urban areas
 */
export function estimateTravelTime(distanceKm: number, avgSpeedKmh = 60): number {
  return Math.round((distanceKm / avgSpeedKmh) * 3600);
}

/**
 * Format seconds into a human-readable ETA string
 */
export function formatEta(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
