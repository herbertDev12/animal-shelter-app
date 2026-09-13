import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import {
  closeTestApp,
  createTestApp,
  getExistingId,
  createAdminAgent,
  ApiAgent,
} from './utils/test-app';

describe('Donations (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  let api: ApiAgent;
  let animalId: number;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    api = await createAdminAgent(server);
    animalId = await getExistingId(app, '/animals');
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /donations', () => {
    it('returns an array', async () => {
      const res = await api.get('/donations').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /donations/search', () => {
    it('applies default pagination', async () => {
      const res = await api.get('/donations/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects a negative minAmount', async () => {
      await api.get('/donations/search?minAmount=-1').expect(400);
    });

    it('rejects limit=0', async () => {
      await api.get('/donations/search?limit=0').expect(400);
    });
  });

  describe('GET /donations/:id', () => {
    it('rejects a non-numeric id', async () => {
      await api.get('/donations/abc').expect(400);
    });

    it('returns 404 for a missing id', async () => {
      await api.get('/donations/999999999').expect(404);
    });
  });

  describe('POST /donations validation', () => {
    it('rejects a missing id_animal', async () => {
      await api
        .post('/donations')
        .send({ amount: 10, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a missing amount', async () => {
      await api
        .post('/donations')
        .send({ id_animal: animalId, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a negative amount', async () => {
      await api
        .post('/donations')
        .send({ id_animal: animalId, amount: -5, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a missing date', async () => {
      await api
        .post('/donations')
        .send({ id_animal: animalId, amount: 10 })
        .expect(400);
    });

    it('rejects a donor name longer than 100 chars', async () => {
      await api
        .post('/donations')
        .send({
          id_animal: animalId,
          amount: 10,
          date: '2024-01-01',
          donor: 'x'.repeat(101),
        })
        .expect(400);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates a donation', async () => {
      const res = await api
        .post('/donations')
        .send({
          id_animal: animalId,
          amount: 50,
          date: '2024-06-01',
          donor: 'E2E Donor',
        })
        .expect(201);
      expect(res.body.id).toBeDefined();
      createdId = res.body.id;
    });

    it('updates the donation', async () => {
      await api.put(`/donations/${createdId}`).send({ amount: 75 }).expect(200);
    });

    it('deletes the donation', async () => {
      await api.delete(`/donations/${createdId}`).expect(200);
      await api.get(`/donations/${createdId}`).expect(404);
    });
  });
});
