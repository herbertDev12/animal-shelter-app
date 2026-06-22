import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  closeTestApp,
  createTestApp,
  expectNoEntity,
  getExistingId,
} from './utils/test-app';

describe('Adoptions (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  let animalId: number;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    animalId = await getExistingId(app, '/animals');
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /adoptions', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/adoptions').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /adoptions/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server).get('/adoptions/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('coerces date and price filters', async () => {
      await request(server)
        .get('/adoptions/search?minPrice=0&startDate=2020-01-01')
        .expect(200);
    });

    it('rejects id_animal below 1', async () => {
      await request(server).get('/adoptions/search?id_animal=0').expect(400);
    });

    it('rejects a negative minPrice', async () => {
      await request(server).get('/adoptions/search?minPrice=-5').expect(400);
    });
  });

  describe('GET /adoptions/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/adoptions/abc').expect(400);
    });

    it('returns no entity for a missing id', async () => {
      const res = await request(server).get('/adoptions/999999999').expect(200);
      expectNoEntity(res.body);
    });
  });

  describe('POST /adoptions validation', () => {
    it('rejects a missing id_animal', async () => {
      await request(server)
        .post('/adoptions')
        .send({ adoption_date: '2024-01-01' })
        .expect(400);
    });

    it('rejects id_animal below 1', async () => {
      await request(server)
        .post('/adoptions')
        .send({ id_animal: 0, adoption_date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a missing adoption_date', async () => {
      await request(server)
        .post('/adoptions')
        .send({ id_animal: animalId })
        .expect(400);
    });

    it('rejects an invalid adoption_date', async () => {
      await request(server)
        .post('/adoptions')
        .send({ id_animal: animalId, adoption_date: 'not-a-date' })
        .expect(400);
    });

    it('rejects a negative adoption_price', async () => {
      await request(server)
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
      const res = await request(server)
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
      await request(server).get(`/adoptions/${createdId}`).expect(200);
    });

    it('updates the adoption (partial)', async () => {
      await request(server)
        .put(`/adoptions/${createdId}`)
        .send({ adoption_price: 250 })
        .expect(200);
    });

    it('deletes the adoption', async () => {
      await request(server).delete(`/adoptions/${createdId}`).expect(200);
      const res = await request(server)
        .get(`/adoptions/${createdId}`)
        .expect(200);
      expectNoEntity(res.body);
    });
  });
});
