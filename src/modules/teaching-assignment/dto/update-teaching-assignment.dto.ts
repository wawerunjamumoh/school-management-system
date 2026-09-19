import { PartialType } from '@nestjs/mapped-types';
import { CreateTeachingAssignmentDto } from './create-teaching-assignment.dto.js';

export class UpdateTeachingAssignmentDto extends PartialType(CreateTeachingAssignmentDto) {}
