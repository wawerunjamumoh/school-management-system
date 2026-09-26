import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';

@Entity('term')
@Unique(['academicYearId', 'termName'])
export class Term {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  termName: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @ManyToOne(() => AcademicYear, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column('uuid')
  academicYearId: string;
}
