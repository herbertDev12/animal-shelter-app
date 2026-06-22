import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { closeTestApp, createTestApp, expectNoEntity } from './utils/test-app';

describe('Animals (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /animals', () => {
    it('returns an array of animals', async () => {
      const res = await request(server).get('/animals').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /animals/stats', () => {
    it('returns adoption stats grouped by species', async () => {
      const res = await request(server).get('/animals/stats').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('species');
        expect(res.body[0]).toHaveProperty('available');
        expect(res.body[0]).toHaveProperty('adopted');
      }
    });
  });

  describe('GET /animals/search', () => {
    it('applies default pagination and returns an array', async () => {
      const res = await request(server).get('/animals/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10); // default limit
    });

    it('coerces numeric query params (limit)', async () => {
      const res = await request(server)
        .get('/animals/search?limit=1')
        .expect(200);
      expect(res.body.length).toBeLessThanOrEqual(1);
    });

    it('accepts repeated status query params as an array', async () => {
      await request(server)
        .get('/animals/search?status=available&status=adopted')
        .expect(200);
    });

    it('rejects limit below the minimum (limit=0)', async () => {
      await request(server).get('/animals/search?limit=0').expect(400);
    });

    it('rejects a non-numeric limit', async () => {
      await request(server).get('/animals/search?limit=abc').expect(400);
    });

    it('rejects a negative minAge', async () => {
      await request(server).get('/animals/search?minAge=-1').expect(400);
    });
  });

  describe('GET /animals/:id', () => {
    it('rejects a non-numeric id via ParseIntPipe', async () => {
      await request(server).get('/animals/abc').expect(400);
    });

    it('returns null for a missing id (no NotFoundException in this module)', async () => {
      const res = await request(server).get('/animals/999999999').expect(200);
      expectNoEntity(res.body);
    });
  });

  describe('POST /animals validation', () => {
    it('rejects a missing name', async () => {
      await request(server)
        .post('/animals')
        .send({ species: 'Dog' })
        .expect(400);
    });

    it('rejects a missing species', async () => {
      await request(server).post('/animals').send({ name: 'Rex' }).expect(400);
    });

    it('rejects an empty name (min 1)', async () => {
      await request(server)
        .post('/animals')
        .send({ name: '', species: 'Dog' })
        .expect(400);
    });

    it('rejects an invalid status enum value', async () => {
      await request(server)
        .post('/animals')
        .send({ name: 'Rex', species: 'Dog', status: 'free' })
        .expect(400);
    });

    it('rejects a negative weight', async () => {
      await request(server)
        .post('/animals')
        .send({ name: 'Rex', species: 'Dog', weight: -2 })
        .expect(400);
    });

    it('rejects missing required fields (breed, birth_date, weight)', async () => {
      await request(server)
        .post('/animals')
        .send({ name: 'Rex', species: 'Dog' })
        .expect(400);
    });

    it('rejects a birth_date after the entry date (future date)', async () => {
      await request(server)
        .post('/animals')
        .send({
          name: 'Rex',
          species: 'Dog',
          breed: 'Mixed',
          birth_date: '2999-01-01',
          weight: 5,
        })
        .expect(400);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates an animal with all required fields and default status', async () => {
      const res = await request(server)
        .post('/animals')
        .send({
          name: 'E2E Test Dog',
          species: 'Dog',
          breed: 'Mixed',
          birth_date: '2020-01-01',
          weight: 10,
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('available'); // default applied
      expect(res.body.birth_date).toBeTruthy();
      createdId = res.body.id;
    });

    it('reads the created animal by id', async () => {
      const res = await request(server)
        .get(`/animals/${createdId}`)
        .expect(200);
      expect(res.body.name).toBe('E2E Test Dog');
    });

    it('updates the animal (partial)', async () => {
      await request(server)
        .put(`/animals/${createdId}`)
        .send({ name: 'E2E Renamed Dog', status: 'reserved' })
        .expect(200);

      const res = await request(server)
        .get(`/animals/${createdId}`)
        .expect(200);
      expect(res.body.name).toBe('E2E Renamed Dog');
      expect(res.body.status).toBe('reserved');
    });

    it('deletes the animal', async () => {
      await request(server).delete(`/animals/${createdId}`).expect(200);
      const res = await request(server)
        .get(`/animals/${createdId}`)
        .expect(200);
      expectNoEntity(res.body);
    });
  });
});
