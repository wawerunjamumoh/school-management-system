import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { SchoolMembershipService } from './school-membership.service.js';
import { CreateSchoolMembershipDto } from './dto/create-school-membership.dto.js';
import { UpdateSchoolMembershipDto } from './dto/update-school-membership.dto.js';

@Controller()
export class SchoolMembershipController {
  constructor(
    private readonly schoolMembershipService: SchoolMembershipService,
  ) {}

  // ==========================================
  // CREATE MEMBERSHIP
  // ==========================================

  // POST /schools/:schoolId/memberships
  @Post('schools/:schoolId/memberships')
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
  @Get('schools/:schoolId/memberships')
  async findSchoolMemberships(@Param('schoolId') schoolId: string) {
    return this.schoolMembershipService.findBySchool(schoolId);
  }

  // ==========================================
  // GET ONE MEMBERSHIP
  // ==========================================

  // GET /schools/:schoolId/memberships/:membershipId
  @Get('schools/:schoolId/memberships/:membershipId')
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
  @Patch('schools/:schoolId/memberships/:membershipId')
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
  @Delete('schools/:schoolId/memberships/:membershipId')
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
  @Get('users/:userId/memberships')
  async findUserMemberships(@Param('userId') userId: string) {
    return this.schoolMembershipService.findByUser(userId);
  }
}
