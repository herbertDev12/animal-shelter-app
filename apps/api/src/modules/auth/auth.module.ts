import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions.guard';
import { jwtExpiresIn, jwtSecret } from './jwt.config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtSecret(),
      signOptions: { expiresIn: jwtExpiresIn() },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
