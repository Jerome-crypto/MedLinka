import request from 'supertest';
import app from '../app';

// ── Test suite: Auth endpoints ──────────────────────────────────────

const TEST_EMAIL = `citizen-${Math.floor(Math.random() * 100000)}@medlinka.com`;
let accessToken: string;
let refreshToken: string;

describe('POST /api/auth/register', () => {
  it('should register a new citizen successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Citizen',
      email: TEST_EMAIL,
      password: 'test1234',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.role).toBe('citizen');

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate',
      email: TEST_EMAIL,
      password: 'test1234',
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing name', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'no-name@medlinka.com',
      password: 'test1234',
    });
    expect(res.status).toBe(422);
  });

  it('should reject short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short',
      email: 'short-pwd@medlinka.com',
      password: '123',
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: 'test1234',
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should reject invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'does-not-exist@medlinka.com',
      password: 'test1234',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return profile for authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', TEST_EMAIL);
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should issue a new access token using refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should reject invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'bad_token' });
    expect(res.status).toBe(401);
  });
});
