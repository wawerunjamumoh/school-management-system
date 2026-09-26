import {IsEmail,IsNotEmpty,IsString,MinLength,IsUUID,IsArray, IsOptional } from 'class-validator';
export class RegisterTeacherDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsUUID('4')
  @IsNotEmpty()
  schoolId: string;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  subjects?: string[]
}
