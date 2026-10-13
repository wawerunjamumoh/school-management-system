import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Class } from './entities/class.entity.js';
import { School } from '../school/entities/school.entity.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class ClassService {
  private readonly CACHE_TTL = 60;

  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    private readonly redisService: RedisService,
  ) {}

  // Cache keys are scoped to a school.
  private getClassListKey(schoolId: string): string {
    return `school:${schoolId}:classes:all`;
  }

  private getClassKey(
    schoolId: string,
    classId: string,
  ): string {
    return `school:${schoolId}:class:${classId}`;
  }

  // Invalidate only after a successful database mutation.
  private async invalidateClassCache(
    schoolId: string,
    classId?: string,
  ): Promise<void> {
    const keys = [this.getClassListKey(schoolId)];

    if (classId) {
      keys.push(this.getClassKey(schoolId, classId));
    }

    await Promise.all(
      keys.map((key) => this.redisService.delete(key)),
    );
  }

  // ==========================================
  // CREATE CLASS
  // ==========================================

  async create(schoolId: string, dto: CreateClassDto) {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (dto.capacity <= 0) {
      throw new BadRequestException(
        'Class capacity must be greater than zero',
      );
    }

    const existingClass = await this.classRepository.findOne({
      where: {
        schoolId,
        className: dto.className,
        level: dto.level,
        stream: dto.stream,
      },
    });

    if (existingClass) {
      throw new BadRequestException(
        'This class already exists in this school',
      );
    }

    const newClass = this.classRepository.create({
      schoolId,
      className: dto.className,
      capacity: dto.capacity,
      level: dto.level,
      stream: dto.stream,
    });

    const savedClass = await this.classRepository.save(newClass);

    await this.invalidateClassCache(schoolId, savedClass.id);

    return {
      message: 'Class created successfully',
      class: savedClass,
    };
  }

  // ==========================================
  // FIND ALL CLASSES FOR A SCHOOL
  // ==========================================

  async findBySchool(schoolId: string) {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    const cacheKey = this.getClassListKey(schoolId);

    const cachedClasses =
      await this.redisService.getJson<Class[]>(cacheKey);

    if (cachedClasses !== null) {
      return cachedClasses;
    }

    const classes = await this.classRepository.find({
      where: { schoolId },
      order: {
        level: 'ASC',
        className: 'ASC',
        stream: 'ASC',
      },
    });

    await this.redisService.setJson(
      cacheKey,
      classes,
      this.CACHE_TTL,
    );

    return classes;
  }

  // ==========================================
  // FIND ONE CLASS — METADATA
  // ==========================================

  async findOne(schoolId: string, classId: string) {
    const cacheKey = this.getClassKey(schoolId, classId);

    const cachedClass =
      await this.redisService.getJson<Class>(cacheKey);

    if (cachedClass !== null) {
      return cachedClass;
    }

    const schoolClass = await this.classRepository.findOne({
      where: {
        id: classId,
        schoolId,
      },
      relations: {
        school: true,
      },
    });

    if (!schoolClass) {
      throw new NotFoundException(
        'Class not found in this school',
      );
    }

    await this.redisService.setJson(
      cacheKey,
      schoolClass,
      this.CACHE_TTL,
    );

    return schoolClass;
  }

  // ==========================================
  // UPDATE CLASS
  // ==========================================

  async update(
    schoolId: string,
    classId: string,
    dto: UpdateClassDto,
  ) {
    const schoolClass = await this.classRepository.findOne({
      where: {
        id: classId,
        schoolId,
      },
    });

    if (!schoolClass) {
      throw new NotFoundException(
        'Class not found in this school',
      );
    }

    if (
      dto.capacity !== undefined &&
      dto.capacity <= 0
    ) {
      throw new BadRequestException(
        'Class capacity must be greater than zero',
      );
    }

    const identifyingFieldsChanged =
      dto.className !== undefined ||
      dto.level !== undefined ||
      dto.stream !== undefined;

    if (identifyingFieldsChanged) {
      const duplicateClass = await this.classRepository.findOne({
        where: {
          schoolId,
          className: dto.className ?? schoolClass.className,
          level: dto.level ?? schoolClass.level,
          stream: dto.stream ?? schoolClass.stream,
        },
      });

      if (
        duplicateClass &&
        duplicateClass.id !== classId
      ) {
        throw new BadRequestException(
          'Another class with these details already exists in this school',
        );
      }
    }

    Object.assign(schoolClass, dto);

    const updatedClass =
      await this.classRepository.save(schoolClass);

    await this.invalidateClassCache(schoolId, classId);

    return {
      message: 'Class updated successfully',
      class: updatedClass,
    };
  }

  // ==========================================
  // DELETE CLASS
  // ==========================================

  async remove(schoolId: string, classId: string) {
    const schoolClass = await this.classRepository.findOne({
      where: {
        id: classId,
        schoolId,
      },
    });

    if (!schoolClass) {
      throw new NotFoundException(
        'Class not found in this school',
      );
    }

    await this.classRepository.remove(schoolClass);

    await this.invalidateClassCache(schoolId, classId);

    return {
      message: 'Class deleted successfully',
      classId,
    };
  }
}