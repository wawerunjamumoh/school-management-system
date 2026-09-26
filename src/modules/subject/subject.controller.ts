import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { SubjectService } from './subject.service.js';
import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';

@Controller('schools/:schoolId/subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  create(@Param('schoolId') schoolId: string, @Body() dto: CreateSubjectDto) {
    return this.subjectService.create(schoolId, dto);
  }

  @Get()
  findAll(@Param('schoolId') schoolId: string) {
    return this.subjectService.findAll(schoolId);
  }

  @Get(':subjectId')
  findOne(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.subjectService.findOne(schoolId, subjectId);
  }

  @Patch(':subjectId')
  update(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(schoolId, subjectId, dto);
  }

  @Delete(':subjectId')
  remove(
    @Param('schoolId') schoolId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.subjectService.remove(schoolId, subjectId);
  }
}
