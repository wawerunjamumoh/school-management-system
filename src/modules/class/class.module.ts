import { Module } from '@nestjs/common';
import { ClassService } from './class.service.js';
import { ClassController } from './class.controller.js';

@Module({
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
