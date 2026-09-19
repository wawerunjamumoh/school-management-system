import { Module } from '@nestjs/common';
import { ExamService } from './exam.service.js';
import { ExamController } from './exam.controller.js';

@Module({
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
