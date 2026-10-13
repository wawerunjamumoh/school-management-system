
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subject } from './entities/subject.entity.js';
import { School } from '../school/entities/school.entity.js';

import { CreateSubjectDto } from './dto/create-subject.dto.js';
import { UpdateSubjectDto } from './dto/update-subject.dto.js';

import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class SubjectService {
  private readonly logger = new Logger(SubjectService.name);

  private readonly SUBJECT_CACHE_TTL_SECONDS = 60;

  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    private readonly redisService: RedisService,
  ) {}

  // CREATE
  async create(schoolId: string, dto: CreateSubjectDto) {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

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

    const subject = this.subjectRepository.create({
      subjectId: dto.subjectId,
      name: dto.name,
      description: dto.description,
      schoolId,
    });

    const savedSubject = await this.subjectRepository.save(subject);

    // Invalidate only after the database write succeeds.
    await this.invalidateSubjectCaches(schoolId, savedSubject.id);

    return savedSubject;
  }

  // FIND ALL SUBJECTS IN A SCHOOL
  async findAll(schoolId: string): Promise<Subject[]> {
    const cacheKey = this.allSubjectsKey(schoolId);

    const cached =
      await this.redisService.getJson<Subject[]>(cacheKey);

    if (cached !== null) {
      return cached.map((subject) => this.hydrateSubject(subject));
    }

    const subjects = await this.subjectRepository.find({
      where: { schoolId },
      order: { name: 'ASC' },
    });

    await this.redisService.setJson(
      cacheKey,
      subjects,
      this.SUBJECT_CACHE_TTL_SECONDS,
    );

    return subjects;
  }

  // FIND ONE SUBJECT
  async findOne(
    schoolId: string,
    subjectId: string,
  ): Promise<Subject> {
    const cacheKey = this.singleSubjectKey(schoolId, subjectId);

    const cached =
      await this.redisService.getJson<Subject>(cacheKey);

    if (cached !== null) {
      return this.hydrateSubject(cached);
    }

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

    await this.redisService.setJson(
      cacheKey,
      subject,
      this.SUBJECT_CACHE_TTL_SECONDS,
    );

    return subject;
  }

  // UPDATE
  async update(
    schoolId: string,
    subjectId: string,
    dto: UpdateSubjectDto,
  ) {
    const subject = await this.findOne(schoolId, subjectId);

    if (dto.subjectId !== undefined) {
      const existingSubject = await this.subjectRepository.findOne({
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

    // Apply only the fields supplied by the update DTO.
    Object.assign(subject, dto);

    const updatedSubject = await this.subjectRepository.save(subject);

    await this.invalidateSubjectCaches(schoolId, subjectId);

    return updatedSubject;
  }

  // DELETE
  async remove(schoolId: string, subjectId: string) {
    const subject = await this.findOne(schoolId, subjectId);

    await this.subjectRepository.remove(subject);

    await this.invalidateSubjectCaches(schoolId, subjectId);

    return {
      message: 'Subject deleted successfully',
    };
  }

  // CACHE KEY BUILDERS
  private allSubjectsKey(schoolId: string): string {
    return `school:${schoolId}:subjects:all`;
  }

  private singleSubjectKey(
    schoolId: string,
    subjectId: string,
  ): string {
    return `school:${schoolId}:subject:${subjectId}`;
  }

  // CACHE INVALIDATION
  private async invalidateSubjectCaches(
    schoolId: string,
    subjectId?: string,
  ): Promise<void> {
    const keys = [this.allSubjectsKey(schoolId)];

    if (subjectId) {
      keys.push(this.singleSubjectKey(schoolId, subjectId));
    }

    const results = await Promise.all(
      keys.map((key) => this.redisService.delete(key)),
    );

    if (results.some((success) => !success)) {
      this.logger.warn(
        `One or more subject cache keys could not be invalidated for school ${schoolId}`,
      );
    }
  }

  // JSON CACHE VALUES ARE PLAIN OBJECTS, NOT ENTITY INSTANCES.
  private hydrateSubject(cached: Subject): Subject {
    return Object.assign(new Subject(), cached);
  }
}
