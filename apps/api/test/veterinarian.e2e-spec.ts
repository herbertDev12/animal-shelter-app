import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  closeTestApp,
  createTestApp,
  expectNoEntity,
  getExistingId,
} from './utils/test-app';

describe('Veterinarians (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  let clinicId: number;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    clinicId = await getExistingId(app, '/clinics');
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  const valid = () => ({
    name: 'E2E Vet',
    id_clinic: clinicId,
    specialty: 'Surgery',
  });

  describe('GET /veterinarians', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/veterinarians').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /veterinarians/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server)
        .get('/veterinarians/search')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects a non-numeric id_clinic', async () => {
      await request(server)
        .get('/veterinarians/search?id_clinic=abc')
        .expect(400);
    });
  });

  describe('GET /veterinarians/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/veterinarians/abc').expect(400);
    });

    it('returns no entity for a missing id', async () => {
      const res = await request(server)
        .get('/veterinarians/999999999')
        .expect(200);
      expectNoEntity(res.body);
    });
  });

  describe('POST /veterinarians validation', () => {
    it('rejects a missing name', async () => {
      const body = valid();
      delete (body as Record<string, unknown>).name;
      await request(server).post('/veterinarians').send(body).expect(400);
    });

    it('rejects a missing id_clinic', async () => {
      const body = valid();
      delete (body as Record<string, unknown>).id_clinic;
      await request(server).post('/veterinarians').send(body).expect(400);
    });

    it('rejects a non-positive id_clinic', async () => {
      await request(server)
        .post('/veterinarians')
        .send({ ...valid(), id_clinic: 0 })
        .expect(400);
    });

    it('rejects a name longer than 100 chars', async () => {
      await request(server)
        .post('/veterinarians')
        .send({ ...valid(), name: 'x'.repeat(101) })
        .expect(400);
    });

    it('rejects a non-positive city_distance', async () => {
      await request(server)
        .post('/veterinarians')
        .send({ ...valid(), city_distance: 0 })
        .expect(400);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates a veterinarian', async () => {
      const res = await request(server)
        .post('/veterinarians')
        .send(valid())
        .expect(201);
      expect(res.body.id).toBeDefined();
      createdId = res.body.id;
    });

    it('reads the created veterinarian by id', async () => {
      await request(server).get(`/veterinarians/${createdId}`).expect(200);
    });

    it('updates the veterinarian', async () => {
      await request(server)
        .put(`/veterinarians/${createdId}`)
        .send({ name: 'E2E Vet Renamed' })
        .expect(200);
      const res = await request(server)
        .get(`/veterinarians/${createdId}`)
        .expect(200);
      expect(res.body.name).toBe('E2E Vet Renamed');
    });

    it('deletes the veterinarian', async () => {
      await request(server).delete(`/veterinarians/${createdId}`).expect(200);
      const res = await request(server)
        .get(`/veterinarians/${createdId}`)
        .expect(200);
      expectNoEntity(res.body);
    });
  });
});
