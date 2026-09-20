import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTermDto {
  @IsString()
  @IsNotEmpty()
  termName: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;
}
