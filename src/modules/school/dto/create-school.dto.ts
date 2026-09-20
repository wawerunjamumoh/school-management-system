import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  schoolPhone: string;

  @IsEmail()
  @IsNotEmpty()
  schoolEmail: string;
}
