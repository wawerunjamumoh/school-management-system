import {IsString,IsNotEmpty,IsOptional} from 'class-validator';
export class CreateSchoolMembershipDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  status: string;
}
