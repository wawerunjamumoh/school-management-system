import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  className: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  capacity: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  level: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  stream: string;
}