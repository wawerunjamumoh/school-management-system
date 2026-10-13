
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Term } from './entities/term.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { CreateTermDto } from './dto/create-term.dto.js';
import { UpdateTermDto } from './dto/update-term.dto.js';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class TermService {
  private readonly logger = new Logger(TermService.name);

  private readonly TERM_CACHE_TTL_SECONDS = 60;

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  // CREATE
  async create(schoolId: string, dto: CreateTermDto) {
    const termRepository = this.dataSource.getRepository(Term);
    const academicYearRepository =
      this.dataSource.getRepository(AcademicYear);

    const termName = dto.termName.trim();

    this.validateDateRange(dto.startDate, dto.endDate);

    const academicYear = await academicYearRepository.findOne({
      where: {
        id: dto.academicYearId,
        schoolId,
      },
    });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found in this school',
      );
    }

    this.validateWithinAcademicYear(
      dto.startDate,
      dto.endDate,
      academicYear.startDate,
      academicYear.endDate,
    );

    const existingTerm = await termRepository.findOne({
      where: {
        academicYearId: dto.academicYearId,
        termName,
      },
    });

    if (existingTerm) {
      throw new BadRequestException(
        'A term with this name already exists for this academic year',
      );
    }

    const overlappingTerm = await this.findOverlappingTerm(
      schoolId,
      dto.academicYearId,
      dto.startDate,
      dto.endDate,
    );

    if (overlappingTerm) {
      throw new BadRequestException(
        `Term dates overlap with ${overlappingTerm.termName}`,
      );
    }

    const term = termRepository.create({
      termName,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      academicYearId: dto.academicYearId,
    });

    const savedTerm = await termRepository.save(term);

    // Invalidate only after PostgreSQL has saved successfully.
    await this.invalidateTermCaches(
      schoolId,
      [dto.academicYearId],
      savedTerm.id,
    );

    return {
      message: 'Term created successfully',
      term: savedTerm,
    };
  }

  // FIND ALL TERMS IN A SCHOOL
  async findAll(schoolId: string): Promise<Term[]> {
    const cacheKey = this.allTermsKey(schoolId);

    const cached = await this.redisService.getJson<Term[]>(cacheKey);

    if (cached !== null) {
      return cached.map((term) => this.hydrateTerm(term));
    }

    const terms = await this.dataSource
      .getRepository(Term)
      .createQueryBuilder('term')
      .innerJoinAndSelect('term.academicYear', 'academicYear')
      .where('academicYear.schoolId = :schoolId', { schoolId })
      .orderBy('academicYear.startDate', 'DESC')
      .addOrderBy('term.startDate', 'ASC')
      .getMany();

    await this.redisService.setJson(
      cacheKey,
      terms,
      this.TERM_CACHE_TTL_SECONDS,
    );

    return terms;
  }

  // FIND TERMS IN ONE ACADEMIC YEAR
  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ): Promise<Term[]> {
    const academicYear = await this.dataSource
      .getRepository(AcademicYear)
      .findOne({
        where: {
          id: academicYearId,
          schoolId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found in this school',
      );
    }

    const cacheKey = this.academicYearTermsKey(
      schoolId,
      academicYearId,
    );

    const cached = await this.redisService.getJson<Term[]>(cacheKey);

    if (cached !== null) {
      return cached.map((term) => this.hydrateTerm(term));
    }

    const terms = await this.dataSource
      .getRepository(Term)
      .find({
        where: { academicYearId },
        order: { startDate: 'ASC' },
      });

    await this.redisService.setJson(
      cacheKey,
      terms,
      this.TERM_CACHE_TTL_SECONDS,
    );

    return terms;
  }

  // FIND ONE TERM
  async findOne(schoolId: string, termId: string): Promise<Term> {
    const cacheKey = this.singleTermKey(schoolId, termId);

    const cached = await this.redisService.getJson<Term>(cacheKey);

    if (cached !== null) {
      return this.hydrateTerm(cached);
    }

    const term = await this.dataSource
      .getRepository(Term)
      .createQueryBuilder('term')
      .innerJoinAndSelect('term.academicYear', 'academicYear')
      .where('term.id = :termId', { termId })
      .andWhere('academicYear.schoolId = :schoolId', { schoolId })
      .getOne();

    if (!term) {
      throw new NotFoundException('Term not found');
    }

    await this.redisService.setJson(
      cacheKey,
      term,
      this.TERM_CACHE_TTL_SECONDS,
    );

    return term;
  }

  // UPDATE
  async update(
    schoolId: string,
    termId: string,
    dto: UpdateTermDto,
  ) {
    const termRepository = this.dataSource.getRepository(Term);
    const academicYearRepository =
      this.dataSource.getRepository(AcademicYear);

    // findOne enforces school scope and can use the cache.
    const term = await this.findOne(schoolId, termId);

    const oldAcademicYearId = term.academicYearId;
    const academicYearId =
      dto.academicYearId ?? oldAcademicYearId;

    const academicYear = await academicYearRepository.findOne({
      where: {
        id: academicYearId,
        schoolId,
      },
    });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found in this school',
      );
    }

    const startDate =
      dto.startDate ?? this.formatDate(term.startDate);

    const endDate =
      dto.endDate ?? this.formatDate(term.endDate);

    const termName =
      dto.termName === undefined
        ? term.termName
        : dto.termName.trim();

    if (!termName) {
      throw new BadRequestException('Term name cannot be empty');
    }

    this.validateDateRange(startDate, endDate);

    this.validateWithinAcademicYear(
      startDate,
      endDate,
      academicYear.startDate,
      academicYear.endDate,
    );

    const duplicate = await termRepository
      .createQueryBuilder('term')
      .where('term.academicYearId = :academicYearId', {
        academicYearId,
      })
      .andWhere('LOWER(term.termName) = LOWER(:termName)', {
        termName,
      })
      .andWhere('term.id != :termId', { termId })
      .getOne();

    if (duplicate) {
      throw new BadRequestException(
        'A term with this name already exists for this academic year',
      );
    }

    const overlappingTerm = await this.findOverlappingTerm(
      schoolId,
      academicYearId,
      startDate,
      endDate,
      termId,
    );

    if (overlappingTerm) {
      throw new BadRequestException(
        `Term dates overlap with ${overlappingTerm.termName}`,
      );
    }

    term.termName = termName;
    term.startDate = new Date(startDate);
    term.endDate = new Date(endDate);
    term.academicYearId = academicYearId;

    const updatedTerm = await termRepository.save(term);

    // If the term moved years, invalidate both years' lists.
    await this.invalidateTermCaches(
      schoolId,
      [oldAcademicYearId, academicYearId],
      termId,
    );

    return {
      message: 'Term updated successfully',
      term: updatedTerm,
    };
  }

  // DELETE
  async remove(schoolId: string, termId: string) {
    const termRepository = this.dataSource.getRepository(Term);

    const term = await this.findOne(schoolId, termId);
    const academicYearId = term.academicYearId;

    await termRepository.remove(term);

    await this.invalidateTermCaches(
      schoolId,
      [academicYearId],
      termId,
    );

    return {
      message: 'Term deleted successfully',
    };
  }

  // CACHE KEY BUILDERS
  private allTermsKey(schoolId: string): string {
    return `school:${schoolId}:terms:all`;
  }

  private academicYearTermsKey(
    schoolId: string,
    academicYearId: string,
  ): string {
    return `school:${schoolId}:academic-year:${academicYearId}:terms`;
  }

  private singleTermKey(
    schoolId: string,
    termId: string,
  ): string {
    return `school:${schoolId}:term:${termId}`;
  }

  // CACHE INVALIDATION
  private async invalidateTermCaches(
    schoolId: string,
    academicYearIds: string[],
    termId?: string,
  ): Promise<void> {
    const keys = new Set<string>([
      this.allTermsKey(schoolId),
      ...academicYearIds.map((id) =>
        this.academicYearTermsKey(schoolId, id),
      ),
    ]);

    if (termId) {
      keys.add(this.singleTermKey(schoolId, termId));
    }

    const results = await Promise.all(
      [...keys].map((key) => this.redisService.delete(key)),
    );

    if (results.some((success) => !success)) {
      this.logger.warn(
        `One or more term cache keys could not be invalidated for school ${schoolId}`,
      );
    }
  }

  // JSON DOES NOT PRESERVE DATE OBJECTS.
  // Rehydrate known date fields on cache hits.
  private hydrateTerm(term: Term): Term {
    const cached = term as Term & {
      startDate: Date | string;
      endDate: Date | string;
      academicYear?: AcademicYear & {
        startDate: Date | string;
        endDate: Date | string;
      };
    };

    const academicYear = cached.academicYear
      ? Object.assign(new AcademicYear(), cached.academicYear, {
          startDate: new Date(String(cached.academicYear.startDate)),
          endDate: new Date(String(cached.academicYear.endDate)),
        })
      : undefined;

    return Object.assign(new Term(), cached, {
      startDate: new Date(String(cached.startDate)),
      endDate: new Date(String(cached.endDate)),
      ...(academicYear ? { academicYear } : {}),
    });
  }

  // VALIDATION
  private validateDateRange(
    startDate: string,
    endDate: string,
  ): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      throw new BadRequestException('Invalid term dates');
    }

    if (start >= end) {
      throw new BadRequestException(
        'Term start date must be before end date',
      );
    }
  }

  private validateWithinAcademicYear(
    termStart: string,
    termEnd: string,
    yearStart: Date,
    yearEnd: Date,
  ): void {
    const start = new Date(termStart);
    const end = new Date(termEnd);
    const academicStart = new Date(String(yearStart));
    const academicEnd = new Date(String(yearEnd));

    if (start < academicStart || end > academicEnd) {
      throw new BadRequestException(
        'Term dates must fall within the academic year',
      );
    }
  }

  private async findOverlappingTerm(
    schoolId: string,
    academicYearId: string,
    startDate: string,
    endDate: string,
    excludeTermId?: string,
  ): Promise<Term | null> {
    const query = this.dataSource
      .getRepository(Term)
      .createQueryBuilder('term')
      .innerJoin('term.academicYear', 'academicYear')
      .where('term.academicYearId = :academicYearId', {
        academicYearId,
      })
      .andWhere('academicYear.schoolId = :schoolId', {
        schoolId,
      })
      .andWhere('term.startDate < :endDate', { endDate })
      .andWhere('term.endDate > :startDate', { startDate });

    if (excludeTermId) {
      query.andWhere('term.id != :excludeTermId', {
        excludeTermId,
      });
    }

    return query.getOne();
  }

  private formatDate(date: Date): string {
    return new Date(String(date)).toISOString().split('T')[0];
  }
}
