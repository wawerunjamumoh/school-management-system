
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AcademicYear } from './entities/academic-year.entity.js';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';
import { School } from '../school/entities/school.entity.js';
import { RedisService } from '../../redis/redis.service.js';

interface CachedAcademicYear {
  id: string;
  name: string;
  schoolId: string;
  startDate: string;
  endDate: string;
}

@Injectable()
export class AcademicYearService {
  private readonly logger = new Logger(AcademicYearService.name);

  private readonly CURRENT_YEAR_TTL_SECONDS = 60;

  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    private readonly redisService: RedisService,
  ) {}

  async create(schoolId: string, dto: CreateAcademicYearDto) {
    await this.verifySchool(schoolId);
    this.validateDates(dto.startDate, dto.endDate);

    const existing = await this.academicYearRepository.findOne({
      where: { schoolId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        'An academic year with this name already exists in this school',
      );
    }

    const academicYear = this.academicYearRepository.create({
      name: dto.name,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      schoolId,
    });

    const saved = await this.academicYearRepository.save(academicYear);

    // Invalidate only after the database write succeeds.
    await this.invalidateCurrentYear(schoolId);

    return saved;
  }

  async findAll(schoolId: string) {
    await this.verifySchool(schoolId);

    return this.academicYearRepository.find({
      where: { schoolId },
      relations: { school: true },
      order: { startDate: 'DESC' },
    });
  }

  async findOne(schoolId: string, academicYearId: string) {
    const academicYear = await this.academicYearRepository.findOne({
      where: {
        id: academicYearId,
        schoolId,
      },
      relations: { school: true },
    });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found in this school',
      );
    }

    return academicYear;
  }

  async findCurrent(schoolId: string): Promise<AcademicYear> {
    await this.verifySchool(schoolId);

    const cacheKey = this.currentYearKey(schoolId);

    // 1. Try Redis first.
    const cached =
      await this.redisService.getJson<CachedAcademicYear>(cacheKey);

    if (cached) {
      // JSON parsing does not restore JavaScript Date objects.
      // Rehydrate dates so cache hits match database hits.
      return Object.assign(new AcademicYear(), cached, {
        startDate: new Date(cached.startDate),
        endDate: new Date(cached.endDate),
      });
    }

    // 2. Cache miss: PostgreSQL is the source of truth.
    const today = new Date();

    const academicYear = await this.academicYearRepository
      .createQueryBuilder('academicYear')
      .where('academicYear.schoolId = :schoolId', { schoolId })
      .andWhere('academicYear.startDate <= :today', { today })
      .andWhere('academicYear.endDate >= :today', { today })
      .getOne();

    if (!academicYear) {
      // We do not cache this absence in the initial implementation.
      throw new NotFoundException(
        'No current academic year found for this school',
      );
    }

    // 3. Populate Redis. A failed write must not fail the request.
    const cacheValue: CachedAcademicYear = {
      id: academicYear.id,
      name: academicYear.name,
      schoolId: academicYear.schoolId,
      startDate: academicYear.startDate.toISOString(),
      endDate: academicYear.endDate.toISOString(),
    };

    await this.redisService.setJson(
      cacheKey,
      cacheValue,
      this.CURRENT_YEAR_TTL_SECONDS,
    );

    return academicYear;
  }

  async update(
    schoolId: string,
    academicYearId: string,
    dto: UpdateAcademicYearDto,
  ) {
    const academicYear = await this.findOne(
      schoolId,
      academicYearId,
    );

    const name = dto.name ?? academicYear.name;

    const startDate =
      dto.startDate ?? academicYear.startDate.toISOString();

    const endDate =
      dto.endDate ?? academicYear.endDate.toISOString();

    this.validateDates(startDate, endDate);

    if (name !== academicYear.name) {
      const existing = await this.academicYearRepository.findOne({
        where: { schoolId, name },
      });

      if (existing && existing.id !== academicYear.id) {
        throw new ConflictException(
          'An academic year with this name already exists in this school',
        );
      }
    }

    academicYear.name = name;
    academicYear.startDate = new Date(startDate);
    academicYear.endDate = new Date(endDate);

    const saved = await this.academicYearRepository.save(academicYear);

    await this.invalidateCurrentYear(schoolId);

    return saved;
  }

  async remove(schoolId: string, academicYearId: string) {
    const academicYear = await this.findOne(
      schoolId,
      academicYearId,
    );

    await this.academicYearRepository.remove(academicYear);

    await this.invalidateCurrentYear(schoolId);

    return { message: 'Academic year deleted successfully' };
  }

  private currentYearKey(schoolId: string): string {
    return `school:${schoolId}:academic-year:current`;
  }

  private async invalidateCurrentYear(
    schoolId: string,
  ): Promise<void> {
    const deleted = await this.redisService.delete(
      this.currentYearKey(schoolId),
    );

    if (!deleted) {
      this.logger.warn(
        `Could not invalidate current academic year cache for school ${schoolId}`,
      );
    }
  }

  private async verifySchool(schoolId: string): Promise<School> {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return school;
  }

  private validateDates(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      throw new BadRequestException('Invalid academic year dates');
    }

    if (end <= start) {
      throw new BadRequestException(
        'Academic year end date must be after start date',
      );
    }
  }
}
