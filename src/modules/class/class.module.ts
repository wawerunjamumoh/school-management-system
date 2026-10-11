import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassController } from './class.controller.js';
import { ClassService } from './class.service.js';
import { Class } from './entities/class.entity.js';
import {School} from '../school/entities/school.entity.js'
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(
      [Class,SchoolMembership,School]),
    ],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
