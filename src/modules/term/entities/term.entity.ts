import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import {AcademicYear} from '../../academic-year/entities/academic-year.entity.js';

@Entity('term')
export class Term {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  termName: string;
  @CreateDateColumn()
  startDate: Date;
  @CreateDateColumn()
  endDate: Date;

//   Rel: Many terms belong to one academic year
  @ManyToOne(() => AcademicYear,{onDelete:'CASCADE'})
  @JoinColumn({name: 'academicYearId'})
  academicyear: AcademicYear;

  @Column()
  academicYearId: string;

}
