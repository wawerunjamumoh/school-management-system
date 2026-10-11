import { forwardRef, Module } from '@nestjs/common';
import { SchoolService } from './school.service.js';
import { SchoolController } from './school.controller.js';
import { ClassModule } from '../class/class.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './entities/school.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([School,SchoolMembership]),
    forwardRef(() => ClassModule),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
})
export class SchoolModule {}
