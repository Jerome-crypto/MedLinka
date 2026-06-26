/**
 * Haversine formula — returns distance in kilometres between two GPS points
 */
export declare function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number;
/**
 * Estimate travel time in seconds assuming average speed of 60 km/h in urban areas
 */
export declare function estimateTravelTime(distanceKm: number, avgSpeedKmh?: number): number;
/**
 * Format seconds into a human-readable ETA string
 */
export declare function formatEta(seconds: number): string;
//# sourceMappingURL=geo.d.ts.map