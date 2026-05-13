import { haversineDistance, estimateTravelTime, formatEta } from '../utils/geo';

// ── Unit tests: Geo utilities ───────────────────────────────────────

describe('haversineDistance', () => {
  it('should return 0 for identical coordinates', () => {
    expect(haversineDistance(0.0613, 32.4625, 0.0613, 32.4625)).toBe(0);
  });

  it('should calculate distance between Entebbe and Kampala correctly (~37 km)', () => {
    // Entebbe: 0.0613, 32.4625  |  Kampala: 0.3136, 32.5811
    const dist = haversineDistance(0.0613, 32.4625, 0.3136, 32.5811);
    expect(dist).toBeGreaterThan(30);
    expect(dist).toBeLessThan(45);
  });

  it('should return a positive distance for any two different points', () => {
    const dist = haversineDistance(0.055, 32.458, 0.070, 32.470);
    expect(dist).toBeGreaterThan(0);
  });

  it('should be symmetric (A→B = B→A)', () => {
    const d1 = haversineDistance(0.0613, 32.4625, 0.3136, 32.5811);
    const d2 = haversineDistance(0.3136, 32.5811, 0.0613, 32.4625);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });
});

describe('estimateTravelTime', () => {
  it('should return 3600 seconds for 60 km at default 60 km/h', () => {
    expect(estimateTravelTime(60)).toBe(3600);
  });

  it('should scale correctly for shorter distances', () => {
    expect(estimateTravelTime(30)).toBe(1800);
  });

  it('should use custom speed when provided', () => {
    // 30 km at 90 km/h = 20 min = 1200 seconds
    expect(estimateTravelTime(30, 90)).toBe(1200);
  });

  it('should return 0 for zero distance', () => {
    expect(estimateTravelTime(0)).toBe(0);
  });
});

describe('formatEta', () => {
  it('should format seconds under 60 as seconds', () => {
    expect(formatEta(45)).toBe('45s');
  });

  it('should format 60 seconds as "1 min"', () => {
    expect(formatEta(60)).toBe('1 min');
  });

  it('should format 300 seconds as "5 min"', () => {
    expect(formatEta(300)).toBe('5 min');
  });

  it('should format 3600 seconds as "1h 0m"', () => {
    expect(formatEta(3600)).toBe('1h 0m');
  });

  it('should format 5400 seconds as "1h 30m"', () => {
    expect(formatEta(5400)).toBe('1h 30m');
  });
});
