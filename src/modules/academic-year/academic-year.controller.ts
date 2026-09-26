import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AcademicYearService } from './academic-year.service.js';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';

@Controller('schools/:schoolId/academic-years')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  // Create academic year
  @Post()
  async create(
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateAcademicYearDto,
  ) {
    return this.academicYearService.create(schoolId, dto);
  }

  // Get all academic years for a school
  @Get()
  async findAll(@Param('schoolId') schoolId: string) {
    return this.academicYearService.findAll(schoolId);
  }

  // Get currently active/current academic year
  @Get('current')
  async findCurrent(@Param('schoolId') schoolId: string) {
    return this.academicYearService.findCurrent(schoolId);
  }

  // // Get one academic year
  // @Get(':academicYearId')
  // async findOne(
  //   @Param('schoolId') schoolId: string,
  //   @Param('academicYearId') academicYearId: string,
  // ) {
  //   return this.academicYearService.findOne(schoolId, academicYearId);
  // }

  // Update academic year
  @Patch(':academicYearId')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYearService.update(schoolId, academicYearId, dto);
  }

  // Delete academic year
  @Delete(':academicYearId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.academicYearService.remove(schoolId, academicYearId);
  }
}
