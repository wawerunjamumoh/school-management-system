import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { School } from '../../school/entities/school.entity.js';

@Entity('academic_year')
@Unique(['schoolId', 'name'])
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @ManyToOne(() => School, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column('uuid')
  schoolId: string;
}