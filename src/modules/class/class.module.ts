import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassController } from './class.controller.js';
import { ClassService } from './class.service.js';
import { Class } from './entities/class.entity.js';
import {School} from '../school/entities/school.entity.js'


@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Class,School]),
    ],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
