import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NoticeBoard } from './entities/notice-board.entity.js';
import { School } from '../school/entities/school.entity.js';
import { Term } from '../term/entities/term.entity.js';

import { CreateNoticeBoardDto } from './dto/create-notice-board.dto.js';
import { UpdateNoticeBoardDto } from './dto/update-notice-board.dto.js';

@Injectable()
export class NoticeBoardService {
  constructor(
    @InjectRepository(NoticeBoard)
    private readonly noticeRepository: Repository<NoticeBoard>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
  ) {}

  // ==========================================
  // CREATE
  // ==========================================

  async create(
    schoolId: string,
    dto: CreateNoticeBoardDto,
  ) {
    // Verify school
    const school =
      await this.schoolRepository.findOne({
        where: {
          id: schoolId,
        },
      });

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    // Validate expiration date
    if (dto.expiresAt) {
      const expiresAt = new Date(
        dto.expiresAt,
      );

      if (expiresAt <= new Date()) {
        throw new BadRequestException(
          'Expiration date must be in the future',
        );
      }
    }

    // Verify term if supplied
    if (dto.termId) {
      await this.verifyTerm(dto.termId);
    }

    const notice =
      this.noticeRepository.create({
        title: dto.title,
        content: dto.content,
        expiresAt: dto.expiresAt
          ? new Date(dto.expiresAt)
          : null,
        termId: dto.termId ?? null,
        schoolId,
      });

    return this.noticeRepository.save(notice);
  }

  // ==========================================
  // FIND ALL SCHOOL NOTICES
  // ==========================================

  async findAll(schoolId: string) {
    return this.noticeRepository.find({
      where: {
        schoolId,
      },
      relations: {
        school: true,
        term: true,
      },
      order: {
        publishedAt: 'DESC',
      },
    });
  }

  // ==========================================
  // FIND ONE
  // ==========================================

  async findOne(
    schoolId: string,
    noticeId: string,
  ) {
    const notice =
      await this.noticeRepository.findOne({
        where: {
          id: noticeId,
          schoolId,
        },
        relations: {
          school: true,
          term: true,
        },
      });

    if (!notice) {
      throw new NotFoundException(
        'Notice not found in this school',
      );
    }

    return notice;
  }

  // ==========================================
  // FIND BY TERM
  // ==========================================

  async findByTerm(
    schoolId: string,
    termId: string,
  ) {
    await this.verifyTerm(termId);

    return this.noticeRepository.find({
      where: {
        schoolId,
        termId,
      },
      relations: {
        term: true,
      },
      order: {
        publishedAt: 'DESC',
      },
    });
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    schoolId: string,
    noticeId: string,
    dto: UpdateNoticeBoardDto,
  ) {
    const notice = await this.findOne(
      schoolId,
      noticeId,
    );

    // Validate expiration date
    if (dto.expiresAt) {
      const expiresAt = new Date(
        dto.expiresAt,
      );

      if (expiresAt <= new Date()) {
        throw new BadRequestException(
          'Expiration date must be in the future',
        );
      }
    }

    // Validate term
    if (
      dto.termId &&
      dto.termId !== notice.termId
    ) {
      await this.verifyTerm(dto.termId);
    }

    Object.assign(notice, {
      ...dto,
      expiresAt: dto.expiresAt
        ? new Date(dto.expiresAt)
        : notice.expiresAt,
    });

    return this.noticeRepository.save(notice);
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(
    schoolId: string,
    noticeId: string,
  ) {
    const notice = await this.findOne(
      schoolId,
      noticeId,
    );

    await this.noticeRepository.remove(notice);

    return {
      message:
        'Notice deleted successfully',
    };
  }

  // ==========================================
  // PRIVATE HELPER
  // ==========================================

  private async verifyTerm(
    termId: string,
  ) {
    const term =
      await this.termRepository.findOne({
        where: {
          id: termId,
        },
      });

    if (!term) {
      throw new NotFoundException(
        'Term not found',
      );
    }

    return term;
  }
}