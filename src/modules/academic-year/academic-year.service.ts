import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AcademicYear } from './entities/academic-year.entity.js';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto.js';

import { School } from '../school/entities/school.entity.js';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  async create(
    schoolId: string,
    dto: CreateAcademicYearDto,
  ) {
    // 1. Verify school
    await this.verifySchool(schoolId);

    // 2. Validate dates
    this.validateDates(
      dto.startDate,
      dto.endDate,
    );

    // 3. Prevent duplicate academic year
    const existingAcademicYear =
      await this.academicYearRepository.findOne({
        where: {
          schoolId,
          name: dto.name,
        },
      });

    if (existingAcademicYear) {
      throw new ConflictException(
        'An academic year with this name already exists in this school',
      );
    }

    // 4. Create
    const academicYear =
      this.academicYearRepository.create({
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        schoolId,
      });

    return this.academicYearRepository.save(
      academicYear,
    );
  }

  // --------------------------------------------------
  // FIND ALL
  // --------------------------------------------------

  async findAll(schoolId: string) {
    await this.verifySchool(schoolId);

    return this.academicYearRepository.find({
      where: {
        schoolId,
      },
      relations: {
        school: true,
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  // --------------------------------------------------
  // FIND ONE
  // --------------------------------------------------

  async findOne(
    schoolId: string,
    academicYearId: string,
  ) {
    const academicYear =
      await this.academicYearRepository.findOne({
        where: {
          id: academicYearId,
          schoolId,
        },
        relations: {
          school: true,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found in this school',
      );
    }

    return academicYear;
  }

  // --------------------------------------------------
  // FIND CURRENT
  // --------------------------------------------------

  async findCurrent(schoolId: string) {
    await this.verifySchool(schoolId);

    const today = new Date();

    const academicYear =
      await this.academicYearRepository
        .createQueryBuilder('academicYear')
        .where(
          'academicYear.schoolId = :schoolId',
          { schoolId },
        )
        .andWhere(
          'academicYear.startDate <= :today',
          { today },
        )
        .andWhere(
          'academicYear.endDate >= :today',
          { today },
        )
        .getOne();

    if (!academicYear) {
      throw new NotFoundException(
        'No current academic year found for this school',
      );
    }

    return academicYear;
  }

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------

  async update(
    schoolId: string,
    academicYearId: string,
    dto: UpdateAcademicYearDto,
  ) {
    const academicYear =
      await this.findOne(
        schoolId,
        academicYearId,
      );

    const name =
      dto.name ?? academicYear.name;

    const startDate =
      dto.startDate ??
      academicYear.startDate.toISOString();

    const endDate =
      dto.endDate ??
      academicYear.endDate.toISOString();

    // 1. Validate dates
    this.validateDates(
      startDate,
      endDate,
    );

    // 2. Check duplicate name
    if (name !== academicYear.name) {
      const existingAcademicYear =
        await this.academicYearRepository.findOne({
          where: {
            schoolId,
            name,
          },
        });

      if (
        existingAcademicYear &&
        existingAcademicYear.id !== academicYear.id
      ) {
        throw new ConflictException(
          'An academic year with this name already exists in this school',
        );
      }
    }

    // 3. Apply changes
    academicYear.name = name;
    academicYear.startDate =
      new Date(startDate);
    academicYear.endDate =
      new Date(endDate);

    return this.academicYearRepository.save(
      academicYear,
    );
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async remove(
    schoolId: string,
    academicYearId: string,
  ) {
    const academicYear =
      await this.findOne(
        schoolId,
        academicYearId,
      );

    await this.academicYearRepository.remove(
      academicYear,
    );

    return {
      message:
        'Academic year deleted successfully',
    };
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  private async verifySchool(
    schoolId: string,
  ) {
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

    return school;
  }

  private validateDates(
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
        'Invalid academic year dates',
      );
    }

    if (end <= start) {
      throw new BadRequestException(
        'Academic year end date must be after start date',
      );
    }
  }
}