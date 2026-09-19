import { PartialType } from '@nestjs/mapped-types';
import { CreateGuardianStudentDto } from './create-guardian-student.dto.js';

export class UpdateGuardianStudentDto extends PartialType(CreateGuardianStudentDto) {}
