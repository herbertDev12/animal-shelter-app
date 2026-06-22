import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { closeTestApp, createTestApp, expectNoEntity } from './utils/test-app';

describe('Clinics (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /clinics', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/clinics').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /clinics/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server).get('/clinics/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects limit=0', async () => {
      await request(server).get('/clinics/search?limit=0').expect(400);
    });

    it('rejects a non-numeric offset', async () => {
      await request(server).get('/clinics/search?offset=x').expect(400);
    });
  });

  describe('GET /clinics/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/clinics/abc').expect(400);
    });

    it('returns no entity for a missing id', async () => {
      const res = await request(server).get('/clinics/999999999').expect(200);
      expectNoEntity(res.body);
    });
  });

  describe('POST /clinics validation', () => {
    it('rejects a missing name', async () => {
      await request(server)
        .post('/clinics')
        .send({ province: 'X' })
        .expect(400);
    });

    it('rejects an empty name', async () => {
      await request(server).post('/clinics').send({ name: '' }).expect(400);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates a clinic', async () => {
      const res = await request(server)
        .post('/clinics')
        .send({ name: 'E2E Clinic', province: 'Havana', address: '123 St' })
        .expect(201);
      expect(res.body.id).toBeDefined();
      createdId = res.body.id;
    });

    it('updates the clinic', async () => {
      await request(server)
        .put(`/clinics/${createdId}`)
        .send({ name: 'E2E Clinic Renamed' })
        .expect(200);
      const res = await request(server)
        .get(`/clinics/${createdId}`)
        .expect(200);
      expect(res.body.name).toBe('E2E Clinic Renamed');
    });

    it('deletes the clinic', async () => {
      await request(server).delete(`/clinics/${createdId}`).expect(200);
      const res = await request(server)
        .get(`/clinics/${createdId}`)
        .expect(200);
      expectNoEntity(res.body);
    });
  });
});
