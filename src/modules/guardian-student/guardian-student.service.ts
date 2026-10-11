import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GuardianStudent } from './entities/guardian-student.entity.js';
import { Guardian } from '../guardian/entities/guardian.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { ExamResult } from '../exam-result/entities/exam-result.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';

import { CreateGuardianStudentDto } from './dto/create-guardian-student.dto.js';
import { UpdateGuardianStudentDto } from './dto/update-guardian-student.dto.js';

@Injectable()
export class GuardianStudentService {
  constructor(
    @InjectRepository(GuardianStudent)
    private readonly guardianStudentRepository: Repository<GuardianStudent>,

    @InjectRepository(Guardian)
    private readonly guardianRepository: Repository<Guardian>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Enrollment)
    private readonly studentEnrollmentRepository: Repository<Enrollment>,

    @InjectRepository(ExamResult)
    private readonly examResultRepository: Repository<ExamResult>,
  ) {}

  // =========================================================
  // PRIVATE VALIDATION HELPERS
  // =========================================================

  /**
   * Ensures the guardian exists globally.
   *
   * Guardians are not owned by a school.
   */
  private async ensureGuardianExists(guardianId: string) {
    const guardian = await this.guardianRepository.findOne({
      where: {
        id: guardianId,
      },
    });

    if (!guardian) {
      throw new NotFoundException('Guardian not found');
    }

    return guardian;
  }

  /**
   * Ensures the student exists and is enrolled
   * in the requested school.
   *
   * School membership is determined through Enrollment,
   * not Student.schoolId.
   */
  private async ensureStudentInSchool(
    studentId: string,
    schoolId: string,
  ) {
    const enrollment = await this.studentEnrollmentRepository.findOne({
      where: {
        studentId,
        schoolId,
      },
      relations: {
        student: true,
        school: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        'Student is not enrolled in this school',
      );
    }

    return enrollment.student;
  }

  /**
   * Ensures that the guardian is actually linked
   * to the student.
   *
   * Notice that there is NO schoolId here.
   */
  private async ensureRelationshipExists(
    guardianId: string,
    studentId: string,
  ) {
    const relationship =
      await this.guardianStudentRepository.findOne({
        where: {
          guardianId,
          studentId,
        },
      });

    if (!relationship) {
      throw new NotFoundException(
        'Guardian is not associated with this student',
      );
    }

    return relationship;
  }

  // =========================================================
  // CREATE
  // =========================================================

  async create(
    schoolId: string,
    dto: CreateGuardianStudentDto,
  ) {
    // Guardian exists globally
    await this.ensureGuardianExists(dto.guardianId);

    // Student must belong to this school's enrollment
    await this.ensureStudentInSchool(
      dto.studentId,
      schoolId,
    );

    // Guardian ↔ Student relationship is global
    const existingRelationship =
      await this.guardianStudentRepository.findOne({
        where: {
          guardianId: dto.guardianId,
          studentId: dto.studentId,
        },
      });

    if (existingRelationship) {
      throw new ConflictException(
        'Guardian is already linked to this student',
      );
    }

    const relationship =
      this.guardianStudentRepository.create({
        guardianId: dto.guardianId,
        studentId: dto.studentId,
      });

    return this.guardianStudentRepository.save(
      relationship,
    );
  }

  // =========================================================
  // GET STUDENT RESULTS
  // =========================================================

  async getStudentResults(
    schoolId: string,
    guardianId: string,
    studentId: string,
  ) {
    // 1. Guardian exists globally
    await this.ensureGuardianExists(guardianId);

    // 2. Student must belong to this school
    await this.ensureStudentInSchool(
      studentId,
      schoolId,
    );

    // 3. Guardian must actually be related to student
    await this.ensureRelationshipExists(
      guardianId,
      studentId,
    );

    // 4. Results are scoped through Exam -> School
    return this.examResultRepository.find({
      where: {
        studentId,
        exam: {
          schoolId,
        },
      },
      relations: {
        exam: true,
        subject: true,
        term: true,
      },
      order: {
        exam: {
          startDate: 'DESC',
        },
      },
    });
  }

  // =========================================================
  // FIND ALL
  // =========================================================

  async findAll(schoolId: string) {
    /*
     * GuardianStudent itself is global.
     *
     * Therefore we cannot simply do:
     *
     * where: { schoolId }
     *
     * Instead, we return relationships whose student
     * is enrolled in this school.
     */

    return this.guardianStudentRepository
      .createQueryBuilder('guardianStudent')
      .innerJoinAndSelect(
        'guardianStudent.guardian',
        'guardian',
      )
      .innerJoinAndSelect(
        'guardianStudent.student',
        'student',
      )
      .innerJoin(
        Enrollment,
        'enrollment',
        `
          enrollment.studentId = student.id
          AND enrollment.schoolId = :schoolId
        `,
        {
          schoolId,
        },
      )
      .getMany();
  }

  // =========================================================
  // FIND ONE
  // =========================================================

  async findOne(
    schoolId: string,
    relationshipId: string,
  ) {
    const relationship =
      await this.guardianStudentRepository
        .createQueryBuilder('guardianStudent')
        .innerJoinAndSelect(
          'guardianStudent.guardian',
          'guardian',
        )
        .innerJoinAndSelect(
          'guardianStudent.student',
          'student',
        )
        .innerJoin(
          Enrollment,
          'enrollment',
          `
            enrollment.studentId = student.id
            AND enrollment.schoolId = :schoolId
          `,
          {
            schoolId,
          },
        )
        .where(
          'guardianStudent.id = :relationshipId',
          {
            relationshipId,
          },
        )
        .getOne();

    if (!relationship) {
      throw new NotFoundException(
        'Guardian-student relationship not found in this school',
      );
    }

    return relationship;
  }

  // =========================================================
  // FIND STUDENTS OF GUARDIAN
  // =========================================================

  async findStudentsByGuardian(
    schoolId: string,
    guardianId: string,
  ) {
    await this.ensureGuardianExists(guardianId);

    return this.guardianStudentRepository
      .createQueryBuilder('guardianStudent')
      .innerJoinAndSelect(
        'guardianStudent.student',
        'student',
      )
      .innerJoin(
        Enrollment,
        'enrollment',
        `
          enrollment.studentId = student.id
          AND enrollment.schoolId = :schoolId
        `,
        {
          schoolId,
        },
      )
      .where(
        'guardianStudent.guardianId = :guardianId',
        {
          guardianId,
        },
      )
      .getMany();
  }

  // =========================================================
  // FIND GUARDIANS OF STUDENT
  // =========================================================

  async findGuardiansByStudent(
    schoolId: string,
    studentId: string,
  ) {
    await this.ensureStudentInSchool(
      studentId,
      schoolId,
    );

    return this.guardianStudentRepository.find({
      where: {
        studentId,
      },
      relations: {
        guardian: true,
      },
    });
  }

  // =========================================================
  // UPDATE
  // =========================================================

  async update(
    schoolId: string,
    relationshipId: string,
    dto: UpdateGuardianStudentDto,
  ) {
    const relationship = await this.findOne(
      schoolId,
      relationshipId,
    );

    // Validate new guardian
    if (dto.guardianId) {
      await this.ensureGuardianExists(
        dto.guardianId,
      );
    }

    // Validate new student against this school
    if (dto.studentId) {
      await this.ensureStudentInSchool(
        dto.studentId,
        schoolId,
      );
    }

    /*
     * If either side changes, make sure the resulting
     * guardian ↔ student combination doesn't already exist.
     */
    const guardianId =
      dto.guardianId ?? relationship.guardianId;

    const studentId =
      dto.studentId ?? relationship.studentId;

    const duplicate =
      await this.guardianStudentRepository.findOne({
        where: {
          guardianId,
          studentId,
        },
      });

    if (
      duplicate &&
      duplicate.id !== relationship.id
    ) {
      throw new ConflictException(
        'Guardian is already linked to this student',
      );
    }

    Object.assign(relationship, {
      guardianId,
      studentId,
    });

    return this.guardianStudentRepository.save(
      relationship,
    );
  }

  // =========================================================
  // DELETE
  // =========================================================

  async remove(
    schoolId: string,
    relationshipId: string,
  ) {
    const relationship = await this.findOne(
      schoolId,
      relationshipId,
    );

    await this.guardianStudentRepository.remove(
      relationship,
    );

    return {
      message:
        'Guardian-student relationship removed successfully',
    };
  }
}