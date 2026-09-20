import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  subject_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  tremId: string;

  @IsUUID()
  @IsNotEmpty()
  schoolId: string;
}
