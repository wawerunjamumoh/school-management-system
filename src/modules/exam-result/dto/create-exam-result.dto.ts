import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateExamResultDto {
  @IsString()
  @IsNotEmpty()
  score: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsUUID()
  @IsNotEmpty()
  examId: string;

  @IsUUID()
  @IsNotEmpty()
  termId: string;
}
