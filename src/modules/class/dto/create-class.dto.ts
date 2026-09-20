import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';
export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  className: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  capacity: number;

  @IsUUID()
  @IsNotEmpty()
  schoolId: string;
}
