import { Controller, Get, Patch, Param, Delete, Body } from '@nestjs/common';

import { StudentService } from './student.service.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

@Controller('schools/:schoolId/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // ==========================================
  // GET ONE STUDENT
  // ==========================================

  // GET /schools/:schoolId/students/:studentId
  @Get(':studentId')
  async findOneStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentService.findOne(schoolId, studentId);
  }

  // ==========================================
  // UPDATE STUDENT
  // ==========================================

  // PATCH /schools/:schoolId/students/:studentId
  @Patch(':studentId')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(schoolId, studentId, dto);
  }

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  // DELETE /schools/:schoolId/students/:studentId
  @Delete(':studentId')
  async removeStudent(
    @Param('schoolId') schoolId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.studentService.remove(schoolId, studentId);
  }

  // ==========================================
  // GET STUDENTS IN CLASS
  // ==========================================

  // GET /schools/:schoolId/students/class/:classId
  @Get('class/:classId')
  async findAllStudentsInClass(
    @Param('schoolId') schoolId: string,
    @Param('classId') classId: string,
  ) {
    return this.studentService.findByClass(schoolId, classId);
  }

  // ==========================================
  // GET ALL STUDENTS IN SCHOOL
  // ==========================================

  // GET /schools/:schoolId/students
  @Get()
  async findAllStudentsInSchool(@Param('schoolId') schoolId: string) {
    return this.studentService.findBySchool(schoolId);
  }
}
