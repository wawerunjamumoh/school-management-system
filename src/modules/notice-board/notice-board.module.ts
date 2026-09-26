import { Module } from '@nestjs/common';
import { NoticeBoardService } from './notice-board.service.js';
import { NoticeBoardController } from './notice-board.controller.js';

import {TypeOrmModule} from '@nestjs/typeorm'

import { NoticeBoard } from './entities/notice-board.entity.js';
import { School } from '../school/entities/school.entity.js';
import { Term } from '../term/entities/term.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoticeBoard,
      School,
      Term,
    ])
  ],
  controllers: [NoticeBoardController],
  providers: [NoticeBoardService],
})
export class NoticeBoardModule {}
