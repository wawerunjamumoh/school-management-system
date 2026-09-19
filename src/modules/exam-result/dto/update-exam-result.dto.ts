import { PartialType } from '@nestjs/mapped-types';
import { CreateExamResultDto } from './create-exam-result.dto.js';

export class UpdateExamResultDto extends PartialType(CreateExamResultDto) {}
