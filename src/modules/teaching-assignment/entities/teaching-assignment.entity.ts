import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import {Teacher} from '../../teacher/entities/teacher.entity.js'
import {Subject} from '../../subject/entities/subject.entity.js'
import {Class} from '../../class/entities/class.entity.js'
import {AcademicYear} from '../../academic-year/entities/academic-year.entity.js';
@Entity('teaching-assignment')
// Prevent assigning two diffrent teachers to the same subject in the same
// class during the same year
@Unique(['classId', 'subjectId', 'academicYearId'])
export class TeachingAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //   Teacher relationship
  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher;

  @Column()
  teacherId: string;

  //   class relationship
  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: string;

  //   Subject relationship
  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column()
  subjectId: string;

  //  academic  relationship
  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column()
  academicYearId: string;
}
