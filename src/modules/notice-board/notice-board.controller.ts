import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { NoticeBoardService } from './notice-board.service.js';
import { CreateNoticeBoardDto } from './dto/create-notice-board.dto.js';
import { UpdateNoticeBoardDto } from './dto/update-notice-board.dto.js';

@Controller('schools/:schoolId/notice-boards')
export class NoticeBoardController {
  constructor(private readonly noticeBoardService: NoticeBoardService) {}

  // ==========================================
  // CREATE
  // ==========================================

  @Post()
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateNoticeBoardDto,
  ) {
    return this.noticeBoardService.create(schoolId, dto);
  }

  // ==========================================
  // ALL SCHOOL NOTICES
  // ==========================================

  @Get()
  async findAll(@Param('schoolId') schoolId: string) {
    return this.noticeBoardService.findAll(schoolId);
  }

  // ==========================================
  // NOTICES BY TERM
  // ==========================================

  @Get('term/:termId')
  async findByTerm(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
  ) {
    return this.noticeBoardService.findByTerm(schoolId, termId);
  }

  // ==========================================
  // ONE NOTICE
  // ==========================================

  @Get(':noticeId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('noticeId') noticeId: string,
  ) {
    return this.noticeBoardService.findOne(schoolId, noticeId);
  }

  // ==========================================
  // UPDATE
  // ==========================================

  @Patch(':noticeId')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('noticeId') noticeId: string,
    @Body() dto: UpdateNoticeBoardDto,
  ) {
    return this.noticeBoardService.update(schoolId, noticeId, dto);
  }

  // ==========================================
  // DELETE
  // ==========================================

  @Delete(':noticeId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('noticeId') noticeId: string,
  ) {
    return this.noticeBoardService.remove(schoolId, noticeId);
  }
}
