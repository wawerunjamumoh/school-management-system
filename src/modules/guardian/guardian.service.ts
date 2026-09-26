import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Guardian } from './entities/guardian.entity.js';
import { GuardianStudent } from '../guardian-student/entities/guardian-student.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';

// DTOs
import { CreateGuardianDto } from './dto/create-guardian.dto.js';
import { UpdateGuardianDto } from './dto/update-guardian.dto.js';

@Injectable()
export class GuardianService {
  constructor(
    @InjectRepository(Guardian)
    private readonly guardianRepository: Repository<Guardian>,

    @InjectRepository(GuardianStudent)
    private readonly guardianStudentRepository: Repository<GuardianStudent>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    schoolId: string,
    dto: CreateGuardianDto,
  ): Promise<Guardian> {
    /*
     * IMPORTANT:
     *
     * Guardian currently has no schoolId.
     *
     * Therefore schoolId cannot be saved directly on Guardian.
     *
     * The school scope will matter when the guardian is connected
     * to a student through GuardianStudent.
     */

    const existingGuardian =
      await this.guardianRepository.findOne({
        where: {
          email: dto.email,
        },
      });

    if (existingGuardian) {
      throw new ConflictException(
        'A guardian with this email already exists',
      );
    }

    const guardian =
      this.guardianRepository.create(dto);

    return this.guardianRepository.save(guardian);
  }

  // ============================================================
  // FIND BY SCHOOL
  // ============================================================

  async findBySchool(
    schoolId: string,
  ): Promise<Guardian[]> {
    /*
     * Guardian does not contain schoolId.
     *
     * Therefore:
     *
     * Guardian
     *    ↓
     * GuardianStudent
     *    ↓
     * Student
     *    ↓
     * Enrollment
     *    ↓
     * Class
     *    ↓
     * School
     */

    return this.guardianRepository
      .createQueryBuilder('guardian')
      .innerJoin(
        GuardianStudent,
        'guardianStudent',
        'guardianStudent.guardianId = guardian.id',
      )
      .innerJoin(
        Student,
        'student',
        'student.id = guardianStudent.studentId',
      )
      .innerJoin(
        Enrollment,
        'enrollment',
        'enrollment.studentId = student.id',
      )
      .innerJoin(
        'class',
        'class',
        'class.id = enrollment.classId',
      )
      .where('class.schoolId = :schoolId', {
        schoolId,
      })
      .distinct(true)
      .orderBy('guardian.lastName', 'ASC')
      .addOrderBy('guardian.firstName', 'ASC')
      .getMany();
  }

  // ============================================================
  // FIND ONE
  // ============================================================

  async findOne(
    schoolId: string,
    guardianId: string,
  ): Promise<Guardian> {
    /*
     * First find the guardian.
     */

    const guardian =
      await this.guardianRepository.findOne({
        where: {
          id: guardianId,
        },
      });

    if (!guardian) {
      throw new NotFoundException(
        `Guardian ${guardianId} not found`,
      );
    }

    /*
     * Now verify that this guardian has a student relationship
     * inside the requested school.
     */

    const belongsToSchool =
      await this.guardianStudentRepository
        .createQueryBuilder('guardianStudent')
        .innerJoin(
          Student,
          'student',
          'student.id = guardianStudent.studentId',
        )
        .innerJoin(
          Enrollment,
          'enrollment',
          'enrollment.studentId = student.id',
        )
        .innerJoin(
          'class',
          'class',
          'class.id = enrollment.classId',
        )
        .where(
          'guardianStudent.guardianId = :guardianId',
          { guardianId },
        )
        .andWhere(
          'class.schoolId = :schoolId',
          { schoolId },
        )
        .getOne();

    if (!belongsToSchool) {
      throw new NotFoundException(
        `Guardian ${guardianId} does not belong to school ${schoolId}`,
      );
    }

    return guardian;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    schoolId: string,
    guardianId: string,
    dto: UpdateGuardianDto,
  ): Promise<Guardian> {
    /*
     * findOne() performs both:
     *
     * 1. Guardian existence check
     * 2. School ownership check
     */

    const guardian = await this.findOne(
      schoolId,
      guardianId,
    );

    // ----------------------------------------------------------
    // Email uniqueness
    // ----------------------------------------------------------

    if (
      dto.email !== undefined &&
      dto.email !== guardian.email
    ) {
      const existingGuardian =
        await this.guardianRepository.findOne({
          where: {
            email: dto.email,
          },
        });

      if (
        existingGuardian &&
        existingGuardian.id !== guardian.id
      ) {
        throw new ConflictException(
          'A guardian with this email already exists',
        );
      }
    }

    // ----------------------------------------------------------
    // Apply update
    // ----------------------------------------------------------

    Object.assign(guardian, dto);

    return this.guardianRepository.save(guardian);
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(
    schoolId: string,
    guardianId: string,
  ): Promise<{ message: string }> {
    /*
     * Ensures the guardian exists and belongs to this school.
     */

    const guardian = await this.findOne(
      schoolId,
      guardianId,
    );

    await this.guardianRepository.remove(
      guardian,
    );

    return {
      message: 'Guardian deleted successfully',
    };
  }
}