import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { Teacher } from '../../teacher/entities/teacher.entity.js';
import { Class } from '../../class/entities/class.entity.js';
import { Subject } from '../../subject/entities/subject.entity.js';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';
import { School } from '../../school/entities/school.entity.js';

@Entity('teaching_assignment')
@Unique([
  'schoolId',
  'classId',
  'subjectId',
  'academicYearId',
])
export class TeachingAssignment {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Teacher
  @ManyToOne(() => Teacher, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'teacherId',
    referencedColumnName: 'id',
  })
  teacher: Teacher;

  @Column({
    type: 'char',
    length: 36,
  })
  teacherId: string;

  // Class
  @ManyToOne(() => Class, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'classId',
    referencedColumnName: 'id',
  })
  class: Class;

  @Column({
    type: 'char',
    length: 36,
  })
  classId: string;

  // Subject
  @ManyToOne(() => Subject, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'subjectId',
    referencedColumnName: 'id',
  })
  subject: Subject;

  @Column({
    type: 'char',
    length: 36,
  })
  subjectId: string;

  // Academic Year
  @ManyToOne(() => AcademicYear, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'academicYearId',
    referencedColumnName: 'id',
  })
  academicYear: AcademicYear;

  @Column({
    type: 'char',
    length: 36,
  })
  academicYearId: string;

  // School
  @ManyToOne(() => School, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'schoolId',
    referencedColumnName: 'id',
  })
  school: School;

  @Column({
    type: 'char',
    length: 36,
  })
  schoolId: string;
}