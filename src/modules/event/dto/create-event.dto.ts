import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsUUID()
  academicYearId: string;

  @IsUUID()
  termId: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
