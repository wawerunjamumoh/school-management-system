import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Class } from './entities/class.entity.js';
import { School } from '../school/entities/school.entity.js';

import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { SchoolService } from '../school/school.service.js';

@Injectable()
export class ClassService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(School) private SchoolRepository: Repository<School>,
  ) {}

  // ==========================================
  // CREATE CLASS
  // ==========================================

  async create(
    schoolId: string,
    dto: CreateClassDto,
  ) {
    const classRepository =
      this.dataSource.getRepository(Class);

    const schoolRepository =
      this.dataSource.getRepository(School);

    // 1. Make sure the school exists
    const school = await schoolRepository.findOne({
      where: {
        id: schoolId,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    // 2. Validate capacity
    if (dto.capacity <= 0) {
      throw new BadRequestException(
        'Class capacity must be greater than zero',
      );
    }

    // 3. Prevent duplicate class
    const existingClass = await classRepository.findOne({
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

    // 4. Create class
    const newClass = classRepository.create({
      schoolId,
      className: dto.className,
      capacity: dto.capacity,
      level: dto.level,
      stream: dto.stream,
    });

    const savedClass =
      await classRepository.save(newClass);

    return {
      message: 'Class created successfully',
      class: savedClass,
    };
  }

  // ==========================================
  // FIND ALL CLASSES FOR SCHOOL
  // ==========================================

  async findBySchool(schoolId: string) {
    const schoolRepository =
      this.dataSource.getRepository(School);

    const classRepository =
      this.dataSource.getRepository(Class);

    // Make sure school exists
    const school = await schoolRepository.findOne({
      where: {
        id: schoolId,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return classRepository.find({
      where: {
        schoolId,
      },
      order: {
        level: 'ASC',
        className: 'ASC',
        stream: 'ASC',
      },
    });
  }

  // ==========================================
  // FIND ONE CLASS
  // ==========================================

  async findOne(
    schoolId: string,
    classId: string,
  ) {
    const classRepository =
      this.dataSource.getRepository(Class);

    const schoolClass = await classRepository.findOne({
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
    const classRepository =
      this.dataSource.getRepository(Class);

    // Find class belonging to this school
    const schoolClass = await classRepository.findOne({
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

    // Validate capacity if provided
    if (
      dto.capacity !== undefined &&
      dto.capacity <= 0
    ) {
      throw new BadRequestException(
        'Class capacity must be greater than zero',
      );
    }

    // Check duplicate if identifying fields are changing
    if (
      dto.className !== undefined ||
      dto.level !== undefined ||
      dto.stream !== undefined
    ) {
      const duplicateClass =
        await classRepository.findOne({
          where: {
            schoolId,
            className:
              dto.className ?? schoolClass.className,
            level:
              dto.level ?? schoolClass.level,
            stream:
              dto.stream ?? schoolClass.stream,
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

    // Apply changes
    Object.assign(schoolClass, dto);

    const updatedClass =
      await classRepository.save(schoolClass);

    return {
      message: 'Class updated successfully',
      class: updatedClass,
    };
  }

  // ==========================================
  // DELETE CLASS
  // ==========================================

  async remove(
    schoolId: string,
    classId: string,
  ) {
    const classRepository =
      this.dataSource.getRepository(Class);

    const schoolClass = await classRepository.findOne({
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

    await classRepository.remove(schoolClass);

    return {
      message: 'Class deleted successfully',
      classId,
    };
  }
}