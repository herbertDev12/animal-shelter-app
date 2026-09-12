import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { WrongUsernameOrPasswordError } from './auth.exceptions';
import type { AuthUser } from './auth.types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<AuthUser> {
    const user = await this.authService.validateUser({ email, password });

    if (!user) {
      throw new WrongUsernameOrPasswordError();
    }

    return user;
  }
}
