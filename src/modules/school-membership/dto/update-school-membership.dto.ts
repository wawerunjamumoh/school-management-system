import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolMembershipDto } from './create-school-membership.dto.js';

export class UpdateSchoolMembershipDto extends PartialType(CreateSchoolMembershipDto) {}
