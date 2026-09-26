import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subject } from './entities/subject.entity.js';
import { School } from '../school/entities/school.entity.js';

import { SubjectController } from './subject.controller.js';
import { SubjectService } from './subject.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, School])],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
