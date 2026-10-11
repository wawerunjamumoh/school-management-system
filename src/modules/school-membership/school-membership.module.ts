import { Module } from '@nestjs/common';
import { SchoolMembershipService } from './school-membership.service.js';
import { SchoolMembershipController } from './school-membership.controller.js';
import { SchoolMembership } from './entities/school-membership.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import {RolesGuard} from '../auth/guards/roles.guard.js'


@Module({
  imports:[
    AuthModule,
    TypeOrmModule.forFeature([
      SchoolMembership,
    ]),
    // AuthModule,
  ],
  controllers: [SchoolMembershipController],
  providers: [SchoolMembershipService,RolesGuard],
  exports: [RolesGuard,TypeOrmModule,]
})
export class SchoolMembershipModule {}
