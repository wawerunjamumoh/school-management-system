import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service.js';
import { TeacherController } from './teacher.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Teacher } from './entities/teacher.entity.js'
import { Subject } from '../subject/entities/subject.entity.js';
import {Enrollment} from  '../enrollment/entities/enrollment.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Teacher,
      Subject,
      Enrollment,
    ]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
