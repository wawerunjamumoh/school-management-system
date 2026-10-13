import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { School } from './entities/school.entity.js';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class SchoolService {
  private readonly CACHE_TTL = 60;

  constructor(
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    private readonly redisService: RedisService,
  ) {}

  // ==========================================
  // CACHE KEY
  // ==========================================

  private getProfileCacheKey(schoolId: string): string {
    return `school:${schoolId}:profile`;
  }

  // ==========================================
  // CREATE SCHOOL
  // ==========================================

  async create(dto: CreateSchoolDto) {
    const existingSchool = await this.schoolRepository.findOne({
      where: {
        schoolName: dto.schoolName,
      },
    });

    if (existingSchool) {
      throw new BadRequestException(
        'A school with this name already exists',
      );
    }

    const school = this.schoolRepository.create(dto);
    const savedSchool = await this.schoolRepository.save(school);

    return {
      message: 'School created successfully',
      school: savedSchool,
    };
  }

  // ==========================================
  // FIND ALL SCHOOLS
  // ==========================================

  async findAll() {
    return this.schoolRepository.find();
  }

  // ==========================================
  // FIND ONE SCHOOL — PROFILE METADATA
  // ==========================================

  async findOne(id: string) {
    const cacheKey = this.getProfileCacheKey(id);

    const cachedSchool =
      await this.redisService.getJson<School>(cacheKey);

    if (cachedSchool !== null) {
      return cachedSchool;
    }

    const school = await this.schoolRepository.findOne({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    await this.redisService.setJson(
      cacheKey,
      school,
      this.CACHE_TTL,
    );

    return school;
  }

  // ==========================================
  // UPDATE SCHOOL
  // ==========================================

  async update(id: string, dto: UpdateSchoolDto) {
    // Read from the database rather than the cache before writing.
    const school = await this.schoolRepository.findOne({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    Object.assign(school, dto);

    const updatedSchool = await this.schoolRepository.save(school);

    await this.redisService.delete(this.getProfileCacheKey(id));

    return {
      message: 'School updated successfully',
      school: updatedSchool,
    };
  }

  // ==========================================
  // DELETE SCHOOL
  // ==========================================

  async remove(id: string) {
    const school = await this.schoolRepository.findOne({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    await this.schoolRepository.remove(school);

    await this.redisService.delete(this.getProfileCacheKey(id));

    return {
      message: 'School deleted successfully',
      schoolId: id,
    };
  }

  // ==========================================
  // FIND BY LOCATION
  // ==========================================

  async findByLocation(location: string) {
    return this.schoolRepository
      .createQueryBuilder('school')
      .where('LOWER(school.location) LIKE LOWER(:location)', {
        location: `%${location}%`,
      })
      .getMany();
  }
}