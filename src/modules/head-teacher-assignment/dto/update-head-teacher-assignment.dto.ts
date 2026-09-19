import { PartialType } from '@nestjs/mapped-types';
import { CreateHeadTeacherAssignmentDto } from './create-head-teacher-assignment.dto.js';

export class UpdateHeadTeacherAssignmentDto extends PartialType(CreateHeadTeacherAssignmentDto) {}
