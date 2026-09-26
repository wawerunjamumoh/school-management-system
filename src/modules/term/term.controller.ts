import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { TermService } from './term.service.js';
import { CreateTermDto } from './dto/create-term.dto.js';
import { UpdateTermDto } from './dto/update-term.dto.js';

@Controller('schools/:schoolId/terms')
export class TermController {
  constructor(private readonly termService: TermService) {}

  @Post()
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateTermDto,
  ) {
    return this.termService.create(schoolId, dto);
  }

  @Get()
  async findAll(@Param('schoolId') schoolId: string) {
    return this.termService.findAll(schoolId);
  }

  @Get('academic-year/:academicYearId')
  async findByAcademicYear(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.termService.findByAcademicYear(schoolId, academicYearId);
  }

  @Get(':termId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
  ) {
    return this.termService.findOne(schoolId, termId);
  }

  @Patch(':termId')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
    @Body() dto: UpdateTermDto,
  ) {
    return this.termService.update(schoolId, termId, dto);
  }

  @Delete(':termId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('termId') termId: string,
  ) {
    return this.termService.remove(schoolId, termId);
  }
}
