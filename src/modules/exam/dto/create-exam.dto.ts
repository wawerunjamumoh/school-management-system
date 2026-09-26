import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  examName: string;

  @IsOptional()
  @IsString()
  examId?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @IsString()
  @IsNotEmpty()
  academicYearId: string;

  @IsString()
  @IsNotEmpty()
  termId: string;
}
