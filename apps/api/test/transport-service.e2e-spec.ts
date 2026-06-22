import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  closeTestApp,
  createTestApp,
  expectNoEntity,
  getExistingId,
} from './utils/test-app';

describe('Transport Services (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  let supplierId: number;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    supplierId = await getExistingId(app, '/suppliers');
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  const valid = () => ({
    id_supplier: supplierId,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    vehicle: 'Van',
    transport_modality: 'Road',
  });

  describe('GET /transport-services', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/transport-services').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /transport-services/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server)
        .get('/transport-services/search')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects an invalid status enum', async () => {
      await request(server)
        .get('/transport-services/search?status=Paused')
        .expect(400);
    });
  });

  describe('GET /transport-services/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/transport-services/abc').expect(400);
    });

    it('returns no entity for a missing id', async () => {
      const res = await request(server)
        .get('/transport-services/999999999')
        .expect(200);
      expectNoEntity(res.body);
    });
  });

  describe('POST /transport-services validation', () => {
    it('rejects a missing vehicle', async () => {
      const body = valid();
      delete (body as Record<string, unknown>).vehicle;
      await request(server).post('/transport-services').send(body).expect(400);
    });

    it('rejects an empty vehicle (min 1)', async () => {
      await request(server)
        .post('/transport-services')
        .send({ ...valid(), vehicle: '' })
        .expect(400);
    });

    it('rejects a missing transport_modality', async () => {
      const body = valid();
      delete (body as Record<string, unknown>).transport_modality;
      await request(server).post('/transport-services').send(body).expect(400);
    });

    it('rejects a non-positive id_supplier', async () => {
      await request(server)
        .post('/transport-services')
        .send({ ...valid(), id_supplier: 0 })
        .expect(400);
    });

    it('rejects end_date before start_date (refinement)', async () => {
      await request(server)
        .post('/transport-services')
        .send({ ...valid(), start_date: '2024-12-31', end_date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a vehicle longer than 100 chars', async () => {
      await request(server)
        .post('/transport-services')
        .send({ ...valid(), vehicle: 'x'.repeat(101) })
        .expect(400);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates a transport service', async () => {
      const res = await request(server)
        .post('/transport-services')
        .send(valid())
        .expect(201);
      expect(res.body.id).toBeDefined();
      createdId = res.body.id;
    });

    it('reads the created transport service by id', async () => {
      await request(server).get(`/transport-services/${createdId}`).expect(200);
    });

    it('updates the transport service', async () => {
      await request(server)
        .put(`/transport-services/${createdId}`)
        .send({ vehicle: 'Truck' })
        .expect(200);
      const res = await request(server)
        .get(`/transport-services/${createdId}`)
        .expect(200);
      expect(res.body.vehicle).toBe('Truck');
    });

    it('deletes the transport service', async () => {
      await request(server)
        .delete(`/transport-services/${createdId}`)
        .expect(200);
      const res = await request(server)
        .get(`/transport-services/${createdId}`)
        .expect(200);
      expectNoEntity(res.body);
    });
  });
});
