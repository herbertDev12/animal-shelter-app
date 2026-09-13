import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import {
  closeTestApp,
  createTestApp,
  getExistingId,
  createAdminAgent,
  ApiAgent,
} from './utils/test-app';

describe('Adoptions (e2e)', () => {
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

  describe('GET /adoptions', () => {
    it('returns an array', async () => {
      const res = await api.get('/adoptions').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /adoptions/search', () => {
    it('applies default pagination', async () => {
      const res = await api.get('/adoptions/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('coerces date and price filters', async () => {
      await api
        .get('/adoptions/search?minPrice=0&startDate=2020-01-01')
        .expect(200);
    });

    it('rejects id_animal below 1', async () => {
      await api.get('/adoptions/search?id_animal=0').expect(400);
    });

    it('rejects a negative minPrice', async () => {
      await api.get('/adoptions/search?minPrice=-5').expect(400);
    });
  });

  describe('GET /adoptions/:id', () => {
    it('rejects a non-numeric id', async () => {
      await api.get('/adoptions/abc').expect(400);
    });

    it('returns 404 for a missing id', async () => {
      await api.get('/adoptions/999999999').expect(404);
    });
  });

  describe('POST /adoptions validation', () => {
    it('rejects a missing id_animal', async () => {
      await api
        .post('/adoptions')
        .send({ adoption_date: '2024-01-01' })
        .expect(400);
    });

    it('rejects id_animal below 1', async () => {
      await api
        .post('/adoptions')
        .send({ id_animal: 0, adoption_date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a missing adoption_date', async () => {
      await api.post('/adoptions').send({ id_animal: animalId }).expect(400);
    });

    it('rejects an invalid adoption_date', async () => {
      await api
        .post('/adoptions')
        .send({ id_animal: animalId, adoption_date: 'not-a-date' })
        .expect(400);
    });

    it('rejects a negative adoption_price', async () => {
      await api
        .post('/adoptions')
        .send({
          id_animal: animalId,
          adoption_date: '2024-01-01',
          adoption_price: -10,
        })
        .expect(400);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates an adoption', async () => {
      const res = await api
        .post('/adoptions')
        .send({
          id_animal: animalId,
          adoption_date: '2024-05-01',
          adoption_price: 100,
        })
        .expect(201);
      expect(res.body.id).toBeDefined();
      createdId = res.body.id;
    });

    it('reads the created adoption', async () => {
      await api.get(`/adoptions/${createdId}`).expect(200);
    });

    it('updates the adoption (partial)', async () => {
      await api
        .put(`/adoptions/${createdId}`)
        .send({ adoption_price: 250 })
        .expect(200);
    });

    it('deletes the adoption', async () => {
      await api.delete(`/adoptions/${createdId}`).expect(200);
      await api.get(`/adoptions/${createdId}`).expect(404);
    });
  });
});
