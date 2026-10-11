import { IsEnum } from 'class-validator';
import { UserRole } from '../../auth/entities/user.entity.js'

export class UpdateMembershipRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}