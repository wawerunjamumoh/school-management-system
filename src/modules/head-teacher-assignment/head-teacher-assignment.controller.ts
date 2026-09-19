import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';
import { CreateHeadTeacherAssignmentDto } from './dto/create-head-teacher-assignment.dto.js';
import { UpdateHeadTeacherAssignmentDto } from './dto/update-head-teacher-assignment.dto.js';

@Controller('head-teacher-assignment')
export class HeadTeacherAssignmentController {
  constructor(private readonly headTeacherAssignmentService: HeadTeacherAssignmentService) {}

  @Post()
  create(@Body() createHeadTeacherAssignmentDto: CreateHeadTeacherAssignmentDto) {
    return this.headTeacherAssignmentService.create(createHeadTeacherAssignmentDto);
  }

  @Get()
  findAll() {
    return this.headTeacherAssignmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.headTeacherAssignmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHeadTeacherAssignmentDto: UpdateHeadTeacherAssignmentDto) {
    return this.headTeacherAssignmentService.update(+id, updateHeadTeacherAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.headTeacherAssignmentService.remove(+id);
  }
}
