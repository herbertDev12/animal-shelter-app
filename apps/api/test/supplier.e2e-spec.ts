import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { closeTestApp, createTestApp, expectNoEntity } from './utils/test-app';

describe('Suppliers (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /suppliers', () => {
    it('returns an array', async () => {
      const res = await request(server).get('/suppliers').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /suppliers/search', () => {
    it('applies default pagination', async () => {
      const res = await request(server).get('/suppliers/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects an invalid type enum', async () => {
      await request(server).get('/suppliers/search?type=Banana').expect(400);
    });

    it('rejects limit=0', async () => {
      await request(server).get('/suppliers/search?limit=0').expect(400);
    });
  });

  describe('GET /suppliers/:id', () => {
    it('rejects a non-numeric id', async () => {
      await request(server).get('/suppliers/abc').expect(400);
    });

    it('returns no entity for a missing id', async () => {
      const res = await request(server).get('/suppliers/999999999').expect(200);
      expectNoEntity(res.body);
    });
  });

  describe('POST /suppliers validation', () => {
    it('rejects a missing name', async () => {
      await request(server)
        .post('/suppliers')
        .send({ type: 'Veterinarian' })
        .expect(400);
    });

    it('rejects a missing type', async () => {
      await request(server)
        .post('/suppliers')
        .send({ name: 'Acme' })
        .expect(400);
    });

    it('rejects an invalid type enum value', async () => {
      await request(server)
        .post('/suppliers')
        .send({ name: 'Acme', type: 'Food' }) // must be "Food Company"
        .expect(400);
    });

    it('rejects an invalid contact_email', async () => {
      await request(server)
        .post('/suppliers')
        .send({
          name: 'Acme',
          type: 'Food Company',
          contact_email: 'not-email',
        })
        .expect(400);
    });

    it('accepts an empty string contact_email (email-or-empty)', async () => {
      const res = await request(server)
        .post('/suppliers')
        .send({
          name: 'E2E Empty Email',
          type: 'Food Company',
          contact_email: '',
        })
        .expect(201);
      await request(server).delete(`/suppliers/${res.body.id}`);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates a supplier', async () => {
      const res = await request(server)
        .post('/suppliers')
        .send({
          name: 'E2E Supplier',
          type: 'Service Company',
          contact_email: 'e2e@example.com',
          province: 'Havana',
        })
        .expect(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.type).toBe('Service Company');
      createdId = res.body.id;
    });

    it('updates the supplier', async () => {
      await request(server)
        .put(`/suppliers/${createdId}`)
        .send({ name: 'E2E Supplier Renamed' })
        .expect(200);
      const res = await request(server)
        .get(`/suppliers/${createdId}`)
        .expect(200);
      expect(res.body.name).toBe('E2E Supplier Renamed');
    });

    it('deletes the supplier', async () => {
      await request(server).delete(`/suppliers/${createdId}`).expect(200);
      const res = await request(server)
        .get(`/suppliers/${createdId}`)
        .expect(200);
      expectNoEntity(res.body);
    });
  });
});
