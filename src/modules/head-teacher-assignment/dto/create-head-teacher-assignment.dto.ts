import { IsUUID } from 'class-validator';

export class CreateHeadTeacherAssignmentDto {
  @IsUUID()
  teacherId: string;

  @IsUUID()
  academicYearId: string;
}
