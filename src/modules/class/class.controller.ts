import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { ClassService } from './class.service.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

@Controller('schools/:schoolId/classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
  ) {}

  // ==========================================
  // CREATE CLASS
  // ==========================================

  // POST /schools/:schoolId/classes
  @Post()
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