import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;
}
