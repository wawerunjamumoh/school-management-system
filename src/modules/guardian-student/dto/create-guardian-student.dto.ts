import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateGuardianStudentDto {
  @IsUUID()
  @IsNotEmpty()
  guardianId: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}
