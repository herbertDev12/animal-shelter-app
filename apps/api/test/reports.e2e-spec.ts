import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { closeTestApp, createTestApp, getExistingId } from './utils/test-app';

describe('Reports (e2e)', () => {
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

  const expectPaginated = (body: Record<string, unknown>) => {
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.limit).toBe('number');
    expect(typeof body.offset).toBe('number');
  };

  describe('GET /reports/reconciled-veterinarian-contracts', () => {
    it('returns a paginated shape with defaults', async () => {
      const res = await request(server)
        .get('/reports/reconciled-veterinarian-contracts')
        .expect(200);
      expectPaginated(res.body);
      expect(res.body.limit).toBe(10);
      expect(res.body.offset).toBe(0);
    });

    it('coerces limit/offset query params', async () => {
      const res = await request(server)
        .get('/reports/reconciled-veterinarian-contracts?limit=5&offset=2')
        .expect(200);
      expect(res.body.limit).toBe(5);
      expect(res.body.offset).toBe(2);
    });

    it('rejects limit=0', async () => {
      await request(server)
        .get('/reports/reconciled-veterinarian-contracts?limit=0')
        .expect(400);
    });
  });

  describe('GET /reports/food-supplier-contracts', () => {
    it('returns a paginated shape', async () => {
      const res = await request(server)
        .get('/reports/food-supplier-contracts')
        .expect(200);
      expectPaginated(res.body);
    });

    it('rejects a non-numeric limit', async () => {
      await request(server)
        .get('/reports/food-supplier-contracts?limit=abc')
        .expect(400);
    });
  });

  describe('GET /reports/complementary-service-contracts', () => {
    it('returns a paginated shape', async () => {
      const res = await request(server)
        .get('/reports/complementary-service-contracts')
        .expect(200);
      expectPaginated(res.body);
    });

    it('rejects a negative offset', async () => {
      await request(server)
        .get('/reports/complementary-service-contracts?offset=-1')
        .expect(400);
    });
  });

  describe('GET /reports/active-veterinarians', () => {
    it('returns a paginated shape', async () => {
      const res = await request(server)
        .get('/reports/active-veterinarians')
        .expect(200);
      expectPaginated(res.body);
    });

    it('accepts optional clinic_id and province filters', async () => {
      const res = await request(server)
        .get('/reports/active-veterinarians?clinic_id=1&province=Havana')
        .expect(200);
      expectPaginated(res.body);
    });

    it('rejects a non-numeric clinic_id', async () => {
      await request(server)
        .get('/reports/active-veterinarians?clinic_id=abc')
        .expect(400);
    });
  });

  describe('GET /reports/animal-care-schedule', () => {
    it('returns a paginated shape for a valid id_animal', async () => {
      const res = await request(server)
        .get(`/reports/animal-care-schedule?id_animal=${animalId}`)
        .expect(200);
      expectPaginated(res.body);
    });

    it('rejects a missing required id_animal', async () => {
      await request(server).get('/reports/animal-care-schedule').expect(400);
    });

    it('rejects id_animal below 1', async () => {
      await request(server)
        .get('/reports/animal-care-schedule?id_animal=0')
        .expect(400);
    });
  });

  describe('GET /reports/revenue-plan', () => {
    it('returns a paginated shape', async () => {
      const res = await request(server)
        .get('/reports/revenue-plan')
        .expect(200);
      expectPaginated(res.body);
    });

    it('rejects limit=0', async () => {
      await request(server).get('/reports/revenue-plan?limit=0').expect(400);
    });
  });
});
