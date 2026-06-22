import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  closeTestApp,
  createTestApp,
  expectNoEntity,
  getExistingId,
} from './utils/test-app';

describe('Donations (e2e)', () => {
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

  describe('GET /donations', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/donations').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /donations/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server).get('/donations/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects a negative minAmount', async () => {
      await request(server).get('/donations/search?minAmount=-1').expect(400);
    });

    it('rejects limit=0', async () => {
      await request(server).get('/donations/search?limit=0').expect(400);
    });
  });

  describe('GET /donations/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/donations/abc').expect(400);
    });

    it('returns no entity for a missing id', async () => {
      const res = await request(server).get('/donations/999999999').expect(200);
      expectNoEntity(res.body);
    });
  });

  describe('POST /donations validation', () => {
    it('rejects a missing id_animal', async () => {
      await request(server)
        .post('/donations')
        .send({ amount: 10, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a missing amount', async () => {
      await request(server)
        .post('/donations')
        .send({ id_animal: animalId, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a negative amount', async () => {
      await request(server)
        .post('/donations')
        .send({ id_animal: animalId, amount: -5, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a missing date', async () => {
      await request(server)
        .post('/donations')
        .send({ id_animal: animalId, amount: 10 })
        .expect(400);
    });

    it('rejects a donor name longer than 100 chars', async () => {
      await request(server)
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
      const res = await request(server)
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
      await request(server)
        .put(`/donations/${createdId}`)
        .send({ amount: 75 })
        .expect(200);
    });

    it('deletes the donation', async () => {
      await request(server).delete(`/donations/${createdId}`).expect(200);
      const res = await request(server)
        .get(`/donations/${createdId}`)
        .expect(200);
      expectNoEntity(res.body);
    });
  });
});
