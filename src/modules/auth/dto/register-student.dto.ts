// src/auth/dto/register-student.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import {UserRole} from '../entities/user.entity.js';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class RegisterStudentDto {
  // 1. Identity Table Fields
  @IsEmail(
    {},
    { message: 'Provide a valid unique email for the student login.' },
  )
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Student login password must be at least 8 characters.',
  })
  @IsNotEmpty()
  password: string;

  // 2. Profile Table Fields
  @IsString()
  @IsNotEmpty({ message: 'Student first name is required.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Student last name is required.' })
  lastName: string;

  @IsDateString(
    {},
    { message: 'Date of birth must be a valid ISO date string (YYYY-MM-DD).' },
  )
  @IsNotEmpty()
  dateOfBirth: string;

  @IsEnum(Gender, { message: 'Gender must be either MALE, FEMALE, or OTHER.' })
  @IsNotEmpty()
  gender: Gender;

  // 3. Multi-Tenant Anchor
  @IsUUID('4', {
    message: 'A valid School ID UUID is required to register a student.',
  })
  @IsNotEmpty()
  schoolId: string;


}
