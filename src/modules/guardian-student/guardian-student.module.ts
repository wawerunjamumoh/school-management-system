import { Module } from '@nestjs/common';
import { GuardianStudentService } from './guardian-student.service.js';
import { GuardianStudentController } from './guardian-student.controller.js';

@Module({
  controllers: [GuardianStudentController],
  providers: [GuardianStudentService],
})
export class GuardianStudentModule {}
