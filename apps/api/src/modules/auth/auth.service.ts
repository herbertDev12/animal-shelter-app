import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { loginInputSchema } from '@repo/schemas';
import type {
  LoginInput,
  LoginOutput,
  RegisterInput,
  SessionUser,
  UpdateUser,
  User,
  UserWithRole,
} from '@repo/schemas';
import { PrismaService } from '../prisma/prisma.service';
import { UserAlreadyExistsException } from './auth.exceptions';
import type { AuthUser, JwtPayload } from './auth.types';

export const SALT_ROUNDS = 10;

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  lastName: true,
  roleId: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterInput): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new UserAlreadyExistsException();
    }

    const role = await this.prisma.role.findFirst({
      where: { id: dto.roleId, isActive: true, isDeleted: false },
      select: { id: true },
    });

    if (!role) {
      throw new BadRequestException('Invalid role');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        lastName: dto.lastName ?? null,
        roleId: role.id,
      },
      select: publicUserSelect,
    });
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
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };

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

  async findSessionUser(id: string): Promise<SessionUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        role: {
          select: {
            name: true,
            permissions: {
              select: { permission: { select: { code: true } } },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const { role, ...rest } = user;
    return {
      ...rest,
      role: { name: role.name },
      permissions: role.permissions.map(({ permission }) => permission.code),
    };
  }

  async findAll(): Promise<UserWithRole[]> {
    return this.prisma.user.findMany({
      select: { ...publicUserSelect, role: { select: { name: true } } },
      orderBy: { email: 'asc' },
    });
  }

  async update(id: string, dto: UpdateUser): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const clash = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true },
      });

      if (clash && clash.id !== id) {
        throw new UserAlreadyExistsException();
      }
    }

    if (dto.roleId) {
      const role = await this.prisma.role.findFirst({
        where: { id: dto.roleId, isActive: true, isDeleted: false },
        select: { id: true },
      });

      if (!role) {
        throw new BadRequestException('Invalid role');
      }
    }

    const data: {
      email?: string;
      name?: string;
      lastName?: string | null;
      passwordHash?: string;
      roleId?: string;
    } = {};

    if (dto.email !== undefined) data.email = dto.email;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.roleId !== undefined) data.roleId = dto.roleId;
    if (dto.password !== undefined) {
      data.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
  }
}
