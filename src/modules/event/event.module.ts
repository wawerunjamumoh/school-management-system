import { Module } from '@nestjs/common';
import { EventService } from './event.service.js';
import { EventController } from './event.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from './entities/event.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Event,
      SchoolMembership,
      School,
      AcademicYear,
      Term,
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
