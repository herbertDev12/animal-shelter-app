import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterInputDto, UpdateUserDto } from '@repo/schemas';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RequirePermission } from './permissions.decorator';
import { Public } from './public.decorator';
import type { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RequirePermission('auth.create')
  @Post('register')
  register(@Body() dto: RegisterInputDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @Get('me')
  async me(@Request() req: AuthenticatedRequest) {
    const user = await this.authService.findSessionUser(req.user.id);

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

  @RequirePermission('auth.read')
  @Get('users/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.findById(id);
  }

  @RequirePermission('auth.edit')
  @Put('users/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() data: UpdateUserDto) {
    return this.authService.update(id, data);
  }

  @RequirePermission('auth.edit')
  @Delete('users/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (req.user.id === id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    return this.authService.remove(id);
  }
}
