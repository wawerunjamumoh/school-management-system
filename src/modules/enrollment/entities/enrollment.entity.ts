import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  Unique,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Student } from '../../student/entities/student.entity.js';
import { Class } from '../../class/entities/class.entity.js';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';
import { Term } from '../../term/entities/term.entity.js';
import { School } from '../../school/entities/school.entity.js'

@Entity('enrollment')

export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'date'})
  enrollDate: Date;

  @Column({
    type: 'varchar',
    default: 'ACTIVE',
  })
  status: string;

  // ==========================================
  // STUDENT
  // ==========================================

  @ManyToOne(() => Student, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({unique: true})
  studentId: string;

  // ==========================================
  // CLASS
  // ==========================================

  @ManyToOne(() => Class, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'classId' })
  class: Class;

  @Column()
  classId: string;

  // ==========================================
  // ACADEMIC YEAR
  // ==========================================

  @ManyToOne(() => AcademicYear, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column()
  academicYearId: string;

  // ==========================================
  // TERM
  // ==========================================

  @ManyToOne(() => Term, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column()
  termId: string;

  // SCHOOL

  @ManyToOne(() => School,{onDelete: 'CASCADE'})
  @JoinColumn({ name: 'schoolId' })
  school: School;
  @Column({type: 'char',length: 36})
  schoolId: string;


}