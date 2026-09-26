import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Student } from './entities/student.entity.js';
import { User,UserRole } from '../auth/entities/user.entity.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

import { UpdateStudentDto } from './dto/update-student.dto.js';

@Injectable()
export class StudentService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // FIND ONE STUDENT
  // ==========================================

  async findOne(
    schoolId: string,
    studentId: string,
  ) {
    const studentRepository =
      this.dataSource.getRepository(Student);

    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    // Verify that the student belongs to this school
    const membership =
      await membershipRepository.findOne({
        where: {
          userId: studentId,
          schoolId,
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Student does not belong to this school',
      );
    }

    const student = await studentRepository.findOne({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    return student;
  }

  // ==========================================
  // UPDATE STUDENT
  // ==========================================

  async update(
    schoolId: string,
    studentId: string,
    dto: UpdateStudentDto,
  ) {
    const studentRepository =
      this.dataSource.getRepository(Student);

    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    // Verify school membership
    const membership =
      await membershipRepository.findOne({
        where: {
          userId: studentId,
          schoolId,
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Student does not belong to this school',
      );
    }

    // Find student
    const student = await studentRepository.findOne({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    // Apply DTO changes
    Object.assign(student, dto);

    const updatedStudent =
      await studentRepository.save(student);

    return {
      message: 'Student updated successfully',
      student: updatedStudent,
    };
  }

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  async remove(
    schoolId: string,
    studentId: string,
  ) {
    const studentRepository =
      this.dataSource.getRepository(Student);

    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    // Verify school membership
    const membership =
      await membershipRepository.findOne({
        where: {
          userId: studentId,
          schoolId,
        },
      });

    if (!membership) {
      throw new NotFoundException(
        'Student does not belong to this school',
      );
    }

    const student = await studentRepository.findOne({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    await studentRepository.remove(student);

    return {
      message: 'Student deleted successfully',
      studentId,
    };
  }

  // ==========================================
  // FIND ALL STUDENTS IN SCHOOL
  // ==========================================

  async findBySchool(
    schoolId: string,
  ) {
    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const studentRepository =
      this.dataSource.getRepository(Student);

    const memberships =
      await membershipRepository.find({
        where: {
          schoolId,
          role: UserRole.STUDENT,
        },
      });

    const studentIds = memberships.map(
      (membership) => membership.userId,
    );

    if (studentIds.length === 0) {
      return [];
    }

    return studentRepository
      .createQueryBuilder('student')
      .where('student.id IN (:...studentIds)', {
        studentIds,
      })
      .getMany();
  }

  // ==========================================
  // FIND STUDENTS IN CLASS
  // ==========================================

  async findByClass(
    schoolId: string,
    classId: string,
  ) {
    // We will implement this after looking
    // at your Enrollment entity.

    throw new Error(
      'findByClass() requires the Enrollment entity structure',
    );
  }
}