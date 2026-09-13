import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import {
  closeTestApp,
  createTestApp,
  getExistingId,
  createAdminAgent,
  ApiAgent,
} from './utils/test-app';

describe('Activities (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  let api: ApiAgent;
  let animalId: number;
  let supplierId: number;
  let activeContractId: number;
  let activeServiceId: number;
  const cleanup: Array<() => Promise<unknown>> = [];

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
    api = await createAdminAgent(server);
    animalId = await getExistingId(app, '/animals');
    supplierId = await getExistingId(app, '/suppliers');

    // Activities require a ServiceOffered whose Contract is Active, so build one.
    const contract = await api
      .post('/contracts')
      .send({
        id_supplier: supplierId,
        contract_category: 'Service',
        start_date: '2024-01-01',
        end_date: '2030-12-31',
      })
      .expect(201);
    activeContractId = contract.body.id;
    cleanup.push(() => api.delete(`/contracts/${activeContractId}`));

    const service = await api
      .post('/services-offered')
      .send({
        id_contract: activeContractId,
        name: 'E2E Activity Service',
        base_price: 10,
      })
      .expect(201);
    activeServiceId = service.body.id;
    cleanup.push(() => api.delete(`/services-offered/${activeServiceId}`));
  });

  afterAll(async () => {
    // Delete dependents (services/contract) after the activities that use them.
    for (const fn of cleanup.reverse()) {
      await fn();
    }
    await closeTestApp(app);
  });

  describe('GET /activities', () => {
    it('returns an array', async () => {
      const res = await api.get('/activities').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /activities/search', () => {
    it('applies default pagination', async () => {
      const res = await api.get('/activities/search').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    it('rejects limit=0', async () => {
      await api.get('/activities/search?limit=0').expect(400);
    });
  });

  describe('GET /activities/:id', () => {
    it('rejects a non-numeric id', async () => {
      await api.get('/activities/abc').expect(400);
    });

    it('returns 404 for a missing id', async () => {
      await api.get('/activities/999999999').expect(404);
    });
  });

  describe('POST /activities validation', () => {
    it('rejects a missing id_animal', async () => {
      await api
        .post('/activities')
        .send({ id_service: activeServiceId, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a non-positive id_service', async () => {
      await api
        .post('/activities')
        .send({ id_animal: animalId, id_service: 0, date: '2024-01-01' })
        .expect(400);
    });

    it('rejects a missing date', async () => {
      await api
        .post('/activities')
        .send({ id_animal: animalId, id_service: activeServiceId })
        .expect(400);
    });

    it('rejects an empty date (min 1)', async () => {
      await api
        .post('/activities')
        .send({ id_animal: animalId, id_service: activeServiceId, date: '' })
        .expect(400);
    });

    it('rejects a description longer than 300 chars', async () => {
      await api
        .post('/activities')
        .send({
          id_animal: animalId,
          id_service: activeServiceId,
          date: '2024-01-01',
          description: 'x'.repeat(301),
        })
        .expect(400);
    });
  });

  describe('Business rule: contract must be Active', () => {
    it('returns 400 when the service contract is not Active', async () => {
      const contract = await api
        .post('/contracts')
        .send({
          id_supplier: supplierId,
          contract_category: 'Service',
          start_date: '2024-01-01',
          end_date: '2030-12-31',
          status: 'Inactive',
        })
        .expect(201);
      const inactiveContractId = contract.body.id;

      const service = await api
        .post('/services-offered')
        .send({
          id_contract: inactiveContractId,
          name: 'E2E Inactive Service',
          base_price: 5,
        })
        .expect(201);
      const inactiveServiceId = service.body.id;

      await api
        .post('/activities')
        .send({
          id_animal: animalId,
          id_service: inactiveServiceId,
          date: '2024-01-01',
        })
        .expect(400);

      await api.delete(`/services-offered/${inactiveServiceId}`);
      await api.delete(`/contracts/${inactiveContractId}`);
    });
  });

  describe('CRUD round-trip', () => {
    let createdId: number;

    it('creates an activity', async () => {
      const res = await api
        .post('/activities')
        .send({
          id_animal: animalId,
          id_service: activeServiceId,
          date: '2024-07-01',
          description: 'E2E activity',
        })
        .expect(201);
      expect(res.body.id_activity).toBeDefined();
      createdId = res.body.id_activity;
    });

    it('reads the created activity by id', async () => {
      const res = await api.get(`/activities/${createdId}`).expect(200);
      expect(res.body.id_activity).toBe(createdId);
    });

    it('updates the activity', async () => {
      await api
        .put(`/activities/${createdId}`)
        .send({ description: 'E2E activity updated' })
        .expect(200);
      const res = await api.get(`/activities/${createdId}`).expect(200);
      expect(res.body.description).toBe('E2E activity updated');
    });

    it('deletes the activity', async () => {
      await api.delete(`/activities/${createdId}`).expect(200);
      await api.get(`/activities/${createdId}`).expect(404);
    });
  });
});
