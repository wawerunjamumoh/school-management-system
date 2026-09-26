import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

import { User } from './entities/user.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Teacher } from '../teacher/entities/teacher.entity.js';
import { Guardian } from '../guardian/entities/guardian.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Teacher,
      Guardian,
    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '90h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}