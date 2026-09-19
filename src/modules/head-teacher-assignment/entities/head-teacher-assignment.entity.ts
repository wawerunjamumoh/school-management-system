// headteacher-assignment.entity.ts
import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Teacher } from '../../teacher/entities/teacher.entity.js';
import { School } from '../../school/entities/school.entity.js';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';
@Entity('headteacher-assignment')
@Unique(['schoolId', 'academicYearId']) // Enforces: 1 school has exactly 1 headteacher per year
@Unique(['teacherId', 'academicYearId']) // Enforces: 1 teacher can only be headteacher at 1 school per year
export class HeadteacherAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Teacher Relationship
  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column('uuid')
  teacherId: string;

  // School Relationship (Headteachers manage schools, not classes)
  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column('uuid')
  schoolId: string;

  // Academic Year Relationship
  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column('uuid')
  academicYearId: string;
}
