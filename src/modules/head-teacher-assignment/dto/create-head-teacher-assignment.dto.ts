import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateHeadTeacherAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;
}
