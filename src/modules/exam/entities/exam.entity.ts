import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { School } from '../../school/entities/school.entity.js';
import { Term } from '../../term/entities/term.entity.js';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';

@Entity('exam')
@Unique(['schoolId', 'examId'])
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  examName: string;

  // Business identifier for the exam
  @Column({
    type: 'varchar',
  })
  examId: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  // ==========================================
  // SCHOOL
  // ==========================================

  @ManyToOne(() => School, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: string;

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
  // RECORD CREATED
  // ==========================================

  @CreateDateColumn()
  createdAt: Date;
}
