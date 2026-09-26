import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TermController } from './term.controller.js';
import { TermService } from './term.service.js';

import { Term } from './entities/term.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Term, AcademicYear])],
  controllers: [TermController],
  providers: [TermService],
})
export class TermModule {}
