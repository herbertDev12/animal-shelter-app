import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import {
  AuthTestContext,
  closeAuthTestApp,
  createAuthTestApp,
  deleteTestUsers,
  uniqueEmail,
} from './utils/auth-test-app';

const PASSWORD = 'correct-horse-battery';

describe('Auth (integration)', () => {
  let ctx: AuthTestContext;
  let jwt: JwtService;

  async function registerUser(
    overrides: Record<string, unknown> = {},
  ): Promise<{ email: string; token: string; id: string }> {
    const email = uniqueEmail();
    const res = await request(ctx.server)
      .post('/auth/register')
      .send({ email, password: PASSWORD, name: 'Ada', ...overrides })
      .expect(201);

    return { email, token: res.body.token, id: res.body.id };
  }

  beforeAll(async () => {
    ctx = await createAuthTestApp();
    jwt = ctx.app.get(JwtService);
  });

  afterEach(async () => {
    await deleteTestUsers(ctx.prisma);
  });

  afterAll(async () => {
    await closeAuthTestApp(ctx);
  });

  describe('POST /auth/register', () => {
    it('creates the account and returns id, email and a token', async () => {
      const email = uniqueEmail();

      const res = await request(ctx.server)
        .post('/auth/register')
        .send({ email, password: PASSWORD, name: 'Ada', lastName: 'Lovelace' })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.any(String),
        email,
        token: expect.any(String),
      });
    });

    it('never returns the password or its hash', async () => {
      const res = await request(ctx.server)
        .post('/auth/register')
        .send({ email: uniqueEmail(), password: PASSWORD, name: 'Ada' })
        .expect(201);

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

    it('stores name and lastName as separate columns', async () => {
      const email = uniqueEmail();
      await request(ctx.server)
        .post('/auth/register')
        .send({ email, password: PASSWORD, name: 'Ada', lastName: 'Lovelace' })
        .expect(201);

      const row = await ctx.prisma.user.findUniqueOrThrow({ where: { email } });

      expect(row.name).toBe('Ada');
      expect(row.lastName).toBe('Lovelace');
    });

    it('treats lastName as optional and stores null when omitted', async () => {
      const { email } = await registerUser();

      const row = await ctx.prisma.user.findUniqueOrThrow({ where: { email } });

      expect(row.lastName).toBeNull();
    });

    it('normalises the email by trimming and lowercasing it', async () => {
      const email = uniqueEmail();

      const res = await request(ctx.server)
        .post('/auth/register')
        .send({
          email: `  ${email.toUpperCase()}  `,
          password: PASSWORD,
          name: 'Ada',
        })
        .expect(201);

      expect(res.body.email).toBe(email);
      await expect(
        ctx.prisma.user.findUnique({ where: { email } }),
      ).resolves.not.toBeNull();
    });

    it('rejects a duplicate email with 409', async () => {
      const { email } = await registerUser();

      await request(ctx.server)
        .post('/auth/register')
        .send({ email, password: PASSWORD, name: 'Someone' })
        .expect(409);
    });

    it('rejects a duplicate email that differs only in case with 409', async () => {
      const { email } = await registerUser();

      await request(ctx.server)
        .post('/auth/register')
        .send({
          email: email.toUpperCase(),
          password: PASSWORD,
          name: 'Someone',
        })
        .expect(409);
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
    ])('rejects %s with 400', async (_label, override) => {
      await request(ctx.server)
        .post('/auth/register')
        .send({
          email: uniqueEmail(),
          password: PASSWORD,
          name: 'Ada',
          ...override,
        })
        .expect(400);
    });

    it('rejects an empty body with 400', async () => {
      await request(ctx.server).post('/auth/register').send({}).expect(400);
    });

    it('accepts a password of exactly 72 characters (the bcrypt limit)', async () => {
      await request(ctx.server)
        .post('/auth/register')
        .send({ email: uniqueEmail(), password: 'p'.repeat(72), name: 'Ada' })
        .expect(201);
    });

    it('ignores unknown fields instead of persisting them', async () => {
      const email = uniqueEmail();

      await request(ctx.server)
        .post('/auth/register')
        .send({
          email,
          password: PASSWORD,
          name: 'Ada',
          id: 'attacker-chosen-id',
          role: 'admin',
        })
        .expect(201);

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

    it('issues a token carrying the user id and email as claims', async () => {
      const { email, id } = await registerUser();

      const res = await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);

      const claims = jwt.verify<{ sub: string; email: string; exp: number }>(
        res.body.token,
      );

      expect(claims.sub).toBe(id);
      expect(claims.email).toBe(email);
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
      const sevenDays = 7 * 24 * 60 * 60;

      expect(exp - iat).toBe(sevenDays);
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
      const registered = await request(ctx.server)
        .post('/auth/register')
        .send({ email, password: PASSWORD, name: 'Ada', lastName: 'Lovelace' })
        .expect(201);

      const res = await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${registered.body.token}`)
        .expect(200);

      expect(res.body).toEqual({
        id: registered.body.id,
        email,
        name: 'Ada',
        lastName: 'Lovelace',
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

    it('accepts the token issued by /auth/login', async () => {
      const { email } = await registerUser();
      const login = await request(ctx.server)
        .post('/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);

      const res = await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${login.body.token}`)
        .expect(200);

      expect(res.body.email).toBe(email);
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
      }).sign({ sub: id, email });

      await request(ctx.server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${forged}`)
        .expect(401);
    });

    it('rejects an expired token with 401', async () => {
      const { id, email } = await registerUser();
      const expired = jwt.sign({ sub: id, email }, { expiresIn: '-1s' });

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
});
