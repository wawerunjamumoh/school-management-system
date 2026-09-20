import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from '../school/entities/school.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { SchoolMembership } from './entities/school-membership.entity.js';
import { UserAccount } from './entities/user-account.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserAccount, SchoolMembership, School])],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
