import {
  Injectable,
  BadRequestException,
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

import { RedisService } from '../../redis/redis.service.js';

type AssignmentCacheDimensions = {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  academicYearId: string;
};

@Injectable()
export class TeachingAssignmentService {
  private readonly CACHE_TTL = 60;

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

    private readonly redisService: RedisService,
  ) {}

  // ==========================================
  // CACHE KEYS
  // ==========================================

  private getListKey(schoolId: string): string {
    return `school:${schoolId}:teaching-assignments:all`;
  }

  private getAssignmentKey(
    schoolId: string,
    assignmentId: string,
  ): string {
    return `school:${schoolId}:teaching-assignment:${assignmentId}`;
  }

  private getTeacherKey(
    schoolId: string,
    teacherId: string,
  ): string {
    return `school:${schoolId}:teaching-assignments:teacher:${teacherId}`;
  }

  private getClassKey(
    schoolId: string,
    classId: string,
  ): string {
    return `school:${schoolId}:teaching-assignments:class:${classId}`;
  }

  private getSubjectKey(
    schoolId: string,
    subjectId: string,
  ): string {
    return `school:${schoolId}:teaching-assignments:subject:${subjectId}`;
  }

  private getAcademicYearKey(
    schoolId: string,
    academicYearId: string,
  ): string {
    return `school:${schoolId}:teaching-assignments:academic-year:${academicYearId}`;
  }

  // ==========================================
  // CACHE-ASIDE HELPER
  // ==========================================

  private async getOrSetCache<T>(
    key: string,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cachedValue = await this.redisService.getJson<T>(key);

    if (cachedValue !== null) {
      return cachedValue;
    }

    const value = await loader();

    await this.redisService.setJson(
      key,
      value,
      this.CACHE_TTL,
    );

    return value;
  }

  // ==========================================
  // CACHE INVALIDATION
  // ==========================================

  private async invalidateAssignmentCache(
    schoolId: string,
    ...assignments: AssignmentCacheDimensions[]
  ): Promise<void> {
    const keys = new Set<string>([
      this.getListKey(schoolId),
    ]);

    for (const assignment of assignments) {
      keys.add(
        this.getAssignmentKey(schoolId, assignment.id),
      );

      keys.add(
        this.getTeacherKey(schoolId, assignment.teacherId),
      );

      keys.add(
        this.getClassKey(schoolId, assignment.classId),
      );

      keys.add(
        this.getSubjectKey(schoolId, assignment.subjectId),
      );

      keys.add(
        this.getAcademicYearKey(
          schoolId,
          assignment.academicYearId,
        ),
      );
    }

    await Promise.all(
      [...keys].map((key) => this.redisService.delete(key)),
    );
  }

  private getCacheDimensions(
    assignment: TeachingAssignment,
  ): AssignmentCacheDimensions {
    return {
      id: assignment.id,
      teacherId: assignment.teacherId,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      academicYearId: assignment.academicYearId,
    };
  }

  // ==========================================
  // CREATE
  // ==========================================

  async create(
    schoolId: string,
    dto: CreateTeachingAssignmentDto,
  ) {
    await this.ensureTeacherBelongsToSchool(
      dto.teacherId,
      schoolId,
    );

    await this.ensureClassBelongsToSchool(
      dto.classId,
      schoolId,
    );

    await this.ensureSubjectBelongsToSchool(
      dto.subjectId,
      schoolId,
    );

    await this.ensureAcademicYearBelongsToSchool(
      dto.academicYearId,
      schoolId,
    );

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

    const assignment = this.assignmentRepository.create({
      teacherId: dto.teacherId,
      classId: dto.classId,
      subjectId: dto.subjectId,
      academicYearId: dto.academicYearId,
      schoolId,
    });

    const savedAssignment =
      await this.assignmentRepository.save(assignment);

    await this.invalidateAssignmentCache(
      schoolId,
      this.getCacheDimensions(savedAssignment),
    );

    return savedAssignment;
  }

  // ==========================================
  // FIND ALL
  // ==========================================

  async findAll(schoolId: string) {
    return this.getOrSetCache(
      this.getListKey(schoolId),
      () =>
        this.assignmentRepository.find({
          where: { schoolId },
          relations: {
            teacher: true,
            class: true,
            subject: true,
            academicYear: true,
          },
          order: {
            id: 'ASC',
          },
        }),
    );
  }

  // ==========================================
  // FIND ONE
  // ==========================================

  async findOne(
    schoolId: string,
    assignmentId: string,
  ) {
    return this.getOrSetCache(
      this.getAssignmentKey(schoolId, assignmentId),
      async () => {
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
      },
    );
  }

  // ==========================================
  // FIND BY TEACHER
  // ==========================================

  async findByTeacher(
    schoolId: string,
    teacherId: string,
  ) {
    await this.ensureTeacherBelongsToSchool(
      teacherId,
      schoolId,
    );

    return this.getOrSetCache(
      this.getTeacherKey(schoolId, teacherId),
      () =>
        this.assignmentRepository.find({
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
        }),
    );
  }

  // ==========================================
  // FIND BY CLASS
  // ==========================================

  async findByClass(
    schoolId: string,
    classId: string,
  ) {
    await this.ensureClassBelongsToSchool(
      classId,
      schoolId,
    );

    return this.getOrSetCache(
      this.getClassKey(schoolId, classId),
      () =>
        this.assignmentRepository.find({
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
        }),
    );
  }

  // ==========================================
  // FIND BY SUBJECT
  // ==========================================

  async findBySubject(
    schoolId: string,
    subjectId: string,
  ) {
    await this.ensureSubjectBelongsToSchool(
      subjectId,
      schoolId,
    );

    return this.getOrSetCache(
      this.getSubjectKey(schoolId, subjectId),
      () =>
        this.assignmentRepository.find({
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
        }),
    );
  }

  // ==========================================
  // FIND BY ACADEMIC YEAR
  // ==========================================

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ) {
    await this.ensureAcademicYearBelongsToSchool(
      academicYearId,
      schoolId,
    );

    return this.getOrSetCache(
      this.getAcademicYearKey(schoolId, academicYearId),
      () =>
        this.assignmentRepository.find({
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
        }),
    );
  }

  // ==========================================
  // UPDATE
  // ==========================================

  async update(
    schoolId: string,
    assignmentId: string,
    dto: UpdateTeachingAssignmentDto,
  ) {
    // Read from PostgreSQL for mutation, not the cache.
    const assignment =
      await this.assignmentRepository.findOne({
        where: {
          id: assignmentId,
          schoolId,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found in this school',
      );
    }

    const oldDimensions = this.getCacheDimensions(assignment);

    const teacherId = dto.teacherId ?? assignment.teacherId;
    const classId = dto.classId ?? assignment.classId;
    const subjectId = dto.subjectId ?? assignment.subjectId;
    const academicYearId =
      dto.academicYearId ?? assignment.academicYearId;

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

    const duplicate =
      await this.assignmentRepository.findOne({
        where: {
          schoolId,
          classId,
          subjectId,
          academicYearId,
        },
      });

    if (duplicate && duplicate.id !== assignment.id) {
      throw new BadRequestException(
        'This subject is already assigned to this class for this academic year',
      );
    }

    Object.assign(assignment, {
      teacherId,
      classId,
      subjectId,
      academicYearId,
    });

    const updatedAssignment =
      await this.assignmentRepository.save(assignment);

    await this.invalidateAssignmentCache(
      schoolId,
      oldDimensions,
      this.getCacheDimensions(updatedAssignment),
    );

    return updatedAssignment;
  }

  // ==========================================
  // DELETE
  // ==========================================

  async remove(
    schoolId: string,
    assignmentId: string,
  ) {
    const assignment =
      await this.assignmentRepository.findOne({
        where: {
          id: assignmentId,
          schoolId,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Teaching assignment not found in this school',
      );
    }

    const dimensions = this.getCacheDimensions(assignment);

    await this.assignmentRepository.remove(assignment);

    await this.invalidateAssignmentCache(
      schoolId,
      dimensions,
    );

    return {
      message: 'Teaching assignment deleted successfully',
    };
  }

  // ==========================================
  // VALIDATION HELPERS
  // ==========================================

  private async ensureTeacherBelongsToSchool(
    teacherId: string,
    schoolId: string,
  ) {
    const teacher = await this.teacherRepository.findOne({
      where: {
        id: teacherId,
        schoolId,
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
    const classEntity = await this.classRepository.findOne({
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
    const subject = await this.subjectRepository.findOne({
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