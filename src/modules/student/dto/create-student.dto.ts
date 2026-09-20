import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;
}
