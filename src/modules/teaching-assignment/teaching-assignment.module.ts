import { Module } from '@nestjs/common';
import { TeachingAssignmentService } from './teaching-assignment.service.js';
import { TeachingAssignmentController } from './teaching-assignment.controller.js';

@Module({
  controllers: [TeachingAssignmentController],
  providers: [TeachingAssignmentService],
})
export class TeachingAssignmentModule {}
