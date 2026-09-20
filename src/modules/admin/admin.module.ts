import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { School } from '../school/entities/school.entity.js';
import { AdminController } from './admin.controller.js';

@Module({ imports: [AuthModule, TypeOrmModule.forFeature([School])], controllers: [AdminController] })
export class AdminModule {}
