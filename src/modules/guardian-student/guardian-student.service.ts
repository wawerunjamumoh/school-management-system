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

import { CreateGuardianStudentDto } from './dto/create-guardian-student.dto.js';
import { UpdateGuardianStudentDto } from './dto/update-guardian-student.dto.js';

@Injectable()
export class GuardianStudentService {
  constructor(
    @InjectRepository(GuardianStudent)
    private readonly guardianStudentRepository:
    Repository<GuardianStudent>,

    @InjectRepository(Guardian)
    private readonly guardianRepository:
    Repository<Guardian>,

    @InjectRepository(Student)
    private readonly studentRepository:
    Repository<Student>,

    @InjectRepository(ExamResult)
    private readonly examResultRepository:
    Repository<ExamResult>,
  ) {}

  // =========================================
  // CREATE
  // =========================================

  async create(
    dto: CreateGuardianStudentDto,
  ) {
    // Check guardian exists
    const guardian =
      await this.guardianRepository.findOne({
        where: {
          id: dto.guardianId,
        },
      });

    if (!guardian) {
      throw new NotFoundException(
        'Guardian not found',
      );
    }

    // Check student exists
    const student =
      await this.studentRepository.findOne({
        where: {
          id: dto.studentId,
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    // Prevent duplicate relationship
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

  async getStudentResults(
    guardianId: string,
    studentId: string,
  ) {
    // 1. Verify the guardian exists
    const guardian =
      await this.guardianRepository.findOne({
        where: {
          id: guardianId,
        },
      });

    if (!guardian) {
      throw new NotFoundException(
        'Guardian not found',
      );
    }

    // 2. Verify the student exists
    const student =
      await this.studentRepository.findOne({
        where: {
          id: studentId,
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    // 3. Verify guardian ↔ student relationship
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

    // 4. Retrieve the student's results
    return this.examResultRepository.find({
      where: {
        studentId,
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

  // =========================================
  // FIND ALL
  // =========================================

  async findAll() {
    return this.guardianStudentRepository.find({
      relations: {
        guardian: true,
        student: true,
      },
    });
  }

  // =========================================
  // FIND ONE
  // =========================================

  async findOne(
    relationshipId: string,
  ) {
    const relationship =
      await this.guardianStudentRepository.findOne({
        where: {
          id: relationshipId,
        },
        relations: {
          guardian: true,
          student: true,
        },
      });

    if (!relationship) {
      throw new NotFoundException(
        'Guardian-student relationship not found',
      );
    }

    return relationship;
  }

  // =========================================
  // FIND STUDENTS OF GUARDIAN
  // =========================================

  async findStudentsByGuardian(
    guardianId: string,
  ) {
    const guardian =
      await this.guardianRepository.findOne({
        where: {
          id: guardianId,
        },
      });

    if (!guardian) {
      throw new NotFoundException(
        'Guardian not found',
      );
    }

    return this.guardianStudentRepository.find({
      where: {
        guardianId,
      },
      relations: {
        student: true,
      },
    });
  }

  // =========================================
  // FIND GUARDIANS OF STUDENT
  // =========================================

  async findGuardiansByStudent(
    studentId: string,
  ) {
    const student =
      await this.studentRepository.findOne({
        where: {
          id: studentId,
        },
      });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    return this.guardianStudentRepository.find({
      where: {
        studentId,
      },
      relations: {
        guardian: true,
      },
    });
  }

  // =========================================
  // UPDATE
  // =========================================

  async update(
    relationshipId: string,
    dto: UpdateGuardianStudentDto,
  ) {
    const relationship =
      await this.findOne(relationshipId);

    if (dto.guardianId) {
      const guardian =
        await this.guardianRepository.findOne({
          where: {
            id: dto.guardianId,
          },
        });

      if (!guardian) {
        throw new NotFoundException(
          'Guardian not found',
        );
      }
    }

    if (dto.studentId) {
      const student =
        await this.studentRepository.findOne({
          where: {
            id: dto.studentId,
          },
        });

      if (!student) {
        throw new NotFoundException(
          'Student not found',
        );
      }
    }

    Object.assign(
      relationship,
      dto,
    );

    return this.guardianStudentRepository.save(
      relationship,
    );
  }

  // =========================================
  // DELETE
  // =========================================

  async remove(
    relationshipId: string,
  ) {
    const relationship =
      await this.findOne(relationshipId);

    await this.guardianStudentRepository.remove(
      relationship,
    );

    return {
      message:
        'Guardian-student relationship removed successfully',
    };
  }
}