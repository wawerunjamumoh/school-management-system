
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ExamResult } from './entities/exam-result.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Subject } from '../subject/entities/subject.entity.js';
import { Exam } from '../exam/entities/exam.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { School } from '../school/entities/school.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';
import { SchoolMembership } from '../school-membership/entities/school-membership.entity.js';
import { UserRole } from '../auth/entities/user.entity.js';

import { CreateExamResultDto } from './dto/create-exam-result.dto.js';
import { UpdateExamResultDto } from './dto/update-exam-result.dto.js';
import { RedisService } from '../../redis/redis.service.js';

@Injectable()
export class ExamResultService {
  private readonly CACHE_TTL = 60;

  constructor(
    @InjectRepository(ExamResult)
    private readonly examResultRepository: Repository<ExamResult>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,

    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(SchoolMembership)
    private readonly membershipRepository: Repository<SchoolMembership>,

    private readonly redisService: RedisService,
  ) {}

  // ============================================================
  // CACHE HELPERS
  // ============================================================

  private versionKey(schoolId: string): string {
    return `school:${schoolId}:exam-results:cache-version`;
  }

  private async getCacheVersion(schoolId: string): Promise<string> {
    const version = await this.redisService.getJson<string>(
      this.versionKey(schoolId),
    );

    return version ?? '1';
  }

  private async getCacheKey(
    schoolId: string,
    query: string,
  ): Promise<string> {
    const version = await this.getCacheVersion(schoolId);

    return `school:${schoolId}:exam-results:v${version}:${query}`;
  }

  private async getOrSetCache<T>(
    key: string,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.redisService.getJson<T>(key);

    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const value = await loader();

    await this.redisService.setJson(
      key,
      value,
      this.CACHE_TTL,
    );

    return value;
  }

