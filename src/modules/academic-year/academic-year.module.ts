import { Module } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service.js';
import { AcademicYearController } from './academic-year.controller.js';
import {TypeOrmModule} from '@nestjs/typeorm';
import { AcademicYear } from './entities/academic-year.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature([AcademicYear,SchoolMembership,School]),
  ],
  controllers: [AcademicYearController],
  providers: [AcademicYearService],
})
export class AcademicYearModule {}
