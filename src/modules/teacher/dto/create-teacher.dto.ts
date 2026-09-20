import { IsArray, IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  teacher_id: string;

  @IsUUID()
  @IsNotEmpty()
  school_id: string;

  @IsArray()
  @IsUUID('4', { each: true })
  subjectIds: string[];
}
