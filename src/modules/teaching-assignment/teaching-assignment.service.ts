import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TeachingAssignment } from './entities/teaching-assignment.entity.js';

import { Teacher } from '../teacher/entities/teacher.entity.js';
import { Class } from '../class/entities/class.entity.js';
import { Subject } from '../subject/entities/subject.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';

import { CreateTeachingAssignmentDto } from './dto/create-teaching-assignment.dto.js';
import { UpdateTeachingAssignmentDto } from './dto/update-teaching-assignment.dto.js';

@Injectable()
export class TeachingAssignmentService {
  constructor(
    @InjectRepository(TeachingAssignment)
    private readonly assignmentRepository: Repository<TeachingAssignment>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  async create(
    schoolId: string,
    dto: CreateTeachingAssignmentDto,
  ) {
    // ---------------------------------------------------
    // 1. Verify teacher belongs to school
    // ---------------------------------------------------

    const teacher = await this.teacherRepository.findOne({
      where: {
        id: dto.teacherId,
        schoolId: schoolId,
      },
    });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found in this school',
      );
    }

    // ---------------------------------------------------
    // 2. Verify class belongs to school
    // ---------------------------------------------------

    const classEntity = await this.classRepository.findOne({
      where: {
        id: dto.classId,
        schoolId,
      },
    });

    if (!classEntity) {
      throw new NotFoundException(
        'Class not found in this school',
      );
    }

    // ---------------------------------------------------
    // 3. Verify subject belongs to school
    // ---------------------------------------------------

