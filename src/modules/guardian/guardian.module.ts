import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GuardianController } from './guardian.controller.js';
import { GuardianService } from './guardian.service.js';

import { Guardian } from './entities/guardian.entity.js';
import { GuardianStudent } from '../guardian-student/entities/guardian-student.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Guardian,
      SchoolMembership,
      GuardianStudent,
      Student,
      Enrollment,
    ]),
  ],
  controllers: [GuardianController],
  providers: [GuardianService],
})
export class GuardianModule {}
