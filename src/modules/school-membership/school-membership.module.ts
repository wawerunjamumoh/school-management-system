import { Module } from '@nestjs/common';
import { SchoolMembershipService } from './school-membership.service.js';
import { SchoolMembershipController } from './school-membership.controller.js';

@Module({
  controllers: [SchoolMembershipController],
  providers: [SchoolMembershipService],
})
export class SchoolMembershipModule {}
