import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTermDto {
  @IsString()
  @IsNotEmpty()
  termName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsUUID()
  academicYearId: string;
}
