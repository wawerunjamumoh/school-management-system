import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsOptional()
  @IsDateString()
  enrollDate?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @IsUUID()
  @IsNotEmpty()
  termId: string;
}
