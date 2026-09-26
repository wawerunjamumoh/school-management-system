import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity.js';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity.js';
import { Term } from '../../term/entities/term.entity.js';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_name' })
  eventName: string;

  @Column({ type: 'text', nullable: true }) // Text type allows longer descriptions; nullable in case it's blank
  description: string;

  @Column({ name: 'created_by'})
  createdBy: string; // Typically records the admin/user UUID string

  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  // FIXED: Changed from @CreateDateColumn to a regular date/timestamp column
  @Column({ type: 'timestamp', name: 'starts_at' })
  startsAt: Date;

  @Column({ type: 'timestamp', name: 'ends_at' })
  endsAt: Date;

  // School relationship
  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' }) // FIXED: wrapped schoolId in string quotes
  school: School;

  @Column('uuid') // Explicitly marked as a UUID column type
  schoolId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column()
  academicYearId: string;

  @ManyToOne(() => Term, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column()
  termId: string;
}
