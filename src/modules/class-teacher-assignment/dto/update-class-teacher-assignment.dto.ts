import { PartialType } from '@nestjs/mapped-types';
import { CreateClassTeacherAssignmentDto } from './create-class-teacher-assignment.dto.js';

export class UpdateClassTeacherAssignmentDto extends PartialType(CreateClassTeacherAssignmentDto) {}
