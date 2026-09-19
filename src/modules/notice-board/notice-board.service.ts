import { Injectable } from '@nestjs/common';
import { CreateNoticeBoardDto } from './dto/create-notice-board.dto.js';
import { UpdateNoticeBoardDto } from './dto/update-notice-board.dto.js';

@Injectable()
export class NoticeBoardService {
  create(createNoticeBoardDto: CreateNoticeBoardDto) {
    return 'This action adds a new noticeBoard';
  }

  findAll() {
    return `This action returns all noticeBoard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} noticeBoard`;
  }

  update(id: number, updateNoticeBoardDto: UpdateNoticeBoardDto) {
    return `This action updates a #${id} noticeBoard`;
  }

  remove(id: number) {
    return `This action removes a #${id} noticeBoard`;
  }
}
