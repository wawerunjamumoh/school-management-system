import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeacherService } from './teacher.service.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { UpdateSubjectDto } from '../subject/dto/update-subject.dto.js';

@Controller('schools/:schoolId/teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // =========================
  // TEACHER PROFILE
  // =========================

  @Get()
  async findAll(
    @Param('schoolId') schoolId: string,
  ) {
    return this.teacherService.findAll(schoolId);
  }

  @Get(':teacherId')
  async findOne(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.findOne(schoolId, teacherId);
  }

  @Patch(':teacherId')
  async update(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(
      schoolId,
      teacherId,
      updateTeacherDto,
    );
  }

  @Delete(':teacherId')
  async remove(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.remove(schoolId, teacherId);
  }

  // =========================
  // TEACHER SUBJECTS
  // =========================

  @Get(':teacherId/subjects')
  async getSubjects(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.getSubjects(schoolId, teacherId);
  }

  @Post(':teacherId/subjects')
  async addSubject(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.teacherService.addSubject(
      schoolId,
      teacherId,
      dto,
    );
  }

  @Delete(':teacherId/subjects/:subjectId')
  async deleteSubject(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.teacherService.deleteSubject(
      schoolId,
      teacherId,
      subjectId,
    );
  }

  // =========================
  // TEACHER STUDENTS
  // =========================

  @Get(':teacherId/classes/:classId/students')
  async getClassStudents(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
    @Param('classId') classId: string,
  ) {
    return this.teacherService.getClassStudents(
      schoolId,
      teacherId,
      classId,
    );
  }

  // =========================
  // VERIFY TEACHER
  // =========================

  @Post(':teacherId/verify')
  async verifyTeacher(
    @Param('schoolId') schoolId: string,
    @Param('teacherId') teacherId: string,
  ) {
    return this.teacherService.verifyTeacher(
      schoolId,
      teacherId,
    );
  }
}
