import {
  Controller,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';

import { LoginDto } from './dto/login.dto.js';
import { RegisterGuardianDto } from './dto/register-gurdian.dto.js';
import { RegisterStudentDto } from './dto/register-student.dto.js';
import { RegisterTeacherDto } from './dto/register-teacher.dto.js';
import { RegisterSuperAdminDto } from './dto/register-super-admin.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js'
// guard
import {JwtAuthGuard} from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // LOGIN
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // LOGOUT
  @Post(':userId/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Param('userId') userId: string) {
    return this.authService.logout(userId);
  }

  // DELETE ACCOUNT
  @Post(':userId/deleteAccount')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Param('userId') userId: string) {
    return this.authService.deleteAccount(userId);
  }

  // RESET PASSWORD
  @Post(':userId/resetPassword')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('userId') userId: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(userId, newPassword);
  }

  // USER ACCOUNT
  @Post('users/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async user(@Req() req:any) {
    return req.user;

  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken)
  }

  // STUDENT
  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  // GUARDIAN
  @Post('register/guardian')
  @HttpCode(HttpStatus.CREATED)
  async registerGuardian(@Body() dto: RegisterGuardianDto) {
    return this.authService.registerGuardian(dto);
  }

  // SUPER ADMIN
  @Post('register/super-admin')
  @HttpCode(HttpStatus.CREATED)
  async registerSuperAdmin(@Body() dto: RegisterSuperAdminDto) {
    return this.authService.registerSuperAdmin(dto);
  }

  // TEACHER
  @Post('register/teacher')
  @HttpCode(HttpStatus.CREATED)
  async registerTeacher(@Body() dto: RegisterTeacherDto) {
    return this.authService.registerTeacher(dto);
  }
}