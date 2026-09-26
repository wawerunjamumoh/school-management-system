import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateExamResultDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  examId: string;

  @IsUUID()
  termId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}
