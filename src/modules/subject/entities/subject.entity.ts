import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { School } from '../../school/entities/school.entity.js';

@Entity('subject')
@Unique(['schoolId', 'subjectId'])
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Human/business identifier e.g. MAT101
  @Column()
  subjectId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column('uuid')
  schoolId: string;
}
