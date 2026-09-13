import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterInputDto } from '@repo/schemas';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';
import { RequirePermission } from './permissions.decorator';
import type { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RequirePermission('auth.create')
  @Post('register')
  register(@Body() registerInputDto: RegisterInputDto) {
    return this.authService.register(registerInputDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  // Any authenticated user may read their own account.
  @Get('me')
  async me(@Request() req: AuthenticatedRequest) {
    const user = await this.authService.findById(req.user.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  @RequirePermission('auth.read')
  @Get('users')
  findAll() {
    return this.authService.findAll();
  }
}
