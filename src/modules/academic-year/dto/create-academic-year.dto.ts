import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAcademicYearDto {
  @IsUUID()
  @IsNotEmpty()
  schoolId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
