import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Term } from './entities/term.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';

import { CreateTermDto } from './dto/create-term.dto.js';
import { UpdateTermDto } from './dto/update-term.dto.js';

@Injectable()
export class TermService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  async create(
    schoolId: string,
    dto: CreateTermDto,
  ) {
    const termRepository =
      this.dataSource.getRepository(Term);

    const academicYearRepository =
      this.dataSource.getRepository(AcademicYear);

    // 1. Validate dates
    this.validateDateRange(
      dto.startDate,
      dto.endDate,
    );

    // 2. Find academic year inside this school
    const academicYear =
      await academicYearRepository.findOne({
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

    // 3. Ensure term dates fall inside academic year
    this.validateWithinAcademicYear(
      dto.startDate,
      dto.endDate,
      academicYear.startDate,
      academicYear.endDate,
    );

    // 4. Check duplicate term name
    const existingTerm =
      await termRepository.findOne({
        where: {
          academicYearId: dto.academicYearId,
          termName: dto.termName,
        },
      });

    if (existingTerm) {
      throw new BadRequestException(
        'A term with this name already exists for this academic year',
      );
    }

    // 5. Check date overlap
    const overlappingTerm =
      await this.findOverlappingTerm(
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

    // 6. Create term
    const term = termRepository.create({
      termName: dto.termName.trim(),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      academicYearId: dto.academicYearId,
    });

    const savedTerm =
      await termRepository.save(term);

    return {
      message: 'Term created successfully',
      term: savedTerm,
    };
  }

  // --------------------------------------------------
  // FIND ALL
  // --------------------------------------------------

  async findAll(schoolId: string) {
    const termRepository =
      this.dataSource.getRepository(Term);

    return termRepository
      .createQueryBuilder('term')
      .innerJoinAndSelect(
        'term.academicYear',
        'academicYear',
      )
      .where('academicYear.schoolId = :schoolId', {
        schoolId,
      })
      .orderBy('academicYear.startDate', 'DESC')
      .addOrderBy('term.startDate', 'ASC')
      .getMany();
  }

  // --------------------------------------------------
  // FIND BY ACADEMIC YEAR
  // --------------------------------------------------

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ) {
    const academicYearRepository =
      this.dataSource.getRepository(AcademicYear);

    const termRepository =
      this.dataSource.getRepository(Term);

    // First verify that the academic year belongs
    // to this school.
    const academicYear =
      await academicYearRepository.findOne({
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

    return termRepository.find({
      where: {
        academicYearId,
      },
      order: {
        startDate: 'ASC',
      },
    });
  }

  // --------------------------------------------------
  // FIND ONE
  // --------------------------------------------------

  async findOne(
    schoolId: string,
    termId: string,
  ) {
    const termRepository =
      this.dataSource.getRepository(Term);

    const term =
      await termRepository
        .createQueryBuilder('term')
        .innerJoinAndSelect(
          'term.academicYear',
          'academicYear',
        )
        .where('term.id = :termId', {
          termId,
        })
        .andWhere(
          'academicYear.schoolId = :schoolId',
          { schoolId },
        )
        .getOne();

    if (!term) {
      throw new NotFoundException(
        'Term not found',
      );
    }

    return term;
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------

  async update(
    schoolId: string,
    termId: string,
    dto: UpdateTermDto,
  ) {
    const termRepository =
      this.dataSource.getRepository(Term);

    const academicYearRepository =
      this.dataSource.getRepository(AcademicYear);

    // 1. Find existing term within school
    const term = await this.findOne(
      schoolId,
      termId,
    );

    // Determine the academic year to use.
    const academicYearId =
      dto.academicYearId ??
      term.academicYearId;

    // 2. Verify academic year belongs to school
    const academicYear =
      await academicYearRepository.findOne({
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
      dto.startDate ??
      this.formatDate(term.startDate);

    const endDate =
      dto.endDate ??
      this.formatDate(term.endDate);

    const termName =
      dto.termName?.trim() ??
      term.termName;

    // 3. Validate dates
    this.validateDateRange(
      startDate,
      endDate,
    );

    // 4. Validate dates against academic year
    this.validateWithinAcademicYear(
      startDate,
      endDate,
      academicYear.startDate,
      academicYear.endDate,
    );

    // 5. Check duplicate name
    const duplicate =
      await termRepository
        .createQueryBuilder('term')
        .where(
          'term.academicYearId = :academicYearId',
          { academicYearId },
        )
        .andWhere(
          'LOWER(term.termName) = LOWER(:termName)',
          { termName },
        )
        .andWhere('term.id != :termId', {
          termId,
        })
        .getOne();

    if (duplicate) {
      throw new BadRequestException(
        'A term with this name already exists for this academic year',
      );
    }

    // 6. Check date overlap
    const overlappingTerm =
      await this.findOverlappingTerm(
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

    // 7. Update
    term.termName = termName;
    term.startDate = new Date(startDate);
    term.endDate = new Date(endDate);
    term.academicYearId = academicYearId;

    const updatedTerm =
      await termRepository.save(term);

    return {
      message: 'Term updated successfully',
      term: updatedTerm,
    };
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async remove(
    schoolId: string,
    termId: string,
  ) {
    const termRepository =
      this.dataSource.getRepository(Term);

    // Verify ownership first.
    const term = await this.findOne(
      schoolId,
      termId,
    );

    await termRepository.remove(term);

    return {
      message: 'Term deleted successfully',
    };
  }

  // --------------------------------------------------
  // PRIVATE VALIDATION
  // --------------------------------------------------

  private validateDateRange(
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      throw new BadRequestException(
        'Invalid term dates',
      );
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
  ) {
    const start = new Date(termStart);
    const end = new Date(termEnd);

    const academicStart = new Date(yearStart);
    const academicEnd = new Date(yearEnd);

    if (
      start < academicStart ||
      end > academicEnd
    ) {
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
  ) {
    const termRepository =
      this.dataSource.getRepository(Term);

    const query =
      termRepository
        .createQueryBuilder('term')
        .innerJoin(
          'term.academicYear',
          'academicYear',
        )
        .where(
          'term.academicYearId = :academicYearId',
          { academicYearId },
        )
        .andWhere(
          'academicYear.schoolId = :schoolId',
          { schoolId },
        )
        .andWhere(
          'term.startDate < :endDate',
          { endDate },
        )
        .andWhere(
          'term.endDate > :startDate',
          { startDate },
        );

    if (excludeTermId) {
      query.andWhere(
        'term.id != :excludeTermId',
        { excludeTermId },
      );
    }

    return query.getOne();
  }

  private formatDate(date: Date): string {
    return date
      .toISOString()
      .split('T')[0];
  }
}