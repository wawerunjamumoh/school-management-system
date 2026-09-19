import { PartialType } from '@nestjs/mapped-types';
import { CreateNoticeBoardDto } from './create-notice-board.dto.js';

export class UpdateNoticeBoardDto extends PartialType(CreateNoticeBoardDto) {}
