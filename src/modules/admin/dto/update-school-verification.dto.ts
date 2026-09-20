import { IsIn } from 'class-validator';

export class UpdateSchoolVerificationDto {
  @IsIn(['VERIFIED', 'SUSPENDED'])
  status: 'VERIFIED' | 'SUSPENDED';
}
