import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassTeacherAssignment } from './entities/class-teacher-assignment.entity.js';
import { CreateClassTeacherAssignmentDto } from './dto/create-class-teacher-assignment.dto.js';

import { Teacher } from '../teacher/entities/teacher.entity.js';
import { Class } from '../class/entities/class.entity.js';
import { AcademicYear } from '../academic-year/entities/academic-year.entity.js';
import { School } from '../school/entities/school.entity.js';

@Injectable()
export class ClassTeacherAssignmentService {
  constructor(
    @InjectRepository(ClassTeacherAssignment)
    private readonly assignmentRepository: Repository<ClassTeacherAssignment>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,

    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,

    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  async create(
    schoolId: string,
    dto: CreateClassTeacherAssignmentDto,
  ) {
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
      throw new NotFoundException(
        'Teacher not found in this school',
      );
    }

    // 3. Verify class belongs to this school
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

    // 4. Verify academic year exists
    const academicYear =
      await this.academicYearRepository.findOne({
        where: {
          id: dto.academicYearId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    // 5. Check whether teacher already manages a class
    //    during this academic year
    const teacherAssignment =
      await this.assignmentRepository.findOne({
        where: {
          teacherId: dto.teacherId,
          academicYearId: dto.academicYearId,
        },
      });

    if (teacherAssignment) {
      throw new ConflictException(
        'Teacher is already assigned as a class teacher for this academic year',
      );
    }

    // 6. Check whether class already has a class teacher
    //    during this academic year
    const classAssignment =
      await this.assignmentRepository.findOne({
        where: {
          classId: dto.classId,
          academicYearId: dto.academicYearId,
        },
      });

    if (classAssignment) {
      throw new ConflictException(
        'This class already has a class teacher for this academic year',
      );
    }

    // 7. Create assignment
    const assignment =
      this.assignmentRepository.create({
        schoolId,
        teacherId: dto.teacherId,
        classId: dto.classId,
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
        teacher: {
          schoolId: schoolId,
        },
      },
      relations: {
        teacher: true,
        class: true,
        academicYear: true,
      },
    });
  }

  // --------------------------------------------------
  // FIND ONE
  // --------------------------------------------------

  async findOne(
    schoolId: string,
    assignmentId: string,
  ) {
    const assignment =
      await this.assignmentRepository.findOne({
        where: {
          id: assignmentId,
          teacher: {
            schoolId: schoolId,
          },
        },
        relations: {
          teacher: true,
          class: true,
          academicYear: true,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Class teacher assignment not found',
      );
    }

    return assignment;
  }

  // --------------------------------------------------
  // FIND BY TEACHER
  // --------------------------------------------------

  async findByTeacher(
    schoolId: string,
    teacherId: string,
  ) {
    await this.verifyTeacher(
      schoolId,
      teacherId,
    );

    return this.assignmentRepository.find({
      where: {
        teacherId,
      },
      relations: {
        teacher: true,
        class: true,
        academicYear: true,
      },
    });
  }

  // --------------------------------------------------
  // FIND BY CLASS
  // --------------------------------------------------

  async findByClass(
    schoolId: string,
    classId: string,
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

    return this.assignmentRepository.find({
      where: {
        classId,
      },
      relations: {
        teacher: true,
        class: true,
        academicYear: true,
      },
    });
  }

  // --------------------------------------------------
  // FIND BY ACADEMIC YEAR
  // --------------------------------------------------

  async findByAcademicYear(
    schoolId: string,
    academicYearId: string,
  ) {
    await this.verifySchool(schoolId);

    const academicYear =
      await this.academicYearRepository.findOne({
        where: {
          id: academicYearId,
        },
      });

    if (!academicYear) {
      throw new NotFoundException(
        'Academic year not found',
      );
    }

    return this.assignmentRepository.find({
      where: {
        academicYearId,
        teacher: {
          schoolId: schoolId,
        },
      },
      relations: {
        teacher: true,
        class: true,
        academicYear: true,
      },
    });
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async remove(
    schoolId: string,
    assignmentId: string,
  ) {
    const assignment =
      await this.findOne(
        schoolId,
        assignmentId,
      );

    await this.assignmentRepository.remove(
      assignment,
    );

    return {
      message:
        'Class teacher assignment removed successfully',
    };
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  private async verifySchool(
    schoolId: string,
  ) {
    const school =
      await this.schoolRepository.findOne({
        where: {
          id: schoolId,
        },
      });

    if (!school) {
      throw new NotFoundException(
        'School not found',
      );
    }

    return school;
  }

  private async verifyTeacher(
    schoolId: string,
    teacherId: string,
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
}