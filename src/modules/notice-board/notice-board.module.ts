import { Module } from '@nestjs/common';
import { NoticeBoardService } from './notice-board.service.js';
import { NoticeBoardController } from './notice-board.controller.js';

@Module({
  controllers: [NoticeBoardController],
  providers: [NoticeBoardService],
})
export class NoticeBoardModule {}
