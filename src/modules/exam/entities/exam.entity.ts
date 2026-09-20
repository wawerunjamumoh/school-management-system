import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {School} from  '../../school/entities/school.entity.js';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';
import { Term } from '../../term/entities/term.entity.js';

@Entity('exam')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  examName: string;
  @Column({charset: 'varchar',default: 'INTERNAL'})
  examId: string;

  @Column({ type: 'timestamp' })
  startDate: Date;
  @Column({ type: 'timestamp' })
  endDate: Date;
  @Column({ default: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED';

//   School relationship
  @ManyToOne(() => School,{onDelete: 'RESTRICT'})
  @JoinColumn({name: 'schoolId'})
  school: School;

  @Column()
  schoolId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;
  @Column('uuid')
  academicYearId: string;

  @ManyToOne(() => Term, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'termId' })
  term: Term;
  @Column('uuid')
  termId: string;
}
