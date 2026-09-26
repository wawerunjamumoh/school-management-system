import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsOptional()
  @IsDateString()
  enrollDate: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsNotEmpty()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;

  @IsUUID('4')
  @IsNotEmpty()
  studentId: string;

  @IsUUID('4')
  @IsNotEmpty()
  classId: string;

  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;

  @IsUUID('4')
  @IsNotEmpty()
  termId: string;
}