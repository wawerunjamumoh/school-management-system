import { Module } from '@nestjs/common';
import { TermService } from './term.service.js';
import { TermController } from './term.controller.js';

@Module({
  controllers: [TermController],
  providers: [TermService],
})
export class TermModule {}
