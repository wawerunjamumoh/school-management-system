import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { ExamResult } from './entities/exam-result.entity.js';
import { Student } from '../student/entities/student.entity.js';
import { Subject } from '../subject/entities/subject.entity.js';
import { Exam } from '../exam/entities/exam.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { School } from '../school/entities/school.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';

// DTOs
import { CreateExamResultDto } from './dto/create-exam-result.dto.js';
import { UpdateExamResultDto } from './dto/update-exam-result.dto.js';

@Injectable()
export class ExamResultService {
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
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    schoolId: string,
    dto: CreateExamResultDto,
  ): Promise<ExamResult> {
    // ----------------------------------------------------------
    // 1. School must exist
    // ----------------------------------------------------------

    await this.verifySchool(schoolId);

    // ----------------------------------------------------------
    // 2. Exam must belong to this school
    // ----------------------------------------------------------

    const exam = await this.examRepository.findOne({
      where: {
        id: dto.examId,
        schoolId,
      },
    });

    if (!exam) {
      throw new NotFoundException(
        `Exam ${dto.examId} was not found in school ${schoolId}`,
      );
    }

    // ----------------------------------------------------------
    // 3. Subject must belong to this school
    // ----------------------------------------------------------

    const subject = await this.subjectRepository.findOne({
      where: {
        id: dto.subjectId,
        schoolId,
      },
    });

    if (!subject) {
      throw new NotFoundException(
        `Subject ${dto.subjectId} was not found in school ${schoolId}`,
      );
    }

    // ----------------------------------------------------------
    // 4. Student must belong to this school
    // ----------------------------------------------------------

    await this.verifyStudentInSchool(
      dto.studentId,
      schoolId,
    );

    // ----------------------------------------------------------
    // 5. Term must exist
    // ----------------------------------------------------------

    const term = await this.termRepository.findOne({
      where: {
        id: dto.termId,
      },
    });

    if (!term) {
      throw new NotFoundException(
        `Term ${dto.termId} not found`,
      );
    }

    // ----------------------------------------------------------
    // 6. Result term must match exam term
    // ----------------------------------------------------------

    if (exam.termId !== dto.termId) {
      throw new BadRequestException(
        'The result term must match the exam term',
      );
    }

    // ----------------------------------------------------------
    // 7. Result term must belong to exam academic year
    // ----------------------------------------------------------

    if (term.academicYearId !== exam.academicYearId) {
      throw new BadRequestException(
        'The result term does not belong to the exam academic year',
      );
    }

    // ----------------------------------------------------------
    // 8. Student must be enrolled for this exam period
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 9. Prevent duplicate result
    // ----------------------------------------------------------

    const existingResult =
      await this.examResultRepository.findOne({
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

    // ----------------------------------------------------------
    // 10. Create
    // ----------------------------------------------------------

    const result = this.examResultRepository.create({
      studentId: dto.studentId,
      subjectId: dto.subjectId,
      examId: dto.examId,
      termId: dto.termId,
      score: dto.score,
    });

    return this.examResultRepository.save(result);
  }

  // ============================================================
  // FIND ALL RESULTS FOR SCHOOL
  // ============================================================

  async findBySchool(
    schoolId: string,
  ): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);

    return this.examResultRepository
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.student', 'student')
      .innerJoinAndSelect('result.subject', 'subject')
      .innerJoinAndSelect('result.exam', 'exam')
      .innerJoinAndSelect('result.term', 'term')
      .where('exam.schoolId = :schoolId', {
        schoolId,
      })
      .orderBy('exam.startDate', 'DESC')
      .addOrderBy('student.lastName', 'ASC')
      .addOrderBy('subject.name', 'ASC')
      .getMany();
  }

  // ============================================================
  // FIND BY SUBJECT
  // ============================================================

  async findBySubject(
    schoolId: string,
    subjectId: string,
  ): Promise<ExamResult[]> {
    await this.verifySchool(schoolId);

    await this.verifySubject(
      subjectId,
      schoolId,
    );

    return this.examResultRepository
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.student', 'student')
      .innerJoinAndSelect('result.subject', 'subject')
      .innerJoinAndSelect('result.exam', 'exam')
      .innerJoinAndSelect('result.term', 'term')
      .where('result.subjectId = :subjectId', {
        subjectId,
      })
      .andWhere('exam.schoolId = :schoolId', {
        schoolId,
      })
      .orderBy('exam.startDate', 'DESC')
      .addOrderBy('student.lastName', 'ASC')
      .getMany();
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

    await this.verifyStudentInSchool(
      studentId,
      schoolId,
    );

    await this.verifyExam(
      examId,
      schoolId,
    );

    return this.examResultRepository
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.student', 'student')
      .innerJoinAndSelect('result.subject', 'subject')
      .innerJoinAndSelect('result.exam', 'exam')
      .innerJoinAndSelect('result.term', 'term')
      .where('result.studentId = :studentId', {
        studentId,
      })
      .andWhere('result.examId = :examId', {
        examId,
      })
      .andWhere('exam.schoolId = :schoolId', {
        schoolId,
      })
      .orderBy('subject.name', 'ASC')
      .getMany();
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

    const exam = await this.verifyExam(
      examId,
      schoolId,
    );

    /*
     * Class membership is determined by Enrollment.
     *
     * We only want students who belonged to this class
     * during the academic year + term of the exam.
     */

    const enrollments =
      await this.enrollmentRepository.find({
        where: {
          classId,
          academicYearId: exam.academicYearId,
          termId: exam.termId,
        },
      });

    if (enrollments.length === 0) {
      return [];
    }

    const studentIds = enrollments.map(
      (enrollment) => enrollment.studentId,
    );

    return this.examResultRepository
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.student', 'student')
      .innerJoinAndSelect('result.subject', 'subject')
      .innerJoinAndSelect('result.exam', 'exam')
      .innerJoinAndSelect('result.term', 'term')
      .where('result.studentId IN (:...studentIds)', {
        studentIds,
      })
      .andWhere('result.examId = :examId', {
        examId,
      })
      .andWhere('exam.schoolId = :schoolId', {
        schoolId,
      })
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('subject.name', 'ASC')
      .getMany();
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

    await this.verifySubject(
      subjectId,
      schoolId,
    );

    /*
     * This endpoint intentionally returns historical results
     * for the class + subject.
     *
     * For a report card, use the student + term endpoint
     * instead because academic period matters.
     */

    const enrollments =
      await this.enrollmentRepository.find({
        where: {
          classId,
        },
      });

    if (enrollments.length === 0) {
      return [];
    }

    const studentIds = enrollments.map(
      (enrollment) => enrollment.studentId,
    );

    return this.examResultRepository
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.student', 'student')
      .innerJoinAndSelect('result.subject', 'subject')
      .innerJoinAndSelect('result.exam', 'exam')
      .innerJoinAndSelect('result.term', 'term')
      .where('result.studentId IN (:...studentIds)', {
        studentIds,
      })
      .andWhere('result.subjectId = :subjectId', {
        subjectId,
      })
      .andWhere('exam.schoolId = :schoolId', {
        schoolId,
      })
      .orderBy('exam.startDate', 'DESC')
      .addOrderBy('student.lastName', 'ASC')
      .getMany();
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

    await this.verifyStudentInSchool(
      studentId,
      schoolId,
    );

    const term = await this.termRepository.findOne({
      where: {
        id: termId,
      },
    });

    if (!term) {
      throw new NotFoundException(
        `Term ${termId} not found`,
      );
    }

    // Student must actually be enrolled in this term.
    const enrollment =
      await this.enrollmentRepository.findOne({
        where: {
          studentId,
          termId,
        },
      });

    if (!enrollment) {
      throw new BadRequestException(
        'Student is not enrolled in the requested term',
      );
    }

    return this.examResultRepository
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.student', 'student')
      .innerJoinAndSelect('result.subject', 'subject')
      .innerJoinAndSelect('result.exam', 'exam')
      .innerJoinAndSelect('result.term', 'term')
      .where('result.studentId = :studentId', {
        studentId,
      })
      .andWhere('result.termId = :termId', {
        termId,
      })
      .andWhere('exam.schoolId = :schoolId', {
        schoolId,
      })
      .orderBy('exam.startDate', 'DESC')
      .addOrderBy('subject.name', 'ASC')
      .getMany();
  }

  // ============================================================
  // FIND ONE
  // ============================================================

  async findOne(
    schoolId: string,
    examResultId: string,
  ): Promise<ExamResult> {
    await this.verifySchool(schoolId);

    const result =
      await this.examResultRepository
        .createQueryBuilder('result')
        .innerJoinAndSelect(
          'result.student',
          'student',
        )
        .innerJoinAndSelect(
          'result.subject',
          'subject',
        )
        .innerJoinAndSelect(
          'result.exam',
          'exam',
        )
        .innerJoinAndSelect(
          'result.term',
          'term',
        )
        .where('result.id = :examResultId', {
          examResultId,
        })
        .andWhere('exam.schoolId = :schoolId', {
          schoolId,
        })
        .getOne();

    if (!result) {
      throw new NotFoundException(
        `Exam result ${examResultId} not found`,
      );
    }

    return result;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    schoolId: string,
    examResultId: string,
    dto: UpdateExamResultDto,
  ): Promise<ExamResult> {
    const result = await this.findOne(
      schoolId,
      examResultId,
    );

    /*
     * Update DTO should ideally contain only `score`.
     *
     * Do NOT allow changing:
     * - studentId
     * - subjectId
     * - examId
     * - termId
     *
     * Those fields define the identity/context of the result.
     */

    if (dto.score !== undefined) {
      result.score = dto.score;
    }

    return this.examResultRepository.save(result);
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(
    schoolId: string,
    examResultId: string,
  ): Promise<{ message: string }> {
    const result = await this.findOne(
      schoolId,
      examResultId,
    );

    await this.examResultRepository.remove(result);

    return {
      message: `Exam result ${examResultId} deleted successfully`,
    };
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async verifySchool(
    schoolId: string,
  ): Promise<School> {
    const school =
      await this.schoolRepository.findOne({
        where: {
          id: schoolId,
        },
      });

    if (!school) {
      throw new NotFoundException(
        `School ${schoolId} not found`,
      );
    }

    return school;
  }

  private async verifyExam(
    examId: string,
    schoolId: string,
  ): Promise<Exam> {
    const exam =
      await this.examRepository.findOne({
        where: {
          id: examId,
          schoolId,
        },
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
    const subject =
      await this.subjectRepository.findOne({
        where: {
          id: subjectId,
          schoolId,
        },
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
    const student =
      await this.studentRepository.findOne({
        where: {
          id: studentId,
        },
      });

    if (!student) {
      throw new NotFoundException(
        `Student ${studentId} not found`,
      );
    }

    /*
     * Student does not directly own schoolId.
     *
     * Therefore we establish school membership through
     * Enrollment -> Class -> School.
     */

    const enrollment =
      await this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .innerJoin(
          'enrollment.class',
          'class',
        )
        .where(
          'enrollment.studentId = :studentId',
          { studentId },
        )
        .andWhere(
          'class.schoolId = :schoolId',
          { schoolId },
        )
        .getOne();

    if (!enrollment) {
      throw new NotFoundException(
        `Student ${studentId} does not belong to school ${schoolId}`,
      );
    }

    return student;
  }
}