import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuardianStudentService } from './guardian-student.service.js';
import { CreateGuardianStudentDto } from './dto/create-guardian-student.dto.js';
import { UpdateGuardianStudentDto } from './dto/update-guardian-student.dto.js';

@Controller('guardian-student')
export class GuardianStudentController {
  constructor(private readonly guardianStudentService: GuardianStudentService) {}

  @Post()
  create(@Body() createGuardianStudentDto: CreateGuardianStudentDto) {
    return this.guardianStudentService.create(createGuardianStudentDto);
  }

  @Get()
  findAll() {
    return this.guardianStudentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guardianStudentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuardianStudentDto: UpdateGuardianStudentDto) {
    return this.guardianStudentService.update(+id, updateGuardianStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guardianStudentService.remove(+id);
  }
}
