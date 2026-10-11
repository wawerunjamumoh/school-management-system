import { Module } from '@nestjs/common';
import { StudentService } from './student.service.js';
import { StudentController } from './student.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';


@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature([
      SchoolMembership,
    ])
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
