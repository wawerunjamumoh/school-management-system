import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Subject } from './entities/subject.entity.js';
import { School } from '../school/entities/school.entity.js';

import { SubjectController } from './subject.controller.js';
import { SubjectService } from './subject.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Subject,SchoolMembership , School])],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
