
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Student } from './entities/student.entity.js';
import { UserRole } from '../auth/entities/user.entity.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class StudentService {
  private readonly CACHE_TTL = 60;

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  // ==========================================
  // CACHE HELPERS
  // ==========================================

  private getStudentProfileCacheKey(studentId: string): string {
    return `student:${studentId}:profile`;
  }

  private getSchoolStudentsCacheKey(schoolId: string): string {
    return `school:${schoolId}:students:all`;
  }

  private async getOrSetCache<T>(
    key: string,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.redisService.getJson<T>(key);

    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const result = await loader();

    await this.redisService.setJson(
      key,
      result,
      this.CACHE_TTL,
    );

    return result;
  }

  /**
   * A student may have memberships in multiple schools.
   * Invalidate every affected school's student list.
   */
  private async invalidateStudentCaches(
    studentId: string,
    schoolIds: string[],
  ): Promise<void> {
    const keys = new Set<string>([
      this.getStudentProfileCacheKey(studentId),
      ...schoolIds.map((schoolId) =>
        this.getSchoolStudentsCacheKey(schoolId),
      ),
    ]);

    await Promise.all(
      [...keys].map((key) => this.redisService.delete(key)),
    );
  }

  // ==========================================
  // FIND ONE STUDENT
  // ==========================================

  async findOne(
    schoolId: string,
    studentId: string,
  ): Promise<Student> {
    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const studentRepository =
      this.dataSource.getRepository(Student);

    // Always verify membership before returning cached data.
    const membership = await membershipRepository.findOne({
      where: {
        userId: studentId,
        schoolId,
        role: UserRole.STUDENT,
      },
    });

    if (!membership) {
      throw new NotFoundException(
        'Student does not belong to this school',
      );
    }

    return this.getOrSetCache(
      this.getStudentProfileCacheKey(studentId),
      async () => {
        const student = await studentRepository.findOne({
          where: { id: studentId },
        });

        if (!student) {
          throw new NotFoundException('Student not found');
        }

        return student;
      },
    );
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

    const membership = await membershipRepository.findOne({
      where: {
        userId: studentId,
        schoolId,
        role: UserRole.STUDENT,
      },
    });

    if (!membership) {
      throw new NotFoundException(
        'Student does not belong to this school',
      );
    }

    const student = await studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Capture memberships so cached lists in other schools
    // can also be invalidated.
    const memberships = await membershipRepository.find({
      where: { userId: studentId },
    });

    Object.assign(student, dto);

    const updatedStudent = await studentRepository.save(student);

    await this.invalidateStudentCaches(
      studentId,
      [
        schoolId,
        ...memberships.map((item) => item.schoolId),
      ],
    );

    return {
      message: 'Student updated successfully',
      student: updatedStudent,
    };
  }

  // ==========================================
  // DELETE STUDENT PROFILE
  // ==========================================

  async remove(
    schoolId: string,
    studentId: string,
  ) {
    const studentRepository =
      this.dataSource.getRepository(Student);

    const membershipRepository =
      this.dataSource.getRepository(SchoolMembership);

    const membership = await membershipRepository.findOne({
      where: {
        userId: studentId,
        schoolId,
        role: UserRole.STUDENT,
      },
    });

    if (!membership) {
      throw new NotFoundException(
        'Student does not belong to this school',
      );
    }

    const student = await studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const memberships = await membershipRepository.find({
      where: { userId: studentId },
    });

    await studentRepository.remove(student);

    await this.invalidateStudentCaches(
      studentId,
      [
        schoolId,
        ...memberships.map((item) => item.schoolId),
      ],
    );

    return {
      message: 'Student profile deleted successfully',
      studentId,
    };
  }

  // ==========================================
  // FIND ALL STUDENTS IN SCHOOL
  // ==========================================

  async findBySchool(schoolId: string): Promise<Student[]> {
    return this.getOrSetCache(
      this.getSchoolStudentsCacheKey(schoolId),
      async () => {
        const studentRepository =
          this.dataSource.getRepository(Student);

        const membershipRepository =
          this.dataSource.getRepository(SchoolMembership);

        // Use a subquery rather than loading all membership IDs
        // into application memory.
        const studentIdsQuery = membershipRepository
          .createQueryBuilder('membership')
          .select('membership.userId')
          .where('membership.schoolId = :schoolId', {
            schoolId,
          })
          .andWhere('membership.role = :role', {
            role: UserRole.STUDENT,
          });

        return studentRepository
          .createQueryBuilder('student')
          .where(`student.id IN (${studentIdsQuery.getQuery()})`)
          .setParameters(studentIdsQuery.getParameters())
          .getMany();
      },
    );
  }

  // ==========================================
  // FIND STUDENTS IN CLASS
  // ==========================================

  async findByClass(
    schoolId: string,
    classId: string,
  ) {
    // Implement after reviewing the Enrollment entity.
    throw new Error(
      'findByClass() requires the Enrollment entity structure',
    );
  }
}
