import { Module } from '@nestjs/common';
import { ExamResultService } from './exam-result.service.js';
import { ExamResultController } from './exam-result.controller.js';

@Module({
  controllers: [ExamResultController],
  providers: [ExamResultService],
})
export class ExamResultModule {}
