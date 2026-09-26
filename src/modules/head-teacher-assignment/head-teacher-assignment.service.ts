import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HeadteacherAssignment } from './entities/head-teacher-assignment.entity.js'
import { CreateHeadTeacherAssignmentDto } from './dto/create-head-teacher-assignment.dto.js';

import { Teacher } from '../teacher/entities/teacher.entity.js';
import { School } from '../school/entities/school.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';

@Injectable()
export class HeadTeacherAssignmentService {
  constructor(
    @InjectRepository(HeadteacherAssignment)
    private readonly assignmentRepository: Repository<HeadteacherAssignment>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  async create(schoolId: string, dto: CreateHeadTeacherAssignmentDto) {
    // 1. Verify school
    await this.verifySchool(schoolId);

    // 2. Verify teacher belongs to this school
    const teacher = await this.teacherRepository.findOne({
      where: {
        id: dto.teacherId,
        schoolId: schoolId,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found in this school');
    }

    // 3. Verify academic year
    const academicYear = await this.academicYearRepository.findOne({
      where: {
        id: dto.academicYearId,
      },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    // 4. Check whether school already has a headteacher
    //    for this academic year
    const existingSchoolAssignment = await this.assignmentRepository.findOne({
      where: {
        schoolId,
        academicYearId: dto.academicYearId,
      },
    });

    if (existingSchoolAssignment) {
      throw new ConflictException(
        'This school already has a headteacher for this academic year',
      );
    }

    // 5. Check whether teacher is already a headteacher
    //    somewhere else during this academic year
    const existingTeacherAssignment = await this.assignmentRepository.findOne({
      where: {
        teacherId: dto.teacherId,
        academicYearId: dto.academicYearId,
      },
    });

    if (existingTeacherAssignment) {
      throw new ConflictException(
        'This teacher is already a headteacher for this academic year',
      );
    }

    // 6. Create assignment
    const assignment = this.assignmentRepository.create({
      teacherId: dto.teacherId,
      schoolId,
      academicYearId: dto.academicYearId,
    });

    return this.assignmentRepository.save(assignment);
  }

  // --------------------------------------------------
  // FIND ALL
  // --------------------------------------------------

  async findAll(schoolId: string) {
    await this.verifySchool(schoolId);

    return this.assignmentRepository.find({
      where: {
        schoolId,
      },
      relations: {
        teacher: true,
        school: true,
        academicYear: true,
      },
      order: {
        academicYearId: 'DESC',
      },
    });
  }

  // --------------------------------------------------
  // FIND ONE
  // --------------------------------------------------

  async findOne(schoolId: string, assignmentId: string) {
    const assignment = await this.assignmentRepository.findOne({
      where: {
        id: assignmentId,
        schoolId,
      },
      relations: {
        teacher: true,
        school: true,
        academicYear: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Headteacher assignment not found');
    }

    return assignment;
  }

  // --------------------------------------------------
  // FIND BY ACADEMIC YEAR
  // --------------------------------------------------

  async findByAcademicYear(schoolId: string, academicYearId: string) {
    await this.verifySchool(schoolId);

    const academicYear = await this.academicYearRepository.findOne({
      where: {
        id: academicYearId,
      },
    });

    if (!academicYear) {
      throw new NotFoundException('Academic year not found');
    }

    const assignment = await this.assignmentRepository.findOne({
      where: {
        schoolId,
        academicYearId,
      },
      relations: {
        teacher: true,
        school: true,
        academicYear: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'No headteacher assigned for this academic year',
      );
    }

    return assignment;
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async remove(schoolId: string, assignmentId: string) {
    const assignment = await this.findOne(schoolId, assignmentId);

    await this.assignmentRepository.remove(assignment);

    return {
      message: 'Headteacher assignment removed successfully',
    };
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  private async verifySchool(schoolId: string) {
    const school = await this.schoolRepository.findOne({
      where: {
        id: schoolId,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return school;
  }
}
