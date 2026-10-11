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

import { ClassService } from './class.service.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(
    private readonly classService: ClassService,
  ) {}

  // ==========================================
  // CREATE CLASS
  // ==========================================

  // POST /schools/:schoolId/classes
  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async createClass(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateClassDto,
  ) {
    return this.classService.create(schoolId, dto);
  }

  // ==========================================
  // GET ALL CLASSES FOR SCHOOL
  // ==========================================

  // GET /schools/:schoolId/classes
  @Get()
  async findAllClasses(
    @Param('schoolId') schoolId: string,
  ) {
    return this.classService.findBySchool(schoolId);
  }

  // ==========================================
  // GET ONE CLASS
  // ==========================================

  // GET /schools/:schoolId/classes/:classId
  @Get(':classId')
  async findOneClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.classService.findOne(
      schoolId,
      classId,
    );
  }

  // ==========================================
  // UPDATE CLASS
  // ==========================================

  // PATCH /schools/:schoolId/classes/:classId
  @Patch(':classId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async updateClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classService.update(
      schoolId,
      classId,
      dto,
    );
  }

  // ==========================================
  // DELETE CLASS
  // ==========================================

  // DELETE /schools/:schoolId/classes/:classId
  @Delete(':classId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async removeClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.classService.remove(
      schoolId,
      classId,
    );
  }
}

