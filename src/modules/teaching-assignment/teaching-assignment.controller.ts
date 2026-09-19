import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeachingAssignmentService } from './teaching-assignment.service.js';
import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto.js';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto.js';

@Controller('teaching-assignment')
export class TeachingAssignmentController {
  constructor(private readonly teachingAssignmentService: TeachingAssignmentService) {}

  @Post()
  create(@Body() createTeachingAssignmentDto: CreateTeachingAssignmentDto) {
    return this.teachingAssignmentService.create(createTeachingAssignmentDto);
  }

  @Get()
  findAll() {
    return this.teachingAssignmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachingAssignmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeachingAssignmentDto: UpdateTeachingAssignmentDto) {
    return this.teachingAssignmentService.update(+id, updateTeachingAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachingAssignmentService.remove(+id);
  }
}
