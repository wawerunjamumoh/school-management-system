import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTeachingAssignmentDto {
  @IsUUID('4')
  @IsNotEmpty()
  teacherId: string;

  @IsUUID('4')
  @IsNotEmpty()
  classId: string;

  @IsUUID('4')
  @IsNotEmpty()
  subjectId: string;

  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;
}
