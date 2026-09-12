import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { loginInputSchema } from '@repo/schemas';
import type {
  LoginInput,
  LoginOutput,
  RegisterInput,
  User,
} from '@repo/schemas';
import { PrismaService } from '../prisma/prisma.service';
import { UserAlreadyExistsException } from './auth.exceptions';
import type { AuthUser, JwtPayload } from './auth.types';

const SALT_ROUNDS = 10;

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  lastName: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterInput): Promise<LoginOutput> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new UserAlreadyExistsException();
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        lastName: dto.lastName ?? null,
      },
      select: publicUserSelect,
    });

    return this.login(user);
  }

  async validateUser(credentials: unknown): Promise<AuthUser | null> {
    const parsed = loginInputSchema.safeParse(credentials);

    if (!parsed.success) {
      return null;
    }

    const dto: LoginInput = parsed.data;

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return null;
    }

    const {
      passwordHash: _passwordHash,
      createdAt: _createdAt,
      ...result
    } = user;
    return result;
  }

  login(user: AuthUser): LoginOutput {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      id: user.id,
      email: user.email,
      token: this.jwtService.sign(payload),
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }
}
