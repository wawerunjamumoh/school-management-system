import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Exam } from './entities/exam.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { Term } from '../term/entities/term.entity.js';
import { ExamResult } from '../exam-result/entities/exam-result.entity.js';

// DTOs
import { CreateExamDto } from './dto/create-exam.dto.js';
import { UpdateExamDto } from './dto/update-exam.dto.js';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,

    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,

    @InjectRepository(ExamResult)
    private readonly examResultRepository: Repository<ExamResult>,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  async create(
    schoolId: string,
    dto: CreateExamDto,
  ): Promise<Exam> {
    // ----------------------------------------------------------
    // 1. Verify school
    // ----------------------------------------------------------

    await this.verifySchool(schoolId);

    // ----------------------------------------------------------
    // 2. Verify academic year belongs to school
    // ----------------------------------------------------------

    const academicYear =
      await this.verifyAcademicYear(
        dto.academicYearId,
        schoolId,
      );

    // ----------------------------------------------------------
    // 3. Verify term belongs to academic year
    // ----------------------------------------------------------

    const term = await this.verifyTerm(
      dto.termId,
      dto.academicYearId,
    );

    // ----------------------------------------------------------
    // 4. Validate exam dates
    // ----------------------------------------------------------

    this.validateExamDates(
      dto.startDate,
      dto.endDate,
    );

    // ----------------------------------------------------------
    // 5. Exam must fall within term
    // ----------------------------------------------------------

    this.validateExamWithinTerm(
      dto.startDate,
      dto.endDate,
      term,
    );

    // ----------------------------------------------------------
    // 6. Exam must fall within academic year
    // ----------------------------------------------------------

    this.validateExamWithinAcademicYear(
      dto.startDate,
      dto.endDate,
      academicYear,
    );

    // ----------------------------------------------------------
    // 7. Prevent duplicate examId within school
    // ----------------------------------------------------------

    const existingExam =
      await this.examRepository.findOne({
        where: {
          schoolId,
          examName: dto.examName,
        },
      });

    if (existingExam) {
      throw new ConflictException(
        `Exam ID "${dto.examId}" already exists in this school`,
      );
    }

    // ----------------------------------------------------------
    // 8. Create
    // ----------------------------------------------------------

    const exam = this.examRepository.create({
      examName: dto.examName,
      examId: dto.examId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),

      schoolId,

      academicYearId:
      dto.academicYearId,

      termId: dto.termId,
    });

    return this.examRepository.save(exam);
  }

  // ============================================================
  // FIND ALL SCHOOL EXAMS
  // ============================================================

  async findBySchool(
    schoolId: string,
  ): Promise<Exam[]> {
    await this.verifySchool(schoolId);

    return this.examRepository.find({
      where: {
        schoolId,
      },
      relations: {
        academicYear: true,
        term: true,
      },
      order: {
        startDate: 'DESC',
      },
    });
  }

  // ============================================================
  // FIND BY ACADEMIC YEAR
  // ============================================================

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ): Promise<Exam[]> {
    await this.verifyAcademicYear(
      academicYearId,
      schoolId,
    );

    return this.examRepository.find({
      where: {
        schoolId,
        academicYearId,
      },
      relations: {
        academicYear: true,
        term: true,
      },
      order: {
        startDate: 'ASC',
      },
    });
  }

  // ============================================================
  // FIND BY ACADEMIC YEAR + TERM
  // ============================================================

  async findByAcademicYearAndTerm(
    schoolId: string,
    academicYearId: string,
    termId: string,
  ): Promise<Exam[]> {
    // ----------------------------------------------------------
    // Verify academic year belongs to school
    // ----------------------------------------------------------

    await this.verifyAcademicYear(
      academicYearId,
      schoolId,
    );

    // ----------------------------------------------------------
    // Verify term belongs to academic year
    // ----------------------------------------------------------

    await this.verifyTerm(
      termId,
      academicYearId,
    );

    // ----------------------------------------------------------
    // Find exams
    // ----------------------------------------------------------

    return this.examRepository.find({
      where: {
        schoolId,
        academicYearId,
        termId,
      },
      relations: {
        academicYear: true,
        term: true,
      },
      order: {
        startDate: 'ASC',
      },
    });
  }

  // ============================================================
  // FIND ONE
  // ============================================================

  async findOne(
    schoolId: string,
    examId: string,
  ): Promise<Exam> {
    await this.verifySchool(schoolId);

    const exam =
      await this.examRepository.findOne({
        where: {
          id: examId,
          schoolId,
        },
        relations: {
          academicYear: true,
          term: true,
        },
      });

    if (!exam) {
      throw new NotFoundException(
        `Exam ${examId} not found in school ${schoolId}`,
      );
    }

    return exam;
  }

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    schoolId: string,
    examId: string,
    dto: UpdateExamDto,
  ): Promise<Exam> {
    const exam = await this.findOne(
      schoolId,
      examId,
    );

    // ----------------------------------------------------------
    // Determine final values
    // ----------------------------------------------------------

    const finalExamName =
      dto.examName ?? exam.examName;

    const finalExamCode =
      dto.examId ?? exam.examId;

    const finalStartDate =
      dto.startDate
        ? new Date(dto.startDate)
        : exam.startDate;

    const finalEndDate =
      dto.endDate
        ? new Date(dto.endDate)
        : exam.endDate;

    const finalAcademicYearId =
      dto.academicYearId ??
      exam.academicYearId;

    const finalTermId =
      dto.termId ??
      exam.termId;

    // ----------------------------------------------------------
    // 1. Verify academic year
    // ----------------------------------------------------------

    const academicYear =
      await this.verifyAcademicYear(
        finalAcademicYearId,
        schoolId,
      );

    // ----------------------------------------------------------
    // 2. Verify term belongs to academic year
    // ----------------------------------------------------------

    const term = await this.verifyTerm(
      finalTermId,
      finalAcademicYearId,
    );

    // ----------------------------------------------------------
    // 3. Validate dates
    // ----------------------------------------------------------

    this.validateExamDates(
      finalStartDate,
      finalEndDate,
    );

    // ----------------------------------------------------------
    // 4. Validate against term
    // ----------------------------------------------------------

    this.validateExamWithinTerm(
      finalStartDate,
      finalEndDate,
      term,
    );

    // ----------------------------------------------------------
    // 5. Validate against academic year
    // ----------------------------------------------------------

    this.validateExamWithinAcademicYear(
      finalStartDate,
      finalEndDate,
      academicYear,
    );

    // ----------------------------------------------------------
    // 6. Check exam ID uniqueness
    // ----------------------------------------------------------

    if (finalExamCode !== exam.examId) {
      const duplicate =
        await this.examRepository.findOne({
          where: {
            schoolId,
            examId: finalExamCode,
          },
        });

      if (duplicate && duplicate.id !== exam.id) {
        throw new ConflictException(
          `Exam ID "${finalExamCode}" already exists in this school`,
        );
      }
    }

    // ----------------------------------------------------------
    // 7. Apply changes
    // ----------------------------------------------------------

    exam.examName = finalExamName;
    exam.examId = finalExamCode;

    exam.startDate = finalStartDate;
    exam.endDate = finalEndDate;

    exam.academicYearId =
      finalAcademicYearId;

    exam.termId =
      finalTermId;

    return this.examRepository.save(exam);
  }

  // ============================================================
  // DELETE
  // ============================================================

  async remove(
    schoolId: string,
    examId: string,
  ): Promise<{ message: string }> {
    const exam = await this.findOne(
      schoolId,
      examId,
    );

    // ----------------------------------------------------------
    // Don't silently delete an exam that has results.
    // ----------------------------------------------------------

    const resultCount =
      await this.examResultRepository.count({
        where: {
          examId: exam.id,
        },
      });

    if (resultCount > 0) {
      throw new ConflictException(
        `Exam cannot be deleted because it has ${resultCount} result(s)`,
      );
    }

    await this.examRepository.remove(exam);

    return {
      message: `Exam ${exam.id} deleted successfully`,
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

  // ------------------------------------------------------------
  // VERIFY ACADEMIC YEAR
  // ------------------------------------------------------------

  private async verifyAcademicYear(
    academicYearId: string,
    schoolId: string,
  ): Promise<AcademicYear> {
    const academicYear =
      await this.academicYearRepository.findOne({
        where: {
          id: academicYearId,
          schoolId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        `Academic year ${academicYearId} not found in school ${schoolId}`,
      );
    }

    return academicYear;
  }

  // ------------------------------------------------------------
  // VERIFY TERM
  // ------------------------------------------------------------

  private async verifyTerm(
    termId: string,
    academicYearId: string,
  ): Promise<Term> {
    const term =
      await this.termRepository.findOne({
        where: {
          id: termId,
          academicYearId,
        },
      });

    if (!term) {
      throw new NotFoundException(
        `Term ${termId} not found in academic year ${academicYearId}`,
      );
    }

    return term;
  }

  // ------------------------------------------------------------
  // VALIDATE EXAM DATES
  // ------------------------------------------------------------

  private validateExamDates(
    startDate: Date | string,
    endDate: Date | string,
  ): void {
    const start =
      startDate instanceof Date
        ? startDate
        : new Date(startDate);

    const end =
      endDate instanceof Date
        ? endDate
        : new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      throw new BadRequestException(
        'Invalid exam date',
      );
    }

    if (end <= start) {
      throw new BadRequestException(
        'Exam end date must be after start date',
      );
    }
  }

  // ------------------------------------------------------------
  // VALIDATE AGAINST TERM
  // ------------------------------------------------------------

  private validateExamWithinTerm(
    startDate: Date | string,
    endDate: Date | string,
    term: Term,
  ): void {
    const start =
      startDate instanceof Date
        ? startDate
        : new Date(startDate);

    const end =
      endDate instanceof Date
        ? endDate
        : new Date(endDate);

    const termStart =
      new Date(term.startDate);

    const termEnd =
      new Date(term.endDate);

    if (
      start < termStart ||
      end > termEnd
    ) {
      throw new BadRequestException(
        'Exam dates must fall within the selected term',
      );
    }
  }

  // ------------------------------------------------------------
  // VALIDATE AGAINST ACADEMIC YEAR
  // ------------------------------------------------------------

  private validateExamWithinAcademicYear(
    startDate: Date | string,
    endDate: Date | string,
    academicYear: AcademicYear,
  ): void {
    const start =
      startDate instanceof Date
        ? startDate
        : new Date(startDate);

    const end =
      endDate instanceof Date
        ? endDate
        : new Date(endDate);

    const yearStart =
      new Date(academicYear.startDate);

    const yearEnd =
      new Date(academicYear.endDate);

    if (
      start < yearStart ||
      end > yearEnd
    ) {
      throw new BadRequestException(
        'Exam dates must fall within the selected academic year',
      );
    }
  }
}