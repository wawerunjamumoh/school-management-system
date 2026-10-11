import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TermController } from './term.controller.js';
import { TermService } from './term.service.js';

import { Term } from './entities/term.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports: [AuthModule,TypeOrmModule.forFeature([Term, SchoolMembership,AcademicYear])],
  controllers: [TermController],
  providers: [TermService],
})
export class TermModule {}
