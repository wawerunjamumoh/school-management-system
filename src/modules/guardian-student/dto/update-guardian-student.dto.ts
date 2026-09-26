import { IsOptional, IsUUID } from 'class-validator';

export class UpdateGuardianStudentDto {
  @IsOptional()
  @IsUUID()
  guardianId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;
}
