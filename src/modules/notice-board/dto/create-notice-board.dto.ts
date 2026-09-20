import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNoticeBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  publishedAt: string;

  @IsDateString()
  @IsNotEmpty()
  expiresAt: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsUUID()
  @IsNotEmpty()
  schoolId: string;
}
