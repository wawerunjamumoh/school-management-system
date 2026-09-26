import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { School } from './entities/school.entity.js';
import { CreateSchoolDto } from './dto/create-school.dto.js';
import { UpdateSchoolDto } from './dto/update-school.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassService } from '../class/class.service.js';

@Injectable()
export class SchoolService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(School) private schoolRepository: Repository<School>,
  ) {}

  // =========================
  // CREATE SCHOOL
  // =========================

  async create(dto: CreateSchoolDto) {
    const schoolRepository = this.dataSource.getRepository(School);

    // Check whether school already exists
    const existingSchool = await schoolRepository.findOne({
      where: {
        schoolName: dto.schoolName,
      },
    });

    if (existingSchool) {
      throw new BadRequestException('A school with this name already exists');
    }

    const school = schoolRepository.create(dto);

    const savedSchool = await schoolRepository.save(school);

    return {
      message: 'School created successfully',
      school: savedSchool,
    };
  }

  // =========================
  // FIND ALL SCHOOLS
  // =========================

  async findAll() {
    const schoolRepository = this.dataSource.getRepository(School);

    return schoolRepository.find();
  }

  // =========================
  // FIND ONE SCHOOL
  // =========================

  async findOne(id: string) {
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return school;
  }

  // =========================
  // UPDATE SCHOOL
  // =========================

  async update(id: string, dto: UpdateSchoolDto) {
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    Object.assign(school, dto);

    const updatedSchool = await schoolRepository.save(school);

    return {
      message: 'School updated successfully',
      school: updatedSchool,
    };
  }

  // =========================
  // DELETE SCHOOL
  // =========================

  async remove(id: string) {
    const schoolRepository = this.dataSource.getRepository(School);

    const school = await schoolRepository.findOne({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    await schoolRepository.remove(school);

    return {
      message: 'School deleted successfully',
      schoolId: id,
    };
  }

  // =========================
  // FIND BY LOCATION
  // =========================

  async findByLocation(location: string) {
    const schoolRepository = this.dataSource.getRepository(School);

    return schoolRepository
      .createQueryBuilder('school')
      .where('LOWER(school.location) LIKE LOWER(:location)', {
        location: `%${location}%`,
      })
      .getMany();
  }
}
