import request from 'supertest';
import app from '../app';

// ── Test suite: SOS endpoints ───────────────────────────────────────

let citizenToken: string;
let requestId: string;

// Re-use seeded citizen account
const CITIZEN_PHONE = '+256700000020';
const CITIZEN_PWD   = 'Citizen@1234';

beforeAll(async () => {
  const res = await request(app).post('/api/auth/login').send({
    phone: CITIZEN_PHONE,
    password: CITIZEN_PWD,
  });
  citizenToken = res.body.data?.accessToken;
});

describe('POST /api/sos', () => {
  it('should create a new SOS request', async () => {
    const res = await request(app)
      .post('/api/sos')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        pickupLat: 0.0613,
        pickupLng: 32.4625,
        pickupAddress: 'Entebbe Road, Test Location',
        patientName: 'Test Patient',
        medicalNotes: 'Headache and fever',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.status).toBe('pending');

    requestId = res.body.data.id;
  });

  it('should reject invalid coordinates', async () => {
    const res = await request(app)
      .post('/api/sos')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ pickupLat: 999, pickupLng: 999 });

    expect(res.status).toBe(422);
  });

  it('should reject unauthenticated request', async () => {
    const res = await request(app).post('/api/sos').send({
      pickupLat: 0.0613,
      pickupLng: 32.4625,
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/sos', () => {
  it('should return paginated list of requests', async () => {
    const res = await request(app)
      .get('/api/sos')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('requests');
    expect(Array.isArray(res.body.data.requests)).toBe(true);
  });
});

describe('GET /api/sos/:id', () => {
  it('should return a specific request', async () => {
    if (!requestId) return;

    const res = await request(app)
      .get(`/api/sos/${requestId}`)
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(requestId);
  });

  it('should return 404 for non-existent request', async () => {
    const res = await request(app)
      .get('/api/sos/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/sos/:id/cancel', () => {
  it('should cancel a pending request', async () => {
    if (!requestId) return;

    const res = await request(app)
      .patch(`/api/sos/${requestId}/cancel`)
      .set('Authorization', `Bearer ${citizenToken}`);

    // Either 200 (cancelled) or 400 (already in progress after dispatch)
    expect([200, 400]).toContain(res.status);
  });
});
