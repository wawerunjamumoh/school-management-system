import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Teacher } from './entities/teacher.entity.js';
import { Subject } from '../subject/entities/subject.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';

import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { UpdateSubjectDto } from '../subject/dto/update-subject.dto.js';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  // =====================================================
  // TEACHER PROFILE
  // =====================================================

  async findAll(schoolId: string) {
    return this.teacherRepository.find({
      where: {
        schoolId: schoolId,
      },
      relations: {
        subjects: true,
      },
    });
  }

  async findOne(
    schoolId: string,
    teacherId: string,
  ) {
    const teacher = await this.teacherRepository.findOne({
      where: {
        id: teacherId,
        schoolId: schoolId,
      },
      relations: {
        subjects: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found in this school',
      );
    }

    return teacher;
  }

  async update(
    schoolId: string,
    teacherId: string,
    dto: UpdateTeacherDto,
  ) {
    const teacher = await this.findOne(
      schoolId,
      teacherId,
    );

    Object.assign(teacher, dto);

    return this.teacherRepository.save(teacher);
  }

  async remove(
    schoolId: string,
    teacherId: string,
  ) {
    const teacher = await this.findOne(
      schoolId,
      teacherId,
    );

    await this.teacherRepository.remove(teacher);

    return {
      message: 'Teacher deleted successfully',
    };
  }

  // =====================================================
  // TEACHER SUBJECTS
  // =====================================================

  async getSubjects(
    schoolId: string,
    teacherId: string,
  ) {
    const teacher = await this.findOne(
      schoolId,
      teacherId,
    );

    return teacher.subjects;
  }

  async addSubject(
    schoolId: string,
    teacherId: string,
    dto: UpdateSubjectDto,
  ) {
    const teacher = await this.findOne(
      schoolId,
      teacherId,
    );

    /*
     * Assumption:
     * UpdateSubjectDto contains subjectId.
     *
     * Example:
     * {
     *   "subjectId": "uuid"
     * }
     */

    if (!dto.subjectId) {
      throw new BadRequestException(
        'subjectId is required',
      );
    }

    const subject = await this.subjectRepository.findOne({
      where: {
        id: dto.subjectId,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found',
      );
    }

    const alreadyAssigned = teacher.subjects.some(
      (existingSubject) =>
        existingSubject.id === subject.id,
    );

    if (alreadyAssigned) {
      throw new ConflictException(
        'Teacher is already assigned to this subject',
      );
    }

    teacher.subjects.push(subject);

    await this.teacherRepository.save(teacher);

    return {
      message: 'Subject assigned to teacher successfully',
      teacherId: teacher.id,
      subject,
    };
  }

  async deleteSubject(
    schoolId: string,
    teacherId: string,
    subjectId: string,
  ) {
    const teacher = await this.findOne(
      schoolId,
      teacherId,
    );

    const subjectExists = teacher.subjects.some(
      (subject) => subject.id === subjectId,
    );

    if (!subjectExists) {
      throw new NotFoundException(
        'This subject is not assigned to the teacher',
      );
    }

    teacher.subjects = teacher.subjects.filter(
      (subject) => subject.id !== subjectId,
    );

    await this.teacherRepository.save(teacher);

    return {
      message: 'Subject removed from teacher successfully',
      teacherId: teacher.id,
      subjects: teacher.subjects,
    };
  }

  // =====================================================
  // TEACHER -> CLASS STUDENTS
  // =====================================================

  async getClassStudents(
    schoolId: string,
    teacherId: string,
    classId: string,
  ) {
    const teacher = await this.findOne(
      schoolId,
      teacherId,
    );

    /*
     * We are not storing classId directly on Teacher.
     *
     * Enrollment is what connects:
     *
     * Teacher -> Class
     * Class -> Students
     */

    const enrollments =
      await this.enrollmentRepository.find({
        where: {
          classId,
        },
        relations: {
          student: true,
          class: true,
        },
      });

    return enrollments.map(
      (enrollment) => enrollment.student,
    );
  }

  // =====================================================
  // VERIFY TEACHER
  // =====================================================

  async verifyTeacher(
    schoolId: string,
    teacherId: string,
  ) {
    const teacher = await this.findOne(
      schoolId,
      teacherId,
    );

    if (teacher.isVerified) {
      throw new ConflictException(
        'Teacher is already verified',
      );
    }

    teacher.isVerified = true;

    await this.teacherRepository.save(teacher);

    return {
      message: 'Teacher verified successfully',
      teacherId: teacher.id,
      isVerified: teacher.isVerified,
    };
  }
}