import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterSuperAdminDto {
  @IsEmail({}, { message: 'Provide a valid unique email for the super admin.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Super admin password must be at least 8 characters.',
  })
  @IsNotEmpty()
  password: string;
}
