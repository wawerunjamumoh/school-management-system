import { Module } from '@nestjs/common';
import { HeadTeacherAssignmentService } from './head-teacher-assignment.service.js';
import { HeadTeacherAssignmentController } from './head-teacher-assignment.controller.js';

@Module({
  controllers: [HeadTeacherAssignmentController],
  providers: [HeadTeacherAssignmentService],
})
export class HeadTeacherAssignmentModule {}
