import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateClassTeacherAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;
}
