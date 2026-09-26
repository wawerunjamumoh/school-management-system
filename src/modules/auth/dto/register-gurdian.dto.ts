import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class RegisterGuardianDto {
  // 1. Identity Table Fields
  @IsEmail(
    {},
    { message: 'Provide a valid unique email for the guardian login.' },
  )
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Guardian login password must be at least 8 characters.',
  })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Guardian last name is required.' })
  lastName: string;
  // 2. Profile Table Fields
  @IsString()
  @IsNotEmpty({ message: 'Guardian first name is required.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Emergency contact phone number is required.' })
  phone: string;

  @IsString()
  @IsOptional() // An address is useful but optional during instant signup
  address?: string;

  // 3. Multi-Tenant Anchor
  @IsUUID('4', {
    message: 'A valid School ID UUID is required to register a guardian.',
  })
  @IsNotEmpty()
  schoolId: string;
}
