import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  MISSING_ID,
  closeTestApp,
  createTestApp,
  getExistingId,
} from './utils/test-app';

describe('Services Offered (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  let contractId: number;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    contractId = await getExistingId(app, '/contracts');
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  const valid = () => ({
    id_contract: contractId,
    name: 'E2E Service',
    base_price: 100,
  });

  describe('GET /services-offered', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/services-offered').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /services-offered/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server)
        .get('/services-offered/search')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects limit=0', async () => {
      await request(server).get('/services-offered/search?limit=0').expect(400);
    });
  });

  describe('GET /services-offered/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/services-offered/abc').expect(400);
    });

    it('returns 404 for a missing id (NotFoundException)', async () => {
      await request(server).get(`/services-offered/${MISSING_ID}`).expect(404);
    });
  });

  describe('POST /services-offered validation', () => {
    it('rejects a missing name', async () => {
      const body = valid();
      delete (body as Record<string, unknown>).name;
      await request(server).post('/services-offered').send(body).expect(400);
    });

    it('rejects a non-positive id_contract', async () => {
      await request(server)
        .post('/services-offered')
        .send({ ...valid(), id_contract: 0 })
        .expect(400);
    });

    it('rejects a negative base_price', async () => {
      await request(server)
        .post('/services-offered')
        .send({ ...valid(), base_price: -1 })
        .expect(400);
    });

    it('rejects a negative surcharge', async () => {
      await request(server)
        .post('/services-offered')
        .send({ ...valid(), surcharge: -1 })
        .expect(400);
    });

    it('rejects a name longer than 100 chars', async () => {
      await request(server)
        .post('/services-offered')
        .send({ ...valid(), name: 'x'.repeat(101) })
        .expect(400);
    });
  });

  describe('PUT/DELETE missing service', () => {
    it('returns 404 when updating a missing service', async () => {
      await request(server)
        .put(`/services-offered/${MISSING_ID}`)
        .send({ name: 'X' })
        .expect(404);
    });

    it('returns 404 when deleting a missing service', async () => {
      await request(server)
        .delete(`/services-offered/${MISSING_ID}`)
        .expect(404);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates a service with default surcharge 0', async () => {
      const res = await request(server)
        .post('/services-offered')
        .send(valid())
        .expect(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.surcharge).toBe(0);
      createdId = res.body.id;
    });

    it('reads the created service by id', async () => {
      await request(server).get(`/services-offered/${createdId}`).expect(200);
    });

    it('updates the service', async () => {
      await request(server)
        .put(`/services-offered/${createdId}`)
        .send({ base_price: 200 })
        .expect(200);
    });

    it('deletes the service', async () => {
      await request(server)
        .delete(`/services-offered/${createdId}`)
        .expect(200);
      await request(server).get(`/services-offered/${createdId}`).expect(404);
    });
  });
});
