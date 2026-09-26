import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subject } from './entities/subject.entity.js';
import { School } from '../school/entities/school.entity.js';

import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  async create(
    schoolId: string,
    dto: CreateSubjectDto,
  ) {
    // 1. Verify school exists
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    // 2. Prevent duplicate subject codes within school
    const existingSubject = await this.subjectRepository.findOne({
      where: {
        schoolId,
        subjectId: dto.subjectId,
      },
    });

    if (existingSubject) {
      throw new BadRequestException(
        'A subject with this ID already exists in this school',
      );
    }

    // 3. Create subject
    const subject = this.subjectRepository.create({
      subjectId: dto.subjectId,
      name: dto.name,
      description: dto.description,
      schoolId,
    });

    return this.subjectRepository.save(subject);
  }

  async findAll(schoolId: string) {
    return this.subjectRepository.find({
      where: { schoolId },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(
    schoolId: string,
    subjectId: string,
  ) {
    const subject = await this.subjectRepository.findOne({
      where: {
        id: subjectId,
        schoolId,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found in this school',
      );
    }

    return subject;
  }

  async update(
    schoolId: string,
    subjectId: string,
    dto: UpdateSubjectDto,
  ) {
    const subject = await this.findOne(
      schoolId,
      subjectId,
    );

    if (dto.subjectId) {
      const existingSubject =
        await this.subjectRepository.findOne({
          where: {
            schoolId,
            subjectId: dto.subjectId,
          },
        });

      if (
        existingSubject &&
        existingSubject.id !== subject.id
      ) {
        throw new BadRequestException(
          'A subject with this ID already exists in this school',
        );
      }
    }

    Object.assign(subject, dto);

    return this.subjectRepository.save(subject);
  }

  async remove(
    schoolId: string,
    subjectId: string,
  ) {
    const subject = await this.findOne(
      schoolId,
      subjectId,
    );

    await this.subjectRepository.remove(subject);

    return {
      message: 'Subject deleted successfully',
    };
  }
}