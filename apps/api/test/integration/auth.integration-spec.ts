import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import {
  AuthTestContext,
  TEST_PASSWORD,
  closeAuthTestApp,
  createAuthTestApp,
  deleteTestUsers,
  roleIdByName,
  tokenFor,
  tokenForRole,
  uniqueEmail,
} from './utils/auth-test-app';

const PASSWORD = TEST_PASSWORD;

describe('Auth (integration)', () => {
  let ctx: AuthTestContext;
  let jwt: JwtService;
  let adminToken: string;
  let workerRoleId: string;

  /** POST /auth/register as the admin. */
  function register(body: Record<string, unknown>) {
    return request(ctx.server)
      .post('/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);
  }

  async function registerUser(
    overrides: Record<string, unknown> = {},
  ): Promise<{ email: string; token: string; id: string }> {
    const email = uniqueEmail();
    const res = await register({
      email,
      password: PASSWORD,
      name: 'Ada',
      roleId: workerRoleId,
      ...overrides,
    }).expect(201);

    return { email, token: await tokenFor(ctx.server, email), id: res.body.id };
  }

  beforeAll(async () => {
    ctx = await createAuthTestApp();
    jwt = ctx.app.get(JwtService);
    workerRoleId = await roleIdByName(ctx.prisma, 'Worker');
  });

  beforeEach(async () => {
    adminToken = await tokenForRole(ctx, 'Admin');
  });

  afterEach(async () => {
    await deleteTestUsers(ctx.prisma);
  });

  afterAll(async () => {
    await closeAuthTestApp(ctx);
  });

  describe('POST /auth/register', () => {
    it('creates the account and returns the public user', async () => {
      const email = uniqueEmail();

      const res = await register({
        email,
        password: PASSWORD,
        name: 'Ada',
        lastName: 'Lovelace',
        roleId: workerRoleId,
      }).expect(201);

      expect(res.body).toEqual({
        id: expect.any(String),
        email,
        name: 'Ada',
        lastName: 'Lovelace',
        roleId: workerRoleId,
      });
    });

    it('rejects a request with no token with 401', async () => {
      await request(ctx.server)
        .post('/auth/register')
        .send({
          email: uniqueEmail(),
          password: PASSWORD,
          name: 'Ada',
          roleId: workerRoleId,
        })
        .expect(401);
    });

    it('rejects a caller whose role lacks auth.create (Worker) with 403', async () => {
      const workerToken = await tokenForRole(ctx, 'Worker');

      await request(ctx.server)
        .post('/auth/register')
        .set('Authorization', `Bearer ${workerToken}`)
        .send({
          email: uniqueEmail(),
          password: PASSWORD,
          name: 'Ada',
          roleId: workerRoleId,
        })
        .expect(403);
    });

    it('rejects a token issued without a roleId claim with 403', async () => {
      const { id, email } = await registerUser();
      const legacy = jwt.sign({ sub: id, email });

      await request(ctx.server)
        .post('/auth/register')
        .set('Authorization', `Bearer ${legacy}`)
        .send({
          email: uniqueEmail(),
          password: PASSWORD,
          name: 'Ada',
          roleId: workerRoleId,
        })
        .expect(403);
    });

    it('rejects a roleId that does not exist with 400', async () => {
      await register({
        email: uniqueEmail(),
        password: PASSWORD,
        name: 'Ada',
        roleId: '00000000-0000-4000-8000-000000000000',
      }).expect(400);
    });

    it('never returns the password or its hash', async () => {
      const res = await register({
        email: uniqueEmail(),
        password: PASSWORD,
        name: 'Ada',
        roleId: workerRoleId,
      }).expect(201);

      expect(JSON.stringify(res.body)).not.toContain(PASSWORD);
      expect(res.body).not.toHaveProperty('passwordHash');
      expect(res.body).not.toHaveProperty('password');
    });

    it('stores a bcrypt hash rather than the plaintext password', async () => {
      const { email } = await registerUser();

      const row = await ctx.prisma.user.findUniqueOrThrow({ where: { email } });

      expect(row.passwordHash).not.toBe(PASSWORD);
      expect(row.passwordHash).toMatch(/^\$2[aby]\$/);
      await expect(bcrypt.compare(PASSWORD, row.passwordHash)).resolves.toBe(
        true,
      );
    });

    it('stores name, lastName and roleId as separate columns', async () => {
      const email = uniqueEmail();
      await register({
        email,
        password: PASSWORD,
        name: 'Ada',
        lastName: 'Lovelace',
        roleId: workerRoleId,
      }).expect(201);

      const row = await ctx.prisma.user.findUniqueOrThrow({ where: { email } });

      expect(row.name).toBe('Ada');
      expect(row.lastName).toBe('Lovelace');
      expect(row.roleId).toBe(workerRoleId);
    });

    it('treats lastName as optional and stores null when omitted', async () => {
      const { email } = await registerUser();

      const row = await ctx.prisma.user.findUniqueOrThrow({ where: { email } });

      expect(row.lastName).toBeNull();
    });

    it('normalises the email by trimming and lowercasing it', async () => {
      const email = uniqueEmail();

      const res = await register({
        email: `  ${email.toUpperCase()}  `,
        password: PASSWORD,
        name: 'Ada',
        roleId: workerRoleId,
      }).expect(201);

      expect(res.body.email).toBe(email);
      await expect(
        ctx.prisma.user.findUnique({ where: { email } }),
      ).resolves.not.toBeNull();
    });

    it('rejects a duplicate email with 409', async () => {
      const { email } = await registerUser();

      await register({
        email,
        password: PASSWORD,
        name: 'Someone',
        roleId: workerRoleId,
      }).expect(409);
    });

    it('rejects a duplicate email that differs only in case with 409', async () => {
      const { email } = await registerUser();

      await register({
        email: email.toUpperCase(),
        password: PASSWORD,
        name: 'Someone',
        roleId: workerRoleId,
      }).expect(409);
    });

    it.each([
      ['a malformed email', { email: 'not-an-email' }],
      ['an empty email', { email: '' }],
      ['a password below 8 characters', { password: 'short' }],
      ['a password above 72 characters', { password: 'p'.repeat(73) }],
      ['a missing password', { password: undefined }],
      ['a missing name', { name: undefined }],
      ['a blank name', { name: '   ' }],
      ['a non-string name', { name: 42 }],
      ['a missing roleId', { roleId: undefined }],
      ['a non-uuid roleId', { roleId: 'admin' }],
    ])('rejects %s with 400', async (_label, override) => {
      await register({
        email: uniqueEmail(),
        password: PASSWORD,
        name: 'Ada',
        roleId: workerRoleId,
        ...override,
      }).expect(400);
    });

    it('rejects an empty body with 400', async () => {
      await register({}).expect(400);
    });

    it('accepts a password of exactly 72 characters (the bcrypt limit)', async () => {
      await register({
        email: uniqueEmail(),
        password: 'p'.repeat(72),
        name: 'Ada',
        roleId: workerRoleId,
      }).expect(201);
    });

    it('ignores unknown fields instead of persisting them', async () => {
      const email = uniqueEmail();

      await register({
        email,
        password: PASSWORD,
        name: 'Ada',
        roleId: workerRoleId,
        id: 'attacker-chosen-id',
        role: 'admin',
      }).expect(201);

      const row = await ctx.prisma.user.findUniqueOrThrow({ where: { email } });

      expect(row.id).not.toBe('attacker-chosen-id');
      expect(row).not.toHaveProperty('role');
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 with id, email and a token for valid credentials', async () => {
      const { email, id } = await registerUser();

      const res = await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);

      expect(res.body).toEqual({ id, email, token: expect.any(String) });
    });

    it('needs no token and no permission', async () => {
      const { email } = await registerUser();

      await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);
    });

    it('issues a token carrying the user id, email and roleId as claims', async () => {
      const { email, id } = await registerUser();

      const res = await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);

      const claims = jwt.verify<{
        sub: string;
        email: string;
        roleId: string;
        exp: number;
      }>(res.body.token);

      expect(claims.sub).toBe(id);
      expect(claims.email).toBe(email);
      expect(claims.roleId).toBe(workerRoleId);
    });

    it('issues a token that expires in about 7 days', async () => {
      const { email } = await registerUser();

      const res = await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);

      const { iat, exp } = jwt.verify<{ iat: number; exp: number }>(
        res.body.token,
      );
      const oneDay = 24 * 60 * 60;

      expect(exp - iat).toBe(oneDay);
    });

    it('accepts an email in a different case than it was registered with', async () => {
      const { email } = await registerUser();

      await request(ctx.server)
        .post('/auth/login')
        .send({ email: `  ${email.toUpperCase()}  `, password: PASSWORD })
        .expect(200);
    });

    it('rejects a wrong password with 401', async () => {
      const { email } = await registerUser();

      await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: 'not-the-password' })
        .expect(401);
    });

    it('answers identically for an unknown email and a wrong password', async () => {
      const { email } = await registerUser();

      const wrongPassword = await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: 'not-the-password' })
        .expect(401);

      const unknownEmail = await request(ctx.server)
        .post('/auth/login')
        .send({ email: uniqueEmail(), password: PASSWORD })
        .expect(401);

      expect(unknownEmail.body).toEqual(wrongPassword.body);
    });

    it('rejects a malformed body with 401', async () => {
      await request(ctx.server).post('/auth/login').send({}).expect(401);

      await request(ctx.server)
        .post('/auth/login')
        .send({ email: 'not-an-email', password: '' })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the caller’s own account for a valid token', async () => {
      const email = uniqueEmail();
      const registered = await register({
        email,
        password: PASSWORD,
        name: 'Ada',
        lastName: 'Lovelace',
        roleId: workerRoleId,
      }).expect(201);
      const token = await tokenFor(ctx.server, email);

      const res = await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toEqual({
        id: registered.body.id,
        email,
        name: 'Ada',
        lastName: 'Lovelace',
        roleId: workerRoleId,
      });
    });

    it('never exposes the password hash', async () => {
      const { token } = await registerUser();

      const res = await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('rejects a request with no Authorization header with 401', async () => {
      await request(ctx.server).get('/auth/me').expect(401);
    });

    it.each([
      ['a garbage token', 'Bearer garbage'],
      ['an empty bearer token', 'Bearer '],
      ['a non-bearer scheme', 'Basic dXNlcjpwYXNz'],
    ])('rejects %s with 401', async (_label, header) => {
      await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', header)
        .expect(401);
    });

    it('rejects a token signed with a different secret with 401', async () => {
      const { id, email } = await registerUser();
      const forged = new JwtService({
        secret: 'not-the-real-secret',
      }).sign({ sub: id, email, roleId: workerRoleId });

      await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${forged}`)
        .expect(401);
    });

    it('rejects an expired token with 401', async () => {
      const { id, email } = await registerUser();
      const expired = jwt.sign(
        { sub: id, email, roleId: workerRoleId },
        { expiresIn: '-1s' },
      );

      await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${expired}`)
        .expect(401);
    });

    it('rejects a validly signed token whose account no longer exists', async () => {
      const { email, token } = await registerUser();
      await ctx.prisma.user.delete({ where: { email } });

      await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('scopes the response to the token holder', async () => {
      const first = await registerUser();
      const second = await registerUser();

      const res = await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${second.token}`)
        .expect(200);

      expect(res.body.email).toBe(second.email);
      expect(res.body.email).not.toBe(first.email);
    });
  });

  describe('GET /auth/users', () => {
    it('lists users for a role with auth.read', async () => {
      const { email } = await registerUser();

      const res = await request(ctx.server)
        .get('/auth/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const row = (res.body as Array<{ email: string }>).find(
        (u) => u.email === email,
      );
      expect(row).toMatchObject({
        roleId: workerRoleId,
        role: { name: 'Worker' },
      });
      expect(row).not.toHaveProperty('passwordHash');
    });

    it('rejects a Worker with 403', async () => {
      const { token } = await registerUser();

      await request(ctx.server)
        .get('/auth/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
