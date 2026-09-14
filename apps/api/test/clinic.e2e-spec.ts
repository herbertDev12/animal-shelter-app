import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import {
  MISSING_ID,
  closeTestApp,
  createTestApp,
  createAdminAgent,
  ApiAgent,
} from './utils/test-app';

describe('Clinics (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  let api: ApiAgent;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    api = await createAdminAgent(server);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /clinics', () => {
    it('returns an array', async () => {
      const res = await api.get('/clinics').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /clinics/search', () => {
    it('applies default pagination', async () => {
      const res = await api.get('/clinics/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects limit=0', async () => {
      await api.get('/clinics/search?limit=0').expect(400);
    });

    it('rejects a non-numeric offset', async () => {
      await api.get('/clinics/search?offset=x').expect(400);
    });
  });

  describe('GET /clinics/:id', () => {
    it('rejects a non-UUID id', async () => {
      await api.get('/clinics/abc').expect(400);
    });

    it('returns 404 for a missing id', async () => {
      await api.get(`/clinics/${MISSING_ID}`).expect(404);
    });
  });

  describe('POST /clinics validation', () => {
    it('rejects a missing name', async () => {
      await api.post('/clinics').send({ province: 'X' }).expect(400);
    });

    it('rejects an empty name', async () => {
      await api.post('/clinics').send({ name: '' }).expect(400);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: string;

    it('creates a clinic', async () => {
      const res = await api
        .post('/clinics')
        .send({ name: 'E2E Clinic', province: 'Havana', address: '123 St' })
        .expect(201);
      expect(res.body.id).toBeDefined();
      createdId = res.body.id;
    });

    it('updates the clinic', async () => {
      await api
        .put(`/clinics/${createdId}`)
        .send({ name: 'E2E Clinic Renamed' })
        .expect(200);
      const res = await api.get(`/clinics/${createdId}`).expect(200);
      expect(res.body.name).toBe('E2E Clinic Renamed');
    });

    it('deletes the clinic', async () => {
      await api.delete(`/clinics/${createdId}`).expect(200);
      await api.get(`/clinics/${createdId}`).expect(404);
    });
  });
});
