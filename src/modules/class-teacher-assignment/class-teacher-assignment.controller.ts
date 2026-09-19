import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClassTeacherAssignmentService } from './class-teacher-assignment.service.js';
import { CreateClassTeacherAssignmentDto } from './dto/create-class-teacher-assignment.dto.js';
import { UpdateClassTeacherAssignmentDto } from './dto/update-class-teacher-assignment.dto.js';

@Controller('class-teacher-assignment')
export class ClassTeacherAssignmentController {
  constructor(private readonly classTeacherAssignmentService: ClassTeacherAssignmentService) {}

  @Post()
  create(@Body() createClassTeacherAssignmentDto: CreateClassTeacherAssignmentDto) {
    return this.classTeacherAssignmentService.create(createClassTeacherAssignmentDto);
  }

  @Get()
  findAll() {
    return this.classTeacherAssignmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classTeacherAssignmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassTeacherAssignmentDto: UpdateClassTeacherAssignmentDto) {
    return this.classTeacherAssignmentService.update(+id, updateClassTeacherAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classTeacherAssignmentService.remove(+id);
  }
}
