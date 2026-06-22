import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  MISSING_ID,
  closeTestApp,
  createTestApp,
  getExistingId,
} from './utils/test-app';

describe('Contracts (e2e)', () => {
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

  describe('GET /contracts', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/contracts').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /contracts/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server).get('/contracts/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects an invalid contract_category enum', async () => {
      await request(server)
        .get('/contracts/search?contract_category=Toys')
        .expect(400);
    });

    it('rejects an invalid status enum', async () => {
      await request(server).get('/contracts/search?status=Paused').expect(400);
    });
  });

  describe('GET /contracts/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/contracts/abc').expect(400);
    });

    it('returns 404 for a missing id (NotFoundException)', async () => {
      await request(server).get(`/contracts/${MISSING_ID}`).expect(404);
    });
  });

  describe('POST /contracts validation', () => {
    const valid = () => ({
      id_supplier: supplierId,
      contract_category: 'Food',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    });

    it('rejects a missing id_supplier', async () => {
      const body = valid();
      delete (body as Record<string, unknown>).id_supplier;
      await request(server).post('/contracts').send(body).expect(400);
    });

    it('rejects a non-positive id_supplier', async () => {
      await request(server)
        .post('/contracts')
        .send({ ...valid(), id_supplier: 0 })
        .expect(400);
    });

    it('rejects an invalid contract_category', async () => {
      await request(server)
        .post('/contracts')
        .send({ ...valid(), contract_category: 'Toys' })
        .expect(400);
    });

    it('rejects end_date before start_date (refinement)', async () => {
      await request(server)
        .post('/contracts')
        .send({ ...valid(), start_date: '2024-12-31', end_date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a description longer than 300 chars', async () => {
      await request(server)
        .post('/contracts')
        .send({ ...valid(), description: 'x'.repeat(301) })
        .expect(400);
    });
  });

  describe('PATCH/DELETE missing contract', () => {
    it('returns 404 when patching a missing contract', async () => {
      await request(server)
        .patch(`/contracts/${MISSING_ID}`)
        .send({ status: 'Inactive' })
        .expect(404);
    });

    it('returns 404 when deleting a missing contract', async () => {
      await request(server).delete(`/contracts/${MISSING_ID}`).expect(404);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates a contract with default status Active', async () => {
      const res = await request(server)
        .post('/contracts')
        .send({
          id_supplier: supplierId,
          contract_category: 'Food',
          start_date: '2024-01-01',
          // Far-future end date so the auto-expire trigger keeps it Active.
          end_date: '2030-12-31',
          description: 'E2E contract',
        })
        .expect(201);
      createdId = res.body.id;
      expect(createdId).toBeDefined();
      expect(res.body.status).toBe('Active');
    });

    it('reads the created contract by id', async () => {
      await request(server).get(`/contracts/${createdId}`).expect(200);
    });

    it('updates the contract (PATCH)', async () => {
      await request(server)
        .patch(`/contracts/${createdId}`)
        .send({ status: 'Inactive' })
        .expect(200);
      const res = await request(server)
        .get(`/contracts/${createdId}`)
        .expect(200);
      expect(res.body.status).toBe('Inactive');
    });

    it('rejects a PATCH with end_date before start_date', async () => {
      await request(server)
        .patch(`/contracts/${createdId}`)
        .send({ start_date: '2024-12-31', end_date: '2024-01-01' })
        .expect(400);
    });

    it('deletes the contract', async () => {
      await request(server).delete(`/contracts/${createdId}`).expect(200);
      await request(server).get(`/contracts/${createdId}`).expect(404);
    });
  });
});
