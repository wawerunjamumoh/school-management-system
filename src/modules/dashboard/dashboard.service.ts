import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthClaims } from '../auth/auth.service.js';
import { SchoolRole } from '../auth/entities/school-membership.entity.js';
import { Enrollment } from '../enrollment/entities/enrollment.entity.js';
import { ExamResult } from '../exam-result/entities/exam-result.entity.js';
import { Exam } from '../exam/entities/exam.entity.js';
import { GuardianStudent } from '../guardian-student/entities/guardian-student.entity.js';
import { Guardian } from '../guardian/entities/guardian.entity.js';
import { Student } from '../student/entities/student.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student) private readonly students: Repository<Student>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
    @InjectRepository(Exam) private readonly exams: Repository<Exam>,
    @InjectRepository(ExamResult) private readonly results: Repository<ExamResult>,
    @InjectRepository(Guardian) private readonly guardians: Repository<Guardian>,
    @InjectRepository(GuardianStudent) private readonly guardianStudents: Repository<GuardianStudent>,
  ) {}

  async summary(auth: AuthClaims) {
    if (!auth.schoolId) throw new ForbiddenException('A school membership is required');
    if (auth.role === SchoolRole.STUDENT) {
      const student = await this.students.findOneBy({ userId: auth.sub, schoolId: auth.schoolId });
      if (!student) throw new NotFoundException('Student profile not found');
      return { role: auth.role, student, results: await this.publishedResults(student.id) };
    }
    if (auth.role === SchoolRole.GUARDIAN) {
      const guardian = await this.guardians.findOneBy({ userId: auth.sub });
      if (!guardian) throw new NotFoundException('Guardian profile not found');
      const links = await this.guardianStudents.findBy({ guardianId: guardian.id, isActive: true });
      const children = await Promise.all(links.map(async (link) => {
        const student = await this.students.findOneBy({ id: link.studentId, schoolId: auth.schoolId });
        return student && { student, results: await this.publishedResults(student.id) };
      }));
      return { role: auth.role, children: children.filter(Boolean) };
    }
    return {
      role: auth.role,
      students: await this.students.countBy({ schoolId: auth.schoolId }),
      enrollments: await this.enrollments.createQueryBuilder('enrollment').innerJoin('enrollment.student', 'student').where('student.schoolId = :schoolId', { schoolId: auth.schoolId }).getCount(),
      publishedExams: await this.exams.countBy({ schoolId: auth.schoolId, status: 'PUBLISHED' }),
    };
  }

  async studentResults(auth: AuthClaims, studentId: string) {
    if (!auth.schoolId) throw new ForbiddenException('A school membership is required');
    const student = await this.students.findOneBy({ id: studentId, schoolId: auth.schoolId });
    if (!student) throw new NotFoundException('Student not found');
    if (auth.role === SchoolRole.STUDENT && student.userId !== auth.sub) throw new ForbiddenException();
    if (auth.role === SchoolRole.GUARDIAN) {
      const guardian = await this.guardians.findOneBy({ userId: auth.sub });
      const link = guardian && await this.guardianStudents.findOneBy({ guardianId: guardian.id, studentId, isActive: true });
      if (!link) throw new ForbiddenException();
    }
    return this.publishedResults(studentId);
  }

  private publishedResults(studentId: string) {
    return this.results.createQueryBuilder('result').innerJoinAndSelect('result.exam', 'exam', 'exam.status = :status', { status: 'PUBLISHED' }).where('result.studentId = :studentId', { studentId }).getMany();
  }
}
