import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Teacher } from '../../teacher/entities/teacher.entity.js';
import { Class } from '../../class/entities/class.entity.js';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';

@Entity('class_teacher_assignments')
@Unique(['schoolId', 'teacherId', 'academicYearId'])
@Unique(['schoolId', 'classId', 'academicYearId'])
export class ClassTeacherAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Teacher relationship
  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column('uuid') // Explicitly state 'uuid' type if the referenced PK is a UUID
  teacherId: string;

  // Class relationship
  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column('uuid')
  classId: string;

  // Academic year relationship
  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column('uuid')
  academicYearId: string;
  @Column('uuid')
  schoolId: string;

}
