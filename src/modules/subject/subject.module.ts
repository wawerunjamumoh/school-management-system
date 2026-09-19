import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service.js';
import { SubjectController } from './subject.controller.js';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService],
})
export class SubjectModule {}
