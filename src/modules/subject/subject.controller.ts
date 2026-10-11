import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SubjectService } from './subject.service.js';

import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole} from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
  ) {}

  // =========================================================
  // CREATE SUBJECT
  // =========================================================
  //
  // POST /schools/:schoolId/subjects
  //
  // Only school leadership should create subjects.
  //

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.subjectService.create(
      schoolId,
      dto,
    );
  }

  // =========================================================
  // GET ALL SUBJECTS
  // =========================================================
  //
  // GET /schools/:schoolId/subjects
  //
  // All authenticated school users who need academic
  // information can view subjects.
  //

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
    UserRole.GUARDIAN,
    UserRole.STUDENT,
  )
  findAll(
    @Param('schoolId') schoolId: string,
  ) {
    return this.subjectService.findAll(
      schoolId,
    );
  }

  // =========================================================
  // GET ONE SUBJECT
  // =========================================================
  //
  // GET /schools/:schoolId/subjects/:subjectId
  //

  @Get(':subjectId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
    UserRole.GUARDIAN,
    UserRole.STUDENT,
  )
  findOne(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.subjectService.findOne(
      schoolId,
      subjectId,
    );
  }

  // =========================================================
  // UPDATE SUBJECT
  // =========================================================
  //
  // PATCH /schools/:schoolId/subjects/:subjectId
  //
  // Only school leadership can modify the subject catalogue.
  //

  @Patch(':subjectId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  update(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(
      schoolId,
      subjectId,
      dto,
    );
  }

  // =========================================================
  // DELETE SUBJECT
  // =========================================================
  //
  // DELETE /schools/:schoolId/subjects/:subjectId
  //
  // Deleting a subject can affect classes, exams,
  // results, and teacher assignments.
  //

  @Delete(':subjectId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  remove(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.subjectService.remove(
      schoolId,
      subjectId,
    );
  }
}
;
