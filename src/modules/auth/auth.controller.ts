import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.auth.login(dto);
  }
  @Post('register')
  

  @Post('super-admin/login')
  async superAdminLogin(@Body() dto: SuperAdminLoginDto) {
    return await this.auth.superAdminLogin(dto.email, dto.password);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.auth.refresh(dto.refreshToken);
  }
}
