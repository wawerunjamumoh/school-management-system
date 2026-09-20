import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateManagedSchoolDto {
  @IsString() @IsNotEmpty() schoolName: string;
  @IsString() @IsNotEmpty() schoolCode: string;
  @IsString() @IsNotEmpty() location: string;
  @IsString() @IsNotEmpty() schoolPhone: string;
  @IsEmail() schoolEmail: string;
}