    const subject = await this.subjectRepository.findOne({
      where: {
        id: dto.subjectId,
        schoolId,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found in this school',
      );
    }

    // ---------------------------------------------------
    // 4. Verify academic year belongs to school
    // ---------------------------------------------------

    const academicYear =
      await this.academicYearRepository.findOne({
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

    // ---------------------------------------------------
    // 5. Prevent duplicate assignment
    // ---------------------------------------------------

    const existingAssignment =
      await this.assignmentRepository.findOne({
        where: {
          schoolId,
          classId: dto.classId,
          subjectId: dto.subjectId,
          academicYearId: dto.academicYearId,
        },
      });

    if (existingAssignment) {
      throw new BadRequestException(
        'This subject is already assigned to this class for this academic year',
      );
    }

    // ---------------------------------------------------
    // 6. Create assignment
    // ---------------------------------------------------

    const assignment =
      this.assignmentRepository.create({
        teacherId: dto.teacherId,
        classId: dto.classId,
        subjectId: dto.subjectId,
        academicYearId: dto.academicYearId,
        schoolId,
      });

    return this.assignmentRepository.save(assignment);
  }

  // =====================================================
  // FIND ALL
  // =====================================================

  async findAll(schoolId: string) {
    return this.assignmentRepository.find({
      where: {
        schoolId,
      },
      relations: {
        teacher: true,
        class: true,
        subject: true,
        academicYear: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  // =====================================================
  // FIND ONE
  // =====================================================

  async findOne(
    schoolId: string,
    assignmentId: string,
  ) {
    const assignment =
      await this.assignmentRepository.findOne({
        where: {
          id: assignmentId,
          schoolId,
        },
        relations: {
          teacher: true,
          class: true,
          subject: true,
          academicYear: true,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found in this school',
      );
    }

    return assignment;
  }

  // =====================================================
  // FIND BY TEACHER
  // =====================================================

  async findByTeacher(
    schoolId: string,
    teacherId: string,
  ) {
    await this.ensureTeacherBelongsToSchool(
      teacherId,
      schoolId,
    );

    return this.assignmentRepository.find({
      where: {
        schoolId,
        teacherId,
      },
      relations: {
        teacher: true,
        class: true,
        subject: true,
        academicYear: true,
      },
    });
  }

  // =====================================================
  // FIND BY CLASS
  // =====================================================

  async findByClass(
    schoolId: string,
    classId: string,
  ) {
    await this.ensureClassBelongsToSchool(
      classId,
      schoolId,
    );

    return this.assignmentRepository.find({
      where: {
        schoolId,
        classId,
      },
      relations: {
        teacher: true,
        class: true,
        subject: true,
        academicYear: true,
      },
    });
  }

  // =====================================================
  // FIND BY SUBJECT
  // =====================================================

  async findBySubject(
    schoolId: string,
    subjectId: string,
  ) {
    await this.ensureSubjectBelongsToSchool(
      subjectId,
      schoolId,
    );

    return this.assignmentRepository.find({
      where: {
        schoolId,
        subjectId,
      },
      relations: {
        teacher: true,
        class: true,
        subject: true,
        academicYear: true,
      },
    });
  }

  // =====================================================
  // FIND BY ACADEMIC YEAR
  // =====================================================

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ) {
    await this.ensureAcademicYearBelongsToSchool(
      academicYearId,
      schoolId,
    );

    return this.assignmentRepository.find({
      where: {
        schoolId,
        academicYearId,
      },
      relations: {
        teacher: true,
        class: true,
        subject: true,
        academicYear: true,
      },
    });
  }

  // =====================================================
  // UPDATE
  // =====================================================

  async update(
    schoolId: string,
    assignmentId: string,
    dto: UpdateTeachingAssignmentDto,
  ) {
    const assignment = await this.findOne(
      schoolId,
      assignmentId,
    );

    const teacherId =
      dto.teacherId ?? assignment.teacherId;

    const classId =
      dto.classId ?? assignment.classId;

    const subjectId =
      dto.subjectId ?? assignment.subjectId;

    const academicYearId =
      dto.academicYearId ??
      assignment.academicYearId;

    // ---------------------------------------------------
    // Verify all referenced resources
    // ---------------------------------------------------

    await this.ensureTeacherBelongsToSchool(
      teacherId,
      schoolId,
    );

    await this.ensureClassBelongsToSchool(
      classId,
      schoolId,
    );

    await this.ensureSubjectBelongsToSchool(
      subjectId,
      schoolId,
    );

    await this.ensureAcademicYearBelongsToSchool(
      academicYearId,
      schoolId,
    );

    // ---------------------------------------------------
    // Check duplicate assignment
    // ---------------------------------------------------

    const duplicate =
      await this.assignmentRepository.findOne({
        where: {
          schoolId,
          classId,
          subjectId,
          academicYearId,
        },
      });

    if (
      duplicate &&
      duplicate.id !== assignment.id
    ) {
      throw new BadRequestException(
        'This subject is already assigned to this class for this academic year',
      );
    }

    // ---------------------------------------------------
    // Apply update
    // ---------------------------------------------------

    Object.assign(assignment, {
      teacherId,
      classId,
      subjectId,
      academicYearId,
    });

    return this.assignmentRepository.save(
      assignment,
    );
  }

  // =====================================================
  // DELETE
  // =====================================================

  async remove(
    schoolId: string,
    assignmentId: string,
  ) {
    const assignment = await this.findOne(
      schoolId,
      assignmentId,
    );

    await this.assignmentRepository.remove(
      assignment,
    );

    return {
      message: 'Teaching assignment deleted successfully',
    };
  }

  // =====================================================
  // VALIDATION HELPERS
  // =====================================================

  private async ensureTeacherBelongsToSchool(
    teacherId: string,
    schoolId: string,
  ) {
    const teacher =
      await this.teacherRepository.findOne({
        where: {
          id: teacherId,
          schoolId: schoolId,
        },
      });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found in this school',
      );
    }

    return teacher;
  }

  private async ensureClassBelongsToSchool(
    classId: string,
    schoolId: string,
  ) {
    const classEntity =
      await this.classRepository.findOne({
        where: {
          id: classId,
          schoolId,
        },
      });

    if (!classEntity) {
      throw new NotFoundException(
        'Class not found in this school',
      );
    }

    return classEntity;
  }

  private async ensureSubjectBelongsToSchool(
    subjectId: string,
    schoolId: string,
  ) {
    const subject =
      await this.subjectRepository.findOne({
        where: {
          id: subjectId,
          schoolId,
        },
      });

    if (!subject) {
      throw new NotFoundException(
        'Subject not found in this school',
      );
    }

    return subject;
  }

  private async ensureAcademicYearBelongsToSchool(
    academicYearId: string,
    schoolId: string,
  ) {
    const academicYear =
      await this.academicYearRepository.findOne({
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

    return academicYear;
  }
}