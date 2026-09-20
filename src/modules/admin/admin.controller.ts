import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthClaims } from '../auth/auth.service.js';
import { PlatformRole } from '../auth/entities/user-account.entity.js';
import { School } from '../school/entities/school.entity.js';
import { CreateManagedSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolVerificationDto } from './dto/update-school-verification.dto.js';

@Controller('admin/schools')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(@InjectRepository(School) private readonly schools: Repository<School>) {}
  private assertSuperAdmin(auth: AuthClaims) { if (!auth.platformRoles?.includes(PlatformRole.SUPER_ADMIN)) throw new ForbiddenException(); }
  @Get()
  async list(@Request() request: { auth: AuthClaims }) {
    this.assertSuperAdmin(request.auth);
    return await this.schools.find();
  }
  @Patch(':schoolId/verification')
  async verify(@Param('schoolId') schoolId: string, @Body() dto: UpdateSchoolVerificationDto, @Request() request: { auth: AuthClaims }) {
    this.assertSuperAdmin(request.auth);
    const school = await this.schools.findOneBy({ id: schoolId });
    if (!school) throw new NotFoundException('School not found');
    school.verificationStatus = dto.status;
    return this.schools.save(school);
  }
  @Post()
  async create(@Body() dto: CreateManagedSchoolDto, @Request() request: { auth: AuthClaims }) {
    this.assertSuperAdmin(request.auth);
    return await this.schools.save(this.schools.create(dto));
  }
}
