import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { School } from '../../school/entities/school.entity.js';
import { Term } from '../../term/entities/term.entity.js';

@Entity('notice-board')
export class NoticeBoard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  publishedAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date | null;

  @Column()
  createdBy: string;

  // School → many notices
  @ManyToOne(() => School, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: string;

  // Term → many notices
  @ManyToOne(() => Term, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column({ nullable: true })
  termId: string | null;
}
