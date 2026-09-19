import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NoticeBoardService } from './notice-board.service.js';
import { CreateNoticeBoardDto } from './dto/create-notice-board.dto.js';
import { UpdateNoticeBoardDto } from './dto/update-notice-board.dto.js';

@Controller('notice-board')
export class NoticeBoardController {
  constructor(private readonly noticeBoardService: NoticeBoardService) {}

  @Post()
  create(@Body() createNoticeBoardDto: CreateNoticeBoardDto) {
    return this.noticeBoardService.create(createNoticeBoardDto);
  }

  @Get()
  findAll() {
    return this.noticeBoardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticeBoardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoticeBoardDto: UpdateNoticeBoardDto) {
    return this.noticeBoardService.update(+id, updateNoticeBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noticeBoardService.remove(+id);
  }
}
