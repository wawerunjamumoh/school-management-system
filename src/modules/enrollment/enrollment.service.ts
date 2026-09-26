import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Enrollment } from './entities/enrollment.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Class } from '../class/entities/class.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';

import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // CREATE ENROLLMENT
  // ==========================================

  async create(
    schoolId: string,
    dto: CreateEnrollmentDto,
  ) {
    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

    const studentRepository =
      this.dataSource.getRepository(Student);

    const classRepository =
      this.dataSource.getRepository(Class);

    const academicYearRepository =
      this.dataSource.getRepository(AcademicYear);

    const termRepository =
      this.dataSource.getRepository(Term);

    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    // 1. Check student exists
    const student = await studentRepository.findOne({
      where: {
        id: dto.studentId,

      },
    });

    if (!student) {
      throw new NotFoundException(
        'Student not found',
      );
    }

    // 2. Check student belongs to school
    const membership =
      await membershipRepository.findOne({
        where: {
          schoolId,
          userId: student.userId,

        },
      });

    if (!membership) {
      throw new BadRequestException(
        'Student does not belong to this school',
      );
    }

    // 3. Check class
    const schoolClass = await classRepository.findOne({
      where: {
        id: dto.classId,
        schoolId,
      },
    });

    if (!schoolClass) {
      throw new NotFoundException(
        'Class not found in this school',
      );
    }

    // 4. Check academic year
    const academicYear =
      await academicYearRepository.findOne({
        where: {
          id: dto.academicYearId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    // 5. Check term
    const term = await termRepository.findOne({
      where: {
        id: dto.termId,
      },
    });

    if (!term) {
      throw new NotFoundException(
        'Term not found',
      );
    }

    // 6. Prevent duplicate enrollment
    const existingEnrollment =
      await enrollmentRepository.findOne({
        where: {
          studentId: dto.studentId,
          academicYearId: dto.academicYearId,
          termId: dto.termId,
        },
      });

    if (existingEnrollment) {
      throw new BadRequestException(
        'Student is already enrolled for this academic year and term',
      );
    }

    // 7. Check class capacity
    const currentEnrollmentCount =
      await enrollmentRepository.count({
        where: {
          classId: dto.classId,
          academicYearId: dto.academicYearId,
          termId: dto.termId,
          status: 'ACTIVE',
        },
      });

    if (currentEnrollmentCount >= schoolClass.capacity) {
      throw new BadRequestException(
        'This class has reached its capacity',
      );
    }

    // 8. Create enrollment
    const enrollment =
      enrollmentRepository.create({
        schoolId,
        studentId: dto.studentId,
        classId: dto.classId,
        academicYearId: dto.academicYearId,
        termId: dto.termId,
        enrollDate: dto.enrollDate,
        status: dto.status ?? 'ACTIVE',
      });

    const savedEnrollment =
      await enrollmentRepository.save(enrollment);

    return {
      message: 'Student enrolled successfully',
      enrollment: savedEnrollment,
    };
  }

  // ==========================================
  // FIND ALL FOR SCHOOL
  // ==========================================

  async findBySchool(
    schoolId: string,
  ) {
    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

    const classRepository =
      this.dataSource.getRepository(Class);

    const classes = await classRepository.find({
      where: {
        schoolId,
      },
    });

    if (classes.length === 0) {
      return [];
    }

    const classIds = classes.map(
      (schoolClass) => schoolClass.id,
    );

    return enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect(
        'enrollment.student',
        'student',
      )
      .leftJoinAndSelect(
        'enrollment.class',
        'class',
      )
      .leftJoinAndSelect(
        'enrollment.academicYear',
        'academicYear',
      )
      .leftJoinAndSelect(
        'enrollment.term',
        'term',
      )
      .where('enrollment.classId IN (:...classIds)', {
        classIds,
      })
      .getMany();
  }

  // ==========================================
  // FIND ONE
  // ==========================================

  async findOne(
    schoolId: string,
    enrollmentId: string,
  ) {
    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

    const enrollment =
      await enrollmentRepository
        .createQueryBuilder('enrollment')
        .leftJoinAndSelect(
          'enrollment.student',
          'student',
        )
        .leftJoinAndSelect(
          'enrollment.class',
          'class',
        )
        .leftJoinAndSelect(
          'enrollment.academicYear',
          'academicYear',
        )
        .leftJoinAndSelect(
          'enrollment.term',
          'term',
        )
        .where('enrollment.id = :enrollmentId', {
          enrollmentId,
        })
        .andWhere('class.schoolId = :schoolId', {
          schoolId,
        })
        .getOne();

    if (!enrollment) {
      throw new NotFoundException(
        'Enrollment not found',
      );
    }

    return enrollment;
  }

  // ==========================================
  // FIND BY STUDENT
  // ==========================================

  async findByStudent(
    schoolId: string,
    studentId: string,
  ) {
    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

    const results =
      await enrollmentRepository
        .createQueryBuilder('enrollment')
        .leftJoinAndSelect(
          'enrollment.student',
          'student',
        )
        .leftJoinAndSelect(
          'enrollment.class',
          'class',
        )
        .leftJoinAndSelect(
          'enrollment.academicYear',
          'academicYear',
        )
        .leftJoinAndSelect(
          'enrollment.term',
          'term',
        )
        .where('enrollment.studentId = :studentId', {
          studentId,
        })
        .andWhere('class.schoolId = :schoolId', {
          schoolId,
        })
        .getMany();

    return results;
  }

  // ==========================================
  // FIND BY CLASS
  // ==========================================

  async findByClass(
    schoolId: string,
    classId: string,
  ) {
    const classRepository =
      this.dataSource.getRepository(Class);

    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

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

    return enrollmentRepository.find({
      where: {
        classId,
      },
      relations: {
        student: true,
        class: true,
        academicYear: true,
        term: true,
      },
    });
  }

  // ==========================================
  // FIND BY ACADEMIC YEAR
  // ==========================================

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ) {
    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

    return enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect(
        'enrollment.student',
        'student',
      )
      .leftJoinAndSelect(
        'enrollment.class',
        'class',
      )
      .leftJoinAndSelect(
        'enrollment.academicYear',
        'academicYear',
      )
      .leftJoinAndSelect(
        'enrollment.term',
        'term',
      )
      .where(
        'enrollment.academicYearId = :academicYearId',
        {
          academicYearId,
        },
      )
      .andWhere('class.schoolId = :schoolId', {
        schoolId,
      })
      .getMany();
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    schoolId: string,
    enrollmentId: string,
    dto: UpdateEnrollmentDto,
  ) {
    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

    const enrollment =
      await this.findOne(
        schoolId,
        enrollmentId,
      );

    Object.assign(enrollment, dto);

    const updatedEnrollment =
      await enrollmentRepository.save(enrollment);

    return {
      message: 'Enrollment updated successfully',
      enrollment: updatedEnrollment,
    };
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(
    schoolId: string,
    enrollmentId: string,
  ) {
    const enrollmentRepository =
      this.dataSource.getRepository(Enrollment);

    const enrollment =
      await this.findOne(
        schoolId,
        enrollmentId,
      );

    await enrollmentRepository.remove(enrollment);

    return {
      message: 'Enrollment deleted successfully',
      enrollmentId,
    };
  }
}