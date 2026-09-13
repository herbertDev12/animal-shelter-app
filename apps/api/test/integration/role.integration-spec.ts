import request from 'supertest';
import { AnimalsModule } from '../../src/modules/animal/animal.module';
import { RoleModule } from '../../src/modules/role/role.module';
import {
  AuthTestContext,
  closeAuthTestApp,
  createAuthTestApp,
  createUserWithRole,
  deleteTestUsers,
  roleIdByName,
  tokenFor,
  tokenForRole,
} from './utils/auth-test-app';

const TEST_ROLE_PREFIX = 'it-role-';

describe('Roles (integration)', () => {
  let ctx: AuthTestContext;
  let adminToken: string;

  const uniqueRoleName = () =>
    `${TEST_ROLE_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const asAdmin = () => ({
    get: (url: string) =>
      request(ctx.server).get(url).set('Authorization', `Bearer ${adminToken}`),
    post: (url: string) =>
      request(ctx.server)
        .post(url)
        .set('Authorization', `Bearer ${adminToken}`),
    put: (url: string) =>
      request(ctx.server).put(url).set('Authorization', `Bearer ${adminToken}`),
    delete: (url: string) =>
      request(ctx.server)
        .delete(url)
        .set('Authorization', `Bearer ${adminToken}`),
  });

  async function permissionIds(...codes: string[]): Promise<string[]> {
    const rows = await ctx.prisma.permission.findMany({
      where: { code: { in: codes } },
    });
    return rows.map((p) => p.id);
  }

  beforeAll(async () => {
    ctx = await createAuthTestApp([RoleModule, AnimalsModule]);
  });

  beforeEach(async () => {
    adminToken = await tokenForRole(ctx, 'Admin');
  });

  afterEach(async () => {
    await deleteTestUsers(ctx.prisma);
    await ctx.prisma.role.deleteMany({
      where: { name: { startsWith: TEST_ROLE_PREFIX } },
    });
  });

  afterAll(async () => {
    await closeAuthTestApp(ctx);
  });

  describe('seeded roles', () => {
    it('grants Admin every permission and Worker all but auth.* and role.*', async () => {
      const total = await ctx.prisma.permission.count();
      const admin = await asAdmin()
        .get(`/roles/${await roleIdByName(ctx.prisma, 'Admin')}`)
        .expect(200);
      const worker = await asAdmin()
        .get(`/roles/${await roleIdByName(ctx.prisma, 'Worker')}`)
        .expect(200);

      const workerCodes = (worker.body.permissions as { code: string }[]).map(
        (p) => p.code,
      );
      expect(admin.body.permissions).toHaveLength(total);
      expect(workerCodes).toContain('contract.edit');
      expect(
        workerCodes.some((c) => c.startsWith('auth.') || c.startsWith('role.')),
      ).toBe(false);
    });
  });

  describe('access', () => {
    it('rejects a Worker on every role endpoint with 403', async () => {
      const token = await tokenForRole(ctx, 'Worker');
      await request(ctx.server)
        .get('/roles')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      await request(ctx.server)
        .get('/permissions')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      await request(ctx.server)
        .post('/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: uniqueRoleName(), permissionIds: [] })
        .expect(403);
    });

    it('rejects an anonymous caller with 401', async () => {
      await request(ctx.server).get('/roles').expect(401);
    });
  });

  describe('POST /roles', () => {
    it('creates a role with the chosen permissions', async () => {
      const name = uniqueRoleName();
      const ids = await permissionIds('animal.read', 'animal.create');

      const res = await asAdmin()
        .post('/roles')
        .send({ name, permissionIds: ids })
        .expect(201);

      expect(res.body).toMatchObject({
        name,
        isActive: true,
        isDeleted: false,
      });
      expect(
        (res.body.permissions as { code: string }[]).map((p) => p.code).sort(),
      ).toEqual(['animal.create', 'animal.read']);
    });

    it('rejects unknown permission ids with 400', async () => {
      await asAdmin()
        .post('/roles')
        .send({
          name: uniqueRoleName(),
          permissionIds: ['00000000-0000-4000-8000-000000000000'],
        })
        .expect(400);
    });

    it('rejects a duplicate name with 409', async () => {
      await asAdmin()
        .post('/roles')
        .send({ name: 'Worker', permissionIds: [] })
        .expect(409);
    });
  });

  describe('role assignment and enforcement', () => {
    it('limits a user to exactly the permissions of their assigned role', async () => {
      const role = await asAdmin()
        .post('/roles')
        .send({
          name: uniqueRoleName(),
          permissionIds: await permissionIds('animal.read'),
        })
        .expect(201);
      const user = await createUserWithRole(ctx.prisma, 'Worker');

      const assigned = await asAdmin()
        .put(`/roles/${role.body.id}/users/${user.id}`)
        .expect(200);
      expect(assigned.body.roleId).toBe(role.body.id);

      // Log in again so the token carries the new role.
      const token = await tokenFor(ctx.server, user.email);
      await request(ctx.server)
        .get('/animals')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      await request(ctx.server)
        .post('/animals')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(403);
    });

    it('revokes access immediately when permissions are replaced', async () => {
      const role = await asAdmin()
        .post('/roles')
        .send({
          name: uniqueRoleName(),
          permissionIds: await permissionIds('animal.read'),
        })
        .expect(201);
      const user = await createUserWithRole(ctx.prisma, 'Worker');
      await asAdmin()
        .put(`/roles/${role.body.id}/users/${user.id}`)
        .expect(200);
      const token = await tokenFor(ctx.server, user.email);

      await asAdmin()
        .put(`/roles/${role.body.id}`)
        .send({ permissionIds: [] })
        .expect(200);

      await request(ctx.server)
        .get('/animals')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('denies everything to a deactivated role', async () => {
      const role = await asAdmin()
        .post('/roles')
        .send({
          name: uniqueRoleName(),
          permissionIds: await permissionIds('animal.read'),
        })
        .expect(201);
      const user = await createUserWithRole(ctx.prisma, 'Worker');
      await asAdmin()
        .put(`/roles/${role.body.id}/users/${user.id}`)
        .expect(200);
      const token = await tokenFor(ctx.server, user.email);

      await asAdmin()
        .put(`/roles/${role.body.id}`)
        .send({ isActive: false })
        .expect(200);

      await request(ctx.server)
        .get('/animals')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('returns 404 when assigning to a user that does not exist', async () => {
      await asAdmin()
        .put(
          `/roles/${await roleIdByName(ctx.prisma, 'Worker')}/users/00000000-0000-4000-8000-000000000000`,
        )
        .expect(404);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('soft-deletes an unassigned role', async () => {
      const role = await asAdmin()
        .post('/roles')
        .send({ name: uniqueRoleName(), permissionIds: [] })
        .expect(201);

      await asAdmin().delete(`/roles/${role.body.id}`).expect(200);

      await asAdmin().get(`/roles/${role.body.id}`).expect(404);
      const row = await ctx.prisma.role.findUniqueOrThrow({
        where: { id: role.body.id },
      });
      expect(row.isDeleted).toBe(true);
    });

    it('refuses to delete a role still assigned to users with 409', async () => {
      const role = await asAdmin()
        .post('/roles')
        .send({ name: uniqueRoleName(), permissionIds: [] })
        .expect(201);
      const user = await createUserWithRole(ctx.prisma, 'Worker');
      await asAdmin()
        .put(`/roles/${role.body.id}/users/${user.id}`)
        .expect(200);

      await asAdmin().delete(`/roles/${role.body.id}`).expect(409);
    });
  });

  describe('Admin role protection', () => {
    it.each([
      ['deleted', 'delete', undefined],
      ['deactivated', 'put', { isActive: false }],
      ['renamed', 'put', { name: 'Boss' }],
      ['stripped of permissions', 'put', { permissionIds: [] }],
    ] as const)('cannot be %s', async (_label, method, body) => {
      const adminRoleId = await roleIdByName(ctx.prisma, 'Admin');
      const call = asAdmin()[method](`/roles/${adminRoleId}`);

      await (body ? call.send(body) : call).expect(409);
    });
  });
});
