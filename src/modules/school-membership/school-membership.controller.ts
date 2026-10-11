import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { SchoolMembershipService } from './school-membership.service.js';
import { CreateSchoolMembershipDto } from './dto/create-school-membership.dto.js';
import { UpdateSchoolMembershipDto } from './dto/update-school-membership.dto.js';
import { UpdateMembershipRoleDto} from './dto/update-membership-role.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '../auth/entities/user.entity.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('schools/:schoolId/memberships/')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolMembershipController {
  constructor(
    private readonly schoolMembershipService: SchoolMembershipService,
  ) {}

  // ==========================================
  // CREATE MEMBERSHIP
  // ==========================================

  // POST /schools/:schoolId/memberships
  @Post()
  async createMembership(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateSchoolMembershipDto,
  ) {
    return this.schoolMembershipService.create(schoolId, dto);
  }

  // ==========================================
  // GET ALL MEMBERSHIPS FOR A SCHOOL
  // ==========================================

  // GET /schools/:schoolId/memberships
  @Get()
  async findSchoolMemberships(@Param('schoolId') schoolId: string) {
    return this.schoolMembershipService.findBySchool(schoolId);
  }

  // ==========================================
  // GET ONE MEMBERSHIP
  // ==========================================

  // GET /schools/:schoolId/memberships/:membershipId
  @Get(':membershipId')
  async findOneMembership(
    @Param('schoolId') schoolId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.schoolMembershipService.findOne(schoolId, membershipId);
  }

  // ==========================================
  // UPDATE MEMBERSHIP
  // ==========================================

  // PATCH /schools/:schoolId/memberships/:membershipId
  @Patch(':membershipId')
  @Roles(UserRole.SUPER_ADMIN)
  async updateMembership(
    @Param('schoolId') schoolId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateSchoolMembershipDto,
  ) {
    return this.schoolMembershipService.update(schoolId, membershipId, dto);
  }

  // ==========================================
  // DELETE MEMBERSHIP
  // ==========================================

  // DELETE /schools/:schoolId/memberships/:membershipId
  @Delete(':membershipId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async deleteMembership(
    @Param('schoolId') schoolId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.schoolMembershipService.remove(schoolId, membershipId);
  }

  // ==========================================
  // GET MEMBERSHIPS FOR A USER
  // ==========================================

  // GET /users/:userId/memberships
  @Get(':userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HEAD_TEACHER)
  async findUserMemberships(@Param('userId') userId: string) {
    return this.schoolMembershipService.findByUser(userId);
  }

  @Patch(':userId/role')
  @Roles(UserRole.SUPER_ADMIN)
  UpdateRole(
    @Param('schoolId') schoolId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMembershipRoleDto,
  ) {
    return this.schoolMembershipService.UpdateRole(schoolId, userId, dto.role);
  }
}
