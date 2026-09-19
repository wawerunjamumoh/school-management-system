import { Module } from '@nestjs/common';
import { ClassTeacherAssignmentService } from './class-teacher-assignment.service.js';
import { ClassTeacherAssignmentController } from './class-teacher-assignment.controller.js';

@Module({
  controllers: [ClassTeacherAssignmentController],
  providers: [ClassTeacherAssignmentService],
})
export class ClassTeacherAssignmentModule {}