  /**
   * Invalidates all result queries for this school by changing
   * the namespace version. Old entries expire via their TTL.
   */
  private async invalidateSchoolResultCaches(
    schoolId: string,
  ): Promise<void> {
    const current = await this.getCacheVersion(schoolId);
    const next = `${Date.now()}-${current}`;

    await this.redisService.setJson(
      this.versionKey(schoolId),
      next,
      24 * 60 * 60,
    );
  }

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    schoolId: string,
    dto: CreateExamResultDto,
  ): Promise<ExamResult> {
    await this.verifySchool(schoolId);

    const exam = await this.verifyExam(dto.examId, schoolId);
    await this.verifySubject(dto.subjectId, schoolId);
    await this.verifyStudentInSchool(dto.studentId, schoolId);

    const term = await this.termRepository.findOne({
      where: { id: dto.termId },
    });

    if (!term) {
      throw new NotFoundException(`Term ${dto.termId} not found`);
    }

    if (exam.termId !== dto.termId) {
      throw new BadRequestException(
        'The result term must match the exam term',
      );
    }

    if (term.academicYearId !== exam.academicYearId) {
      throw new BadRequestException(
        'The result term does not belong to the exam academic year',
      );
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        studentId: dto.studentId,
        academicYearId: exam.academicYearId,
        termId: exam.termId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        'Student is not enrolled for the academic year and term of this exam',
      );
    }

    const existingResult = await this.examResultRepository.findOne({
      where: {
        studentId: dto.studentId,
        subjectId: dto.subjectId,
        examId: dto.examId,
      },
    });

    if (existingResult) {
      throw new ConflictException(
        'A result already exists for this student, subject, and exam',
      );
    }

    const result = this.examResultRepository.create({
      studentId: dto.studentId,
      subjectId: dto.subjectId,
      examId: dto.examId,
      termId: dto.termId,
      score: dto.score,
    });

    const savedResult = await this.examResultRepository.save(result);

    await this.invalidateSchoolResultCaches(schoolId);

    return savedResult;
  }

  // ============================================================
  // FIND ALL RESULTS FOR SCHOOL
  // ============================================================

  async findBySchool(schoolId: string): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);

    const key = await this.getCacheKey(schoolId, 'all');

    return this.getOrSetCache(key, () =>
      this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.student', 'student')
        .innerJoinAndSelect('result.subject', 'subject')
        .innerJoinAndSelect('result.exam', 'exam')
        .innerJoinAndSelect('result.term', 'term')
        .where('exam.schoolId = :schoolId', { schoolId })
        .orderBy('exam.startDate', 'DESC')
        .addOrderBy('student.lastName', 'ASC')
        .addOrderBy('subject.name', 'ASC')
        .getMany(),
    );
  }

  // ============================================================
  // FIND BY SUBJECT
  // ============================================================

  async findBySubject(
    schoolId: string,
    subjectId: string,
  ): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);
    await this.verifySubject(subjectId, schoolId);

    const key = await this.getCacheKey(
      schoolId,
      `subject:${subjectId}`,
    );

    return this.getOrSetCache(key, () =>
      this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.student', 'student')
        .innerJoinAndSelect('result.subject', 'subject')
        .innerJoinAndSelect('result.exam', 'exam')
        .innerJoinAndSelect('result.term', 'term')
        .where('result.subjectId = :subjectId', { subjectId })
        .andWhere('exam.schoolId = :schoolId', { schoolId })
        .orderBy('exam.startDate', 'DESC')
        .addOrderBy('student.lastName', 'ASC')
        .getMany(),
    );
  }

  // ============================================================
  // FIND STUDENT + EXAM
  // ============================================================

  async findByStudentAndExam(
    schoolId: string,
    studentId: string,
    examId: string,
  ): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);
    await this.verifyStudentInSchool(studentId, schoolId);
    await this.verifyExam(examId, schoolId);

    const key = await this.getCacheKey(
      schoolId,
      `student:${studentId}:exam:${examId}`,
    );

    return this.getOrSetCache(key, () =>
      this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.student', 'student')
        .innerJoinAndSelect('result.subject', 'subject')
        .innerJoinAndSelect('result.exam', 'exam')
        .innerJoinAndSelect('result.term', 'term')
        .where('result.studentId = :studentId', { studentId })
        .andWhere('result.examId = :examId', { examId })
        .andWhere('exam.schoolId = :schoolId', { schoolId })
        .orderBy('subject.name', 'ASC')
        .getMany(),
    );
  }

  // ============================================================
  // FIND CLASS + EXAM
  // ============================================================

  async findByClassAndExam(
    schoolId: string,
    classId: string,
    examId: string,
  ): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);

    const exam = await this.verifyExam(examId, schoolId);

    const key = await this.getCacheKey(
      schoolId,
      `class:${classId}:exam:${examId}`,
    );

    return this.getOrSetCache(key, async () => {
      const enrollments = await this.enrollmentRepository.find({
        where: {
          classId,
          academicYearId: exam.academicYearId,
          termId: exam.termId,
        },
      });

      const studentIds = [
        ...new Set(enrollments.map((item) => item.studentId)),
      ];

      if (studentIds.length === 0) {
        return [];
      }

      return this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.student', 'student')
        .innerJoinAndSelect('result.subject', 'subject')
        .innerJoinAndSelect('result.exam', 'exam')
        .innerJoinAndSelect('result.term', 'term')
        .where('result.studentId IN (:...studentIds)', { studentIds })
        .andWhere('result.examId = :examId', { examId })
        .andWhere('exam.schoolId = :schoolId', { schoolId })
        .orderBy('student.lastName', 'ASC')
        .addOrderBy('subject.name', 'ASC')
        .getMany();
    });
  }

  // ============================================================
  // FIND CLASS + SUBJECT
  // ============================================================

  async findByClassAndSubject(
    schoolId: string,
    classId: string,
    subjectId: string,
  ): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);
    await this.verifySubject(subjectId, schoolId);

    const key = await this.getCacheKey(
      schoolId,
      `class:${classId}:subject:${subjectId}`,
    );

    return this.getOrSetCache(key, async () => {
      const enrollments = await this.enrollmentRepository.find({
        where: { classId },
      });

      const studentIds = [
        ...new Set(enrollments.map((item) => item.studentId)),
      ];

      if (studentIds.length === 0) {
        return [];
      }

      return this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.student', 'student')
        .innerJoinAndSelect('result.subject', 'subject')
        .innerJoinAndSelect('result.exam', 'exam')
        .innerJoinAndSelect('result.term', 'term')
        .where('result.studentId IN (:...studentIds)', { studentIds })
        .andWhere('result.subjectId = :subjectId', { subjectId })
        .andWhere('exam.schoolId = :schoolId', { schoolId })
        .orderBy('exam.startDate', 'DESC')
        .addOrderBy('student.lastName', 'ASC')
        .getMany();
    });
  }

  // ============================================================
  // FIND STUDENT + TERM
  // ============================================================

  async findByStudentAndTerm(
    schoolId: string,
    studentId: string,
    termId: string,
  ): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);
    await this.verifyStudentInSchool(studentId, schoolId);

    const term = await this.termRepository.findOne({
      where: { id: termId },
    });

    if (!term) {
      throw new NotFoundException(`Term ${termId} not found`);
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { studentId, termId },
    });

    if (!enrollment) {
      throw new BadRequestException(
        'Student is not enrolled in the requested term',
      );
    }

    const key = await this.getCacheKey(
      schoolId,
      `student:${studentId}:term:${termId}`,
    );

    return this.getOrSetCache(key, () =>
      this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.student', 'student')
        .innerJoinAndSelect('result.subject', 'subject')
        .innerJoinAndSelect('result.exam', 'exam')
        .innerJoinAndSelect('result.term', 'term')
        .where('result.studentId = :studentId', { studentId })
        .andWhere('result.termId = :termId', { termId })
        .andWhere('exam.schoolId = :schoolId', { schoolId })
        .orderBy('exam.startDate', 'DESC')
        .addOrderBy('subject.name', 'ASC')
        .getMany(),
    );
  }

  // ============================================================
  // FIND ONE
  // ============================================================

  async findOne(
    schoolId: string,
    examResultId: string,
  ): Promise<ExamResult> {
    await this.verifySchool(schoolId);

    const key = await this.getCacheKey(
      schoolId,
      `one:${examResultId}`,
    );

    return this.getOrSetCache(key, async () => {
      const result = await this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect('result.student', 'student')
        .innerJoinAndSelect('result.subject', 'subject')
        .innerJoinAndSelect('result.exam', 'exam')
        .innerJoinAndSelect('result.term', 'term')
        .where('result.id = :examResultId', { examResultId })
        .andWhere('exam.schoolId = :schoolId', { schoolId })
        .getOne();

      if (!result) {
        throw new NotFoundException(
          `Exam result ${examResultId} not found`,
        );
      }

      return result;
    });
  }

  // ============================================================
  // UPDATE RESULT
  // ============================================================

  async update(
    schoolId: string,
    examResultId: string,
    dto: UpdateExamResultDto,
  ): Promise<ExamResult> {
    // Fetch from the database directly for a correction.
    const result = await this.findOne(schoolId, examResultId);

    // Result identity fields should not be changed by this DTO.
    if (dto.score !== undefined) {
      result.score = dto.score;
    }

    const updated = await this.examResultRepository.save(result);

    await this.invalidateSchoolResultCaches(schoolId);

    return updated;
  }

  // ============================================================
  // DELETE RESULT
  // ============================================================

  async remove(
    schoolId: string,
    examResultId: string,
  ): Promise<{ message: string }> {
    const result = await this.findOne(schoolId, examResultId);

    await this.examResultRepository.remove(result);

    await this.invalidateSchoolResultCaches(schoolId);

    return {
      message: `Exam result ${examResultId} deleted successfully`,
    };
  }

  // ============================================================
  // VALIDATION HELPERS
  // ============================================================

  private async verifySchool(schoolId: string): Promise<School> {
    const school = await this.schoolRepository.findOne({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundException(`School ${schoolId} not found`);
    }

    return school;
  }

  private async verifyExam(
    examId: string,
    schoolId: string,
  ): Promise<Exam> {
    const exam = await this.examRepository.findOne({
      where: { id: examId, schoolId },
    });

    if (!exam) {
      throw new NotFoundException(
        `Exam ${examId} not found in school ${schoolId}`,
      );
    }

    return exam;
  }

  private async verifySubject(
    subjectId: string,
    schoolId: string,
  ): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, schoolId },
    });

    if (!subject) {
      throw new NotFoundException(
        `Subject ${subjectId} not found in school ${schoolId}`,
      );
    }

    return subject;
  }

  private async verifyStudentInSchool(
    studentId: string,
    schoolId: string,
  ): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`);
    }

    const membership = await this.membershipRepository.findOne({
      where: {
        userId: studentId,
        schoolId,
        role: UserRole.STUDENT,
      },
    });

    if (!membership) {
      throw new NotFoundException(
        `Student ${studentId} does not belong to school ${schoolId}`,
      );
    }

    return student;
  }
}
