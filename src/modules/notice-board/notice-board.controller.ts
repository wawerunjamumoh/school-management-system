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

import { NoticeBoardService } from './notice-board.service.js';
import { CreateNoticeBoardDto } from './dto/create-notice-board.dto.js';
import { UpdateNoticeBoardDto } from './dto/update-notice-board.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@Controller('schools/:schoolId/notice-boards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticeBoardController {
  constructor(
    private readonly noticeBoardService: NoticeBoardService,
  ) {}

  // ==========================================
  // CREATE
  // SUPER_ADMIN / HEAD_TEACHER / TEACHER
  // ==========================================

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateNoticeBoardDto,
  ) {
    return this.noticeBoardService.create(
      schoolId,
      dto,
    );
  }

  // ==========================================
  // ALL SCHOOL NOTICES
  // Any authenticated school member
  // ==========================================

  @Get()
  async findAll(
    @Param('schoolId') schoolId: string,
  ) {
    return this.noticeBoardService.findAll(
      schoolId,
    );
  }

  // ==========================================
  // NOTICES BY TERM
  // Any authenticated school member
  // ==========================================

  @Get('term/:termId')
  async findByTerm(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
  ) {
    return this.noticeBoardService.findByTerm(
      schoolId,
      termId,
    );
  }

  // ==========================================
  // ONE NOTICE
  // Any authenticated school member
  // ==========================================

  @Get(':noticeId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('noticeId') noticeId: string,
  ) {
    return this.noticeBoardService.findOne(
      schoolId,
      noticeId,
    );
  }

  // ==========================================
  // UPDATE
  // SUPER_ADMIN / HEAD_TEACHER / TEACHER
  // ==========================================

  @Patch(':noticeId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
    UserRole.TEACHER,
  )
  async update(
    @Param('schoolId') schoolId: string,
    @Param('noticeId') noticeId: string,
    @Body() dto: UpdateNoticeBoardDto,
  ) {
    return this.noticeBoardService.update(
      schoolId,
      noticeId,
      dto,
    );
  }

  // ==========================================
  // DELETE
  // SUPER_ADMIN / HEAD_TEACHER
  // ==========================================

  @Delete(':noticeId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.HEAD_TEACHER,
  )
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('noticeId') noticeId: string,
  ) {
    return this.noticeBoardService.remove(
      schoolId,
      noticeId,
    );
  }
}
