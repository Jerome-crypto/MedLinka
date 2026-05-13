import request from 'supertest';
import app from '../app';

// ── Test suite: Hospital & Reports endpoints ────────────────────────

let adminToken: string;

beforeAll(async () => {
  const res = await request(app).post('/api/auth/login').send({
    phone: '+256700000001',
    password: 'Admin@1234',
  });
  adminToken = res.body.data?.accessToken;
});

describe('GET /api/hospitals', () => {
  it('should return list of hospitals', async () => {
    const res = await request(app)
      .get('/api/hospitals')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/hospitals');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/hospitals', () => {
  it('should create a new hospital as admin', async () => {
    const res = await request(app)
      .post('/api/hospitals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Hospital',
        address: '123 Test Street, Kampala',
        lat: 0.31,
        lng: 32.58,
        phone: '+256414000000',
        capacity: 50,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Hospital');
  });

  it('should reject invalid lat/lng', async () => {
    const res = await request(app)
      .post('/api/hospitals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bad', address: 'x', lat: 999, lng: 999, phone: '+256000000000' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/reports/stats', () => {
  it('should return system statistics for admin', async () => {
    const res = await request(app)
      .get('/api/reports/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('requests');
    expect(res.body.data).toHaveProperty('ambulances');
    expect(res.body.data).toHaveProperty('hospitals');
  });
});

describe('GET /api/reports/requests-per-day', () => {
  it('should return daily trend data', async () => {
    const res = await request(app)
      .get('/api/reports/requests-per-day')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/ambulances', () => {
  it('should list all ambulances', async () => {
    const res = await request(app)
      .get('/api/ambulances')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('ambulances');
  });
});

describe('GET /health', () => {
  it('should return ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('MedLinka API');
  });
});
